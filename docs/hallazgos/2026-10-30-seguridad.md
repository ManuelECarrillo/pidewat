# Seguridad · Pidewat · 2026-10-30 (primera corrida de /seguridad-supremo)

**Veredicto:** ningún dato de clientes expuesto hoy. La base está bien cerrada (RLS en todas las tablas, columnas privadas fuera del alcance del público, webhook que vuelve a consultar a Mercado Pago). Hay 0 graves, 4 medios y 5 bajos; el más importante es que cualquiera puede llenar de pedidos falsos las estadísticas de un negocio.

**Qué se revisó:** `supabase/schema.sql` contra la base real (permisos por columna, políticas, asesor de seguridad de Supabase), todas las acciones del servidor (`admin/acciones.ts`, `panel/acciones.ts`, `panel/plan/acciones.ts`), las rutas de API, `middleware.ts`, `sesion.ts`, la llave `service_role`, el webhook de Mercado Pago, `npm audit`.
**Qué no se pudo:** pruebas en vivo contra `pidewat.vercel.app` y contra la API de Supabase con la llave pública: la red de esta sesión no deja salir a esos dominios. Las comprobaciones se hicieron con el conector de Supabase (solo lectura) y leyendo el código.

## Mapa de datos

| Dato | Dónde | Quién lo ve | Quién lo cambia |
|---|---|---|---|
| Menú, WhatsApp, dirección, horario del negocio | `businesses` | Público (a propósito) | Dueño, admin |
| Plan, prueba, pagado hasta, pausa | `businesses` | **Público** (ver SEG-003) | Solo servidor / admin |
| Correo del dueño, notas, id de suscripción | `businesses` | Dueño y admin | Solo servidor / admin |
| Contraseñas | `auth.users` (Supabase, cifradas) | Nadie | Admin (genera), Supabase |
| Pedidos (estadísticas) | `order_events` | Dueño y admin | Servidor (`/api/pedido`) |
| Pagos | `payments` | Dueño y admin | Servidor (webhook, admin) |
| Fotos | Storage `imagenes` (público) | Público | Dueño en su carpeta |

## Hallazgos

### SEG-001 · 🟡 Media · Cualquiera puede inflar los pedidos de un negocio
- **Dónde:** `src/app/api/pedido/route.ts:5`
- **Qué pasa:** la ruta es pública, no tiene límite y guarda con la llave maestra el `total` y los productos que manda el navegador. Con el id de un negocio (sale en el HTML del menú) se pueden meter miles de pedidos falsos con totales inventados. Las estadísticas del dueño ("lo que te dio Pidewat esta semana") se vuelven basura y la tabla crece sin control.
- **Cómo se comprueba:** `for i in $(seq 20); do curl -s -X POST https://pidewat.vercel.app/api/pedido -H 'content-type: application/json' -d '{"business_id":"<id de el-fogon>","total":99999}'; done` → 20 filas nuevas con total 99,999 en `order_events`.
- **Arreglo propuesto:** (1) recalcular el total en el servidor con los precios de `products` de ese negocio e ignorar el del navegador; (2) rechazar si el negocio no existe o está en pausa; (3) límite sencillo: no más de N pedidos por negocio por minuto y por IP (tabla o conteo de los últimos 60 s en `order_events`).
- **Estado:** abierto

### SEG-002 · 🟡 Media · Revisar que el registro libre de Supabase esté apagado
- **Dónde:** Supabase → Authentication → Sign In / Providers → "Allow new users to sign up"
- **Qué pasa:** si está prendido, cualquiera puede crearse una cuenta con la llave pública. Hoy no le da acceso a nada (no tiene negocio), pero es una puerta abierta innecesaria y cualquier error futuro de permisos la convierte en un problema. Hoy hay 2 usuarios y ninguno sobra.
- **Cómo se comprueba:** `GET https://<proyecto>.supabase.co/auth/v1/settings` con la llave pública → `disable_signup` debe ser `true`.
- **Arreglo propuesto:** apagarlo en el panel de Supabase. De paso, prender "Leaked password protection" (aviso del asesor de Supabase).
- **Estado:** necesita a Eduardo (dos clics en Supabase)

### SEG-003 · 🟡 Media · El público puede ver quién paga y cuándo le vence
- **Dónde:** `supabase/schema.sql:99` (`grant select (… plan, trial_ends_at, paid_until, paused)` a `anon`)
- **Qué pasa:** con la llave pública cualquiera (un competidor, por ejemplo) puede listar todos los negocios con su plan, cuándo vence su prueba y hasta cuándo pagaron. Es información comercial de Eduardo y de sus clientes.
- **Cómo se comprueba:** `GET /rest/v1/businesses?select=slug,plan,trial_ends_at,paid_until` con la llave pública → lista completa.
- **Arreglo propuesto:** que el menú público lea esas columnas en el servidor con la llave maestra (solo para calcular si está en pausa) o con una función `menu_activo(slug) returns boolean`, y quitarle a `anon` esas cuatro columnas.
- **Estado:** abierto

