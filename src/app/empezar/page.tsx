import type { Metadata } from "next";
import Link from "next/link";
import FormEmpezar from "./FormEmpezar";

export const metadata: Metadata = {
  title: "Prueba Pidewat 14 días gratis",
  description: "Pide tu prueba gratis de Pidewat: menú digital con pedidos por WhatsApp para tu negocio de comida. Sin tarjeta.",
  robots: { index: false },
};

export default async function Empezar({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const restaurante = plan === "restaurante";
  return (
    <main className="empezar">
      <div className="wrap" style={{ maxWidth: 560, padding: "28px 16px 48px" }}>
        <Link href="/" className="marca">Pide<b>wat</b></Link>
        <h1 style={{ fontSize: "1.7rem", margin: "18px 0 6px" }}>
          {restaurante ? "Solicita una demostración del plan Restaurante" : "Empieza tu prueba de 14 días gratis"}
        </h1>
        <p className="muted" style={{ marginTop: 0 }}>
          {restaurante
            ? "La pantalla de cocina está en pruebas con pocos negocios. Déjanos tus datos y te la mostramos."
            : "Sin tarjeta. Nosotros configuramos tu menú contigo y tu prueba empieza cuando quede listo."}
        </p>
        <FormEmpezar plan={restaurante ? "restaurante" : "esencial"} />
      </div>
    </main>
  );
}
