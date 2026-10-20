// sw.js - 最低限度 PWA 安裝宣告
const CACHE_NAME = 'gqmap-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // 被動快取或直接回傳網路請求，確保導航與工單資料即時更新
  e.respondWith(fetch(e.request));
});
