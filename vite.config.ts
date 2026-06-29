import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Cross-origin isolation headers. In production these come from the service worker
// (GitHub Pages can't set headers); in dev we set them here so the multi-threaded
// ffmpeg core can be tested locally.
const isolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: { headers: isolationHeaders },
  preview: { headers: isolationHeaders },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'OpenConvert',
        short_name: 'OpenConvert',
        description: 'Private, in-browser image, audio, and video converter. No upload, no account.',
        theme_color: '#0b0b12',
        background_color: '#0b0b12',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      injectManifest: {
        // Precache the app shell only; the big wasm cores are runtime-cached by the SW.
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        globIgnores: ['**/ffmpeg/**', '**/ffmpeg-mt/**'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: { enabled: false },
    }),
  ],
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
