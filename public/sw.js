/* Fermi offline shell: public static assets only; never cache Firebase/API/user data. */
const VERSION = "fermi-offline-v2";
const SHELL = VERSION + "-shell";
const ASSETS = VERSION + "-assets";
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const HOME = BASE + "/";
const CORE = [HOME, BASE + "/agenda/", BASE + "/agenda/activiteit/", BASE + "/manifest.webmanifest", BASE + "/icon.svg",
  BASE + "/images/branding/fermi-logo.png",
  BASE + "/images/branding/atoom-loader.png"];
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await Promise.allSettled(CORE.map(async (url) => {
      const response = await fetch(url, { cache: "reload" });
      if (response.ok && response.type !== "opaque") await cache.put(url, response);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("fermi-offline-") && key !== SHELL && key !== ASSETS).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
function eligible(request, url) {
  if (request.method !== "GET" || url.origin !== self.location.origin) return false;
  if (!url.pathname.startsWith(BASE + "/")) return false;
  if (url.pathname.includes("/api/") || url.pathname.includes("/_next/data/")) return false;
  if (request.headers.has("authorization")) return false;
  return true;
}
self.addEventListener("message", (event) => {
  if (event.data?.type !== "FERMI_CACHE_ACTIVITIES") return;
  const urls = Array.isArray(event.data.urls) ? event.data.urls.slice(0, 180) : [];
  event.waitUntil((async () => {
    const cache = await caches.open(ASSETS);
    await Promise.allSettled(urls.map(async (value) => {
      if (typeof value !== "string") return;
      const url = new URL(value, self.location.origin);
      if (!eligible(new Request(url), url)) return;
      if (!url.pathname.startsWith(BASE + "/images/")) return;
      if (await cache.match(url.href)) return;
      const response = await fetch(url.href);
      if (response.ok && response.type !== "opaque") await cache.put(url.href, response);
    }));
  })());
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (!eligible(request, url)) return;
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL);
      try {
        const response = await fetch(request);
        if (response.ok && response.type !== "opaque") await cache.put(request, response.clone());
        return response;
      } catch {
        return (await cache.match(request, { ignoreSearch: true })) || (await cache.match(HOME)) ||
          new Response("Fermi is offline. Open de app eerst een keer met internet.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }
  const isAsset = url.pathname.startsWith(BASE + "/_next/static/") ||
    /\.(?:png|jpe?g|webp|svg|gif|ico|css|js|woff2?|webmanifest)$/i.test(url.pathname);
  if (!isAsset) return;
  event.respondWith((async () => {
    const cache = await caches.open(ASSETS);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type !== "opaque") {
      try { await cache.put(request, response.clone()); } catch { /* Storage quota: fall back to network. */ }
    }
    return response;
  })());
});
