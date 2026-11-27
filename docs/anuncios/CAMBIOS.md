# Cambios de anuncios

## Vuelta 8 (retoques P3 y R3)

### Corregido

- P3 en 4:5 y 9:16 incorpora la oferta obligatoria «14 días gratis · Sin tarjeta» junto al CTA «Crea tu menú», con tipografía de 40 px o mayor.
- La comparación de P3 ahora muestra el mensaje de pedido como burbuja verde de WhatsApp: aplica negritas e itálicas igual que `src/components/landing/formatoWa.tsx` y no expone los marcadores `*` ni `_`. El contenido reproduce el pedido de la grabación: Hamburguesa de la casa, Doble carne · Queso extra · Sin cebolla, $132, recoger, Ana demo y el enlace de demo.
- Se retiró la etiqueta «Dramatización» de las imágenes P3 y R3. No se modificaron P1, P2, R1 ni R2.

## Vuelta 7 (R2 y subtítulos)

### Corregido

- Se regrabó C4 con la ruta local `/grabacion` y `PIDEWAT_GRABACION=1`: después de «Ya está listo», cambia a «Listos (1)» y mantiene visible la orden `#7 · Mesa 7` durante 1.5 s. Se actualizaron sus tiempos en `grabaciones/LEEME.md`.
- R2 en 9:16 y 4:5 muestra la interfaz completa dentro de la tablet y se congela en la pestaña Listos, sin mostrar la lista vacía.
- Los subtítulos se cortan por puntuación o cláusulas; las frases «Desde $249 al mes» y «Pruébalo 14 días gratis, sin tarjeta» no se separan entre bloques.

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

## Vuelta 3 (C: grabaciones)

### Quedó hecho

- Se agregó exclusivamente a `src/lib/demo.ts` la hamburguesa ficticia de la casa: tamaño Clásica/Doble carne, Queso extra y la opción de quitar Cebolla. No se tocaron precios de planes ni datos reales.
- Se creó `/grabacion/[escena]`, bloqueada con `notFound()` salvo cuando `PIDEWAT_GRABACION=1`. No consulta Supabase. Reutiliza `Menu`, `Cocina`, `tarjetaPng` de `lib/tarjetaQr.ts` y `mensajePedido` de `lib/whatsapp.ts`; así las pantallas y el texto mostrado son los reales de la app, alimentados con `/demo`.
- Para la cocina se añadió un almacén efímero protegido en `/api/grabacion/cocina`. Permite mostrar el mismo componente de cocina con pedido de mesa 7, Preparando y Listo, sin base, sesión ni persistencia.
- Scripts reproducibles en `anuncios/grabar/`, incluidos los marcos genéricos de dispositivos y la verificación de decodificación/cuadros. Se usó `next start` para no capturar el indicador de desarrollo.
- Entregados los cinco MP4, las dos PNG y `docs/anuncios/grabaciones/LEEME.md`.
- `npm run build`, `npx tsc --noEmit`, las cinco grabaciones y su verificación de reproducción pasan.

### Pendiente

- No se inició la parte D ni se montaron anuncios, conforme al encargo.
- El binario `ffmpeg` no estaba accesible en esta sesión pese a la ruta declarada en el contexto; la suite usa WebCodecs H.264 y un muxer MP4 local como respaldo. Los MP4 finales se decodificaron y verificaron a 30 fps.

### Necesita Claude o Eduardo

- Claude puede revisar los puntos de corte y usar los tiempos de `docs/anuncios/grabaciones/LEEME.md` al montar la parte D. No necesita credenciales para reproducir C.
- Eduardo no necesita aportar credenciales ni datos para estas grabaciones; si va a regenerarlas, basta con ejecutar el bloque de `LEEME.md` en esta PC.

## Vuelta 3b: correcciones

### Corregido

