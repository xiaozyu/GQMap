const CACHE_NAME = 'gq-nav-clean-v1';

// 安裝時立即接管，不等待舊版關閉
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 啟動時強制刪除所有舊名字的系統殘留快取
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

// 網路優先策略：有網路抓最新程式，沒網路才讀快取，確保不會卡舊版
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
