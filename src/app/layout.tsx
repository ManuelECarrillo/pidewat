import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Suspense } from "react";
import MetaConsentimiento from "@/components/MetaConsentimiento";
import "./globals.css";

// Claude (QA 2026-11-27): una sola tipografía para landing, registro, panel y menú. «Aptos» solo existe en Windows;
// en Android y iPhone se veía la del sistema. next/font las sirve desde el mismo dominio, sin pedir nada a Google al abrir.
const titulos = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", variable: "--fuente-titulos" });
const texto = Inter({ subsets: ["latin"], display: "swap", variable: "--fuente-texto" });

export const metadata: Metadata = {
  title: { default: "Pidewat · Pedidos ordenados por WhatsApp", template: "%s · Pidewat" },
  description: "Tu menú en un link y un QR. Tus clientes arman su pedido y te llega ordenado por WhatsApp, sin comisión.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Pidewat", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1f8a4c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${titulos.variable} ${texto.variable}`}>
      <body>{children}<Suspense fallback={null}><MetaConsentimiento /></Suspense></body>
    </html>
  );
}
