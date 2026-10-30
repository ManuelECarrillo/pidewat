-- 2026-10-30 · Horario por día: el menú no deja pedir cuando el negocio está cerrado.
-- Correr en Supabase > SQL Editor ANTES de publicar el código que lo usa. Se puede volver a correr.
alter table public.businesses add column if not exists horario jsonb;
grant select (horario) on public.businesses to anon;
grant update (horario) on public.businesses to authenticated;
