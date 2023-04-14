importScripts("https://cdn.jsdelivr.net/npm/pouchdb@7.3.1/dist/pouchdb.min.js");
importScripts("/js/sw-db.js");

const INIT_MSG = "SW:";
const INIT_BASE = "/";

const STATI_CACHE_NAME = "static-cache-v1.1";
const INMUTABLE_CACHE_NAME = "inmutable-cache-v1.1";
const DYNAMIC_CACHE_NAME = "dynamic-cache-v1.1";

function cleanCache(cacheName, numberItems) {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > numberItems) {
        cache.delete(keys[0]).then(() => {
          cleanCache(cacheName, numberItems);
        });
      }
    });
  });
}

self.addEventListener("install", (event) => {
  console.log(INIT_MSG, "install");

  const promiseCache = caches.open(STATI_CACHE_NAME).then((cache) => {
    return cache.addAll([
    ]);
  });

  const promiseCacheInmutable = caches
    .open(INMUTABLE_CACHE_NAME)
    .then((cache) => {
      return cache.addAll([
      ]);
    });

  event.waitUntil(Promise.all([promiseCache, promiseCacheInmutable]));
});
    
self.addEventListener("install", (event) => {
  console.log(INIT_MSG, "activated");
  const prom = caches.keys().then((cachesItems) => {
    cachesItems.forEach((element) => {
      if (element != STATI_CACHE_NAME && element.includes("static")) {
        return caches.delete(element);
      }
    });
  });

  event.waitUntil(prom);
});

self.addEventListener("fetch", (event) => {
  console.log(event.request.clone().method);
  if (event.request.clone().method === "POST") {
    const respuesta = fetch(event.request.clone())
      .then((respWeb) => {
        return respWeb;
      })
      .catch(() => {
        if (self.registration.sync) {
          return event.request.json().then((body) => {
            if (body.payment != null) {
              const respOffline = saveOrder(body);
              return respOffline;
            } else {
              return null;
            }
          });
        } else {
          //crear response que no tiene sync
          return null;
        }
      });
    event.respondWith(respuesta);
  } else if (event.request.clone().method === "PUT") {
  } else {
    const resp = fetch(event.request)
      .then((respWeb) => {
        if (!respWeb) {
          return caches.match(event.request);
        }
        caches.open(DYNAMIC_CACHE_NAME).then((chacheDynamic) => {
          chacheDynamic.put(event.request, respWeb);
          cleanCache(DYNAMIC_CACHE_NAME, 30);
        });
        return respWeb.clone();
      })
      .catch(() => {
        return caches.match(event.request);
      });

    event.respondWith(resp);
  }
  
});

self.addEventListener("sync", (event) => {
  console.log("sw:sync");
  if (event.tag === "new-order") {
    const resPromSync = sendPostOrders();
    event.waitUntil(resPromSync);
  }
});