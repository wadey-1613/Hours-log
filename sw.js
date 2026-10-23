/* Hours Log service worker: makes the app open and work with no signal.
   Bump VERSION when releasing a new version so phones refresh their copy. */
var VERSION = 'hourslog-v9';
var CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  /* The page itself: open the saved copy straight away (no waiting on a weak signal),
     and fetch a fresh copy in the background so the next open has any update. */
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    e.respondWith(
      caches.match('index.html').then(function (hit) {
        var old = hit ? hit.clone() : null;
        var refresh = fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone(), fresh = res.clone();
            caches.open(VERSION).then(function (c) { c.put('index.html', copy); });
            /* Tell the open page when the saved copy has just changed. */
            if (old) Promise.all([old.text(), fresh.text()]).then(function (t) {
              if (t[0] !== t[1]) self.clients.matchAll().then(function (cs) { cs.forEach(function (c) { c.postMessage('hourslog-updated'); }); });
            }).catch(function () {});
          }
          return res;
        }).catch(function () { return null; });
        if (hit) { e.waitUntil(refresh); return hit; }
        return refresh.then(function (res) { return res || caches.match('./'); });
      })
    );
    return;
  }
  /* Everything else: saved copy first. */
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
        return res;
      });
    })
  );
});