### SEG-004 · 🟡 Media · La contraseña del dueño viaja por WhatsApp y no se cambia nunca
- **Dónde:** `src/app/admin/acciones.ts:58` (mensaje de bienvenida) y `/entrar`
- **Qué pasa:** la contraseña se manda en texto en el chat de WhatsApp y el dueño no tiene forma de cambiarla ni de recuperarla solo. Si alguien ve ese chat (un empleado, otro celular con WhatsApp Web) puede entrar al panel y cambiar el número de WhatsApp del menú para quedarse con los pedidos.
- **Arreglo propuesto:** pantalla "Cambiar contraseña" en el panel y pedirle cambiarla la primera vez que entra (marca en `user_metadata`); a futuro, entrar con enlace mágico al correo. Mientras tanto, que el mensaje de bienvenida diga "cámbiala al entrar".
- **Estado:** abierto

### SEG-005 · ⚪ Baja · Sin encabezados de seguridad
- **Dónde:** `next.config.mjs`
- **Qué pasa:** no hay `Content-Security-Policy` ni `frame-ancestors`/`X-Frame-Options`; alguien podría meter el panel dentro de otra página (clickjacking). Riesgo bajo hoy.
- **Arreglo propuesto:** `headers()` en `next.config.mjs` con `X-Frame-Options: DENY` (o `frame-ancestors 'none'`), `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy` básica. CSP completa después, con cuidado de no romper Supabase ni las fotos.
- **Estado:** abierto

### SEG-006 · ⚪ Baja · Permisos de tabla de más (los frena solo RLS)
- **Dónde:** base real: `anon` y `authenticated` tienen INSERT/UPDATE en `admins`, `payments`, `order_events`, `products`, `categories` (los permisos por defecto de Supabase).
- **Qué pasa:** hoy no se puede abusar porque RLS no tiene políticas que lo permitan. Pero si alguna vez se desactiva RLS en una tabla (por error, al depurar), quedaría abierta para escribir pagos o volverse admin.
- **Arreglo propuesto:** migración con `revoke all on public.admins, public.payments, public.order_events from anon, authenticated;` y luego volver a dar solo `select` a `authenticated` donde haga falta; `revoke insert, update, delete on public.products, public.categories from anon;`. Y `revoke execute on function public.is_admin(), public.owns_business(uuid) from anon;` (aviso del asesor; las dos solo responden sí/no sobre quien pregunta, por eso es baja).
- **Estado:** abierto

### SEG-007 · ⚪ Baja · El webhook acepta todo si falta la clave secreta
- **Dónde:** `src/lib/mercadopago.ts:74`
- **Qué pasa:** sin `MP_WEBHOOK_SECRET`, `firmaValida` devuelve `true`. Como el webhook vuelve a consultar el pago a Mercado Pago, nadie puede inventar un pago; solo podrían hacer que se re-consulte uno real. Bajo, pero es mejor que falle cerrado en producción.
- **Arreglo propuesto:** si hay `MP_ACCESS_TOKEN` y no hay secreto, responder 401 y escribir un aviso en el log.
- **Estado:** abierto

### SEG-008 · ⚪ Baja · Un platillo puede apuntar a una categoría de otro negocio
- **Dónde:** `src/app/panel/acciones.ts:24` (`category_id` sin validar); `image_url`, `logo_url`, `cover_url` aceptan cualquier dirección
- **Qué pasa:** llamando la acción a mano, un dueño puede poner el id de una categoría ajena (no ve nada de otro negocio, solo ensucia su menú) o una foto de cualquier sitio (puede rastrear quién abre el menú).
- **Arreglo propuesto:** comprobar que la categoría sea del negocio y que las URLs de fotos empiecen con la dirección del Storage de Supabase.
- **Estado:** abierto

### SEG-009 · ⚪ Baja · Avisos de dependencias
- **Dónde:** `package.json` (`next 15.5.28` trae `postcss` con 4 avisos; `npm audit`: 1 alta, 1 moderada)
- **Qué pasa:** los avisos de postcss afectan al procesar CSS de terceros al compilar; Pidewat no lo hace, así que el riesgo real es bajo.
- **Arreglo propuesto:** subir a la versión de Next 15 más nueva cuando salga un parche; no hace falta saltar a Next 16 por esto.
- **Estado:** abierto

## Lo que está bien hecho (no tocar)
- RLS activado en las 6 tablas y permisos por columna en `businesses`: el público no ve correo, notas ni ids de cobro.
- El dueño no puede cambiar su plan, prueba ni pago (no tiene permiso de columna).
- Todas las acciones del panel filtran por el negocio del usuario (`.eq("business_id", negocio.id)`).
- La llave maestra solo está en archivos `server-only` y cada acción de admin llama a `requiereAdmin()` primero.
- El webhook verifica la firma, vuelve a consultar a Mercado Pago y no suma dos veces el mismo pago (`mp_id` único).
- Contraseñas generadas con `crypto.randomBytes` (10 caracteres sin letras confusas).
- Fotos: bucket con límite de 1 MB, solo jpg/png/webp, y cada dueño solo escribe en su carpeta.
