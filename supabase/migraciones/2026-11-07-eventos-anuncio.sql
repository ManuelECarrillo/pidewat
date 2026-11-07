-- Conteo simple de visitas y toques al botón de WhatsApp de la página /prueba (anuncios).
-- Sin datos personales: solo tipo, página y la etiqueta utm del anuncio.
create table if not exists public.eventos_anuncio (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  tipo text not null check (tipo in ('visita','toque')),
  pagina text not null default 'prueba',
  utm text
);
alter table public.eventos_anuncio enable row level security;
-- Sin políticas: solo el servidor (llave maestra) escribe y lee.
revoke all on public.eventos_anuncio from anon, authenticated;
