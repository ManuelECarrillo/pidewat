-- 2026-10-30 · SEG-003 y SEG-006 (docs/hallazgos/2026-10-30-seguridad.md)
-- Correr en Supabase > SQL Editor DESPUÉS de publicar el código que ya no lee plan/prueba/pagos con la llave pública.
-- Se puede volver a correr.

-- SEG-003: el público ya no ve plan, prueba, pagado hasta ni pausa
revoke select on public.businesses from anon;
grant select (id, slug, name, whatsapp, description, address, hours, logo_url, cover_url, color, mode,
  accepts_table, accepts_pickup, accepts_delivery, delivery_fee, delivery_note)
  on public.businesses to anon;

-- SEG-006: quitar los permisos por defecto que hoy solo frena RLS
revoke all on public.admins, public.payments, public.order_events from anon, authenticated;
grant select on public.admins, public.payments, public.order_events to authenticated;
revoke all on public.categories, public.products from anon;
grant select on public.categories, public.products to anon;
revoke execute on function public.is_admin(), public.owns_business(uuid) from anon, public;
grant execute on function public.is_admin(), public.owns_business(uuid) to authenticated;
