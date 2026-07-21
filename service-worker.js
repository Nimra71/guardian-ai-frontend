// Minimal service worker — its only job is to exist and handle fetch,
// which is what makes browsers consider this site "installable" as an app.
// It does NOT cache your API calls (those always go live to your real
// backend) — it only lets the browser treat this page itself as installable.

const CACHE_NAME = "guardianai-shell-v1";
const SHELL_FILES = ["./index.html", "./manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Only serve from cache for the page shell itself; everything else
  // (all your API calls to FastAPI Cloud) always goes to the real network.
  const url = new URL(event.request.url);
  if (SHELL_FILES.some((f) => url.pathname.endsWith(f.replace("./", "")))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
