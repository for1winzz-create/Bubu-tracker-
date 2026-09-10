const CACHE = 'study-tracker-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const res = await fetch(e.request);
        cache.put(e.request, res.clone());
        return res;
      } catch (err) {
        const cached = await cache.match(e.request);
        return cached || Response.error();
      }
    })
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'Study Tracker', body: 'Reminder' };
  try {
    data = event.data.json();
  } catch (e) {
    try {
      data = { title: 'Study Tracker', body: event.data.text() };
    } catch (e2) {}
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Study Tracker', {
      body: data.body || '',
      tag: 'schedule-reminder',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      if (clientsArr.length > 0) return clientsArr[0].focus();
      return self.clients.openWindow('/');
    })
  );
});
