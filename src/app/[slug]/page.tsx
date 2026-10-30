import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Menu from "@/components/Menu";
import { categoriasDemo, negocioDemo, productosDemo } from "@/lib/demo";
import { estadoNegocio } from "@/lib/estado";
import { siteUrl } from "@/lib/formato";
import { SLUGS_RESERVADOS } from "@/lib/planes";
import { supabaseConfigurado, supabasePublico } from "@/lib/supabase/publico";
import { COLUMNAS_PUBLICAS, type Categoria, type Negocio, type Producto } from "@/lib/tipos";

export const revalidate = 30;

async function cargar(slug: string) {
  if (slug === "demo") return { negocio: negocioDemo, categorias: categoriasDemo, productos: productosDemo };
  if (SLUGS_RESERVADOS.has(slug) || !supabaseConfigurado()) return null;
  const sb = supabasePublico();
  const { data: negocio } = await sb.from("businesses").select(COLUMNAS_PUBLICAS).eq("slug", slug).maybeSingle<Negocio>();
  if (!negocio) return null;
  const [{ data: categorias }, { data: productos }] = await Promise.all([
    sb.from("categories").select("*").eq("business_id", negocio.id).order("position").order("name"),
    sb.from("products").select("*").eq("business_id", negocio.id).order("position").order("name"),
  ]);
  return { negocio, categorias: (categorias || []) as Categoria[], productos: (productos || []) as Producto[] };
}

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ mesa?: string }> };

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
  const { mesa } = await searchParams;
  const d = await cargar(slug);
  if (!d) notFound();
  const { negocio } = d;
  const estado = estadoNegocio(negocio);
  const link = `${siteUrl().replace(/^https?:\/\//, "")}/${negocio.slug}`;
  const inicial = negocio.name.trim().charAt(0).toUpperCase();

  return (
    <main style={{ ["--c" as string]: negocio.color }}>
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

      {estado.activo ? (
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
        Menú hecho con <a href="/">Pidewa</a> · Pedidos por WhatsApp sin comisión
      </footer>
    </main>
  );
}
