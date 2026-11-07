import type { Metadata } from "next";
import { DIAS_PRUEBA } from "@/lib/planes";
import { Visita, BotonWhatsApp } from "./Boton";

export const metadata: Metadata = {
  title: "Tu menú digital con pedidos por WhatsApp",
  description: "Para puestos, locales y restaurantes de Durango. Pruébalo gratis.",
  robots: { index: false },
};

const ventas = process.env.NEXT_PUBLIC_PIDEWAT_WHATSAPP || "";
const texto = encodeURIComponent("Hola, vi Pidewat y quiero la demostración para mi negocio.");

export default function Prueba() {
  const href = `https://wa.me/${ventas}?text=${texto}`;
  return (
    <main>
      <Visita />
      <section className="wrap hero" style={{ paddingTop: 28, paddingBottom: 12 }}>
        <div className="marca" style={{ marginBottom: 14 }}>Pide<b>wat</b></div>
        <h1>Tu <em>menú digital</em> con pedidos por WhatsApp.</h1>
        <p className="muted" style={{ fontSize: "1.1rem" }}>
          Para tu puesto, local o restaurante. Tus clientes piden desde su casa o ahí mismo, y el pedido te llega ordenado a tu WhatsApp.
        </p>
        {ventas && (
          <BotonWhatsApp
            href={href}
            texto="Pide tu demostración gratis"
            className="btn btn-wa"
          />
        )}
        <p className="small muted" style={{ marginTop: 10 }}>Te contesto por WhatsApp. {DIAS_PRUEBA} días gratis, sin tarjeta.</p>
      </section>

      <section className="wrap" style={{ paddingBottom: 24 }}>
        <div className="card stack">
          <div>✅ <strong>Sin comisiones.</strong> Nada de apps de reparto.</div>
          <div>✅ <strong>Link y QR</strong> para tu puesto, tus mesas y tus redes.</div>
          <div>✅ <strong>Comer aquí, recoger o a domicilio.</strong> Tú decides cuál ofreces.</div>
          <div>✅ <strong>Cambias precios</strong> o marcas “agotado” desde tu celular.</div>
        </div>
        <p style={{ marginTop: 14 }}>
          <a href="/demo" className="btn btn-dark">Ver un menú de ejemplo</a>
        </p>
      </section>

      <section className="wrap" style={{ paddingBottom: 48 }}>
        {ventas && (
          <BotonWhatsApp href={href} texto="Escríbeme por WhatsApp" className="btn btn-wa" />
        )}
      </section>
    </main>
  );
}
