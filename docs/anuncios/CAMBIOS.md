# Cambios de anuncios

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
