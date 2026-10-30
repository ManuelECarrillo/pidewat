// Service worker mínimo: permite instalar Pidewat en el celular. No guarda nada en caché
// para que el dueño siempre vea sus datos al día.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
