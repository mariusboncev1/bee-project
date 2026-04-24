self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  self.registration.unregister();
});
  // Only cache GET requests for static assets, let API and SSR pass through
  if (e.request.method !== 'GET') return;
  if (!e.request.url.includes('/api/') && e.request.url.includes(self.location.origin)) {
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
  }
});
