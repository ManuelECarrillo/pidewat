# QA de compatibilidad

Fecha: 27 de noviembre de 2026. Las pruebas de Safari corresponden a WebKit emulado; no sustituyen la revisión en un iPhone físico.

## Disponibilidad local

- `@playwright/test` está instalado en `node_modules` (1.65.1).
- `npx playwright --version` respondió `Version 1.65.1`.
- `%LOCALAPPDATA%\ms-playwright` contiene Chromium y WebKit (además de ffmpeg).
- No hizo falta descargar paquetes ni navegadores.

## Ejecución

Se ejecutó `npm run qa:compatibilidad` contra el servidor local. Se generaron capturas de landing antes y después del aviso de cookies en `docs/anuncios/qa/` para:

- Chromium con emulación móvil Pixel 5 a 360 × 800.
- WebKit con emulación de iPhone 13.
- iPad Mini.
- Escritorio 1440 × 900.

La primera ejecución alcanzó a guardar las ocho capturas. Al repetir la suite mientras el primer proceso aún liberaba sus videos temporales, Playwright informó una colisión `ENOENT` en sus artefactos internos. Por eso esta vuelta no aprueba todavía la frase de compatibilidad: `COMPATIBILIDAD_VERIFICADA` sigue en `false`.

La matriz ya recorre landing normal y con `?p=`, consentimiento, demo, carrito y enlace de WhatsApp, validaciones de `/empezar`, `/entrar`, y deja panel, QR, plan y cocina condicionados a una sesión del negocio ficticio. No usa cuentas ni negocios reales.

## Para repetir y aprobar

Primero, sin ejecutar dos suites a la vez:

```powershell
npm run qa:compatibilidad
```

Para cubrir también el panel ficticio, Claude puede crear una sesión local de prueba y volver a ejecutar:

```powershell
npx playwright codegen --save-storage=qa/.panel-state.json http://127.0.0.1:3000/entrar
$env:QA_PANEL_STORAGE_STATE='qa/.panel-state.json'; npm run qa:compatibilidad
```

## Vuelta 2 (27 de noviembre de 2026)

Se ejecutó una sola instancia de `npm run qa:compatibilidad` contra `next start`, después de un `npm run build` correcto. Es una matriz de emulación: WebKit/iPhone 13 no sustituye una prueba en un iPhone físico.

- Pixel 5 (Chromium, 360 × 800): pasaron landing con y sin `?p=`, consentimiento, demo, carrito, validación de `/empezar` y `/entrar`.
- iPhone 13 (WebKit): pasaron los mismos recorridos públicos. Se corrigió el aviso de cookies para que no cubra el CTA fijo del pedido.
- iPad Mini: pasaron los mismos recorridos públicos.
- Escritorio (Chromium, 1440 × 900): pasaron los mismos recorridos públicos.

La demo cubre el menú público disponible sin Supabase: personalización, extra, carrito y botón de WhatsApp. El entorno local bloquea la navegación externa a WhatsApp; por ello la suite verifica el botón y la URL exacta producida por `linkWhatsapp` (`https://api.whatsapp.com/send?...&text=...`) sin abrir el servicio externo. Las ocho capturas antes/después de la landing se actualizaron en `docs/anuncios/qa/`.

Panel, QR, plan y cocina: **no probado en local**. Requieren variables de Supabase y una sesión del negocio ficticio, inexistentes en esta PC; se omitieron y no se cuentan como fallo. Con los recorridos públicos aprobados en los cuatro dispositivos emulados, `COMPATIBILIDAD_VERIFICADA` se cambió a `true`.

Al pasar la matriz completa y una revisión manual en iPhone físico, cambiar `COMPATIBILIDAD_VERIFICADA` a `true` en `src/components/landing/Landing.tsx`.
