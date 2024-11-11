const CONFIG_nocors = true;

// sw.js
const CACHE_NAME = 'offline-cache-v1';
const URLS_TO_CACHE = [
    // Rmarkdown satic htmlwidgets  example:
    '/playground4offline/',          // Cache the root index.html
    '/playground4offline/index.html', // Explicitly cache index.html in case the root path isn't recognized
    '/playground4offline/sw.js',
    // WebR example:
    '/playground4offline/r-wasm.html',
    'https://webr.r-wasm.org/latest/webr.mjs',
    'https://webr.r-wasm.org/main/webr-worker.js',
    'https://webr.r-wasm.org/main/R.bin.js',
    'https://webr.r-wasm.org/main/R.bin.wasm',
    'https://webr.r-wasm.org/main/libRlapack.so',
    'https://webr.r-wasm.org/main/libRblas.so',
    'https://webr.r-wasm.org/main/vfs/usr/lib/R/library/translations/DESCRIPTION'
];

// Install event: cache the necessary files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching files during install...');                
                if (CONFIG_nocors) {
                    return cache.addAll(URLS_TO_CACHE.map(function(urlToPrefetch) {
                        return new Request(urlToPrefetch, { mode: 'no-cors' });
                     })).then(function() {
                       console.log('All resources have been fetched and cached.');
                     });
                }
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
