const CACHE_NAME = 'petCow-v3';

/* 安装：只缓存最关键的入口文件，其他按需缓存 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      /* 只缓存入口页面，确保安装不会失败 */
      return cache.add('/pet-cow-app/');
    }).then(() => self.skipWaiting())
  );
});

/* 激活：清理旧缓存，立即接管所有页面 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

/* 请求策略：缓存优先，后台更新（Cache-then-Network）
   这样即使网络不好，也能立即从缓存返回页面 */
self.addEventListener('fetch', event => {
  /* 只处理GET请求 */
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      /* 有缓存就立即返回，同时后台静默更新缓存 */
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      }).catch(() => {
        /* 网络完全失败，返回缓存的首页作为兜底 */
        return caches.match('/pet-cow-app/');
      });

      return cached || fetchPromise;
    })
  );
});
