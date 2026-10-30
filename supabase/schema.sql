-- Pidewa: esquema de base de datos (Supabase / Postgres)
-- Correr completo en Supabase > SQL Editor > New query. Se puede volver a correr.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'),
  name text not null,
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,15}$'), -- con lada de país, ej. 5216181234567
  description text,
  address text,
  hours text,
  logo_url text,
  cover_url text,
  color text not null default '#e4572e',
  mode text not null default 'menu' check (mode in ('menu', 'catalogo')),
  accepts_table boolean not null default true,
  accepts_pickup boolean not null default true,
  accepts_delivery boolean not null default false,
  delivery_fee numeric(10,2) not null default 0,
  delivery_note text,
  -- cuenta y cobro (solo nosotros los cambiamos)
  owner_id uuid references auth.users on delete set null,
  owner_email text,
  plan text not null default 'base' check (plan in ('base', 'plus')),
  trial_ends_at timestamptz not null default now() + interval '14 days',
  paid_until timestamptz,
  paused boolean not null default false,
  mp_preapproval_id text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists businesses_owner_idx on public.businesses (owner_id);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  name text not null,
  position int not null default 0
);
create index if not exists categories_business_idx on public.categories (business_id);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  category_id uuid references public.categories on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0 check (price >= 0),
  image_url text,
  available boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists products_business_idx on public.products (business_id);

-- Cada vez que un cliente toca "Pedir por WhatsApp" (sirve para estadísticas y para mostrarle al dueño lo que vale la app)
create table if not exists public.order_events (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses on delete cascade,
  total numeric(10,2) not null default 0,
  items jsonb not null default '[]',
  order_type text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_business_idx on public.order_events (business_id, created_at desc);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  amount numeric(10,2) not null,
  method text not null check (method in ('mercadopago', 'transferencia', 'efectivo', 'otro')),
  months int not null default 1,
  mp_id text unique,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Funciones
-- ---------------------------------------------------------------

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.owns_business(bid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.businesses where id = bid and owner_id = auth.uid());
$$;

-- ---------------------------------------------------------------
-- Permisos por columna: el público solo ve lo que sale en el menú
-- ---------------------------------------------------------------

revoke all on public.businesses from anon, authenticated;
grant select (id, slug, name, whatsapp, description, address, hours, logo_url, cover_url, color, mode,
  accepts_table, accepts_pickup, accepts_delivery, delivery_fee, delivery_note,
  plan, trial_ends_at, paid_until, paused)
  on public.businesses to anon;
grant select on public.businesses to authenticated;
-- el dueño edita sus datos, pero no su plan, su prueba ni su pago
grant update (name, whatsapp, description, address, hours, logo_url, cover_url, color, mode,
  accepts_table, accepts_pickup, accepts_delivery, delivery_fee, delivery_note)
  on public.businesses to authenticated;

-- ---------------------------------------------------------------
-- Seguridad por fila (RLS)
-- ---------------------------------------------------------------

alter table public.admins enable row level security;
alter table public.businesses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.order_events enable row level security;
alter table public.payments enable row level security;

drop policy if exists "admins se ven a sí mismos" on public.admins;
create policy "admins se ven a sí mismos" on public.admins for select to authenticated using (user_id = auth.uid());

drop policy if exists "menú público" on public.businesses;
create policy "menú público" on public.businesses for select to anon using (true);
drop policy if exists "dueño ve su negocio" on public.businesses;
create policy "dueño ve su negocio" on public.businesses for select to authenticated using (owner_id = auth.uid() or public.is_admin());
drop policy if exists "dueño edita su negocio" on public.businesses;
create policy "dueño edita su negocio" on public.businesses for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "categorías públicas" on public.categories;
create policy "categorías públicas" on public.categories for select to anon, authenticated using (true);
drop policy if exists "dueño maneja categorías" on public.categories;
create policy "dueño maneja categorías" on public.categories for all to authenticated
  using (public.owns_business(business_id)) with check (public.owns_business(business_id));

drop policy if exists "productos públicos" on public.products;
create policy "productos públicos" on public.products for select to anon, authenticated using (true);
drop policy if exists "dueño maneja productos" on public.products;
create policy "dueño maneja productos" on public.products for all to authenticated
  using (public.owns_business(business_id)) with check (public.owns_business(business_id));

grant select on public.categories, public.products to anon;
grant select, insert, update, delete on public.categories, public.products to authenticated;

drop policy if exists "dueño ve sus pedidos" on public.order_events;
create policy "dueño ve sus pedidos" on public.order_events for select to authenticated using (public.owns_business(business_id) or public.is_admin());
grant select on public.order_events to authenticated;

drop policy if exists "dueño ve sus pagos" on public.payments;
create policy "dueño ve sus pagos" on public.payments for select to authenticated using (public.owns_business(business_id) or public.is_admin());
grant select on public.payments to authenticated;
-- order_events y payments se escriben solo desde el servidor (service role)

-- ---------------------------------------------------------------
-- Fotos: bucket público "imagenes", carpeta = id del negocio
-- ---------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagenes', 'imagenes', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "dueño sube fotos" on storage.objects;
create policy "dueño sube fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes' and public.owns_business(((storage.foldername(name))[1])::uuid));
drop policy if exists "dueño cambia fotos" on storage.objects;
create policy "dueño cambia fotos" on storage.objects for update to authenticated
  using (bucket_id = 'imagenes' and public.owns_business(((storage.foldername(name))[1])::uuid));
drop policy if exists "dueño borra fotos" on storage.objects;
create policy "dueño borra fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes' and public.owns_business(((storage.foldername(name))[1])::uuid));
