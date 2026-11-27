# Auditoría UI/UX — Fase 1 (antes de cambios)

Fecha: 2026-11-26  
Rama auditada: `ui-premium`  
Alcance: revisión y evidencia solamente. No se modificó nada en `src/`.

## Método y límites de la evidencia

- Recorrí `/demo` como cliente con datos ficticios: búsqueda, tamaño, extra, ingrediente quitado, carrito, tipo **Recoger** y llegada al botón habilitado de WhatsApp. No toqué ese botón, no abrí WhatsApp y no envié ningún pedido.
- Las capturas actuales se generaron con Chrome + `playwright-core`, usando 360 px, 390 px (`isMobile: true`) y 1440 px. El script reproducible está en `scripts/capturar-antes.cjs` y produce 21 PNG en `capturas/antes/`.
- `npx next build` se ejecutó antes de levantar la instancia y falló al descargar `Inter` y `Bricolage Grotesque` desde Google Fonts (`EACCES`). Como consecuencia, `npx next start -p 3130` no pudo encontrar `.next/BUILD_ID`. Para no modificar la app ni instalar nada, las capturas se tomaron de la misma rama con `next dev -p 3130`; el fallo de build queda registrado como `UX-011`.
- `/panel`, `/panel/menu`, `/panel/negocio`, `/panel/qr`, `/panel/plan` y `/panel/cocina` exigen sesión y base de datos. Se calificaron **por código, no por captura**, en `src/app/panel/**` y `src/components/**`; no se crearon ni usaron datos reales.
- Las calificaciones consideran claridad, rapidez de la tarea principal, prevención de errores, jerarquía visual, accesibilidad básica y ajuste al brief. Los números no son una medición porcentual.

## Calificación por pantalla

| Pantalla | Calificación | Evidencia | Problemas principales |
|---|---:|---|---|
| Menú público `/demo` | 7/10 | `capturas/antes/menu-publico-movil-360.png`, `menu-publico-movil-390.png`, `menu-publico-escritorio-1440.png` | UX-006 medio, UX-007 bajo |
| Hoja de tamaños/sabores | 8/10 | `capturas/antes/hoja-tamano-movil-360.png`, `hoja-tamano-movil-390.png`, `hoja-tamano-escritorio-1440.png` | UX-007 bajo |
| Hoja de extras e ingredientes | 8/10 | `capturas/antes/hoja-extras-ingredientes-movil-360.png`, `hoja-extras-ingredientes-movil-390.png`, `hoja-extras-ingredientes-escritorio-1440.png` | UX-007 bajo |
| Carrito | 7/10 | `capturas/antes/carrito-movil-360.png`, `carrito-movil-390.png`, `carrito-escritorio-1440.png` | UX-004 alto, UX-005 medio |
| Entrar `/entrar` | 7/10 | `capturas/antes/entrar-movil-360.png`, `entrar-movil-390.png`, `entrar-escritorio-1440.png` | UX-012 bajo |
| Inicio del dueño `/panel` | 4/10 | **Medido en código, sin captura**: `src/app/panel/page.tsx:40-64`, `src/components/CompartirLink.tsx:35-59` | UX-001 alto, UX-003 alto |
| Editor `/panel/menu` | 5/10 | **Medido en código, sin captura**: `src/app/panel/menu/page.tsx:67-130`, `src/components/OpcionesInput.tsx:40-74` | UX-003 alto, UX-008 medio |
| Mi negocio `/panel/negocio` | 6/10 | **Medido en código, sin captura**: `src/app/panel/negocio/page.tsx:21-62`, `src/components/HorarioInput.tsx:24-58` | UX-008 medio |
| QR `/panel/qr` | 6/10 | **Medido en código, sin captura**: `src/app/panel/qr/page.tsx:24-38`, `src/components/CompartirLink.tsx:40-54` | UX-009 medio |
| Plan `/panel/plan` | 7/10 | **Medido en código, sin captura**: `src/app/panel/plan/page.tsx:40-83` | UX-013 bajo |
| Cocina `/panel/cocina` | 6/10 | **Medido en código, sin captura**: `src/components/Cocina.tsx:41-66`, `src/components/Cocina.tsx:95-120` | UX-010 medio, UX-002 alto |
| Landing `/` | 8/10 | `capturas/antes/landing-movil-360.png`, `landing-movil-390.png`, `landing-escritorio-1440.png` | UX-011 medio |
| Registro `/empezar` | 7/10 | `capturas/antes/empezar-movil-360.png`, `empezar-movil-390.png`, `empezar-escritorio-1440.png` | UX-012 bajo |

