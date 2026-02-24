const CACHE_NAME = 'tarawih-go-v2';
// Daftar aset yang wajib ada offline
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './logo.png'
    // Jika Anda punya file lokal lainnya, tambahkan di sini:
    // './style.css',
    // './app.js'
];

// 1. Install Service Worker & Cache Aset
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching aset utama...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. Aktivasi & Hapus Cache Lama
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Menghapus cache lama...');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// 3. Strategi Fetch: Cache First, then Network
self.addEventListener('fetch', (event) => {
    // Abaikan request dari ekstensi browser atau skema bukan http/https
    if (!(event.request.url.indexOf('http') === 0)) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // Jangan simpan response yang tidak valid (misal error 404)
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !event.request.url.includes('cdn')) {
                    return networkResponse;
                }

                // Salin response untuk disimpan di cache
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // Fallback Offline untuk navigasi halaman
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});