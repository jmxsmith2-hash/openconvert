// Copy the self-hosted ffmpeg.wasm core into public/ so it ships with the app
// (no CDN, fully offline). Runs before dev and build; the files are gitignored.
import { mkdirSync, copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const from = resolve(root, 'node_modules/@ffmpeg/core/dist/esm')
const to = resolve(root, 'public/ffmpeg')

mkdirSync(to, { recursive: true })
for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  copyFileSync(resolve(from, file), resolve(to, file))
  console.log(`copied ${file} -> public/ffmpeg/`)
}
