-- 2026-10-30 · SEG-010 (docs/hallazgos/2026-10-30-taller.md)
-- Correr en Supabase > SQL Editor. Se puede correr antes o después de publicar el código:
-- sin esta columna el código sigue funcionando, solo que sin el límite por persona.
-- Se puede volver a correr.

-- Huella revuelta de la IP (HMAC), no la IP: sirve para contar pedidos por persona
alter table public.order_events add column if not exists ip_hash text;
create index if not exists order_events_ip_idx on public.order_events (ip_hash, created_at desc) where ip_hash is not null;

-- El dueño no necesita ver la huella: le dejamos ver solo lo que usa su panel
revoke select on public.order_events from authenticated;
grant select (id, business_id, total, items, order_type, created_at) on public.order_events to authenticated;
