# Cambios de anuncios

## Vuelta 1 (E + A + B)

### Quedó hecho

- QA de compatibilidad en `qa/`: Playwright cubre Chromium 360 × 800, WebKit/iPhone 13, iPad Mini y escritorio 1440. Genera capturas de landing antes/después en `docs/anuncios/qa/`.
- Landing: variantes ligeras `?p=puestos` y `?p=restaurantes`, parámetro `p` conservado junto con UTM y enviado como detalle de `landing_visita`; dos fotografías WebP optimizadas con `next/image`, medidas fijas, `sizes`, lazy loading y texto alternativo; textos de dispositivos/navegador reforzados.
- La frase «Funciona en Android, iPhone, tablets y computadoras…» está detrás de `COMPATIBILIDAD_VERIFICADA = false`, pues la suite aún no quedó aprobada por completo.
- Páginas `/terminos` y actualización de `/privacidad`; enlaces desde pie de landing, `/empezar` y `/panel/plan`.
- Aviso propio de cookies. Meta Pixel solo se inyecta tras Aceptar; PageView y ViewContent para `/demo` se omiten al rechazar. El embudo propio conserva eventos agregados de aceptar/rechazar.
- API de conversiones de Meta del servidor: timeout de 2 s, no interrumpe altas, eventos `CompleteRegistration` y `Lead`, `event_id` para deduplicación, `fbc` desde `fbclid`, UTM content e IP/agente. Correo y WhatsApp con SHA-256 únicamente si se aceptaron cookies.
- `.env.example` contiene solamente los nombres de `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_TOKEN` y `META_TEST_EVENT_CODE`.

### Archivos tocados

- `qa/playwright.config.ts`, `qa/compatibilidad.spec.ts`, `package.json`, `.gitignore`.
- `src/components/MetaConsentimiento.tsx`, `src/lib/meta.ts`, `src/lib/medicion.ts`, `src/app/api/medir/route.ts`.
- `src/components/landing/Landing.tsx`, `Landing.module.css`, `Medicion.tsx`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`.
- `src/app/empezar/FormEmpezar.tsx`, `src/app/empezar/acciones.ts`, `src/app/privacidad/page.tsx`, `src/app/panel/plan/page.tsx`, `src/app/terminos/page.tsx`, `.env.example`.
- `public/landing/puesto-4x5.webp` (107 KB) y `public/landing/fonda-cliente-qr-4x5.webp` (79 KB).
- `docs/anuncios/QA.md` y las capturas en `docs/anuncios/qa/`.

### Falló o quedó pendiente

- `npm run build` no llegó a compilación de la app: `next/font` intentó descargar Bricolage Grotesque e Inter de Google y el sandbox sin internet recibió `EACCES`. No faltan variables de Supabase; `npx tsc --noEmit` sí pasó sin errores.
- La repetición de QA chocó con artefactos temporales de una ejecución concurrente. Hay capturas, pero no se marca la compatibilidad como aprobada.
- Panel, QR, plan y cocina requieren una sesión de `el-fogon`/negocio ficticio; no se crearon cuentas reales.

### Necesita Claude o Eduardo

Claude debe ejecutar, sin otra suite de Playwright en paralelo:

```powershell
npm run qa:compatibilidad
npm run build
```

Para la cobertura autenticada ficticia:

```powershell
npx playwright codegen --save-storage=qa/.panel-state.json http://127.0.0.1:3000/entrar
$env:QA_PANEL_STORAGE_STATE='qa/.panel-state.json'; npm run qa:compatibilidad
```

## Vuelta 2 (correcciones de A+B y QA)

### Corregido

- El layout ahora envuelve `MetaConsentimiento` en `Suspense`, por lo que `useSearchParams()` no rompe el prerender de `/_not-found`; `npm run build` termina correctamente.
- La API de conversiones de Meta incluye `access_token` exclusivamente en el cuerpo de la petición, sin registrarlo. El envío se programa con `after()` de `next/server`, de modo que no bloquea ni se corta al terminar una server action.
- `fbclid` conserva la hora de su primera vista en esta pestaña (`fbclid_visto_ms`) y la API arma `fbc` con esa hora; conserva `Date.now()` como respaldo para visitas antiguas.
- Aviso y píxel se limitan a las páginas propias de Pidewat. No aparecen ni cargan en menús públicos `/<slug>`, administración o API. En `/panel` solo se permite el `CompleteRegistration` deduplicado cuando ya existía consentimiento.
- El aviso de cookies queda detrás de las hojas de pedido y conserva espacio sobre CTA fijos en tablet/escritorio; no impide agregar ni abrir el carrito.
- QA afinada para interacciones reales de la demo, el intervalo antirobot de `/empezar` y la URL generada para WhatsApp sin depender de salida de red externa.

### Verificación

- `npm run build`: pasa. Solo queda el aviso preexistente de Autoprefixer sobre `end`/`flex-end`.
- `npm run qa:compatibilidad`: recorridos públicos aprobados en Pixel 5/Chromium, iPhone 13/WebKit, iPad Mini y escritorio 1440; capturas renovadas en `docs/anuncios/qa/`. `COMPATIBILIDAD_VERIFICADA = true`.
- `npx tsc --noEmit`: pasa.

### Pendiente

- Panel, QR, plan y cocina: no probado en local porque esta PC no tiene variables de Supabase ni sesión del negocio ficticio; no se cuenta como fallo.
- Eduardo debe cargar en Vercel, si decide habilitar Meta, `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_TOKEN` y opcionalmente `META_TEST_EVENT_CODE`. No hay secretos en el repositorio.

Eduardo debe añadir en Vercel, si decide habilitar Meta, `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_TOKEN` y opcionalmente `META_TEST_EVENT_CODE`; no hay valores ni secretos en este repositorio. También debe confirmar los marcadores `{{RESPONSABLE}}` y `{{CORREO}}` de términos y privacidad.
