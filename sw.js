const CACHE_NAME = 'tarawih-go-v4'; // Versi baru
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'manifest.json',
    'logo.png'
];

// 1. Install: Simpan semua aset ke HP
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Menyimpan aset ke memori HP...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. Activate: Hapus cache lama agar tidak penuh
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. Fetch: Strategi OFFLINE TOTAL
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Jika file ada di memori HP (Cache), langsung tampilkan (Cepat & Offline)
            if (cachedResponse) {
                return cachedResponse;
            }

            // Jika tidak ada di cache, baru ambil ke internet
            return fetch(event.request).then((networkResponse) => {
                // Simpan file baru (seperti font/gambar cdn) ke cache secara otomatis
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        }).catch(() => {
            // Jika internet mati DAN file tidak ada di cache, arahkan ke halaman utama
            if (event.request.mode === 'navigate') {
                return caches.match('index.html');
            }
        })
    );
});