/* Fermi offline shell: public static assets only; never cache Firebase/API/user data. */
const VERSION = "fermi-offline-v4";
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
      if (response.ok && response.type !== "opaque") {
        await cache.put(url, response.clone());
        if (response.headers.get("content-type")?.includes("text/html")) {
          const html = await response.text();
          const assets = await caches.open(ASSETS);
          const urls = new Set();
          for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
            const candidate = new URL(match[1], self.location.origin);
            if (candidate.origin === self.location.origin &&
                (candidate.pathname.startsWith(BASE + "/_next/static/") ||
                 candidate.pathname.startsWith(BASE + "/images/"))) urls.add(candidate.href);
          }
          await Promise.allSettled([...urls].map(async (assetUrl) => {
            const asset = await fetch(assetUrl);
            if (asset.ok && asset.type !== "opaque") await assets.put(assetUrl, asset);
          }));
        }
      }
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
function offlinePage() {
  const html = `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#06283B"><title>Even offline · S.V. Fermi</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100dvh;background:#061d30;color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;align-items:center;justify-content:center;padding:32px 24px}
body:before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 80% 5%,#194e70 0%,transparent 55%)}
main{position:relative;width:100%;max-width:430px;text-align:center}header{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:52px;font-weight:800;letter-spacing:.12em;font-size:16px}header img{width:36px;height:36px;object-fit:contain}
.symbol{width:92px;height:92px;margin:0 auto 28px;display:grid;place-items:center;border:1px solid #47718a;border-radius:26px;background:#103751}
.symbol svg{width:43px;height:43px;stroke:#ff8734;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
h1{font-size:clamp(29px,8vw,40px);line-height:1.15;letter-spacing:-.04em;margin:0 0 17px;font-weight:800}
p{font-size:16px;line-height:1.65;color:#bbd1df;margin:0 auto 34px;max-width:330px}
button,a{display:flex;align-items:center;justify-content:center;min-height:54px;border-radius:16px;text-decoration:none;font:700 15px system-ui,-apple-system,sans-serif}
button{background:#ff8734;color:#082438;border:0;width:100%;cursor:pointer}
a{color:#d6e7f0;margin-top:15px}small{display:block;margin-top:48px;color:#8ea9ba;font-size:12px}
</style></head><body><main>
<header><img src="${BASE}/icon.svg" alt=""> S.V. FERMI</header>
<div class="symbol"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 17a26 26 0 0 1 34 0M12 24a18 18 0 0 1 24 0M18 31a9 9 0 0 1 12 0"/><path d="m7 40 34-34"/></svg></div>
<h1>Even geen verbinding</h1>
<p>Fermi kan deze pagina momenteel niet offline openen. Maak verbinding met internet om je activiteiten en pagina's weer te laden.</p>
<button type="button" onclick="location.reload()">Opnieuw proberen</button>
<a href="${HOME}">Terug naar Home</a>
<small>S.V. Fermi · Altijd dichtbij, ook als je even offline bent.</small>
</main></body></html>`;
  return new Response(html, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
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
        return (await cache.match(request, { ignoreSearch: true })) ||
          offlinePage();
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
