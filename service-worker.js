const CACHE_NAME = "farhsiu-service-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./service-worker.js",
    "./icon.svg"
];


/* 安裝 */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(CACHE_NAME)
                .then(cache => {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                })

        );

        self.skipWaiting();

    }
);


/* 啟用 */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
                .then(keys => {

                    return Promise.all(

                        keys
                            .filter(
                                key =>
                                    key !== CACHE_NAME
                            )
                            .map(
                                key =>
                                    caches.delete(key)
                            )

                    );

                })

        );

        self.clients.claim();

    }
);


/* 網路請求 */

self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(event.request)
                .then(cached => {

                    if (cached) {

                        return cached;

                    }

                    return fetch(event.request)
                        .then(response => {

                            /*
                               把新的檔案存進 Cache
                            */

                            if (
                                response &&
                                response.status === 200 &&
                                response.type === "basic"
                            ) {

                                const copy =
                                    response.clone();

                                caches.open(
                                    CACHE_NAME
                                ).then(cache => {

                                    cache.put(
                                        event.request,
                                        copy
                                    );

                                });

                            }

                            return response;

                        });

                })
                .catch(() => {

                    return caches.match(
                        "./index.html"
                    );

                })

        );

    }
);