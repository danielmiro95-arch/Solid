// SGS|on · Service Worker
// Estrategia:
//  - Shell (HTML/CSS/JSX/PNG) → cache-first con revalidación en background
//  - /api/* (backend dinámico)  → network-first, sin cache
//  - Externos (CDN React/Babel/Supabase) → cache-first largo
//
// Versión bumpeada con cada release que cambia el shell. Si subes la versión
// borra los caches viejos en el activate().

const VERSION = 'sgson-v1-20260427y';
const SHELL_CACHE = VERSION + '-shell';
const CDN_CACHE   = VERSION + '-cdn';

const SHELL_FILES = [
  '/',
  '/manifest.json',
  '/sgs-on-logo.png',
  '/mentor-ia-logo.png',
  '/beonit-logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // /api/* — network first, sin cache (dinámico, auth, secrets)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req).catch(() => new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' }})));
    return;
  }

  // CDNs externas (React, Babel, Supabase) — cache-first largo
  if (url.hostname.includes('unpkg.com') || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CDN_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) cache.put(req, fresh.clone());
          return fresh;
        } catch (e) {
          return cached || new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // Shell same-origin — cache-first con revalidación en background
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req).then((fresh) => {
          if (fresh && fresh.ok) cache.put(req, fresh.clone());
          return fresh;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Otros: network passthrough
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});

// Push notifications (opcional · requiere registrar suscripción server-side)
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  const title = data.title || 'SGS|on';
  const options = {
    body: data.body || 'Tienes una notificación nueva.',
    icon: '/mentor-ia-logo.png',
    badge: '/mentor-ia-logo.png',
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100],
    tag: data.tag || 'sgson-notif',
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes(url) && 'focus' in w) return w.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Recibe mensajes del cliente (ej: skipWaiting) si hace falta
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
