# Voz de los anuncios (ElevenLabs) · 2026-11-27

- **Voz:** «Marco» (`fjL3LsPhPx7Isgj2S7NE`), español de México, narrador publicitario (la que le gustó a Eduardo en Celda 27). Modelo `eleven_v4`.
- **Prueba corta primero:** `pruebas/` (Marco v4, Marco multilingual v2 y Silverio v4). Whisper local entiende «Pidewat» como «Pide what» en las tres: la marca se escribe `Pídewat` en el texto de la voz para que suene «pide-guat».
- **Gasto:** 1,223 caracteres de los 12 tramos + ~250 de las pruebas, del plan Starter (límite 74,758 al mes; iba en 0). Sin compras.
- **Tramos:** `segmentos.json` (texto de la voz y texto EXACTO del subtítulo, con `$249`, `14`, `Pidewat`). Los originales `P1-1.mp3`… quedan aquí.
- **Para el montaje usar `rapida/`:** sin silencios al inicio y al final y 1.12× más rápida (ffmpeg `atempo`, no cambia el tono). Así caben en las duraciones de `CREATIVOS.md`.
- **`tiempos.json`:** por tramo, duración real del archivo de `rapida/`, el subtítulo exacto y las palabras de la voz con su inicio y fin en segundos (ya ajustados al recorte y a la velocidad; ±0,2 s). Las palabras de la voz dicen «Pídewat», «doscientos cuarenta y nueve» y «catorce»: para los subtítulos usa el campo `subtitulo`, repartido en bloques de máximo 2 líneas según esos tiempos.
- Revisado con faster-whisper (small, CPU): los 12 tramos dicen exactamente el guion.

| Tramo | Dónde va | Duración (rapida) |
|---|---|---|
| P1-1 | P1 0-3 s, la dice el dueño a cámara (también es el audio del lipsync) | 4.62 s |
| P1-3 | P1 grabación real | 6.88 s |
| P1-4 | P1 cierre | 7.32 s |
| P2-1 | P2 gancho | 3.01 s |
| P2-2 | P2 grabación y dispositivos | 9.74 s |
| P2-3 | P2 cierre | 6.54 s |
| R1-1 | R1 escena de la clienta | 3.28 s |
| R1-2 | R1 grabación real | 8.34 s |
| R1-3 | R1 cierre | 6.14 s |
| R2-1 | R2 escena de cocina | 4.48 s |
| R2-2 | R2 grabación de cocina | 6.59 s |
| R2-3 | R2 cierre | 2.53 s |

Con la voz, P1 queda en ~22-23 s (con 3 s de burbujas sin voz), P2 en ~19 s, R1 en ~18 s y R2 en ~14-16 s (se puede estirar con la grabación).
Las imágenes P3 y R3 no llevan voz.
