const CACHE_NAME = 'tarawih-go-v7';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // 1. Jika ada di cache, tampilkan langsung
            if (cachedResponse) return cachedResponse;

            // 2. Jika tidak ada, ambil dari internet
            return fetch(event.request).then((networkResponse) => {
                // Jangan simpan jika response tidak valid
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }

                // 3. Simpan otomatis file CSS/Font/JS dari CDN ke memori HP
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return networkResponse;
            });
        }).catch(() => {
            // Fallback jika offline total dan file tidak ada di cache
            if (event.request.mode === 'navigate') {
                return caches.match('/');
            }
        })
    );
});