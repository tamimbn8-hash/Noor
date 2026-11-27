/**
 * نُور القرآن | NOOR AL-QURAN
 * sw.js - Service Worker لدعم إشعارات مواقيت الصلاة والأذان في الخلفية وعلى الهواتف الذكية
 */

const CACHE_NAME = 'noor-quran-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// التعامل مع النقر على إشعار الأذان أو الصلاة
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : './';
  const shouldPlayAdhan = event.notification.data && event.notification.data.playAdhan;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // إذا كان التطبيق مفتوحاً في الخلفية، اجعله في الواجهة
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          if (shouldPlayAdhan) {
            client.postMessage({ type: 'PLAY_ADHAN_FROM_NOTIFICATION' });
          }
          return client.focus();
        }
      }
      // إذا لم يكن مفتوحاً، افتح نافذة جديدة للموقع
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// التعامل مع استقبال رسائل من الصفحة الرئيسية
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_PRAYER_NOTIFICATION') {
    const { title, body, icon, tag, data } = event.data;
    self.registration.showNotification(title, {
      body: body || 'حيّ على الصلاة، تقبل الله منا ومنكم صالح الأعمال.',
      icon: icon || 'assets/icons/icon-192.png',
      badge: icon || 'assets/icons/icon-192.png',
      tag: tag || 'noor-prayer-notification',
      renotify: true,
      requireInteraction: true,
      vibrate: [500, 200, 500, 200, 500],
      data: data || { url: './', playAdhan: true },
      dir: 'rtl',
      lang: 'ar'
    });
  }
});
