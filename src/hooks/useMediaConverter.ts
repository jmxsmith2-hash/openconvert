import { useCallback, useEffect, useRef, useState } from 'react'
import { AV_FORMATS, availableFormats, mediaKind, type AvFormat } from '../lib/media'

export type MediaStatus = 'queued' | 'working' | 'done' | 'error'

export interface MediaJob {
  id: string
  file: File
  kind: 'audio' | 'video'
  status: MediaStatus
  progress: number
  outName: string
  result?: { blob: Blob; url: string }
  error?: string
}

let counter = 0

function renameExt(name: string, ext: string): string {
  const dot = name.lastIndexOf('.')
  return `${dot > 0 ? name.slice(0, dot) : name}.${ext}`
}

export function useMediaConverter() {
  const [jobs, setJobs] = useState<MediaJob[]>([])
  const [format, setFormatState] = useState<AvFormat>('mp3')
  const [isConverting, setIsConverting] = useState(false)
  const [coreLoading, setCoreLoading] = useState(false)

  const jobsRef = useRef(jobs)
  jobsRef.current = jobs
  const formatRef = useRef(format)
  formatRef.current = format

  const hasVideo = jobs.some((j) => j.kind === 'video')
  const formats = availableFormats(hasVideo)

  // If the current choice isn't valid for the present media, fall back to the first option.
  useEffect(() => {
    if (!formats.includes(formatRef.current)) {
      setFormatState(formats[0])
      formatRef.current = formats[0]
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formats.join(',')])

  const patch = useCallback((id: string, p: Partial<MediaJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...p } : j)))
  }, [])

  const setFormat = useCallback((f: AvFormat) => {
    formatRef.current = f
    setFormatState(f)
    const ext = AV_FORMATS[f].ext
    setJobs((prev) =>
      prev.map((j) => {
        if (j.result) URL.revokeObjectURL(j.result.url)
        return {
          ...j,
          outName: renameExt(j.file.name, ext),
          status: j.status === 'done' || j.status === 'working' ? 'queued' : j.status,
          progress: 0,
          result: undefined,
          error: undefined,
        }
      }),
    )
  }, [])

  const addFiles = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files)
      .map((file) => ({ file, kind: mediaKind(file) }))
      .filter((x) => x.kind === 'audio' || x.kind === 'video') as {
      file: File
      kind: 'audio' | 'video'
    }[]
    if (!incoming.length) return 0

    const wasEmpty = jobsRef.current.length === 0
    const willHaveVideo = incoming.some((x) => x.kind === 'video') || hasVideo
    // Default a sensible target the first time files arrive.
    let ext = AV_FORMATS[formatRef.current].ext
    if (wasEmpty) {
      const def: AvFormat = willHaveVideo ? 'mp4' : 'mp3'
      formatRef.current = def
      setFormatState(def)
      ext = AV_FORMATS[def].ext
    }

    const next: MediaJob[] = incoming.map(({ file, kind }) => ({
      id: `m${counter++}`,
      file,
      kind,
      status: 'queued',
      progress: 0,
      outName: renameExt(file.name, ext),
    }))
    setJobs((prev) => [...prev, ...next])
    return next.length
  }, [hasVideo])

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => {
      const j = prev.find((x) => x.id === id)
      if (j?.result) URL.revokeObjectURL(j.result.url)
      return prev.filter((x) => x.id !== id)
    })
  }, [])

  const clear = useCallback(() => {
    for (const j of jobsRef.current) if (j.result) URL.revokeObjectURL(j.result.url)
    setJobs([])
  }, [])

  const convertAll = useCallback(async () => {
    if (isConverting) return
    setIsConverting(true)
    try {
      const ffmpeg = await import('../lib/ffmpeg')
      if (!ffmpeg.isFFmpegLoaded()) setCoreLoading(true)
      await ffmpeg.loadFFmpeg()
      setCoreLoading(false)

      const pending = jobsRef.current.filter((j) => j.status === 'queued' || j.status === 'error')
      for (const job of pending) {
        patch(job.id, { status: 'working', progress: 0, error: undefined })
        try {
          const { blob } = await ffmpeg.convertMedia(job.file, formatRef.current, (p) =>
            patch(job.id, { progress: p }),
          )
          patch(job.id, { status: 'done', progress: 1, result: { blob, url: URL.createObjectURL(blob) } })
        } catch (e) {
          patch(job.id, { status: 'error', error: e instanceof Error ? e.message : String(e) })
        }
      }
    } catch (e) {
      setCoreLoading(false)
      // Loading the ffmpeg core itself failed: surface it on every pending job.
      const msg = e instanceof Error ? e.message : String(e)
      setJobs((prev) =>
        prev.map((j) => (j.status === 'queued' ? { ...j, status: 'error', error: `Converter failed to load: ${msg}` } : j)),
      )
    } finally {
      setIsConverting(false)
    }
  }, [isConverting, patch])

  useEffect(
    () => () => {
      for (const j of jobsRef.current) if (j.result) URL.revokeObjectURL(j.result.url)
    },
    [],
  )

  const doneJobs = jobs.filter((j) => j.status === 'done')
  const pendingCount = jobs.filter((j) => j.status === 'queued' || j.status === 'error').length

  return {
    jobs,
    format,
    setFormat,
    formats,
    addFiles,
    removeJob,
    clear,
    convertAll,
    isConverting,
    coreLoading,
    doneJobs,
    pendingCount,
  }
}
