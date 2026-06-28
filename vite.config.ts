import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // jSquash ships its own wasm; let it load those itself instead of pre-bundling.
  optimizeDeps: {
    exclude: ['@jsquash/avif', '@jsquash/jpeg', '@jsquash/png', '@jsquash/webp', '@jsquash/resize'],
  },
})
