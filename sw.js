const CACHE_NAME = 'the-forge-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './storage.js',
  './problemBank.js',
  './skillRating.js',
  './ai.js',
  './manifest.json',
  './evaluators/javascript.js',
  './evaluators/python.js',
  './screens/dashboard.js',
  './screens/problemPicker.js',
  './screens/problemView.js',
  './screens/resultView.js',
  './screens/importProblem.js',
  './screens/settings.js',
  './screens/history.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
