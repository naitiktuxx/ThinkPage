const APP_CACHE = 'new-tab-dashboard-app-v2';
const RUNTIME_CACHE = 'new-tab-dashboard-runtime-v1';
const APP_SHELL = [
  './',
  './index.html',
  './sw.js',
  './manifest.webmanifest',
  './app-icon.svg'
];
const MAX_RUNTIME_ITEMS = 80;

self.addEventListener('install', event => {
  event.waitUntil(
    cacheAppShell()
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => ![APP_CACHE, RUNTIME_CACHE].includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxItems) return;
  await Promise.all(keys.slice(0, keys.length - maxItems).map(key => cache.delete(key)));
}

async function fetchAndCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) {
    cache.put(request, response.clone());
  }
  return response;
}

function appShellRequests({ bust = false } = {}) {
  return APP_SHELL.map(path => {
    const url = new URL(path, self.registration.scope);
    if (bust) url.searchParams.set('__sw_update', Date.now().toString());
    return {
      cacheKey: new Request(new URL(path, self.registration.scope).href),
      networkRequest: new Request(url.href, { cache: 'reload' })
    };
  });
}

async function cacheAppShell({ bust = false } = {}) {
  const cache = await caches.open(APP_CACHE);
  await Promise.all(appShellRequests({ bust }).map(async ({ cacheKey, networkRequest }) => {
    const response = await fetch(networkRequest);
    if (response && (response.ok || response.type === 'opaque')) {
      await cache.put(cacheKey, response.clone());
    }
  }));
}

async function handleNavigation(request) {
  const cache = await caches.open(APP_CACHE);
  const indexRequest = new Request(new URL('./index.html', self.registration.scope).href);
  const rootRequest = new Request(self.registration.scope);
  const cached = await cache.match(request)
    || await cache.match(rootRequest)
    || await cache.match(indexRequest);

  if (cached) {
    fetch(request, { cache: 'reload' })
      .then(response => {
        if (response && (response.ok || response.type === 'opaque')) {
          cache.put(request, response.clone());
          cache.put(indexRequest, response.clone());
        }
      })
      .catch(() => {});
    return cached;
  }

  try {
    return await fetchAndCache(request, APP_CACHE);
  } catch {
    return cache.match(indexRequest);
  }
}

async function handleSameOriginAsset(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetchAndCache(request, APP_CACHE).catch(() => cached);
  return cached || fetchPromise;
}

async function handleRuntimeImage(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetchAndCache(request, RUNTIME_CACHE)
    .then(response => {
      trimCache(RUNTIME_CACHE, MAX_RUNTIME_ITEMS);
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(handleSameOriginAsset(request));
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(handleRuntimeImage(request));
  }
});

self.addEventListener('message', event => {
  if (event.data?.type === 'UPDATE_OFFLINE_COPY') {
    const replyPort = event.ports?.[0];
    const sendReply = message => {
      if (replyPort) {
        replyPort.postMessage(message);
      } else {
        event.source?.postMessage(message);
      }
    };

    event.waitUntil(
      cacheAppShell({ bust: true })
        .then(() => {
          sendReply({ type: 'OFFLINE_COPY_UPDATED' });
        })
        .catch(() => {
          sendReply({ type: 'OFFLINE_COPY_UPDATE_FAILED' });
        })
    );
  }

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
