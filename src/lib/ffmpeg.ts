import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { AV_FORMATS, extOf, targetArgs, type AvFormat } from './media'

// Core files live in public/ffmpeg/ (single-thread) and public/ffmpeg-mt/ (multi-thread),
// copied there by scripts/copy-ffmpeg-core.mjs. Resolve against the document base so it
// works in dev and under the Pages subpath.
const fileUrl = (dir: string, name: string) => new URL(`${dir}/${name}`, document.baseURI).href

let multithread = false
/** True once the multi-threaded core is in use (needs cross-origin isolation). */
export function isMultithread(): boolean {
  return multithread
}

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
    // The multi-threaded core needs SharedArrayBuffer, which needs cross-origin
    // isolation (provided by the service worker in production). Fall back to the
    // single-threaded core anywhere isolation isn't available.
    const isolated = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated
    if (isolated) {
      try {
        await ff.load({
          coreURL: await toBlobURL(fileUrl('ffmpeg-mt', 'ffmpeg-core.js'), 'text/javascript'),
          wasmURL: await toBlobURL(fileUrl('ffmpeg-mt', 'ffmpeg-core.wasm'), 'application/wasm'),
          workerURL: await toBlobURL(fileUrl('ffmpeg-mt', 'ffmpeg-core.worker.js'), 'text/javascript'),
        })
        multithread = true
        instance = ff
        return ff
      } catch {
        // mt failed for some reason — fall through to single-thread below.
        multithread = false
      }
    }
    await ff.load({
      coreURL: await toBlobURL(fileUrl('ffmpeg', 'ffmpeg-core.js'), 'text/javascript'),
      wasmURL: await toBlobURL(fileUrl('ffmpeg', 'ffmpeg-core.wasm'), 'application/wasm'),
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
  target?: { bytes: number; durationSec: number },
): Promise<MediaResult> {
  const ff = await loadFFmpeg()
  const def = AV_FORMATS[format]
  const inName = `input.${extOf(file.name)}`
  const outName = `output.${def.ext}`

  // Build args: bitrate-targeted if a size target is given, else the format defaults.
  let args = def.args
  if (target && target.bytes > 0 && target.durationSec > 0) {
    const totalK = (target.bytes * 8) / 1000 / target.durationSec
    let custom: string[] | null
    if (def.family === 'audio') {
      custom = targetArgs(format, 0, Math.max(32, Math.min(320, Math.round(totalK))))
    } else {
      const audioK = 128
      custom = targetArgs(format, Math.max(64, Math.round(totalK - audioK)), audioK)
    }
    if (custom) args = custom
  }

  const handleProgress = ({ progress }: { progress: number }) => {
    if (onProgress) onProgress(Math.max(0, Math.min(1, progress)))
  }
  ff.on('progress', handleProgress)

  try {
    await ff.writeFile(inName, await fetchFile(file))
    const code = await ff.exec(['-i', inName, ...args, outName])
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
