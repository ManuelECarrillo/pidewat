# Entregables finales (2026-11-27)

Render de Remotion en la PC (Claude), H.264 30 fps CRF 20, audio AAC 48 kHz normalizado a **-14 LUFS** (pico -1,5 dB) con ffmpeg `loudnorm` en dos pasadas. Sin música (no hay licencia confirmada). Miniatura `.jpg` del segundo 1 junto a cada video. Todos pesan menos de 7 MB.

| Archivo | Duración | Peso | Grabación o clip | UTM |
|---|---|---|---|---|
| `P1-9x16.mp4` / `P1-4x5.mp4` | 22,8 s | 6,6 MB / 5,1 MB | clips `p1-gancho-dueno` (lipsync) y `p1-problema-celular`, `c1-pedido-hamburguesa.mp4`, fondo `puesto` | `?p=puestos&utm_source=facebook&utm_medium=paid_social&utm_campaign=pidewat_mx_t1&utm_term=puestos&utm_content=p1_pedido_medias` |
| `P2-9x16.mp4` / `P2-4x5.mp4` | 20,1 s | 1,6 MB / 1,5 MB | `c2-menu-qr-carrito.mp4`, `c5-dispositivos.mp4`, fondo `puesto` | `?p=puestos&utm_source=facebook&utm_medium=paid_social&utm_campaign=pidewat_mx_t1&utm_term=puestos&utm_content=p2_sin_comision` |
| `R1-9x16.mp4` / `R1-4x5.mp4` | 18,6 s | 4,1 MB / 3,2 MB | clip `fonda-cliente-qr`, `c3-mesa-qr.mp4` | `?p=restaurantes&utm_source=facebook&utm_medium=paid_social&utm_campaign=pidewat_mx_t1&utm_term=restaurantes&utm_content=r1_qr_mesa` |
| `R2-9x16.mp4` / `R2-4x5.mp4` | 14,4 s | 4,1 MB / 3,4 MB | clip `cocina-tablet`, `c4-mesa-a-cocina.mp4` (termina en «Listos (1)») | `?p=restaurantes&utm_source=facebook&utm_medium=paid_social&utm_campaign=pidewat_mx_t1&utm_term=restaurantes&utm_content=r2_demo_cocina` |
| `P3-4x5.png` / `P3-9x16.png` | imagen | 0,8 / 1,1 MB | fondo `puesto`, chat de ejemplo, `p3-mensaje-pedido.png` | `?p=puestos&utm_source=facebook&utm_medium=paid_social&utm_campaign=pidewat_mx_t1&utm_term=puestos&utm_content=p3_comparativa` |
| `R3-4x5.png` / `R3-9x16.png` | imagen | 0,7 / 0,9 MB | fondo `fonda-qr`, `r3-menu-pedido-mesa.png` | `?p=restaurantes&utm_source=facebook&utm_medium=paid_social&utm_campaign=pidewat_mx_t1&utm_term=restaurantes&utm_content=r3_menu_listo` |

Destino P1, P2, P3, R1 y R3: `https://pidewat.vercel.app/`. Destino R2: `https://pidewat.vercel.app/empezar?plan=restaurante` con su UTM.

Notas para subir a Meta:
- R2 dura 14,4 s (el guion pedía 18-20 s): la voz es corta y no se estiró con relleno.
- Las piezas con personas IA llevan la etiqueta «Dramatización»: marca también la casilla de «contenido generado con IA» al subir.
- Volver a generar: `cd anuncios` y `npx remotion render src/index.ts <ID> salida/<ID>.mp4 --codec=h264 --audio-codec=aac --crf=20`; después, normaliza a -14 LUFS (ver docs/anuncios/CAMBIOS.md).
