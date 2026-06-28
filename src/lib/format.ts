import type { OutputFormat } from './types'

export const FORMAT_META: Record<
  OutputFormat,
  { label: string; mime: string; ext: string; lossy: boolean }
> = {
  jpeg: { label: 'JPEG', mime: 'image/jpeg', ext: 'jpg', lossy: true },
  png: { label: 'PNG', mime: 'image/png', ext: 'png', lossy: false },
  webp: { label: 'WebP', mime: 'image/webp', ext: 'webp', lossy: true },
  avif: { label: 'AVIF', mime: 'image/avif', ext: 'avif', lossy: true },
}

export const OUTPUT_FORMATS: OutputFormat[] = ['jpeg', 'png', 'webp', 'avif']

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  const units = ['KB', 'MB', 'GB']
  let v = n / 1024
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`
}

export function isHeic(file: File): boolean {
  const name = file.name.toLowerCase()
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  )
}

export function isSupportedImage(file: File): boolean {
  return file.type.startsWith('image/') || isHeic(file)
}

/** Swap a filename's extension, e.g. `photo.heic` -> `photo.jpg`. */
export function outputName(originalName: string, ext: string): string {
  const dot = originalName.lastIndexOf('.')
  const base = dot > 0 ? originalName.slice(0, dot) : originalName
  return `${base}.${ext}`
}
