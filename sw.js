const CACHE_NAME = 'petCow-v2';
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* 安装：缓存核心文件 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES);
    }).then(() => self.skipWaiting())
  );
});

/* 激活：清理旧缓存 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

/* 请求：优先缓存，网络失败则返回缓存 */
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(r => r || caches.match('./index.html'));
    })
  );
});