- `c5-dispositivos.mp4` se rehízo sin iframes: compone PNG de rutas reales ya cargadas para Android/Chromium 360 × 800, iPhone/WebKit 390 × 844, panel QR/tablet 820 × 1180 y cocina/escritorio 1440 × 900. Así ningún marco queda blanco.
- La ruta de grabación pasa `https://pidewat.vercel.app/demo` al mismo generador que usa `Menu`, `mensajePedido` y `tarjetaPng`; la tarjeta de mesa 7 lleva `?mesa=7`. Ya no aparece `pidewat.local` en QR, tarjeta ni mensaje.
- El encabezado de la pantalla de mensaje usa fondo verde y texto blanco con sombra; “WhatsApp” tiene contraste suficiente.
- Se regeneraron C1–C5 y las PNG dependientes. Playwright volvió a decodificar y revisar 54 cuadros, uno por segundo; todos contienen imagen. `npm run build` y `npx tsc --noEmit` pasan.

### Nota para Claude o Eduardo

- `/grabacion` es una ruta estática y tapa el slug `grabacion` si un negocio lo usa. No se tocó `src/lib/planes.ts`, como se indicó. Deben decidir si se añade a `SLUGS_RESERVADOS`.

## Vuelta 4 (D: montaje)

### Hecho

- Se creó el proyecto Remotion aislado en `anuncios/`, con `src/`, `remotion.config.ts`, fuentes locales Bricolage Grotesque e Inter, composición por pieza/formato, subtítulos sincronizados desde `voz/tiempos.json`, clips sin audio y voces locales.
- Las composiciones usan únicamente las grabaciones/PNG reales de Pidewat para pantallas. Las personas de clips IA llevan la etiqueta “Dramatización”; P1 difumina el letrero falso y R2 conserva la etiqueta fija “Plan Restaurante · en pruebas”, sin precio de Restaurante.
- Se excluyó `anuncios` del `tsconfig.json` raíz. `npm run build`, `npx tsc --noEmit` raíz y `npm run check` dentro de `anuncios` pasan.

### Pendiente por límite del sandbox

- El render de Remotion no pudo iniciar: el bundler intenta leer directorios padre fuera del workspace y el sandbox responde `Cannot read directory "../../..": Access is denied`, antes de lanzar Chrome. Por ello no se produjeron MP4/PNG, miniaturas, medición LUFS ni QA visual de los renders aquí.
- Claude debe ejecutar desde `anuncios/` fuera de este sandbox: `npm run render:todo`. Después debe crear una miniatura JPG por MP4, medir con `ffmpeg` (`loudnorm` o `ebur128`), ajustar si hace falta hacia -14 LUFS y hacer la revisión a un cuadro por segundo.
- Al publicar en Meta, Eduardo o Claude debe marcar la casilla de “contenido generado con IA” para las piezas con personas dramatizadas.

## Vuelta 5 (D: correcciones de montaje)

### Corregido

- Los subtítulos ahora proceden siempre del campo `subtitulo` de `anuncios/public/assets/tiempos.json`, no de las palabras reconocidas en la voz. Se dividen en bloques de hasta siete palabras, se cambian por fracción de caracteres a lo largo de la locución y se muestran en Inter 800 dentro de la franja segura.
- P1, P2 y R1 colocan las grabaciones reales en un marco genérico de celular, con la escena oscurecida detrás, títulos grandes del guion y subtítulos separados debajo. P1 inicia C1 en el punto que deja visible el mensaje final de WhatsApp más de 1.5 s.
- P1 usa `p1-problema-celular.mp4` para la escena de problema y burbujas de chat animadas, señaladas como ejemplo. R2 usa `cocina-tablet.mp4` en su gancho y muestra el texto completo del guion sin duplicarlo en otro subtítulo.
- Se rediseñaron los cierres de P1, P2, R1 y R2: escena oscurecida, wordmark legible, oferta/estado, CTA de al menos 44 px y entrada suave. Cada composición ahora incluye voz del cierre más 0.8 s, sin extender R2 a una tarjeta estática ni terminar en negro.
- R2 congela la grabación de cocina en el estado marcado como listo antes de que aparezca “No hay pedidos por preparar”; la interfaz queda dentro de marco de tablet y la pastilla “Plan Restaurante · en pruebas” queda fuera de la interfaz a 30+ px.
- P3 y R3 usan wordmark blanco con “wat” verde, capturas reencuadradas hacia el mensaje/pedido, pie y CTA mayores, y distribución vertical sin el vacío inferior. Las escenas con personas conservan la pastilla “Dramatización” dentro de zona segura.

