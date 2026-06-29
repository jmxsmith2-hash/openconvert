import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register the service worker (offline + cross-origin isolation for fast video).
// The SW only ships in production; dev gets isolation from the Vite server headers.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { type: 'module' })
      await navigator.serviceWorker.ready
      // The first load isn't controlled by the SW yet, so it isn't isolated.
      // Reload once (guarded) so the SW can serve the isolation headers.
      if (!crossOriginIsolated && !sessionStorage.getItem('coi-reloaded')) {
        sessionStorage.setItem('coi-reloaded', '1')
        location.reload()
      }
    } catch {
      // No SW means no multi-threading; the single-threaded core still works.
    }
  })
}
