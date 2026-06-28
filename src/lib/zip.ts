import { zip } from 'fflate'

function uniqueName(taken: Record<string, unknown>, name: string): string {
  if (!(name in taken)) return name
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot) : ''
  let i = 1
  while (`${base} (${i})${ext}` in taken) i++
  return `${base} (${i})${ext}`
}

export async function zipBlobs(
  entries: { name: string; blob: Blob }[],
): Promise<Blob> {
  const files: Record<string, Uint8Array> = {}
  for (const entry of entries) {
    files[uniqueName(files, entry.name)] = new Uint8Array(await entry.blob.arrayBuffer())
  }
  return new Promise((resolve, reject) => {
    // level 0 (store): images are already compressed, so don't waste time re-deflating.
    zip(files, { level: 0 }, (err, data) => {
      if (err) reject(err)
      else resolve(new Blob([data], { type: 'application/zip' }))
    })
  })
}
