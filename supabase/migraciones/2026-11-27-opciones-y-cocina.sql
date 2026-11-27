-- 2026-11-27 · Plan Esencial: tamaños, sabores y extras · Plan Restaurante: pedidos de mesa a la cocina.
-- Todo es nuevo y apagado por defecto: los negocios que ya existen no cambian en nada. Se puede volver a correr.

-- Tamaños/sabores/extras de cada platillo (ver src/lib/opciones.ts). Vacío = como siempre.
alter table public.products add column if not exists opciones jsonb not null default '[]'::jsonb;

-- Lo prende solo el admin (el dueño no tiene permiso de cambiarlo). Apagado = todo sigue por WhatsApp.
alter table public.businesses add column if not exists cocina boolean not null default false;
grant select (cocina) on public.businesses to anon;

-- Pedidos completos que van a la pantalla de cocina. Se crean solo desde el servidor (service role).
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  numero int not null,
  tipo text not null default 'mesa',
  mesa text,
  nombre text,
  notas text,
  items jsonb not null,
  total numeric(10,2) not null,
  estado text not null default 'nuevo' check (estado in ('nuevo','preparando','listo','entregado','cancelado')),
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_negocio_fecha on public.orders (business_id, created_at desc);

alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;
grant update (estado, updated_at) on public.orders to authenticated;
drop policy if exists "dueño ve sus órdenes" on public.orders;
create policy "dueño ve sus órdenes" on public.orders for select to authenticated using (public.owns_business(business_id) or public.is_admin());
drop policy if exists "dueño mueve sus órdenes" on public.orders;
create policy "dueño mueve sus órdenes" on public.orders for update to authenticated
  using (public.owns_business(business_id) or public.is_admin()) with check (public.owns_business(business_id) or public.is_admin());
