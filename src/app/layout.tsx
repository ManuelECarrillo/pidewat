import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Pidewat · Pedidos ordenados por WhatsApp", template: "%s · Pidewat" },
  description: "Tu menú en un link y un QR. Tus clientes arman su pedido y te llega ordenado por WhatsApp, sin comisión.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1f8a4c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
