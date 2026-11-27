import type { Metadata } from "next";
import Landing from "@/components/landing/Landing";
import { siteUrl } from "@/lib/formato";

// Página de inicio = landing comercial para dueños de negocios de comida.
// El menú de cada negocio (/[slug]), el panel y el admin no cambian.
const TITULO = "Pidewat · Menú digital con pedidos por WhatsApp para negocios de comida";
const DESCRIPCION = "Tus clientes eligen productos, tamaños y extras desde tu menú digital y el pedido te llega completo a WhatsApp, con su total. 14 días gratis, sin tarjeta y sin comisión por pedido.";
// Imagen al compartir el link: la portada de marca (ya existe en public/marca, 1640×624)
const IMAGEN = { url: "/marca/portada-facebook.png", width: 1640, height: 624, alt: "Pidewat: tu menú digital con pedidos por WhatsApp" };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { absolute: TITULO },
  description: DESCRIPCION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Pidewat · Deja de tomar pedidos a medias por WhatsApp",
    description: "Menú digital con pedidos ordenados por WhatsApp para taquerías, hamburgueserías, puestos y fondas. 14 días gratis, sin comisión.",
    url: "/",
    siteName: "Pidewat",
    type: "website",
    locale: "es_MX",
    images: [IMAGEN],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pidewat · Deja de tomar pedidos a medias por WhatsApp",
    description: "Menú digital con pedidos ordenados por WhatsApp. 14 días gratis, sin comisión.",
    images: [IMAGEN.url],
  },
};

export default async function Inicio({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  return <Landing publico={p === "puestos" || p === "restaurantes" ? p : undefined} />;
}
