-- 2026-11-27 · Landing comercial: solicitudes de prueba gratis y medición propia del embudo.
-- Solo AGREGA dos tablas nuevas. No toca negocios, platillos, pagos ni nada que usen los clientes actuales.
-- Para deshacer: drop table public.solicitudes; drop table public.eventos_landing;

-- Quien pide la prueba en /empezar. Datos mínimos para escribirle por WhatsApp y armar su menú.
create table if not exists public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  negocio text not null check (length(negocio) between 2 and 80),
  nombre text not null check (length(nombre) between 2 and 60),
  whatsapp text not null check (whatsapp ~ '^[0-9]{12,13}$'),
  giro text,
  ciudad text,
  plan text not null default 'esencial' check (plan in ('esencial','restaurante')),
  estado text not null default 'nueva' check (estado in ('nueva','contactada','prueba','descartada')),
  business_id uuid references public.businesses(id) on delete set null,
  utm jsonb not null default '{}'::jsonb check (pg_column_size(utm) < 2000),
  ip_hash text,
  acepto_privacidad boolean not null default false
);
create index if not exists solicitudes_fecha on public.solicitudes (creado desc);

-- Embudo de la landing: un renglón por evento, sin datos personales ni cookies.
create table if not exists public.eventos_landing (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  evento text not null check (evento in ('landing_visita','ver_demo','demo_interaccion','probar_click','registro_inicio','registro_enviado')),
  pagina text,
  detalle text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text
);
create index if not exists eventos_landing_fecha on public.eventos_landing (creado desc);

-- Las dos tablas solo las escribe y lee el servidor (llave maestra). El público y los dueños no ven nada.
alter table public.solicitudes enable row level security;
alter table public.eventos_landing enable row level security;
revoke all on public.solicitudes, public.eventos_landing from anon, authenticated;
