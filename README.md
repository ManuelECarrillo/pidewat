# Pidewat

Pedidos ordenados por WhatsApp para negocios locales. Cada negocio tiene su menú en `pidewat.mx/<su-link>` y un QR; el cliente arma su pedido y se abre WhatsApp con el mensaje listo (platillos, total, mesa o dirección, nombre). Sin comisión.

- **Menú público** `/<link>` (y `/<link>?mesa=4` desde el QR de cada mesa). `/demo` es un ejemplo que no usa base de datos.
- **Panel del dueño** `/panel`: link y QR (también tarjetas por mesa para imprimir), pedidos de la semana, menú (platillos, fotos, agotado, categorías), datos del negocio (horario, envío, color), plan y pagos.
- **Panel nuestro** `/admin`: ingreso mensual, pruebas por vencer con recordatorio por WhatsApp, alta de negocios (crea la cuenta del dueño y arma el mensaje de bienvenida), cargar menú pegando texto, registrar pagos manuales, extender prueba, pausar, contraseña nueva.
- **Cobro**: 14 días gratis → un solo plan de 149 MXN/mes (anual 1490) con Mercado Pago. Mensual = Suscripción con cobro automático; anual = pago único (tarjeta, OXXO, transferencia). Si vence, 7 días de gracia y luego el menú queda "en pausa" (no se borra nada).

Stack: Next.js 15 + Supabase (Postgres, login y fotos) + Vercel. Costo: 0 hasta ~200 negocios.

## Puesta en marcha (una sola vez)

1. **Supabase** (supabase.com → New project `pidewat`, región East US).
   - SQL Editor → pega y corre `supabase/schema.sql`.
   - Authentication → Sign In / Providers → Email: deja activo "Email", **desactiva "Allow new users to sign up"** (las cuentas las creamos nosotros desde /admin).
   - Authentication → Users → Add user → tu correo y contraseña (marca "Auto confirm"). Luego en SQL Editor:
     ```sql
     insert into public.admins (user_id) select id from auth.users where email = 'TU_CORREO';
     ```
   - Project Settings → API: copia `Project URL`, `anon public` y `service_role`.
2. **Vercel** (vercel.com → Add New → Project → importa el repo `pidewat`). En Environment Variables pon las de `.env.example`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (al principio la dirección `https://pidewat-xxx.vercel.app`), `NEXT_PUBLIC_PIDEWAT_WHATSAPP`. Deploy.
3. **Mercado Pago** (cuando haya el primer cliente por cobrar): Tus integraciones → crear aplicación "Pidewat" → Credenciales de producción → `Access Token` en `MP_ACCESS_TOKEN`. En Webhooks: URL `https://pidewat.mx/api/mp/webhook`, eventos **Pagos**, **Planes y suscripciones** (los dos de suscripciones); copia la clave secreta a `MP_WEBHOOK_SECRET`. Sin token, el panel solo ofrece pagar por transferencia.
4. **Dominio**: compra `pidewat.mx`, agrégalo en Vercel → Settings → Domains y cambia `NEXT_PUBLIC_SITE_URL` a `https://pidewat.mx` (redeploy).

## Cómo dar de alta un negocio (30 minutos)

1. `/admin` → "Dar de alta un negocio": nombre, WhatsApp, correo del dueño. Sale el mensaje de bienvenida con su link, su correo y contraseña → botón "Mandar por WhatsApp".
2. Abre el negocio → "Cargar menú desde texto". Pásale a Claude la foto del menú y pídele el formato:
   ```
   # Gorditas
   Gordita de chicharrón | 28 | De maíz, hecha a mano
   # Bebidas
   Agua de horchata 1 L | 35
   ```
3. Entra con su cuenta o pídele que suba logo y portada desde "Mi negocio". Imprime sus tarjetas QR desde su panel.

## Desarrollo

```bash
cp .env.example .env.local   # y llena los datos
npm install
npm run dev                  # http://localhost:3000/demo
```

Seguridad: el público solo puede leer las columnas del menú (permisos por columna + RLS). El dueño solo edita su negocio y no puede tocar su plan, prueba ni pago. Pagos, pedidos y altas se escriben solo desde el servidor con la llave `service_role`. El webhook de Mercado Pago nunca confía en lo que recibe: vuelve a consultar el pago a la API y no suma dos veces el mismo cobro.
