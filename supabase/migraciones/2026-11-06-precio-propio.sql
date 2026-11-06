-- 2026-11-06 · Precio propio por negocio (ej. los primeros clientes se quedan con $149 aunque la lista suba a $259).
-- null = precio de lista (src/lib/planes.ts). Solo nosotros lo cambiamos: el público no lo ve y el dueño no lo puede editar.
-- Se puede volver a correr.
alter table public.businesses add column if not exists precio_mensual numeric(10,2) check (precio_mensual is null or precio_mensual >= 0);
