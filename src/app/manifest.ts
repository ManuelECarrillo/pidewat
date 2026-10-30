import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pidewat",
    short_name: "Pidewat",
    description: "Pedidos ordenados por WhatsApp",
    start_url: "/panel",
    display: "standalone",
    background_color: "#f7f5f2",
    theme_color: "#1f8a4c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
