-- Opcional: crea el negocio de ejemplo "El Fogón de Durango" en la base (sin dueño) en /el-fogon.
-- La demo de /demo funciona sin esto; esto sirve para probar el panel de admin con datos reales.
insert into public.businesses (slug, name, whatsapp, description, address, hours, color, accepts_delivery, delivery_fee, trial_ends_at)
values ('el-fogon', 'El Fogón de Durango', '5216180000000', 'Gorditas, caldillo y antojitos duranguenses.',
  'Av. 20 de Noviembre 123, Centro, Durango', 'Lun a Sáb 8:00 a 17:00', '#d9480f', true, 25, now() + interval '10 years')
on conflict (slug) do nothing;
