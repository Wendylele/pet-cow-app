const CACHE_NAME = 'petCow-v7';

/* 安装：跳过等待，立即激活 */
self.addEventListener('install', event => {
  self.skipWaiting();
});

/* 激活：删除所有旧缓存，立即接管页面 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

/* 请求策略：网络优先，网络失败才用缓存
   这样每次打开都能拿到最新版本 */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(response => {
      /* 网络成功：更新缓存，返回最新内容 */
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(() => {
      /* 网络失败：回退到缓存 */
      return caches.match(event.request).then(r => r || caches.match('/pet-cow-app/'));
    })
  );
});
