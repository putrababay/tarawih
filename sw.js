const CACHE_NAME = 'tarawih-v1';
const assets = [
    '/',
    '/index.html',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Tahap Install (Simpan file ke cache)
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching assets...');
            cache.addAll(assets);
        })
    );
});

// Tahap Fetch (Ambil dari cache jika offline)
self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request);
        })
    );
});