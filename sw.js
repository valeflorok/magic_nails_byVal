// SERVICE WORKER: guarda archivos en caché para que la app funcione sin internet
const CACHE = 'nails-v4';
const ARCHIVOS = [
  './', 'index.html', 'css/estilos.css', 'js/script.js',
  'manifest.json', 'img/logo.png', 'img/icon-192.png', 'img/icon-512.png'
];

// Al instalar: guarda los archivos base
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
});

// Al activar: borra cachés viejas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(claves =>
      Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

// En cada pedido: primero busca en caché, si no está va a internet y lo guarda
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(guardado =>
      guardado || fetch(e.request).then(res => {
        if (res.ok) { // solo guarda respuestas correctas (no errores 404)
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return res;
      })
    )
  );
});
