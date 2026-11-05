-- 2026-11-05 · Ingredientes que el cliente puede quitar (ej. hot dog: mostaza, mayonesa, cátsup…).
-- En el menú, al agregar ese producto, el cliente toca lo que NO quiere y sale "Sin mayonesa" en el pedido.
-- Se puede volver a correr.
alter table public.products add column if not exists ingredientes text[] not null default '{}';
