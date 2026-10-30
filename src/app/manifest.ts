import type { MetadataRoute } from "next";

// Lo que usa el celular al "instalar" Pidewat en la pantalla de inicio (sin tienda de apps).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/panel",
    name: "Pidewat · Mi negocio",
    short_name: "Pidewat",
    description: "Tu menú y tus pedidos por WhatsApp",
    start_url: "/panel",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f5f2",
    theme_color: "#1f8a4c",
    lang: "es-MX",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
