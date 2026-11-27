# Encargo para Codex: landing, medición Meta, grabaciones reales y montaje de 6 anuncios

Pedido por Eduardo el 2026-11-27. Codex hace TODO el código, las grabaciones y el montaje. Claude dirige y revisa.
Guiones, copys, UTM y reglas creativas: `docs/anuncios/CREATIVOS.md` (léelo completo antes de empezar).

## Reglas obligatorias
- Rama: `claude/project-thread-60jlct` (sale de `entrar-directo`, PR #12). Nunca push a `main`, nunca fusionar. (Codex no hace git: lo commitea la sesión de Claude en la PC.)
- No cambiar precios ni `lib/planes.ts`. Vigente: Esencial $249/mes, 14 días gratis sin tarjeta; Restaurante $499 «Próximamente», solo solicitud de demostración.
- No tocar a Santiago ni a negocios reales. No usar sus datos en grabaciones. Solo `/demo`, build local o el negocio ficticio de pruebas `el-fogon`.
- Gustos de Eduardo: nada de `<select>`, `confirm()`, `alert()` ni `type=color` nativos; nada de `target=_blank` a páginas propias; sin bibliotecas pesadas en la app; respetar `prefers-reduced-motion`.
- La landing NO se reconstruye y la demo funcional NO se reemplaza por imágenes.
- No secretos en el repo. Variables nuevas solo como nombres; los valores los pone Eduardo en Vercel.
- `npm run build` debe pasar.

## A. Landing (`src/components/landing/Landing.tsx` y su CSS)
1. Línea de confianza cerca del hero (debajo de los botones): «Funciona en Android, iPhone, tablets y computadoras. Sin instalar nada.» con 3-4 íconos SVG simples en línea (celular, tablet, computadora). Solo se publica si la parte E pasa.
2. «Cómo funciona»: reforzar en el texto de los pasos que el cliente pide desde el navegador de su celular y el dueño maneja todo desde su celular, tablet o computadora, sin descargar apps.
3. Dos imágenes nuevas (las fuentes están en `docs/anuncios/escenas/`):
   - Imagen 1 `puesto-4x5.jpg`: cerca de la parte de problema → solución (junto a «Así se ve en el celular de tu cliente» o en una franja corta antes de la demo), con una captura REAL del pedido ordenado encima si ayuda.
   - Imagen 2 `fonda-cliente-qr-9x16.jpg` (recortar a 4:5): en «Cómo funciona», junto al paso del QR.
   - Optimizar a AVIF/WebP en `public/landing/` (máx. ~150 KB cada una en 1080 px de ancho), `next/image` con `sizes`, `width/height` fijos (sin saltos de diseño), `loading="lazy"`, `alt` en español descriptivo. Sin texto dentro de las fotos.
4. Variante ligera por público con `?p=puestos` o `?p=restaurantes` (sin duplicar la web): solo cambia la frase pequeña sobre el título y el subtítulo del hero.
   - puestos: «Para taquerías, hamburguesas, hot dogs y food trucks» / subtítulo actual.
   - restaurantes: «Para fondas y restaurantes con mesas» / «Tu menú con QR en cada mesa. Tus clientes eligen y te mandan el pedido completo por WhatsApp.»
   - Sin `p` queda exactamente como hoy. Guardar `p` junto con las UTM (`lib/medicion.ts`) y mandarlo en `detalle` de `landing_visita`.
5. Página `/terminos` (Condiciones de contratación), en español sencillo, enlazada en el pie de la landing, en `/empezar` (junto al aviso de privacidad) y en `/panel/plan`. Solo hechos del código:
   - 14 días gratis, sin tarjeta. Al terminar, el dueño decide si paga: mensual $249 MXN con cobro automático por Mercado Pago, o anual $2,490 en un pago (sin meses sin intereses).
   - El cobro automático se cancela cuando quiera desde «Mi plan»; el menú sigue hasta la fecha pagada.
   - Si no paga, hay 7 días de gracia y luego el menú se pausa; no se borra nada (`lib/estado.ts`).
   - Pidewat no cobra comisión por pedido. El cliente final envía su pedido por WhatsApp; abrir WhatsApp no garantiza que el mensaje se envíe.
   - Plan Restaurante: en pruebas, no se puede contratar; solo demostración.
   - Responsable y correo de contacto: dejar `{{RESPONSABLE}}` y `{{CORREO}}` como en `/privacidad`; Claude los llena con lo que diga Eduardo. No inventarlos.
6. `/privacidad`: agregar un párrafo sobre la medición de Meta descrita en B (qué se manda, para qué, y cómo rechazarla).

## B. Medición para Meta (píxel + API de conversiones)
Objetivo: que Meta optimice por pruebas activadas y solicitudes de demostración, sin romper la privacidad.
- Variables: `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_TOKEN`, `META_TEST_EVENT_CODE` (opcional, solo QA). Si faltan, todo funciona igual y no se manda nada.
- Aviso de cookies propio (no nativo, estilo de la landing, abajo y pequeño, sin tapar el botón principal del celular): «Usamos cookies de Meta para medir nuestros anuncios» · Aceptar · Rechazar. El píxel del navegador (PageView, ViewContent en la demo) SOLO carga tras «Aceptar». Contar en `eventos_landing`, en agregado y sin datos personales, `cookies_aceptar` y `cookies_rechazar` (agregar a la lista de eventos permitidos de `/api/medir`).
- API de conversiones desde el servidor (fetch a `graph.facebook.com/v26.0/<pixel>/events`, con timeout de 2 s, sin bloquear ni romper el registro si falla):
  - `crearPrueba` (Esencial) correcto → evento estándar `CompleteRegistration`, `custom_data: { content_name: "esencial", status: "trial" }`.
  - `enviarSolicitud` con plan restaurante → evento estándar `Lead`, `custom_data: { content_name: "restaurante_demo" }`.
  - `user_data`: `client_ip_address`, `client_user_agent` y `fbc` armado desde el `fbclid` guardado (`fb.1.<ms>.<fbclid>`). Correo y teléfono (SHA-256) SOLO si la persona aceptó las cookies. `event_id` único, el mismo que use el píxel del navegador si también dispara el evento (deduplicación). `action_source: "website"`, `event_source_url`.
  - Pasar `utm_content` en `custom_data` para cruzar con nuestro embudo.
- Mantener intacto el embudo propio sin cookies (`/admin/embudo`), que sigue siendo la fuente de verdad.
- No optimizar ni mandar `Purchase` todavía.

## C. Grabaciones de pantalla REALES (Playwright, 30 fps)
Grabar con datos ficticios en build local (`/demo`) o con `el-fogon`. Si `/demo` no tiene una hamburguesa con tamaño, «Queso extra» y la opción «Sin cebolla», agrégala SOLO a los datos de `/demo` (`lib/demo.ts`) con precios creíbles.
Viewport de celular 390×844 a escala 3 (recortar a 1080 de ancho). Sin cursor de mouse; toques con un círculo suave.
1. `c1-pedido-hamburguesa`: menú → hamburguesa → tamaño → queso extra → sin cebolla → el total cambia → carrito → «Enviar por WhatsApp» → el mensaje EXACTO que genera `lib/whatsapp.ts`, mostrado en una burbuja tipo chat (como hace la landing con `formatoWa`). Para P1.
2. `c2-menu-qr-carrito`: menú → tarjeta QR real de `/panel/qr` → variante → extra → carrito → mensaje. Para P2.
3. `c3-mesa-qr`: menú abierto desde el QR de una mesa → platillos y extras → enviar → mensaje. Para R1.
4. `c4-mesa-a-cocina`: QR mesa 7 → producto → `/panel/cocina` recibe el pedido → «Preparando» → «Listo». Para R2. (Cocina solo en el negocio ficticio.)
5. `c5-dispositivos`: el mismo menú en Android (360×800, Chromium) y en iPhone (390×844, WebKit), y el panel del dueño en tablet (820×1180) y computadora (1440×900). Marcos de dispositivo realistas y genéricos (sin logos de marcas). Para P2 y la landing si sirve.
6. Capturas fijas PNG: mensaje de pedido ordenado (P3), menú y pedido de mesa (R3).
Guardar en `docs/anuncios/grabaciones/`.

## D. Montaje de los 6 anuncios (Remotion, en `anuncios/` fuera de `src/`)
- Seguir los guiones de `CREATIVOS.md` al pie de la letra (textos exactos, duración, orden).
- Clips animados de las escenas: los genera la sesión de Claude en la PC con APIMart (ver `escenas/PROMPTS.md`); si alguno falta, usar la foto con movimiento lento (Ken Burns), nunca inventar pantallas.
- Voz: la prepara la sesión de Claude en la PC (ElevenLabs, voz mexicana neutral). Subtítulos quemados sincronizados, máximo 2 líneas, fuente de la marca, contorno legible.
- Etiqueta pequeña «Dramatización» mientras se vea a una persona generada con IA.
- Zonas seguras 9:16 de `CREATIVOS.md`. Gancho legible en el primer segundo y medio.
- Música solo con licencia comercial confirmada, o sin música. Volumen -14 LUFS, voz por encima.
- Exportar por anuncio: `P1-9x16.mp4`, `P1-4x5.mp4`, … (H.264, 30 fps, AAC) e imágenes `P3-4x5.png`, `P3-9x16.png`, `R3-4x5.png`, `R3-9x16.png`, más una miniatura por video.
- Guardar finales en `anuncios/salida/` y una hoja `anuncios/salida/LISTA.md` con duración, peso y qué grabación usa cada uno.

## E. QA de compatibilidad (antes de prometer «funciona en todos»)
Con Playwright: Chromium en Android emulado (Pixel 5 y 360×800), WebKit en iPhone emulado (iPhone 13), tablet (iPad Mini) y escritorio (1440).
Recorridos: landing completa (con y sin `?p=`), demo interactiva, `/empezar` (validaciones, sin crear cuentas reales), menú público y carrito, link de WhatsApp correcto, `/entrar`, panel (menú, QR, plan) con el negocio ficticio, cocina.
Anotar resultados en `docs/anuncios/QA.md` con capturas antes/después de la landing (360, 390, 768, 1440). Si algo falla en Safari/WebKit, arreglarlo y volver a probar. Decir con honestidad que es emulación (no hay iPhone físico).

## Entrega
`docs/anuncios/CAMBIOS.md` con lo hecho, lo que no se pudo y lo que necesita de Claude o de Eduardo.
