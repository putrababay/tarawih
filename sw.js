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
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Jika ada di cache, kirim yang di cache. Jika tidak, ambil dari internet
            return cachedResponse || fetch(event.request).then((networkResponse) => {
                // Simpan hasil fetch baru ke cache secara otomatis (untuk font/cdn)
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        }).catch(() => {
            // Jika internet mati dan file tidak ada di cache (fallback)
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});