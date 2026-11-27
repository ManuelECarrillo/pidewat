-- Deshace 2026-11-27-opciones-y-cocina.sql. Correr SOLO si hay que volver atrás.
-- Borra lo NUEVO (pedidos de cocina, opciones de platillos, interruptor de cocina); lo de antes queda igual.
-- Antes de correrlo, publicar en Vercel una versión del código anterior a la rama pidewat-planes.
drop trigger if exists numerar_orden on public.orders;
drop function if exists public.numerar_orden();
drop table if exists public.orders;
alter table public.products drop constraint if exists opciones_es_lista;
alter table public.products drop column if exists opciones;
alter table public.businesses drop column if exists cocina;
-- El respaldo (esquema respaldo) se queda. Para restaurar una tabla desde él, por ejemplo productos:
--   insert into public.products select * from respaldo.products_20261127 on conflict (id) do nothing;
-- El revoke de TRUNCATE no se deshace a propósito (era un hueco de seguridad).
