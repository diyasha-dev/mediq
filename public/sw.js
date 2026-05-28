const CACHE_NAME = 'mediq-v2';
const STATIC_URLS = [
  '/',
  '/search',
  '/interactions',
  '/vault',
  '/report',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// ─── In-memory alarm registry ─────────────────────────────────────────────────
// Map<alarmId, timeoutId>  — cleared on SW restart (acceptable for setTimeout approach)
const activeAlarms = new Map();

// ─── Install — pre-cache key pages ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_URLS).catch(() => {})
    )
  );
  self.skipWaiting();
});

// ─── Activate — purge old caches ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch — smart caching strategy ───────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// ─── Message handler — schedule / cancel alarms from main thread ──────────────
self.addEventListener('message', (event) => {
  const { type, alarms } = event.data || {};

  if (type === 'SCHEDULE_ALARMS') {
    // Clear all previous alarms first
    activeAlarms.forEach((tid) => clearTimeout(tid));
    activeAlarms.clear();

    if (!Array.isArray(alarms)) return;

    alarms.forEach(({ id, drugName, times }) => {
      if (!Array.isArray(times)) return;

      times.forEach((timeStr, idx) => {
        if (!timeStr) return;
        const delay = msUntilNextFire(timeStr);
        const alarmId = `${id}-${idx}`;

        // Schedule the first fire; inside the callback we reschedule for 24h later
        const fire = () => {
          showMedReminder(drugName, timeStr);
          // Reschedule every 24 h
          const tid = setTimeout(fire, 24 * 60 * 60 * 1000);
          activeAlarms.set(alarmId, tid);
        };

        const tid = setTimeout(fire, delay);
        activeAlarms.set(alarmId, tid);
      });
    });

    // Acknowledge
    event.source && event.source.postMessage({ type: 'ALARMS_SCHEDULED', count: activeAlarms.size });
  }

  if (type === 'CANCEL_ALL_ALARMS') {
    activeAlarms.forEach((tid) => clearTimeout(tid));
    activeAlarms.clear();
  }
});

// ─── Push event (future Web Push / background push) ───────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'MedIQ Reminder', body: 'Time to take your medication.' };
  try { data = event.data.json(); } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'mediq-reminder',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: '/vault' },
    })
  );
});

// ─── Notification click — open /vault ─────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/vault';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function msUntilNextFire(timeStr) {
  const [hh, mm] = timeStr.split(':').map(Number);
  const now = new Date();
  const next = new Date(now);
  next.setHours(hh, mm, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1); // already passed today → tomorrow
  return next - now;
}

function showMedReminder(drugName, timeStr) {
  const [hh, mm] = timeStr.split(':').map(Number);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h = hh % 12 || 12;
  const label = `${h}:${String(mm).padStart(2, '0')} ${ampm}`;

  self.registration.showNotification('💊 MedIQ Reminder', {
    body: `Time to take ${drugName} (${label})`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: `mediq-${drugName}-${timeStr}`,
    renotify: true,
    silent: false,
    vibrate: [200, 100, 200, 100, 200],
    data: { url: '/vault' },
    actions: [
      { action: 'taken', title: '✅ Taken' },
      { action: 'snooze', title: '⏰ Snooze 10 min' },
    ],
  });
}
