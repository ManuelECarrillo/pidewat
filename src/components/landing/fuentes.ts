import { Bricolage_Grotesque, Inter } from "next/font/google";

// Fuentes solo de la landing: se aplican a su contenedor (clase lp), así el menú,
// el panel y el admin siguen con la fuente del sistema y no cargan nada extra.
export const fuenteTitulos = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--lp-display",
});

export const fuenteTexto = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--lp-texto",
});
