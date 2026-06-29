// My Money — minimal service worker.
// Strategy:
//   - HTML / navigation:  network-first, fall back to cached app shell
//   - Hashed bundle URLs (/assets/*): cache-first (immutable by hash)
//   - Everything else (icons, fonts, manifest): stale-while-revalidate
// The cache version bumps when this file changes.

const VERSION = 'mymoney-v3'
const SHELL_CACHE = `${VERSION}-shell`
const ASSETS_CACHE = `${VERSION}-assets`
const SHELL_URLS = ['./', './index.html', './manifest.webmanifest', './favicon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(
        names.filter((n) => !n.startsWith(VERSION)).map((n) => caches.delete(n))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // Navigation → network-first, fall back to cached index.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(SHELL_CACHE).then((c) => c.put('./index.html', copy)).catch(() => {})
          return res
        })
        .catch(async () => (await caches.match('./index.html')) || (await caches.match('./')))
    )
    return
  }

  // Hashed bundle assets — cache-first, immutable.
  if (url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit
        return fetch(req).then((res) => {
          const copy = res.clone()
          caches.open(ASSETS_CACHE).then((c) => c.put(req, copy)).catch(() => {})
          return res
        })
      })
    )
    return
  }

  // Icons / manifest / misc → stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req).then((res) => {
        const copy = res.clone()
        caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {})
        return res
      }).catch(() => cached)
      return cached || fetched
    })
  )
})
