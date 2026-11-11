// 每次改版把版號 +1,舊快取會自動清掉
const CACHE_NAME = 'gq-nav-v4';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
// 程式庫與圖釘圖示（版本固定的檔案）：也存一份，沒訊號時 App 才打得開。地圖圖磚、路線 API 一律不存。
const LIB_HOSTS = ['unpkg.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'raw.githubusercontent.com'];
 
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL)).catch(() => {}));
});
 
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
 
// 網路優先(有網路永遠拿最新版),成功後順手存一份;沒網路才用快取
// 只快取自己網站的檔案,不快取地圖圖磚/第三方 API;大的圖資 PDF 交給 App 內的 IndexedDB
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isLib = LIB_HOSTS.includes(url.hostname);
  if (url.origin !== location.origin && !isLib) return;
  if (/\.pdf$/i.test(url.pathname)) return;
 
  if (isLib) {                                   // 程式庫版本固定 → 快取優先，啟動不再等網路
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && (res.ok || (isLib && res.type === 'opaque'))) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
 