## Problemas priorizados

### Alto

#### UX-001 · Inicio del dueño no resuelve las acciones diarias ni comunica la métrica con suficiente precisión

- **Pantallas:** `/panel`.
- **Evidencia:** `src/app/panel/page.tsx:46-64` muestra solamente la tarjeta de enlace/QR y una tarjeta de estadísticas; las acciones de menú siguen detrás de la navegación. `src/app/panel/page.tsx:17` obtiene `order_events`, y `src/app/panel/page.tsx:55` suma su importe aunque `src/app/panel/page.tsx:63` reconoce que un evento solo registra el toque en “Enviar pedido por WhatsApp”.
- **Qué pasa:** al abrir el panel, el dueño no puede responder al instante “¿mi menú funciona?”, “¿cómo agrego/cambio/agoto un producto?” ni distinguir con seguridad un monto de pedido enviado de dinero cobrado o confirmado.
- **Impacto:** es la pantalla de prioridad máxima del brief; hoy obliga a interpretar estadísticas y buscar tareas frecuentes.

#### UX-002 · La barra móvil del panel se parte cuando Cocina agrega una quinta sección

- **Pantallas:** todas las de `/panel`, especialmente `/panel/cocina`.
- **Evidencia:** `src/components/NavPanel.tsx:22` agrega Cocina y deja cinco enlaces; `src/app/globals.css:194-205` fija `grid-template-columns: repeat(4, 1fr)`.
- **Qué pasa:** el quinto enlace cae en una segunda fila inesperada y la reserva inferior de contenido sigue pensada para una sola barra.
- **Impacto:** puede tapar contenido o volver impredecible la navegación con una mano para un negocio que usa cocina.

#### UX-003 · El editor no permite las tareas más repetidas de forma inmediata

- **Pantallas:** `/panel` y `/panel/menu`.
- **Evidencia:** `src/app/panel/menu/page.tsx:67-95` obliga a crear categorías antes de mostrar alta de productos; `src/app/panel/menu/page.tsx:105-127` encierra cada producto y alta dentro de acordeones; precio y disponibilidad están dentro del formulario o tarjeta expandida (`src/app/panel/menu/page.tsx:112-117`).
- **Qué pasa:** agregar un platillo simple, cambiar precio o marcar agotado requiere navegar y abrir contexto; el inicio tampoco expone atajos.
- **Impacto:** contradice la meta de que un puesto pueda manejarlo como WhatsApp y el requisito de acciones cotidianas al alcance del dedo.

#### UX-004 · Quitar el último artículo del carrito no pide confirmación

- **Pantalla:** carrito.
- **Evidencia:** `src/components/Menu.tsx:102-103` borra la línea al llegar a cero; los controles del carrito lo llaman directamente en `src/components/Menu.tsx:273-277`.
- **Qué pasa:** un toque en “−” del único artículo descarta esa línea sin diálogo ni deshacer.
- **Impacto:** pierde una personalización que el cliente acaba de armar; el brief exige confirmación propia antes de borrar.

### Medio

#### UX-005 · Las validaciones del carrito están escondidas en el texto del botón

