-- 2026-10-30 · Horario por día: el menú no deja pedir cuando el negocio está cerrado
-- Correr en Supabase > SQL Editor. Se puede correr antes o después de publicar el código:
-- sin esta columna todo sigue funcionando, solo que el horario no se guarda.
-- Se puede volver a correr.

-- { "lun": {"abre":"08:00","cierra":"17:00"}, "dom": null, ... } · null = sin horario (se puede pedir siempre)
alter table public.businesses add column if not exists horario jsonb;

-- El dueño lo cambia desde "Mi negocio". El público no lo lee directo: el servidor lo manda al menú.
grant update (horario) on public.businesses to authenticated;
