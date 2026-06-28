import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // jSquash and ffmpeg.wasm ship their own wasm/workers; don't pre-bundle them.
  optimizeDeps: {
    exclude: [
      '@jsquash/avif',
      '@jsquash/jpeg',
      '@jsquash/png',
      '@jsquash/webp',
      '@jsquash/resize',
      '@ffmpeg/ffmpeg',
      '@ffmpeg/util',
    ],
  },
})
