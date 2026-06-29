/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: { url: string; revision: string | null }[]
}

const VERSION = 'oc-v2'
const PRECACHE = `${VERSION}-precache`
const RUNTIME = `${VERSION}-runtime`

const precacheUrls = (self.__WB_MANIFEST || []).map((e) => e.url)

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((c) => c.addAll(precacheUrls))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

/** Add the headers that make the page cross-origin isolated (enables SharedArrayBuffer). */
function withCOI(res: Response): Response {
  if (!res || res.status === 0) return res
  const headers = new Headers(res.headers)
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin')
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
}

// Content-hashed assets and the big wasm cores never change once published.
const IMMUTABLE = /\/(assets|ffmpeg|ffmpeg-mt)\/|\.(?:woff2?|wasm)$/

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // leave cross-origin requests untouched

  if (IMMUTABLE.test(url.pathname)) {
    // Cache-first: these are immutable, so serve from cache and backfill on miss.
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME)
        const hit = await cache.match(req)
        if (hit) return withCOI(hit)
        const res = await fetch(req)
        if (res.ok && res.type === 'basic') cache.put(req, res.clone())
        return withCOI(res)
      })(),
    )
    return
  }

  // Network-first for HTML/navigation so a new deploy is never stuck behind stale
  // cache; fall back to cache when offline.
  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req)
        if (res.ok && res.type === 'basic') {
          const cache = await caches.open(PRECACHE)
          cache.put(req, res.clone())
        }
        return withCOI(res)
      } catch {
        const cached =
          (await caches.match(req)) ||
          (await caches.match('index.html')) ||
          (await caches.match('./'))
        if (cached) return withCOI(cached)
        throw new Error('offline and not cached')
      }
    })(),
  )
})
