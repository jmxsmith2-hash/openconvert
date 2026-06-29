// Copy the self-hosted ffmpeg.wasm cores into public/ so they ship with the app
// (no CDN, fully offline). Runs before dev and build; the files are gitignored.
import { mkdirSync, copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const targets = [
  { pkg: '@ffmpeg/core', dest: 'public/ffmpeg', files: ['ffmpeg-core.js', 'ffmpeg-core.wasm'] },
  {
    pkg: '@ffmpeg/core-mt',
    dest: 'public/ffmpeg-mt',
    files: ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js'],
  },
]

for (const { pkg, dest, files } of targets) {
  const from = resolve(root, 'node_modules', pkg, 'dist/esm')
  const to = resolve(root, dest)
  mkdirSync(to, { recursive: true })
  for (const file of files) {
    copyFileSync(resolve(from, file), resolve(to, file))
    console.log(`copied ${pkg}/${file} -> ${dest}/`)
  }
}