- **Pantalla:** carrito.
- **Evidencia:** `src/components/Menu.tsx:126-128` concentra la falta en una variable; `src/components/Menu.tsx:335-340` deshabilita el botón y usa ese texto como etiqueta, sin error junto a Nombre, Dirección o Mesa.
- **Qué pasa:** si el cliente ya recorrió la hoja, debe deducir qué campo corregir desde el CTA, especialmente con teclado abierto.
- **Impacto:** retrasa el cierre del pedido y no cumple “errores junto a su campo”.

#### UX-006 · El menú público no expresa de inmediato si el negocio está abierto o cerrado

- **Pantalla:** menú público.
- **Evidencia:** la cabecera solo muestra horario y dirección en `src/app/[slug]/page.tsx:68-73`; el aviso “Cerrado en este momento” depende de tener `horario` estructurado en `src/components/Menu.tsx:42-50` y aparece separado del encabezado (`src/components/Menu.tsx:186-190`). La captura `capturas/antes/menu-publico-movil-360.png` muestra el horario sin estado actual.
- **Qué pasa:** una persona puede recorrer y personalizar un pedido sin la señal inmediata que el brief pide en portada.
- **Impacto:** genera expectativas equivocadas y pedidos que finalmente no se pueden enviar.

#### UX-007 · La estructura pública sigue siendo una lista larga y estrecha también en escritorio

- **Pantallas:** menú, hojas y carrito públicos.
- **Evidencia:** `src/app/globals.css:31` limita `.wrap` a 720 px; `src/app/globals.css:171-175` limita la hoja a 720 px. Véanse `capturas/antes/menu-publico-escritorio-1440.png` y `carrito-escritorio-1440.png`.
- **Qué pasa:** en 1440 px queda una columna de celular con gran vacío lateral. En móvil la lista funciona, pero productos sin foto se leen como filas repetidas y el principal “+” es el único ancla visual.
- **Impacto:** bajo en finalización móvil, pero reduce percepción premium y escaneabilidad de menús largos en escritorio.

#### UX-008 · Edición de menú y horario concentra demasiada complejidad antes de guardar

- **Pantallas:** `/panel/menu` y `/panel/negocio`.
- **Evidencia:** `src/app/panel/menu/page.tsx:15-37` muestra en una alta sencilla nombre, precio, categoría, descripción, ingredientes, opciones, foto y disponibilidad; `src/components/OpcionesInput.tsx:40-74` siempre expone su editor. El horario estructurado muestra siete días y dos selectores por día en `src/components/HorarioInput.tsx:35-57`.
- **Qué pasa:** funciones opcionales compiten con el dato esencial y el guardado queda al final de formularios extensos.
- **Impacto:** la primera carga y el cambio de horario se sienten como “configuración” en vez de una acción corta desde el celular.

#### UX-009 · Compartir e imprimir QR no es una misma acción clara

- **Pantallas:** `/panel` y `/panel/qr`.
- **Evidencia:** la tarjeta de inicio comparte el enlace (`src/components/CompartirLink.tsx:28-43`), mientras que descargar QR e imprimir tarjetas aparecen como rutas separadas (`src/components/CompartirLink.tsx:45-54`; `src/app/panel/qr/page.tsx:24-38`).
- **Qué pasa:** “Compartir” publica texto con link, pero no ofrece explícitamente compartir la tarjeta QR; para imprimir hay que descubrir otra acción.
- **Impacto:** el QR existe y se genera bien, pero la tarea que el dueño reconoce como una sola se fragmenta.

#### UX-010 · Cocina no confirma fallos de transición ni protege de toques consecutivos

- **Pantalla:** `/panel/cocina`.
- **Evidencia:** `src/components/Cocina.tsx:62-66` actualiza el estado de forma optimista, ignora tanto una respuesta no exitosa como el error del `fetch`, y vuelve a consultar; los botones de acción no se deshabilitan en `src/components/Cocina.tsx:113-120`.
- **Qué pasa:** con red inestable la tarjeta puede parecer “lista” momentáneamente y regresar después; el personal no recibe una confirmación inequívoca ni protección visual contra doble toque.
- **Impacto:** afecta la confianza en una pantalla operativa. El aviso de reconexión y reintento sí existen (`src/components/Cocina.tsx:41-59`, `87`), pero no cubren bien la transición individual.

