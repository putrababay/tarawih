const CACHE_NAME = 'tarawih-go-v5'; // Naikkan versi
const ASSETS_TO_CACHE = [
    'index.html',
    'manifest.json',
    'logo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Kita tambahkan '/' secara eksplisit agar root bisa dibuka offline
            return cache.addAll([...ASSETS_TO_CACHE, './']);
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
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then((networkResponse) => {
                // Simpan aset baru secara dinamis (seperti link CDN)
                if (networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            });
        }).catch(() => {
            // FALLBACK: Jika offline total dan navigasi gagal
            if (event.request.mode === 'navigate') {
                return caches.match('index.html');
            }
        })
    );
});