self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('sota-cache-v1').then(cache =>
      cache.addAll([
        './',
        './index.html',
        './core.js',
        './mood.js',
        './personality.js',
        './memory.js',
        './manifest.json'
      ])
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});