#### UX-011 · La landing depende de fuentes remotas sin contingencia para el build local

- **Pantalla:** landing y pipeline de entrega.
- **Evidencia:** `src/components/landing/fuentes.ts:1-14` importa ambas familias desde `next/font/google`. En esta corrida `npx next build` terminó con `EACCES` al obtener Bricolage Grotesque e Inter; por eso `npx next start -p 3130` no tuvo un build que iniciar.
- **Qué pasa:** no se pudo validar la versión de producción local ni capturar desde `next start` en este entorno restringido.
- **Impacto:** no es un defecto visual de la landing publicada, pero sí un riesgo de reproducibilidad y QA previo a entrega.

### Bajo

#### UX-012 · Formularios de entrar y registro sólo muestran guía de error al intentar enviar

- **Pantallas:** `/entrar` y `/empezar`.
- **Evidencia:** el login muestra un único error genérico tras la respuesta en `src/app/entrar/FormEntrar.tsx:20-40`; el registro dibuja errores de servidor sólo cuando existe `r` en `src/app/empezar/FormEmpezar.tsx:40-49, 91-97`.
- **Qué pasa:** los campos tienen etiqueta, tipo y estados inválidos correctos, pero no hay ayuda temprana para contraseña, privacidad o formato antes del envío.
- **Impacto:** el flujo base es claro y el CTA aparece en la primera pantalla de celular, por lo que la corrección es de pulido.

#### UX-013 · El historial de pagos presupone desplazamiento horizontal en móvil

- **Pantalla:** `/panel/plan`.
- **Evidencia:** `src/app/panel/plan/page.tsx:71-82` envuelve la tabla en `scroll-x`; `src/app/globals.css:218-221` aplica `overflow-x: auto`.
- **Qué pasa:** el historial es legible, pero obliga a un gesto lateral en una interfaz cuya regla general evita menús/barras horizontales.
- **Impacto:** secundario porque sólo aparece cuando hay pagos y no bloquea activación ni consulta del plan.

## Pasos ANTES por tarea

Un “toque” es una pulsación sobre un control de la app; escribir con teclado, el desplazamiento y la respuesta automática no suman. Los conteos de dueño y cocina están **medidos en código**, no con sesión ni base de datos.

