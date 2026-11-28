# Cambios de anuncios

## Vuelta 20

- C2 espera a que la imagen real de la tarjeta QR termine de generarse y desaparezca su estado de carga antes de grabar; P2 vuelve a mostrar el QR de El Fogón tanto en el gancho como en «TU QR Y TU LINK».
- R3 recorta la tarjeta QR dentro del soporte de acrílico desde el contenido de la tarjeta, sin el texto residual «panel.» de la página de grabación.

## Vuelta 17 (correcciones visuales v2)

- P2 y R1 bajan sus placas de demostraciÃ³n a partir de y=255 en 9:16, con una banda fÃ­sica antes de la interfaz. R1 conserva el gancho exacto: Â«Â¿Tu QR solo muestra un PDF?Â».
- P2 sustituye la cuadrÃ­cula C5 por dos capturas reales independientes del mismo menÃº de El FogÃ³n (Chromium 360 e iPhone/WebKit 390), grandes y lado a lado. El segundo tramo incluye la barra legible `pidewat.vercel.app` y Â«Sin descargar appsÂ».
- Los momentos de mensaje de P2 y R1 ahora usan la burbuja formateada de P1 v2, sin marcadores Markdown visibles. El cierre R1 eleva Â«Pidewat EsencialÂ» a 84 px en 9:16 y mantiene la oferta en 54/48 px.
- R2 elimina el corte que exponÃ­a el aviso transitorio del navegador, sube el recorte seguro de cocina y agranda la comanda de Mesa 7 sobre la tablet (etiqueta #7 Â· Mesa 7 de 40 px en 9:16 y 34 px en 4:5).
- R3 reubica la tarjeta QR dentro del soporte acrÃ­lico de `fonda-qr-4x5.jpg`, con sus coordenadas y perspectiva ajustadas por formato.


## Vuelta 16 (P2, R1, P3, R3 v2 y detalles de R2)

- Se creó `anuncios/src/PiezasV2.tsx` y se registraron P2/R1 en video y P3/R3 en imagen con IDs v2. P2 es una demo rápida a sangre; R1 compara PDF contra pedido desde Mesa 7; P3 es antes/después y R3 deja la fotografía y el QR real como protagonistas. Comparten música, SFX, placas, subtítulos, paneos verticales y mensaje formateado de los pilotos sin reutilizar su estructura narrativa.
- R2 separa «Pedido desde Mesa 7» en una cabecera completa antes de los dos paneles y adelanta el paneo cliente, por lo que Comer aquí, Recoger y A domicilio ya no quedan debajo de la franja ni cortados. El recorte de cocina baja por debajo del aviso transitorio del navegador.
- El script `render-sandbox.mjs` detecta PNG y usa `renderStill` con el mismo bundle. Se entregaron los crudos v2 solicitados y las cuatro PNG; `qa-v16/` conserva las capturas de revisión a un segundo.

Autoevaluación honesta:
- **P2:** la demostración es rápida, legible y reserva bandas físicas para placas/subtítulos; Android y iPhone aparecen en C5. El tramo de dispositivos muestra además panel y cocina porque así está compuesta la grabación C5, aunque el foco principal sigue siendo los dos teléfonos.
- **R1:** el contraste PDF sin interacción → menú de Mesa 7 es claro y conserva productos/extras de hamburguesa. El PDF es una simulación genérica, intencionalmente sin marca; la voz entra al segundo 2 como indicó el guion.
- **P3:** los seis mensajes y las dos hamburguesas con total $217 se leen completos en ambas proporciones. Es la pieza con menos aire decorativo y mantiene sólo título, etiquetas, oferta y wordmark.
- **R3:** usa la foto de fonda completa, una sola captura grande del menú de Mesa 7 y la tarjeta QR real de El Fogón en perspectiva. La tarjeta se integra sobre el soporte/mesa pero la perspectiva es una composición 2D, no una fotografía impresa nueva.
- **R2:** los dos detalles pedidos quedan corregidos. Persisten los subtítulos dentro de su franja inferior de seguridad; no cubren controles. La revisión visual a 1 fps incluyó los dos formatos y los cuadros de transición.

## Vuelta 15 (R2: tablet real y franjas seguras)

- R2 vuelve a abrir y cerrar con `cocina-tablet.mp4` a pantalla completa. La pantalla física de la tablet se cubre con recortes reales de C4: `#7 · Mesa 7 · Nuevo` al inicio y la misma comanda en `Listo` al cierre; no se redibujó la tarjeta. La placa de título queda arriba de la tablet y el cierre usa el botón «Solicita una demostración ↓» fuera de ella.
- Las demostraciones C4 ahora empiezan en una franja de UI reservada a partir de y=340 en 9:16 (y su equivalente proporcional en 4:5). La cabecera contiene sólo la pastilla «Plan Restaurante · en pruebas», a 32 px en 9:16, completa y separada de la interfaz. Los subtítulos viven en una banda sólida inferior reservada, sin cubrir controles.
- La composición dividida reserva una cabecera propia para «Pedido desde Mesa 7» entre cocina y cliente: ya no se superpone a campos, y el encuadre del cliente mantiene visibles «Número de mesa» y «Tu nombre».
- Se renderizaron `salida/v2/crudo-R2-9x16.mp4` y `salida/v2/crudo-R2-4x5.mp4`, con una revisión de un cuadro por segundo en ambos formatos. `npx tsc --noEmit` pasó en `anuncios/`.

## Vuelta 14 (R2: tablet, recorte y huecos)

- R2 v2 sustituye los tres planos de la tablet negra por cortes a la grabación real C4 de `/panel/cocina`: el gancho parte de `#7 · Mesa 7 · Nuevo` y el cierre se congela en el estado final `Listo`. Se evita una perspectiva falsa sobre una cámara en movimiento y no queda una tablet negra en primer plano.
- La vista de cocina arranca por debajo del aviso del navegador; esa línea ya no entra al encuadre. La comanda se acerca a 1.08× sin recortar su contenido y el espacio inferior se completa con el pedido real de Mesa 7 desde C4, en vez de dejar media pantalla vacía.
- Los subtítulos de la demostración cliente ahora se anclan dentro de la franja inferior propia (70 px desde el borde en 9:16 y 20 px en 4:5), sin cubrir `¿Cuántos así?` ni otros controles de la interfaz.
- Se volvieron a renderizar `salida/v2/crudo-R2-9x16.mp4` y `salida/v2/crudo-R2-4x5.mp4`; los 19 cuadros a 1 fps de cada formato quedaron en `salida/v2/qa-v14/`. `npx tsc --noEmit` pasó en `anuncios/`.

## Vuelta 13 (pastilla en pruebas)

- R2 v2 dibuja `Plan Restaurante · en pruebas` como la última capa, por encima de todos los planos, interfaz, subtítulos y CTA, durante los 17 s completos en 9:16 y 4:5.
- Las tres placas de título de R2 empiezan debajo de la pastilla: y=350 en 9:16 y y=115 en 4:5. Así se conserva la separación respecto de la UI y los subtítulos.
- Se renderizaron `salida/v2/crudo-R2-9x16.mp4` y `salida/v2/crudo-R2-4x5.mp4`, con una revisión de un cuadro por segundo para confirmar que la pastilla es completa y legible en ambos formatos.

## Vuelta 12 (sincronía de estados R2)

- R2 v2 reproduce C4 de cocina en una sola pasada sin retrocesos: inicia en la comanda `Nuevo` (8.8 s de C4), cambia a `Preparando` al toque de 10.2 s y a `Listo` al abrir `Listos (1)` a los 11.6 s. Cuando termina la fuente, se congela el estado final; nunca se vuelve a un tramo anterior.
- La pastilla grande se calcula con esos mismos fotogramas de C4 y queda directamente sobre la etiqueta nativa de la comanda en 9:16 y 4:5. Los SFX de toque se alinearon a los dos cambios.
- Rendericé `salida/v2/crudo-R2-9x16.mp4` y `salida/v2/crudo-R2-4x5.mp4`. Se extrajeron los cuadros 7.5–10.5 s a 4 fps en `salida/v2/qa-v12/`; además se comprobaron los fotogramas de corte de Preparando y Listo en ambos formatos.

## Vuelta 11 (pilotos v2)

- Eliminé la franja negra inferior de las demos C1 y C4: la banda reservada para subtítulos ahora es crema `#f6f3ee` en ambos formatos. La interfaz conserva su anchura completa y sólo hace paneos verticales.
- P1 y R2 usan ahora bloques de subtítulos de hasta dos líneas, sincronizados contra los cortes de `palabras_voz`. El estilo unificado es Inter 800 de 54 px en 9:16 y 47 px en 4:5; ya no hay el bloque completo de cuatro líneas ni texto diminuto en R2.
- El chat P1 amplía las burbujas a 54/47 px y las distribuye a lo largo del lienzo. La comanda del gancho de R2 ahora dice exactamente `MESA 7 · 1 Hamburguesa de la casa · NUEVO`; los estados grandes quedan anclados al borde superior derecho de la tarjeta real.
- Rendericé `crudo-P1-9x16.mp4`, `crudo-P1-4x5.mp4`, `crudo-R2-9x16.mp4` y `crudo-R2-4x5.mp4` con `scripts/render-sandbox.mjs`, y extraje/inspeccioné una captura por segundo en `anuncios/salida/v2/qa-v11/`. `npx tsc --noEmit` pasó en `anuncios/`.

Autoevaluación honesta: los cuatro cortes ya no muestran un vacío negro en las demos, los subtítulos de la demostración se mantienen legibles y cortos, y la tarjeta de Mesa 7 coincide con el pedido real ($132, doble carne, queso extra, sin cebolla). En R2 el distintivo de estado queda deliberadamente superpuesto sobre la chapa nativa más pequeña para que el estado sea inequívoco sin separarse de la comanda.

## Vuelta 10 (correcciones de pilotos v2)

- Reemplacé los punch-ins de 1.5–1.9× por una composición de UI a 1080 px de ancho y paneos exclusivamente verticales, guiados por las posiciones de C1 y C4. Ningún encuadre escala horizontalmente la interfaz, por lo que no corta nombres, extras, precios ni tarjetas por los laterales.
- Quité los contornos de títulos. Los títulos que acompañan los planos de cámara ahora viven en placas sólidas oscuras (92 %, radio y sombra) dentro de zona segura; durante las demostraciones de interfaz se retiran para no tapar texto del producto o de la comanda.
- P1: el subtítulo inicial se lee directamente de tiempos.json; el chat ahora ocupa toda la pantalla, tiene encabezado «Cliente», seis burbujas grandes y pings, seguido del corte «¿Cuál era sin cebolla?». El pedido ordenado aparece como un mensaje Pidewat grande, sin asteriscos o guiones de Markdown, con las dos hamburguesas, extras y total $217 resaltados. Se rehízo el CTA como calcomanía «Toca Registrarte ↓».
- R2: añadí el plano 2–4 s de fonda-cliente-qr.mp4, el recorrido del cliente muestra «Mesa 7» y «Número de mesa 7», y la comanda de cocina permanece completa a lo ancho. NUEVO, PREPARANDO y LISTO son pastillas sólidas grandes; no usan contorno.
- Verificación: npx tsc --noEmit pasó en anuncios/. Se renderizaron P1 y R2 en 9:16 y 4:5 con scripts/render-sandbox.mjs; se extrajeron cuadros de revisión a un segundo con el binario FFmpeg incluido por Remotion porque ffmpeg no estaba en PATH.

Autoevaluación honesta: los laterales de la UI y las tarjetas de cocina ya no quedan amputados, los mensajes y CTA sí son legibles, y los cortes no sostienen un plano quieto por más de 2 s. El subtítulo largo de R2 se mantuvo compacto en su banda inferior para no competir con la tarjeta central; aun así, cubre una franja baja de la interfaz mientras habla la voz. Es el compromiso pendiente si se decide reservar una banda física para subtítulos en una siguiente edición.

## Vuelta 9 (pilotos v2: P1 y R2)

- El demo ahora se llama `El Fogón`; se recapturaron C1–C5 y las PNG. C1 arma dos hamburguesas con las variantes solicitadas y C4 documenta Mesa 7 hasta `Listos (1)`. Las posiciones de toque y total están en los JSON de C1 y C4, y los artefactos se copiaron al `public` de Remotion.
- Se agregaron pilotos `P1v2-9x16`, `P1v2-4x5`, `R2v2-9x16` y `R2v2-4x5`: UI a sangre con punch-ins, chat genérico, ticket de Mesa 7, mensaje final formateado, voces existentes y SFX WAV sintetizados localmente. La música queda como `<Audio>` opcional, desactivado mientras no exista una pista licenciada.
- Se eliminó la capa `Dramatización` de las piezas existentes y de los pilotos. Se mantiene la declaración para Meta, como indicó Eduardo.
- Validación: `npm run build` en raíz, `npx tsc --noEmit` en `anuncios/`, y las cinco pruebas de grabación pasaron con el servidor local en el puerto 3002.

### Render y revisión

El render de CLI todavía no pudo cargar `remotion.config.ts` dentro del sandbox: webpack intenta leer `../../..` y recibe `Access is denied`, aun limitando módulos, symlinks y caché. No se exportaron MP4 de pilotos ni hojas de contacto aquí, por lo que no afirmo una revisión visual final. Claude puede renderizar con:

```powershell
cd anuncios
npx remotion render src/index.ts P1v2-9x16 salida/pilotos/P1-9x16.mp4 --codec=h264 --audio-codec=aac --crf=20
npx remotion render src/index.ts P1v2-4x5 salida/pilotos/P1-4x5.mp4 --codec=h264 --audio-codec=aac --crf=20
npx remotion render src/index.ts R2v2-9x16 salida/pilotos/R2-9x16.mp4 --codec=h264 --audio-codec=aac --crf=20
npx remotion render src/index.ts R2v2-4x5 salida/pilotos/R2-4x5.mp4 --codec=h264 --audio-codec=aac --crf=20
```

Autoevaluación: la estructura de planos, escala de UI y zonas seguras están implementadas para el criterio de cinco segundos; falta la verificación de los MP4 renderizados y la extracción de un cuadro por segundo, así que la aprobación creativa final queda pendiente de render externo.
