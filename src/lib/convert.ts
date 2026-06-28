import encodeAvif from '@jsquash/avif/encode'
import { FORMAT_META, isHeic } from './format'
import type { ConvertOptions, ConvertResult } from './types'

/**
 * Everything in this file runs in the browser. No file is ever uploaded:
 * we decode -> (optionally) resize -> re-encode entirely in memory.
 */

async function fileToBitmap(file: File): Promise<ImageBitmap> {
  if (isHeic(file)) {
    // Browsers (outside Safari) can't decode HEIC natively, so use libheif via heic2any.
    const heic2any = (await import('heic2any')).default as (opts: {
      blob: Blob
      toType?: string
      quality?: number
    }) => Promise<Blob | Blob[]>
    const out = await heic2any({ blob: file, toType: 'image/png' })
    const blob = Array.isArray(out) ? out[0] : out
    return createImageBitmap(blob)
  }
  return createImageBitmap(file)
}

function targetSize(
  w: number,
  h: number,
  max: number | null,
): { width: number; height: number } {
  if (!max || (w <= max && h <= max)) return { width: w, height: h }
  const scale = max / Math.max(w, h)
  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}

export async function convertImage(
  file: File,
  opts: ConvertOptions,
): Promise<ConvertResult> {
  const bitmap = await fileToBitmap(file)
  const { width, height } = targetSize(bitmap.width, bitmap.height, opts.maxDimension)

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d', { alpha: opts.format !== 'jpeg' })
  if (!ctx) throw new Error('Could not get a 2D canvas context')

  // JPEG has no alpha channel — flatten transparency onto white instead of black.
  if (opts.format === 'jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  const meta = FORMAT_META[opts.format]
  let blob: Blob

  if (opts.format === 'avif') {
    // Canvas can't reliably encode AVIF, so use the jSquash (libavif) wasm encoder.
    const imageData = ctx.getImageData(0, 0, width, height)
    const buffer = await encodeAvif(imageData, { quality: opts.quality })
    blob = new Blob([buffer], { type: meta.mime })
  } else {
    const quality = meta.lossy ? opts.quality / 100 : undefined
    blob = await canvas.convertToBlob({ type: meta.mime, quality })
  }

  if (blob.type !== meta.mime) {
    // Browser silently fell back (e.g. WebP unsupported) — surface it rather than lie.
    throw new Error(`Your browser can't encode ${meta.label} here`)
  }

  return { blob, width, height }
}
