import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { AV_FORMATS, extOf, type AvFormat } from './media'

// Core files live in public/ffmpeg/ (copied there by scripts/copy-ffmpeg-core.mjs).
// Resolve against the document base so it works in dev and under the Pages subpath.
const fileUrl = (name: string) => new URL(`ffmpeg/${name}`, document.baseURI).href

/**
 * Single shared ffmpeg.wasm instance. The core (~30 MB) is bundled with the app
 * and loaded from same-origin blob URLs, so nothing is fetched from a CDN and no
 * media ever leaves the device. Single-threaded core: no SharedArrayBuffer / COOP
 * headers required, so it runs anywhere including GitHub Pages.
 */
let instance: FFmpeg | null = null
let loadingPromise: Promise<FFmpeg> | null = null

export function isFFmpegLoaded(): boolean {
  return instance?.loaded ?? false
}

export function loadFFmpeg(): Promise<FFmpeg> {
  if (instance?.loaded) return Promise.resolve(instance)
  if (loadingPromise) return loadingPromise
  loadingPromise = (async () => {
    const ff = new FFmpeg()
    await ff.load({
      coreURL: await toBlobURL(fileUrl('ffmpeg-core.js'), 'text/javascript'),
      wasmURL: await toBlobURL(fileUrl('ffmpeg-core.wasm'), 'application/wasm'),
    })
    instance = ff
    return ff
  })()
  return loadingPromise
}

export interface MediaResult {
  blob: Blob
}

/**
 * Convert one audio/video file to the target format. ffmpeg processes one job at
 * a time, so callers must run conversions sequentially.
 */
export async function convertMedia(
  file: File,
  format: AvFormat,
  onProgress?: (ratio: number) => void,
): Promise<MediaResult> {
  const ff = await loadFFmpeg()
  const def = AV_FORMATS[format]
  const inName = `input.${extOf(file.name)}`
  const outName = `output.${def.ext}`

  const handleProgress = ({ progress }: { progress: number }) => {
    if (onProgress) onProgress(Math.max(0, Math.min(1, progress)))
  }
  ff.on('progress', handleProgress)

  try {
    await ff.writeFile(inName, await fetchFile(file))
    const code = await ff.exec(['-i', inName, ...def.args, outName])
    if (code !== 0) throw new Error(`ffmpeg exited with code ${code}`)
    const data = await ff.readFile(outName)
    // data is a Uint8Array here; cast past ffmpeg's broad ArrayBufferLike typing.
    return { blob: new Blob([data as BlobPart], { type: def.mime }) }
  } finally {
    ff.off('progress', handleProgress)
    await ff.deleteFile(inName).catch(() => {})
    await ff.deleteFile(outName).catch(() => {})
  }
}
