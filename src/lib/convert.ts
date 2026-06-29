import encodeAvif from '@jsquash/avif/encode'
import { FORMAT_META, isHeic } from './format'
import { compressToTarget } from './targetSize'
import type { ConvertOptions, ConvertResult, OutputFormat } from './types'

/**
 * Everything in this file runs in the browser. No file is ever uploaded:
 * we decode -> (optionally) resize -> re-encode entirely in memory.
 */

export async function fileToBitmap(file: File): Promise<ImageBitmap> {
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

export function fitSize(
  w: number,
  h: number,
  max: number | null,
): { width: number; height: number } {
  if (!max || (w <= max && h <= max)) return { width: w, height: h }
  const scale = max / Math.max(w, h)
  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}

/** Draw a bitmap into a fresh canvas at the given size, ready to encode as `format`. */
export function drawToCanvas(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  format: OutputFormat,
): OffscreenCanvas {
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d', { alpha: format !== 'jpeg' })
  if (!ctx) throw new Error('Could not get a 2D canvas context')
  // JPEG has no alpha channel — flatten transparency onto white instead of black.
  if (format === 'jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, width, height)
  return canvas
}

/** Encode a prepared canvas to a Blob. `quality` is 1-100 (ignored by PNG). */
export async function encodeCanvas(
  canvas: OffscreenCanvas,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  const meta = FORMAT_META[format]
  if (format === 'avif') {
    // Canvas can't reliably encode AVIF, so use the jSquash (libavif) wasm encoder.
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get a 2D canvas context')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const buffer = await encodeAvif(imageData, { quality })
    return new Blob([buffer], { type: meta.mime })
  }
  const q = meta.lossy ? quality / 100 : undefined
  const blob = await canvas.convertToBlob({ type: meta.mime, quality: q })
  if (blob.type !== meta.mime) {
    // Browser silently fell back (e.g. WebP unsupported) — surface it rather than lie.
    throw new Error(`Your browser can't encode ${meta.label} here`)
  }
  return blob
}

export async function convertImage(
  file: File,
  opts: ConvertOptions,
): Promise<ConvertResult> {
  const bitmap = await fileToBitmap(file)
  const fit = fitSize(bitmap.width, bitmap.height, opts.maxDimension)

  try {
    if (opts.targetBytes && opts.targetBytes > 0) {
      return await compressToTarget(bitmap, fit, opts.format, opts.targetBytes)
    }
    const canvas = drawToCanvas(bitmap, fit.width, fit.height, opts.format)
    const blob = await encodeCanvas(canvas, opts.format, opts.quality)
    return { blob, width: fit.width, height: fit.height }
  } finally {
    bitmap.close?.()
  }
}
