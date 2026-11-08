const CACHE_NAME = "prato-prosa-v2";
const APP_SHELL = ["./", "./index.html", "./styles.css", "./app.js", "./supabase-config.js", "./manifest.webmanifest", "./assets/icon.svg", "./assets/icon-192.png", "./assets/icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok && new URL(request.url).pathname.startsWith(new URL(self.registration.scope).pathname)) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    return request.mode === "navigate" ? caches.match("./index.html") : Response.error();
  }));
});
