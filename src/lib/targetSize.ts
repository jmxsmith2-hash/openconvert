import { drawToCanvas, encodeCanvas } from './convert'
import { FORMAT_META } from './format'
import type { ConvertResult, OutputFormat } from './types'

/** Resolution multipliers tried in order if the target can't be met at full size. */
const SCALES = [1, 0.85, 0.72, 0.6, 0.5, 0.4, 0.3]

/**
 * Find the largest encoding of `bitmap` that fits in `targetBytes`.
 *
 * Lossy formats: binary-search quality at each resolution. Lossless (PNG): just
 * step the resolution down. If nothing fits even at the smallest size, return the
 * smallest result we produced (closest we could get).
 */
export async function compressToTarget(
  bitmap: ImageBitmap,
  fit: { width: number; height: number },
  format: OutputFormat,
  targetBytes: number,
): Promise<ConvertResult> {
  const lossy = FORMAT_META[format].lossy
  let smallest: ConvertResult | null = null

  const consider = (blob: Blob, width: number, height: number) => {
    if (!smallest || blob.size < smallest.blob.size) smallest = { blob, width, height }
  }

  for (const scale of SCALES) {
    const width = Math.max(1, Math.round(fit.width * scale))
    const height = Math.max(1, Math.round(fit.height * scale))
    const canvas = drawToCanvas(bitmap, width, height, format)

    if (!lossy) {
      const blob = await encodeCanvas(canvas, format, 100)
      consider(blob, width, height)
      if (blob.size <= targetBytes) return { blob, width, height }
      continue
    }

    let lo = 5
    let hi = 95
    let best: ConvertResult | null = null
    for (let i = 0; i < 7 && lo <= hi; i++) {
      const q = Math.round((lo + hi) / 2)
      const blob = await encodeCanvas(canvas, format, q)
      consider(blob, width, height)
      if (blob.size <= targetBytes) {
        best = { blob, width, height }
        lo = q + 1
      } else {
        hi = q - 1
      }
    }
    if (best) return best
  }

  return smallest ?? { blob: await encodeCanvas(drawToCanvas(bitmap, fit.width, fit.height, format), format, 5), width: fit.width, height: fit.height }
}
