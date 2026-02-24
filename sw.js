const CACHE_NAME = 'tarawih-go-v3'; // Naikkan versi ke v3
const ASSETS_TO_CACHE = [
    'index.html',    // Tanpa ./ jika berada di root yang sama
    'manifest.json',
    'logo.png'
];

// 1. Install & Force Cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching assets...');
            // Menggunakan addAll dengan proteksi: jika satu gagal, tetap lanjut
            return Promise.all(
                ASSETS_TO_CACHE.map(url => {
                    return cache.add(url).catch(err => console.log('Gagal cache:', url, err));
                })
            );
        })
    );
    self.skipWaiting();
});

// 2. Aktivasi & Bersihkan Sampah Cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    // Memastikan SW langsung mengontrol halaman saat pertama kali install
    return self.clients.claim();
});

// 3. Strategi Fetch: Network First (Supaya tidak stuck di cache lama)
// Tapi jika internet mati, ambil dari Cache.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request).then((response) => {
                if (response) {
                    return response;
                }
                // Jika user mencoba membuka halaman utama saat offline
                if (event.request.mode === 'navigate') {
                    return caches.match('index.html');
                }
            });
        })
    );
});