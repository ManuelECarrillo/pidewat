# Grabaciones de Pidewat

Todos los archivos se grabaron con datos ficticios de `/demo`, escala de dispositivo 3, y son MP4 H.264 a 30 fps y 1080 × 2338. Los toques llevan un aro suave inyectado solo durante la grabación.

| Archivo | Duración / resolución / peso | Qué muestra y puntos para montaje |
|---|---:|---|
| `c1-pedido-hamburguesa.mp4` | 11.0 s · 1080 × 2338 · 1.07 MB | 0.0 menú; 1.0 hamburguesa; 2.2 tamaño doble; 3.2 queso extra; 4.2 sin cebolla; 5.4 total; 6.4 carrito; 8.8 mensaje exacto de WhatsApp. |
| `c2-menu-qr-carrito.mp4` | 12.6 s · 1080 × 2338 · 1.27 MB | 0.0 menú; 0.8 tarjeta QR real; 3.8 tamaño; 4.8 extra; 8.0 carrito; 10.4 mensaje final. |
| `c3-mesa-qr.mp4` | 11.7 s · 1080 × 2338 · 949 KB | 0.0 menú de mesa 7; 1.1 personalización; 7.9 pedido con mesa; 9.7 mensaje organizado para la mesa. |
| `c4-mesa-a-cocina.mp4` | 13.1 s · 1080 × 2338 · 1.04 MB | 0.0 mesa 7; 1.0 platillo; 7.8 envío; 8.8 cocina recibe; 10.2 Preparando; 11.6 pestaña Listos con #7 · Mesa 7. |
| `c5-dispositivos.mp4` | 4.0 s · 1080 × 2338 · 109 KB | Marcos genéricos sin logos: Android, iPhone, tablet con QR y computadora con cocina. |
| `p3-mensaje-pedido.png` | 1080 × 2338 · 175 KB | Captura fija del mensaje de pedido ordenado. |
| `r3-menu-pedido-mesa.png` | 1080 × 2338 · 179 KB | Captura fija del carrito de mesa 7 con platillo, extras y total. |

Verificación: Playwright decodificó cada MP4, comprobó 1080 px de ancho y revisó un cuadro por segundo (54 cuadros en total); ninguno estaba en blanco. También se revisaron visualmente las dos PNG fijas. No hay datos reales, Santiago ni errores de interfaz.

## Volver a generarlas

```powershell
npm run build
anuncios\grabar\iniciar-produccion.cmd
npx playwright test --config anuncios/grabar/playwright.config.ts
```

La suite toma PNG a escala 3 por cada paso y compone pausas a 30 fps. Produce H.264 con WebCodecs y un muxer MP4 local para que no dependa del video comprimido de Playwright ni de una interfaz inventada.

La C1 de vuelta 9 usa dos hamburguesas (Doble carne + Queso extra; Clásica sin cebolla) y escribe `c1-pedido-hamburguesa-posiciones.json`. C4 escribe su JSON equivalente para los cambios de estado de cocina. Las cajas están expresadas en píxeles de salida 1080 × 2338.
