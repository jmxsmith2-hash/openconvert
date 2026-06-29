export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif'

export interface ConvertOptions {
  /** Target output format. */
  format: OutputFormat
  /** Quality 1-100, used only by lossy formats (JPEG / WebP / AVIF). */
  quality: number
  /** Cap the longest side to this many pixels. `null` keeps original size. */
  maxDimension: number | null
  /** When set, ignore `quality` and search for the largest file <= this many bytes. */
  targetBytes?: number | null
}

export interface ConvertResult {
  blob: Blob
  width: number
  height: number
}
