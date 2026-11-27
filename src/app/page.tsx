import type { Metadata } from "next";
import Landing from "@/components/landing/Landing";

// Página de inicio = landing comercial para dueños de negocios de comida.
// El menú de cada negocio (/[slug]), el panel y el admin no cambian.
export const metadata: Metadata = {
  title: { absolute: "Pidewat · Menú digital con pedidos por WhatsApp para negocios de comida" },
  description: "Tus clientes eligen productos, tamaños y extras desde tu menú digital y el pedido te llega completo a WhatsApp, con su total. 14 días gratis, sin tarjeta y sin comisión por pedido.",
  openGraph: {
    title: "Pidewat · Deja de tomar pedidos a medias por WhatsApp",
    description: "Menú digital con pedidos ordenados por WhatsApp para taquerías, hamburgueserías, puestos y fondas. 14 días gratis, sin comisión.",
    type: "website",
    locale: "es_MX",
  },
};

export default function Inicio() {
  return <Landing />;
}
