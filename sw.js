const CACHE_NAME = 'tarawih-go-v1';
const ASSETS = [
    './',
    './index.html',
    // Tambahkan file CSS/JS eksternal jika Anda mendownloadnya, 
    // Jika menggunakan CDN (seperti Tailwind/FontAwesome), browser akan mencoba menyimpannya otomatis
];

// Tahap Install: Simpan file ke Cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Tahap Fetch: Ambil dari Cache jika Offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});