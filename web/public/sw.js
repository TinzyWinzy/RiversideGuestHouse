// Riverside Guest House service worker (hand-rolled, no Workbox dependency).
// Strategy:
// - Navigations: network-first, fall back to cached shell (offline browsing of public pages).
// - Same-origin /assets/* + images: cache-first (runtime cache, avoids build-time manifest).
// - API / Firestore / Functions: never cached (network-only).
// - Background Sync 'enquiry-flush': notify clients to flush the IndexedDB queue.
const VERSION = 'riverside-v1';
const SHELL = ["/", "/accommodation", "/location", "/booking", "/privacy"];
const RUNTIME = `runtime-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isApi = (url) => /googleapis\.com|firebaseio\.com|firestore\.googleapis|cloudfunctions\.net|wa\.me/.test(url.host);

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (isApi(url)) return; // network-only: never serve or store API traffic
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit ?? caches.match("/"))),
    );
    return;
  }
  if (url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || /\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/.test(url.pathname))) {
    event.respondWith(
      caches.open(RUNTIME).then((cache) =>
        cache.match(request).then(
          (hit) =>
            hit ??
            fetch(request).then((res) => {
              if (res.ok) cache.put(request, res.clone());
              return res;
            }),
        ),
      ),
    );
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'enquiry-flush') {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((c) => c.postMessage({ type: 'FLUSH_QUEUE' }));
      }),
    );
  }
});
