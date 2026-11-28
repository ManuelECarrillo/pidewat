# Piezas v2: P2, P3, R1 y R3 (dirección de Claude, 2026-11-28)

Eduardo aprobó los pilotos P1 y R2 v2 («Están bien todos», 28/11). Las otras cuatro piezas se rehacen con la misma calidad. **Cada una tiene un formato distinto**, no la plantilla de P1/R2.

Reglas: las de `PILOTOS-V2.md`, sin excepción.
- UI real a sangre con paneo vertical, sin cortes laterales; texto de la app ≥ 34 px.
- Títulos en placa sólida que nunca tapa la UI, máximo 6 palabras.
- Subtítulos en bloques de 2 líneas, tomados de `subtitulo`.
- Música de `assets/musica/pista.mp3` bajo la voz y SFX hechos con código.
- Sin «Dramatización» y sin escenas IA ni créditos nuevos.
- Negocio de demo «El Fogón». Mismos productos en el problema y en la demo.
- Precio: $249/mes, 14 días gratis, sin tarjeta. El plan Restaurante no tiene precio.

## P2 · Demo de pantalla rápida «Sin comisión por pedido» (≈ 18-20 s, 9:16 y 4:5)
**Formato: demostración de producto bien editada.** No hay escenas de personas: es la pantalla real, con cortes rápidos y acercamientos a funciones.
| s | Imagen | Texto grande |
|---|---|---|
| 0-2 | Golpe: el menú real de «El Fogón» entra a sangre con un zoom rápido. La placa «0 % de comisión por pedido» aparece con un «pop». | «0 % DE COMISIÓN POR PEDIDO» |
| 2-6 | Recorrido rápido por funciones reales, un corte cada ~1 s: categorías → producto con fotos → tamaño → extra → el total cambia. | «TU MENÚ CON PRECIOS Y EXTRAS» |
| 6-11 | **Mismo menú en Android y en iPhone**, lado a lado y a pantalla completa (cuadros reales de `c5`: Chromium 360 y WebKit 390). Después la barra del navegador con la dirección (pidewat.vercel.app) y la placa «Sin descargar apps». | «ANDROID · IPHONE · SIN DESCARGAR» |
| 11-14 | El dueño, del lado del panel: el QR real (tarjeta de `/panel/qr`) a pantalla completa → corte al mensaje ordenado. | «TU QR Y TU LINK» |
| 14-19 | Cierre sobre el clip `puesto.mp4`: «$249/mes · mensualidad fija» → «14 días gratis · sin tarjeta» → calcomanía «Toca Registrarte ↓». | — |
Voz: P2-1, P2-2 y P2-3 (`voz/rapida/`). La voz P2-2 dice «Tus clientes ven tus platillos…», que va con la parte de funciones.

## R1 · Problema-solución «¿Tu QR solo muestra un PDF?» (≈ 18 s)
**Formato: comparación problema → solución.**
| s | Imagen | Texto grande |
|---|---|---|
| 0-2 | Clip `fonda-cliente-qr.mp4`: la clienta acerca el celular al QR. Placa: «¿Tu QR solo muestra un PDF?» | «¿TU QR SOLO MUESTRA UN PDF?» |
| 2-5 | **El problema:** una carta en PDF genérica, dibujada con código (texto chico, pellizco para hacer zoom y nada que tocar), con una X roja: «Ve el menú… y luego tiene que llamar al mesero». Sin marcas reales. | «VE EL MENÚ… Y YA» |
| 5-13 | **La solución, real:** el menú de mesa 7 de Pidewat (c3) a sangre: elige, personaliza y en el carrito aparece «Mesa 7» → enviar → el pedido ordenado con formato. | «AQUÍ TAMBIÉN PIDE» |
| 13-18 | Cierre con la fonda: «Pidewat Esencial · 14 días gratis · sin tarjeta» → «Después $249/mes» → «Toca Registrarte ↓». | — |
Voz: R1-1, R1-2 y R1-3. Si R1-1 («Un QR en tu mesa puede hacer más que enseñar una carta») no cuadra con el gancho nuevo, deja el gancho como texto sin voz y que la voz entre en el segundo 2. **No generes voz nueva.**

## P3 · Imagen antes/después «De 6 mensajes a un pedido claro» (4:5 y 9:16)
**Formato: comparación lado a lado, casi sin texto.**
- Dos mitades del mismo tamaño. Izquierda, «ANTES»: el chat ficticio con los 6 mensajes de P1, sobre el mismo pedido («Me das 2 hamburguesas» · «una sin cebolla» · «la otra doble» · «ah, y queso a la doble» · «¿cuánto es?» · «paso por ellas»). Derecha, «DESPUÉS»: el mensaje real de Pidewat con formato, las 2 hamburguesas y «Total: $217».
- El único texto aparte de las etiquetas ANTES/DESPUÉS: el título «De 6 mensajes a 1 pedido» y la oferta «14 días gratis · sin tarjeta». Wordmark Pidewat chico.
- Fondo: `puesto-4x5.jpg` desenfocado y oscurecido. Mensajes con texto ≥ 34 px en 1080.

## R3 · Imagen «Tu menú, listo para pedir» (4:5 y 9:16)
**Formato: fotografía protagonista.**
- La foto `fonda-qr-4x5.jpg` ocupa todo. Sobre el soporte de acrílico de la mesa va la **tarjeta QR real de El Fogón**, con perspectiva para que parezca impresa y puesta ahí.
- **Una sola captura** legible: el menú de mesa 7 (c3) en un celular dentro de la foto, o como tarjeta flotante grande, no dos.
- Texto: «Tu menú con QR para pedir» y la oferta «14 días gratis». Nada más. Wordmark Pidewat chico.

## Entrega
`anuncios/salida/v2/`: `P2-9x16.mp4`, `P2-4x5.mp4`, `R1-9x16.mp4`, `R1-4x5.mp4`, `P3-4x5.png`, `P3-9x16.png`, `R3-4x5.png`, `R3-9x16.png`. Revisión de 1 cuadro por segundo con el checklist de PILOTOS-V2.