| Rol y tarea | Recorrido contado | Toques ANTES | Método |
|---|---|---:|---|
| Cliente: encontrar, personalizar y agregar | Buscar “Agua fresca” → `+` → elegir “1 litro” → Agregar → buscar “Gordita…” → `+` → queso extra → quitar salsa → Agregar | 9 | Recorrido real en `/demo` |
| Cliente: revisar total, elegir tipo y llegar a enviar | Ver pedido → Recoger → tocar Nombre y escribir “Ana”; el botón queda habilitado sin tocarlo | 3 | Recorrido real en `/demo` |
| Cliente: flujo completo solicitado | Las dos filas anteriores | **12** | Recorrido real en `/demo`; WhatsApp no se abrió |
| Dueño: agregar platillo sencillo con categoría existente | Menú → abrir “Agregar platillo” → Nombre → Precio → Agregar | **5** | **Medido en código**: `src/components/NavPanel.tsx:10-34`, `src/app/panel/menu/page.tsx:124-127` |
| Dueño: agregar primer platillo sin categoría | Menú → Nombre de categoría → Agregar categoría → abrir “Agregar platillo” → Nombre → Precio → Agregar | **7** | **Medido en código**: `src/app/panel/menu/page.tsx:69-95, 124-127` |
| Dueño: cambiar un precio | Menú → abrir producto → Precio → Guardar cambios | **4** | **Medido en código**: `src/app/panel/menu/page.tsx:105-117` |
| Dueño: marcar agotado | Menú → abrir producto → Marcar agotado | **3** | **Medido en código**: `src/app/panel/menu/page.tsx:105-116` |
| Dueño: cambiar horario estructurado | Mi negocio → abrir selector de hora → elegir hora → Guardar | **4** | **Medido en código**: `src/app/panel/negocio/page.tsx:31-34, 62`; `src/components/HorarioInput.tsx:35-56` |
| Dueño: encontrar y compartir enlace del QR | Inicio; la tarjeta ya muestra QR → Compartir | **1** | **Medido en código**: `src/app/panel/page.tsx:46-48`; `src/components/CompartirLink.tsx:35-43`. Comparte el enlace, no el archivo QR. |
| Dueño: abrir y exportar tarjeta QR | Inicio → Imprimir tarjetas para mesas → Guardar hoja/Imprimir | **2** | **Medido en código**: `src/components/CompartirLink.tsx:49-53`; `src/app/panel/qr/Imprimir.tsx:27-37` |
| Cocina: recibir un pedido nuevo | Cocina → Prender sonido; la consulta y aparición del pedido son automáticas cada 4 s | **2** (1 después de configurar sonido) | **Medido en código**: `src/components/NavPanel.tsx:17-34`; `src/components/Cocina.tsx:55-59, 78-85` |
| Cocina: iniciar preparación | Tocar “Empezar a preparar” | **1** | **Medido en código**: `src/components/Cocina.tsx:10-13, 113-115` |
| Cocina: marcar listo | Tocar “Ya está listo” | **1** | **Medido en código**: `src/components/Cocina.tsx:10-13, 113-115` |
| Cocina: recuperarse sin conexión | El sistema vuelve a consultar cada 4 s y muestra aviso; no hay toque de recuperación | **0** | **Medido en código**: `src/components/Cocina.tsx:41-59, 87` |

## Los 10 cambios con mayor impacto (en orden del brief)

1. **§2 Sistema compartido:** consolidar tokens, foco, estados, radios, sombras, movimiento y componentes base para que landing, menú y panel hablen el mismo idioma.
2. **§3 Menú del cliente:** poner estado abierto/cerrado junto al nombre, conservar categorías visibles y hacer más escaneable un menú largo con o sin foto.
3. **§3 Menú del cliente:** reforzar la respuesta inmediata al agregar y el indicador por producto, sin perder el color propio del restaurante.
4. **§4 Carrito:** poner cada error junto a su campo, conservar el CTA visible con teclado y pedir confirmación propia antes de quitar la última línea.
5. **§5 Inicio del dueño:** convertirlo en tablero de acciones diarias (compartir, QR, agregar, precio, agotado) y nombrar los eventos como “pedidos enviados a tu WhatsApp”, nunca dinero confirmado.
6. **§6 Editor de menú:** alta mínima primero; precio y disponible/agotado inmediatos; tamaños/extras plegados, estado de guardado y prevención de pérdida de cambios.
7. **§7 Navegación móvil:** calcular las columnas de `NavPanel` según las secciones, para que cinco destinos no generen una segunda fila.
8. **§8 Cocina:** confirmar transiciones, bloquear doble toque por tarjeta y explicar con claridad qué se reintentará y qué estado quedó pendiente sin red.
9. **§9 Calidad responsive:** revisar 320–430 px, tableta y escritorio con menús largos, sin foto, carrito lleno, teclado y red lenta; eliminar desbordes y contenido tapado.
10. **§9 Calidad de entrega:** hacer reproducible el build local con una estrategia de fuentes compatible con entornos sin salida a Google, y después validar con `tsc` y `next build`.

## No seguro o no viable en esta fase

- No fue seguro capturar ni mutar pantallas autenticadas sin una sesión y base de ejemplo; por instrucción se auditaron por código.
- No fue viable usar `next start` porque el build de producción falló por la descarga remota de fuentes. No se alteraron fuentes, dependencias ni configuración para forzarlo.
- No se creó ningún pedido, usuario, negocio, pago ni mensaje de WhatsApp fuera del recorrido ficticio de `/demo`.
