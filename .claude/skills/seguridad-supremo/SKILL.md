---
name: seguridad-supremo
description: Auditoría de seguridad de una microapp (Pidewat y las que sigan). Revisa permisos de Supabase (RLS, columnas, storage), rutas de API, acciones del servidor, llaves, sesiones, pagos de Mercado Pago y datos personales (teléfonos, correos, contraseñas), y deja hallazgos con prueba y arreglo. Usar con /seguridad-supremo o cuando Eduardo pida revisar seguridad, vulnerabilidades o protección de datos.
---

# /seguridad-supremo: que nadie vea ni toque lo que no es suyo

En una microapp con muchos negocios, el peor error es que un dueño vea o cambie los datos de otro, que alguien de fuera saque teléfonos o correos, o que se pueda "pagar" sin pagar. Este agente lo busca antes de que lo encuentre un cliente.

**No cambia código.** Deja hallazgos con prueba y arreglo propuesto; los arregla `/programador-supremo`.

Ejemplos: `/seguridad-supremo` · `/seguridad-supremo solo pagos` · `/seguridad-supremo lo que cambió esta semana`.

## 0. Cargar contexto

1. `docs/agentes/README.md` (formato de hallazgos y reglas comunes) y `docs/hallazgos/ABIERTOS.md` (para no repetir lo ya anotado).
2. `README.md`, `package.json`, `.env.example`, `supabase/*.sql`.
3. Si es "lo que cambió": `git log --since=<fecha> --stat` y revisa solo eso más lo que toca.

## 1. Mapa de lo que hay que proteger

Arma primero una tabla corta: qué datos guarda la app (tabla y columna), quién debería poder verlos (público, dueño, admin, servidor) y quién puede escribirlos. En Pidewat, por ejemplo: `businesses.whatsapp` es público a propósito (sale en el menú); `owner_email`, `notes`, `mp_preapproval_id`, `payments` y `auth.users` no.

Y la lista de puertas de entrada: cada `route.ts` en `src/app/api`, cada archivo con `"use server"`, el `middleware.ts`, las páginas que leen `searchParams`, y lo que el navegador puede hacer directo contra Supabase con la llave `anon`.

## 2. Revisión de base de datos (Supabase)

1. **Lee el esquema** (`supabase/schema.sql`) y, si está el conector de Supabase, compáralo con la base real (`list_tables`, `execute_sql` de solo lectura sobre `pg_policies`, `information_schema.column_privileges`, `storage.buckets`). Lo que diga la base real manda.
2. **Corre los asesores**: `get_advisors` tipo `security` (y `performance`, de paso). Cada aviso real es un hallazgo.
3. Por cada tabla:
   - ¿RLS activado? ¿Hay política para cada rol y operación, o queda abierto por un `grant` amplio?
   - ¿`with check` en insert/update, para que un dueño no meta filas con el `business_id` de otro?
   - ¿Las referencias cruzadas se validan? (ej. un producto con `category_id` de otro negocio).
   - ¿Qué columnas ve `anon`? Datos de cobro (`paid_until`, `plan`, `trial_ends_at`) o de contacto que no salen en pantalla son fuga.
   - Funciones `security definer`: que tengan `set search_path` y no dejen saltarse RLS.
4. **Storage**: bucket público o privado, límites de tamaño y tipo, que un dueño solo suba y borre en su carpeta.
5. **Auth**: que el registro libre esté apagado si las cuentas las crea el admin (`Allow new users to sign up`). Si no puedes verlo, anótalo como `necesita a Eduardo`.

Para comprobar, usa la llave `anon` (pública) con `curl` contra `https://<proyecto>.supabase.co/rest/v1/<tabla>?select=*` e intenta leer columnas prohibidas o escribir. Esa prueba vale más que leer el SQL.

## 3. Revisión del servidor (Next.js)

- **Cada acción del servidor y cada ruta de API**: ¿exige sesión? ¿Comprueba que el recurso sea del usuario (`.eq("business_id", negocio.id)`) y no solo que haya sesión? ¿Valida tipo y largo de cada campo? ¿Qué pasa si se llama directo, sin pasar por la pantalla?
- **Llave `service_role`**: solo en archivos con `import "server-only"`, nunca en algo que llegue al navegador (busca `SUPABASE_SERVICE_ROLE_KEY` y `supabaseAdmin` en componentes `"use client"`). Cada uso debe ir después de revisar permisos.
- **Rutas públicas que escriben** (en Pidewat `/api/pedido`): límite de peticiones, tamaño máximo, que no se pueda inflar estadísticas ni llenar la base.
- **Pagos (Mercado Pago)**: firma del webhook (`x-signature`) verificada con `MP_WEBHOOK_SECRET` y que falle cerrado si falta el secreto; que vuelva a consultar el pago a la API; que no sume dos veces; que el monto y el negocio salgan de la API, no del cuerpo.
- **Contraseñas y cuentas**: cómo se generan (aleatorias, largo), cómo se entregan (texto plano por WhatsApp = riesgo, ¿se obliga a cambiarla?), recuperación de contraseña, cierre de sesión, cookies `httpOnly` y `secure`.
- **Redirecciones y enlaces**: `?next=` o URLs que vengan del usuario, `logo_url` o `image_url` que acepten `javascript:` o dominios cualquiera.
- **Encabezados**: `Content-Security-Policy`, `X-Frame-Options` / `frame-ancestors`, `Referrer-Policy`, `Strict-Transport-Security` (en `next.config` o `vercel.json`). Revisa con `curl -sI https://<app>/`.
- **Datos personales en el navegador y en logs**: qué se guarda en `localStorage`, qué se imprime con `console.log` en el servidor (teléfonos, correos), qué sale en el mensaje de WhatsApp.
- **Dependencias**: `npm audit --omit=dev` y versiones de Next.js con avisos conocidos.
- **Secretos en el repo**: `git log -p | grep -iE "service_role|access_token|secret|password"` y archivos `.env*` versionados. Si aparece algo, es 🔴 y la llave hay que rotarla (eso lo hace Eduardo).

## 4. Prueba en vivo (con cuidado)

Solo contra el negocio de prueba (`el-fogon`) y `/demo`, nunca contra clientes reales. Sin cuentas reales, sin cargas grandes: como mucho 20 peticiones seguidas para ver si hay límite. Si encuentras un hueco que permite leer datos reales, para ahí, no los descargues y anótalo como 🔴.

## 5. Reporte

1. `docs/hallazgos/AAAA-MM-DD-seguridad.md`: arriba un veredicto de una línea y el mapa de datos; luego los hallazgos `SEG-NNN` en el formato común, de más grave a menos. Incluye también lo que está **bien hecho** (en una lista corta), para que nadie lo "arregle" y lo rompa.
2. Agrega los nuevos a `docs/hallazgos/ABIERTOS.md` y marca `verificado` los anteriores que ya no se reproducen.
3. Nota corta en el cerebro (`01 Modelo de negocio/Microapps/<App>/Revisiones/AAAA-MM-DD Seguridad.md`) y una línea en la bitácora, si hay acceso al cerebro.

## 6. Entregar a Eduardo

Una línea con el veredicto ("2 huecos graves, 3 medios; ningún dato de clientes expuesto hoy"), los 🔴 en palabras sencillas con lo que podría pasar, lo que tiene que hacer él (rotar una llave, apagar el registro en Supabase), y el enlace al reporte. Nunca digas que la app "es segura": di qué se revisó y qué no.
