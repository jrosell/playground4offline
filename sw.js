// sw.js
const CACHE_NAME = 'offline-cache-v1';
const URLS_TO_CACHE = [
    '/playground4offline/',          // Cache the root index.html
    '/playground4offline/index.html', // Explicitly cache index.html in case the root path isn't recognized
    '/playground4offline/sw.js'
];

// Install event: cache the necessary files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching files during install');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Fetch event: serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return the cached response if it's available
                if (response) {
                    return response;
                }
                // Otherwise, fetch from the network
                return fetch(event.request);
            })
            .catch(() => {
                // Fallback in case the network is not available and the resource is not cached
                return caches.match('/index.html');
            })
    );
});

// Activate event: clear old caches if any
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