### Render de una pieza

Desde `anuncios/`, por ejemplo para renderizar solo P1 vertical:

```powershell
npx remotion render src/index.ts P1-9x16 salida/P1-9x16.mp4 --codec=h264 --audio-codec=aac --crf=20
```

Para todas las piezas y formatos se conserva `npm run render:todo`.

## Vuelta 6 (D: ajustes finales)

### Corregido

- Los marcos de celular vertical ahora respetan la proporción de las grabaciones reales (1080 × 2338): en 9:16 se ven completos, con título arriba y subtítulos debajo del dispositivo. En 4:5 el encuadre es alto y el contenido se desplaza hacia la parte inferior al llegar a la confirmación, para mantener legibles carrito y mensaje.
- P1 conserva el mensaje final de WhatsApp desde C1 durante más de 1.5 s. P2 vuelve de la muestra de dispositivos a C2 para mostrar carrito y el mensaje final más de 1.5 s. R1 inicia C3 en el tramo que alcanza el pedido de mesa y mantiene visible su mensaje final más de 1.5 s.
- R2 usa C4 desde 7.5 s y lo reproduce a 0.73×: muestra envío, entrada a cocina, Preparando y se congela en Listo dentro de una tablet horizontal grande. Ya no congela la lista vacía.
- La etiqueta «Dramatización» solo aparece en los tramos con personas IA nítidas (ganchos, problema de P1 y artes P3/R3); se retiró de las pantallas reales y de los cierres, y se separó de los títulos.
- Los títulos de pantallas reales quedan centrados, en un máximo práctico de dos líneas y a 64 px en 9:16. El cierre ahora agrupa oferta, CTA y ayuda en el centro, dejando libre la franja de subtítulos.
- R3 ya no reutiliza el chat ficticio de P3: enseña una captura real de menú de mesa (C3) junto con la captura real de pedido organizado de mesa 7. No se modificó el volumen.

### Verificación

- `npx tsc --noEmit` dentro de `anuncios/`: pasa.

## Cierre de la sesión de Claude en la PC (2026-11-27)

**Quedó:** A+B y E (ff29666), voz y clips (259db8e), C (66ddacf) y D (este commit): 8 videos, 4 imágenes y 8 miniaturas en `anuncios/salida/`, con su `LISTA.md`.
- Voz: ElevenLabs «Marco», 12 tramos, ~1,500 caracteres del plan Starter. Clips: APIMart `wan2.6-i2v-flash`, **0,504 USD** (saldo 4,46 → 3,96).
- El render lo corrí yo en la PC porque el sandbox de Codex no puede abrir el bundler de Remotion. Antes de aprobarlo hice 4 renders y regresé el montaje 3 veces, revisando 1 cuadro por segundo. Lo que se corrigió: subtítulos con el texto de la voz en lugar del guion, celular recortado, mensaje de WhatsApp sin verse, cocina vacía en R2, etiquetas encimadas y cierre vacío.
- Volumen: -14 LUFS medidos con `ebur128` en los 8 videos.

**Pendiente / para Eduardo:**
- Al subir a Meta, marcar la casilla de «contenido generado con IA» (P1, R1, R2, P3, R3).
- R2 dura 14,4 s; el guion pedía 18-20 s.
- QA del panel, QR y cocina con sesión real: no se probó en local porque no hay Supabase en esta PC.
- `/grabacion` tapa el slug «grabacion»: decidir si se agrega a `SLUGS_RESERVADOS` (está en `lib/planes.ts`, que esta tarea no podía tocar).
- Nada de esto está en producción: la rama no se fusionó y no hay PR.
