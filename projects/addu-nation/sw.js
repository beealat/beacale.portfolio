/* ============================================================
   ADDU Nation — Service Worker (sw.js)
   Strategy: Network-First for local assets (dev-friendly),
             Cache-First for CDN assets
   ============================================================ */

const CACHE_NAME = 'addu-nation-v9'; // ← bump this number whenever you update files
const OFFLINE_URL = './index.html';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './main.css',
  './app.js',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png'
];

const CDN_ORIGINS = [
  'https://ajax.googleapis.com',
  'https://cdn.jsdelivr.net',
  'https://cdnjs.cloudflare.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];

// ── Install ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing v4...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting()) // activate immediately
  );
});

// ── Activate: wipe ALL old caches ────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating v4, clearing old caches...');
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(n => n !== CACHE_NAME)
          .map(n => {
            console.log('[SW] Deleting old cache:', n);
            return caches.delete(n);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // CDN assets → cache-first (they don't change)
  if (CDN_ORIGINS.some(o => request.url.startsWith(o))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Local assets → network-first (always get latest from disk)
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

// ── Strategies ───────────────────────────────────────────────

// Cache-First: try cache, update cache in background, fallback network
async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) {
    fetchAndCache(req); // background refresh
    return cached;
  }
  return fetchAndCache(req);
}

// Network-First: always try network, cache the result, fallback to cache
async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    // Last resort offline fallback for navigation requests
    if (req.mode === 'navigate') {
      return (await caches.match(OFFLINE_URL)) ||
        new Response('<h1>ADDU Nation is offline</h1>', {
          headers: { 'Content-Type': 'text/html' }
        });
    }
    return new Response('Offline', { status: 503 });
  }
}

async function fetchAndCache(req) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw err;
  }
}

// ── Message handler (force update from app) ──────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
