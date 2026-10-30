import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BotonVolver from "@/components/BotonVolver";
import Menu from "@/components/Menu";
import { categoriasDemo, negocioDemo, productosDemo } from "@/lib/demo";
import { estadoNegocio } from "@/lib/estado";
import { siteUrl } from "@/lib/formato";
import { SLUGS_RESERVADOS } from "@/lib/planes";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseConfigurado, supabasePublico } from "@/lib/supabase/publico";
import { COLUMNAS_MENU, type Categoria, type NegocioMenu, type Producto } from "@/lib/tipos";

export const revalidate = 30;

async function cargar(slug: string) {
  if (slug === "demo") {
    const { plan, trial_ends_at, paid_until, paused, ...negocio } = negocioDemo;
    return { negocio, activo: true, categorias: categoriasDemo, productos: productosDemo };
  }
  if (SLUGS_RESERVADOS.has(slug) || !supabaseConfigurado()) return null;
  const sb = supabasePublico();
  let { data: negocio, error } = await sb.from("businesses").select(COLUMNAS_MENU).eq("slug", slug).maybeSingle<NegocioMenu>();
  // Mientras no se corra la migración del horario (2026-10-30-horario.sql), el menú sigue funcionando sin él
  if (error) ({ data: negocio } = await sb.from("businesses").select(COLUMNAS_MENU.replace(", horario", "")).eq("slug", slug).maybeSingle<NegocioMenu>());
  if (!negocio) return null;
  const [{ data: cobro }, { data: categorias }, { data: productos }] = await Promise.all([
    // Si está en pausa se decide aquí en el servidor; esas fechas nunca llegan al navegador
    supabaseAdmin().from("businesses").select("trial_ends_at, paid_until, paused").eq("id", negocio.id).single(),
    sb.from("categories").select("*").eq("business_id", negocio.id).order("position").order("name"),
    sb.from("products").select("*").eq("business_id", negocio.id).order("position").order("name"),
  ]);
  return {
    negocio, activo: cobro ? estadoNegocio(cobro).activo : true,
    categorias: (categorias || []) as Categoria[], productos: (productos || []) as Producto[],
  };
}

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ mesa?: string; desde?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await cargar(slug);
  if (!d) return {};
  return {
    title: { absolute: `${d.negocio.name} · Haz tu pedido` },
    description: d.negocio.description || `Menú de ${d.negocio.name}. Pide por WhatsApp.`,
    openGraph: d.negocio.cover_url ? { images: [d.negocio.cover_url] } : undefined,
  };
}

export default async function PaginaNegocio({ params, searchParams }: Props) {
  const { slug } = await params;
  const { mesa, desde } = await searchParams;
  const d = await cargar(slug);
  if (!d) notFound();
  const { negocio } = d;
  const link = `${siteUrl().replace(/^https?:\/\//, "")}/${negocio.slug}`;
  const inicial = negocio.name.trim().charAt(0).toUpperCase();

  return (
    <main style={{ ["--c" as string]: negocio.color }}>
      {(desde === "panel" || desde === "admin") && <BotonVolver a={desde === "admin" ? "/admin" : "/panel"} />}
      <div className="portada" style={negocio.cover_url ? { backgroundImage: `url(${negocio.cover_url})` } : undefined} />
      <div className="wrap cabecera">
        <div className="logo" style={negocio.logo_url ? { backgroundImage: `url(${negocio.logo_url})` } : undefined}>
          {!negocio.logo_url && inicial}
        </div>
        <h1 style={{ marginTop: 12, fontSize: "1.6rem" }}>{negocio.name}</h1>
        {negocio.description && <p className="muted">{negocio.description}</p>}
        <div className="small muted">
          {negocio.hours && <div>🕒 {negocio.hours}</div>}
          {negocio.address && <div>📍 {negocio.address}</div>}
        </div>
      </div>

      {d.activo ? (
        <Menu negocio={negocio} categorias={d.categorias} productos={d.productos} mesaInicial={mesa?.slice(0, 6)} link={link} />
      ) : (
        <div className="wrap" style={{ paddingTop: 24 }}>
          <div className="alerta">
            <strong>Este menú está en pausa por el momento.</strong>
            <p style={{ margin: "6px 0 12px" }}>Puedes escribirle directo al negocio por WhatsApp.</p>
            <a className="btn btn-wa" href={`https://wa.me/${negocio.whatsapp}`}>Escribir por WhatsApp</a>
          </div>
        </div>
      )}

      <footer className="pie">
        Menú hecho con <a href="/">Pidewat</a> · Pedidos por WhatsApp sin comisión
      </footer>
    </main>
  );
}
