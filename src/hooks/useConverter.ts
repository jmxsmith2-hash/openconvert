import { useCallback, useEffect, useRef, useState } from 'react'
import { convertImage } from '../lib/convert'
import { FORMAT_META, isHeic, isSupportedImage, outputName } from '../lib/format'
import type { ConvertOptions } from '../lib/types'

export type JobStatus = 'queued' | 'working' | 'done' | 'error'

export interface Job {
  id: string
  file: File
  previewUrl: string | null
  status: JobStatus
  outName: string
  result?: { blob: Blob; url: string; width: number; height: number }
  error?: string
}

const DEFAULT_OPTIONS: ConvertOptions = { format: 'jpeg', quality: 80, maxDimension: null }

let counter = 0

export function useConverter() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [options, setOptionsState] = useState<ConvertOptions>(DEFAULT_OPTIONS)
  const [isConverting, setIsConverting] = useState(false)

  // Refs mirror state so async loops / event handlers read fresh values.
  const jobsRef = useRef(jobs)
  jobsRef.current = jobs
  const optionsRef = useRef(options)
  optionsRef.current = options

  const patch = useCallback((id: string, p: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...p } : j)))
  }, [])

  const addFiles = useCallback((files: FileList | File[]) => {
    const ext = FORMAT_META[optionsRef.current.format].ext
    const next: Job[] = Array.from(files)
      .filter(isSupportedImage)
      .map((file) => ({
        id: `job-${counter++}`,
        file,
        // HEIC can't be shown by <img>; we'll show its converted result instead.
        previewUrl: isHeic(file) ? null : URL.createObjectURL(file),
        status: 'queued' as JobStatus,
        outName: outputName(file.name, ext),
      }))
    if (next.length) setJobs((prev) => [...prev, ...next])
    return next.length
  }, [])

  const setOptions = useCallback((p: Partial<ConvertOptions>) => {
    const nextOpts = { ...optionsRef.current, ...p }
    optionsRef.current = nextOpts
    setOptionsState(nextOpts)
    const ext = FORMAT_META[nextOpts.format].ext
    // Any previously-converted result is now stale: revoke it and re-queue.
    setJobs((prev) =>
      prev.map((j) => {
        const outName = outputName(j.file.name, ext)
        if (j.status === 'done' || j.status === 'working') {
          if (j.result) URL.revokeObjectURL(j.result.url)
          return { ...j, status: 'queued' as JobStatus, result: undefined, error: undefined, outName }
        }
        return { ...j, outName }
      }),
    )
  }, [])

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => {
      const j = prev.find((x) => x.id === id)
      if (j?.previewUrl) URL.revokeObjectURL(j.previewUrl)
      if (j?.result) URL.revokeObjectURL(j.result.url)
      return prev.filter((x) => x.id !== id)
    })
  }, [])

  const clear = useCallback(() => {
    for (const j of jobsRef.current) {
      if (j.previewUrl) URL.revokeObjectURL(j.previewUrl)
      if (j.result) URL.revokeObjectURL(j.result.url)
    }
    setJobs([])
  }, [])

  const convertAll = useCallback(async () => {
    if (isConverting) return
    setIsConverting(true)
    try {
      const pending = jobsRef.current.filter(
        (j) => j.status === 'queued' || j.status === 'error',
      )
      for (const job of pending) {
        patch(job.id, { status: 'working', error: undefined })
        try {
          const res = await convertImage(job.file, optionsRef.current)
          const url = URL.createObjectURL(res.blob)
          patch(job.id, {
            status: 'done',
            result: { blob: res.blob, url, width: res.width, height: res.height },
          })
        } catch (e) {
          patch(job.id, {
            status: 'error',
            error: e instanceof Error ? e.message : String(e),
          })
        }
      }
    } finally {
      setIsConverting(false)
    }
  }, [isConverting, patch])

  // Revoke any outstanding object URLs when the app unmounts.
  useEffect(
    () => () => {
      for (const j of jobsRef.current) {
        if (j.previewUrl) URL.revokeObjectURL(j.previewUrl)
        if (j.result) URL.revokeObjectURL(j.result.url)
      }
    },
    [],
  )

  const doneJobs = jobs.filter((j) => j.status === 'done')
  const pendingCount = jobs.filter(
    (j) => j.status === 'queued' || j.status === 'error',
  ).length

  return {
    jobs,
    options,
    setOptions,
    addFiles,
    removeJob,
    clear,
    convertAll,
    isConverting,
    doneJobs,
    pendingCount,
  }
}
