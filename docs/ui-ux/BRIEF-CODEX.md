# Encargo para Codex: rediseño UI/UX de Pidewat

Eduardo (dueño) lo pidió el 2026-11-27. Codex es el responsable principal del diseño y la usabilidad. Claude coordina y hace QA independiente.
Objetivo: que un dueño de un puesto de hamburguesas use Pidewat tan fácil como WhatsApp. Debe sentirse digno de una suscripción mensual.
No es un simple cambio de CSS: hay que reducir pasos, evitar errores y lograr que se use de forma natural.
Empieza por los flujos que más usa el negocio e implementa mejoras reales. No pierdas días en propuestas visuales.

## Reglas obligatorias (producción con clientes que pagan)
- Trabaja SOLO en la rama `ui-premium`, que sale de `landing-comercial`. Nunca hagas push a `main` ni fusiones. Claude decide cuándo se fusiona, con el OK de Eduardo.
- `pidewat-planes` ya está fusionada en main (PR #7, #8, #9, #10). No la uses como base.
- No toques: autenticación, cobros (`lib/mercadopago`, `api/mp`, `panel/plan/acciones.ts`), migraciones SQL, `app/empezar/acciones.ts`, `app/api/*` ni `lib/planes.ts`. Eso es de Claude. Si necesitas un cambio ahí, anótalo en `docs/ui-ux/PEDIDOS-A-CLAUDE.md`.
- No cambies precios ni textos de precios. Vigente: Esencial $249/mes, Restaurante $499 «Próximamente», 14 días gratis sin tarjeta. Santiago y los negocios anteriores conservan su precio. Todo sale de `lib/planes.ts` / `precioDe()`.
- Prueba solo con datos ficticios: `/demo` (sin base) o build local. Nada de datos de Santiago ni de otros negocios reales.
- El comportamiento de WhatsApp (`lib/whatsapp.ts`: texto del pedido y link) no se cambia sin entenderlo. Abrir WhatsApp NO confirma que el cliente envió el mensaje.
- Gustos de Eduardo: nada de `<select>`, `confirm()`, `alert()` ni `type=color` nativos (ya existen `Selector`, `SelectorColor`, `BotonEnviar confirmar`). Sin menús que haya que deslizar en horizontal. Botón principal en la primera pantalla del celular. Nada de `target=_blank` a páginas propias, porque saca de la app instalada.
- Sin bibliotecas pesadas para efectos. Respeta `prefers-reduced-motion`.

## 1. Auditoría antes de cambiar (capturas reales)
Pantallas: menú público (`/demo`), carrito, hoja de tamaños/sabores/ingredientes/extras, `/entrar`, `/panel` (inicio), `/panel/menu`, `/panel/negocio`, `/panel/qr`, `/panel/plan`, `/panel/cocina`, la landing `/` y `/empezar`.
Toma capturas de celular (360 y 390) y de escritorio (1440) del estado ACTUAL de esta rama. Las capturas del 30 de octubre ya no sirven.
Por cada pantalla, documenta en `docs/ui-ux/AUDITORIA.md` una calificación del 1 al 10 y sus problemas, ordenados por prioridad.
Mide los PASOS (toques) de cada tarea ANTES del cambio:
- Cliente: encontrar un producto, personalizarlo, agregarlo, revisar el total, enviar el pedido.
- Dueño: agregar un platillo sencillo, cambiar un precio, marcar agotado, cambiar el horario, encontrar y compartir el QR.
- Cocina: recibir un pedido, prepararlo, marcarlo listo, recuperarse si se cae la conexión.

## 2. Sistema de diseño compartido
Debe valer para la landing (`components/landing/Landing.module.css`), el panel y el menú público, que hoy tienen estilos distintos.
- Tokens en un solo lugar (`globals.css`, variables CSS): color, tipografía, espacios, radios, sombras y movimiento.
- Componentes reutilizables: Botón, Campo, Tarjeta, Interruptor, Chip, Hoja (sheet), Aviso o toast, Vacío y Skeleton.
- Iconos SVG consistentes en línea, sin fuentes de iconos pesadas.
- Contraste WCAG AA, foco visible y áreas táctiles de al menos 44×44.
- Documenta todo en `docs/ui-ux/SISTEMA.md`.

## 3. Menú del cliente
- Portada, logo, nombre, horario y estado abierto o cerrado.
- Categorías que se vean siempre, sin deslizar; buscador cuando sirva.
- Fotos bien presentadas y buena jerarquía entre nombre, precio y descripción.
- Al agregar, respuesta visual inmediata e indicador de cantidad en el producto.
- Hoja para personalizar con el precio que se actualiza al momento; agotados claros.
- Carrito fijo y fácil de reconocer.
- Mantén el color del restaurante donde corresponde, sobre una estructura que se reconozca como Pidewat.

## 4. Carrito
- Artículos claros, cantidades editables y personalización visible.
- Total y costo de envío claros. Elección sencilla entre recoger, comer ahí y domicilio.
- Errores junto a su campo. El botón principal se ve aunque el teclado esté abierto.
- Confirmar antes de borrar, con diálogo propio.
- Estados de carga y protección contra doble toque.

## 5. Inicio del dueño (PRIORIDAD MÁXIMA)
Debe responder al instante:
- ¿Mi menú está funcionando?
- ¿Cómo comparto mi link?
- ¿Dónde está mi QR?
- ¿Cómo agrego un producto?
- ¿Cómo cambio un precio?
- ¿Cómo marco algo como agotado?
- ¿Cómo voy?

Acciones de todos los días al alcance del dedo.
Las estadísticas deben decir la verdad. Hoy `order_events` cuenta los toques en «Enviar por WhatsApp», no pedidos confirmados ni dinero cobrado. Llámalos «pedidos enviados a tu WhatsApp» y nunca «ventas» ni «ingresos».
Los pedidos de mesa con cocina salen de `orders` sin cancelados (ya lo hace `app/panel/page.tsx`).

## 6. Editor de menú
- Lista visual de productos.
- Nombre y precio editables rápido.
- Interruptor de disponible o agotado inmediato, sin abrir el formulario.
- Foto con vista previa.
- Agregar un platillo sencillo en pocos pasos.
- Extras y tamaños (`OpcionesInput`) solo cuando se necesiten, plegados.
- Categorías y orden fáciles de manejar.
- Estado de guardado visible y protección contra perder cambios.
- Deshacer cuando sea seguro y vista previa del menú.

Usa las server actions que ya existen en `app/panel/acciones.ts`. Si necesitas una nueva, pídela en PEDIDOS-A-CLAUDE.md.

## 7. Navegación móvil
`NavPanel` muestra 5 secciones cuando la cocina está activa, pero el CSS usa 4 columnas fijas. Hay que arreglarlo con columnas según la cantidad de secciones, sin filas inesperadas.
Debe poder usarse con una sola mano.

## 8. Cocina (`/panel/cocina`, ya probada en producción con un negocio ficticio)
- Tarjetas grandes con número de mesa muy visible y tiempo transcurrido.
- Estados con colores distintos y botones grandes.
- Sonido controlable: el navegador no deja prenderlo solo, ya hay un aviso para eso.
- Indicador de conexión, confirmación antes de cancelar y varios pedidos a la vez.
Prueba solo con datos de ejemplo.

## 9. Calidad
- Anchos: 320, 360, 390, 430, tableta y escritorio. Teclado abierto, conexión lenta, menú largo y productos sin foto.
- Carrito con muchos artículos y errores de red.
- Sin scroll horizontal. Ninguna barra debe tapar información.
- Formularios con etiquetas y uso completo con teclado.
- Antes de cada entrega corre `npx tsc --noEmit` y `npx next build`.

## Entrega (en docs/ui-ux/)
1. AUDITORIA.md: calificación por pantalla y problemas priorizados.
2. SISTEMA.md.
3. La interfaz rediseñada en la rama `ui-premium`.
4. Capturas antes y después (`docs/ui-ux/capturas/`).
5. Pasos medidos antes y después de cada tarea. Sin porcentajes que no se hayan medido.
6. Lista de lo que no fue seguro o viable.
