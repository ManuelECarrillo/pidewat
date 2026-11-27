-- 2026-11-27 · Plan Esencial: tamaños, sabores y extras · Plan Restaurante: pedidos de mesa a la cocina.
-- Solo AGREGA: ningún drop de datos, ningún update ni delete de filas existentes. Se puede volver a correr.
-- Los negocios que ya existen no cambian: opciones = [] y cocina = false.
-- Para deshacer: 2026-11-27-opciones-y-cocina-deshacer.sql

-- 0. Respaldo dentro de la base, en un esquema que la API pública no expone (solo lo ve el dueño del proyecto).
create schema if not exists respaldo;
revoke all on schema respaldo from public, anon, authenticated;
create table if not exists respaldo.businesses_20261127 as table public.businesses;
create table if not exists respaldo.categories_20261127 as table public.categories;
create table if not exists respaldo.products_20261127 as table public.products;

-- 1. Seguridad (arreglo de algo que ya existía): TRUNCATE se salta RLS, así que un dueño podía vaciar
--    los productos o categorías de TODOS los negocios. Los dueños conservan select/insert/update/delete con RLS.
revoke truncate, references, trigger on public.products, public.categories from anon, authenticated;

-- 2. Tamaños/sabores/extras de cada platillo (ver src/lib/opciones.ts). Vacío = como siempre.
alter table public.products add column if not exists opciones jsonb not null default '[]'::jsonb;
alter table public.products drop constraint if exists opciones_es_lista;
alter table public.products add constraint opciones_es_lista
  check (jsonb_typeof(opciones) = 'array' and pg_column_size(opciones) < 16000);

-- 3. Interruptor del plan Restaurante. Apagado = todo sigue por WhatsApp.
--    El dueño NO puede cambiarlo (no está en su grant update por columna); lo prende el admin.
alter table public.businesses add column if not exists cocina boolean not null default false;
grant select (cocina) on public.businesses to anon;

-- 4. Pedidos que van a la pantalla de cocina. Solo el servidor (service role) los crea.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  clave uuid not null,                  -- la genera el celular: si reintenta, no se duplica el pedido
  numero int not null default 0,        -- lo pone el trigger: 1, 2, 3… cada día por negocio
  tipo text not null default 'mesa',
  mesa text,
  nombre text,
  notas text,
  items jsonb not null,
  total numeric(10,2) not null,
  estado text not null default 'nuevo' check (estado in ('nuevo','preparando','listo','entregado','cancelado')),
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, clave)
);
create index if not exists orders_negocio_fecha on public.orders (business_id, created_at desc);

-- Número corto del día (hora de México). El candado por negocio evita números repetidos con pedidos al mismo tiempo.
create or replace function public.numerar_orden() returns trigger language plpgsql set search_path = public as $$
declare inicio timestamptz := date_trunc('day', now() at time zone 'America/Mexico_City') at time zone 'America/Mexico_City';
begin
  perform pg_advisory_xact_lock(hashtext('orden:' || new.business_id::text));
  select coalesce(max(numero), 0) + 1 into new.numero from public.orders where business_id = new.business_id and created_at >= inicio;
  return new;
end $$;
revoke execute on function public.numerar_orden() from public, anon, authenticated;
drop trigger if exists numerar_orden on public.orders;
create trigger numerar_orden before insert on public.orders for each row execute function public.numerar_orden();

-- RLS: cada dueño ve y mueve SOLO las órdenes de su negocio; el público no ve nada (el cliente consulta su
-- pedido por el servidor con el id). El dueño solo puede cambiar el estado, nada más.
alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
grant select (id, business_id, numero, tipo, mesa, nombre, notas, items, total, estado, created_at, updated_at) on public.orders to authenticated;
grant update (estado, updated_at) on public.orders to authenticated;
drop policy if exists "dueño ve sus órdenes" on public.orders;
create policy "dueño ve sus órdenes" on public.orders for select to authenticated
  using (public.owns_business(business_id) or public.is_admin());
drop policy if exists "dueño mueve sus órdenes" on public.orders;
create policy "dueño mueve sus órdenes" on public.orders for update to authenticated
  using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id) or public.is_admin());
