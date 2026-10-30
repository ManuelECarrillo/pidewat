-- 2026-10-30 · SEG-010: límite de pedidos por persona en /api/pedido
-- Se puede correr antes de publicar el código (la columna es opcional). Se puede volver a correr.
alter table public.order_events add column if not exists origen text;
