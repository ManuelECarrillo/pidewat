import Link from "next/link";
import { PLANES, DIAS_PRUEBA } from "@/lib/planes";
import { dinero } from "@/lib/formato";

const ventas = process.env.NEXT_PUBLIC_PIDEWAT_WHATSAPP || "";
const textoVentas = encodeURIComponent("Hola, quiero probar Pidewat en mi negocio.");

const ejemplo = `Hola *El Fogón de Durango*, quiero hacer un pedido:

• 3 x Gordita de chicharrón — $84
• 1 x Caldillo duranguense — $120
• 1 x Agua de horchata (1 L) — $35

*Total: $239*

🛵 A domicilio: Calle Negrete 410, Centro
👤 Mariana`;

export default function Inicio() {
  return (
    <main>
      <header className="top">
        <div className="wrap-ancho">
          <Link href="/" className="marca">Pide<b>wat</b></Link>
          <div className="grow" />
          <Link href="/entrar" className="btn btn-sm">Entrar</Link>
        </div>
      </header>

      <section className="wrap hero">
        <h1>Pedidos <em>ordenados</em> por WhatsApp, sin comisión.</h1>
        <p className="muted" style={{ fontSize: "1.1rem" }}>
          Tu menú en un link y un QR. Tus clientes eligen, y a tu WhatsApp llega el pedido completo con total, nombre y dirección.
          Nada de mensajes sueltos ni el 30 % de las apps de reparto.
        </p>
        <div className="row wrap-flex" style={{ marginTop: 18 }}>
          <Link href="/demo" className="btn btn-dark">Ver menú de ejemplo</Link>
          {ventas && <a href={`https://wa.me/${ventas}?text=${textoVentas}`} className="btn btn-wa">Te lo dejo montado hoy</a>}
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 32 }}>
        <div className="grid2">
          <div className="card">
            <h3>Así te llega cada pedido</h3>
            <pre className="burbuja">{ejemplo}</pre>
          </div>
          <div className="card stack">
            <h3>Cómo funciona</h3>
            <div><strong>1. Te lo montamos.</strong> Nos mandas foto de tu menú y en 30 minutos tienes tu link y tu QR para imprimir.</div>
            <div><strong>2. Lo compartes.</strong> QR en las mesas, link en Instagram, Facebook y tu estado de WhatsApp.</div>
            <div><strong>3. Recibes pedidos ordenados.</strong> Contestas desde tu WhatsApp de siempre. Cambias precios o marcas “agotado” desde tu celular.</div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 48 }}>
        <h2>Precio</h2>
        <div style={{ maxWidth: 420 }}>
          <div className="card">
            <div className="muted">Un solo plan, todo incluido</div>
            <div className="kpi">{dinero(PLANES.base.mensual)}<span className="small muted"> /mes</span></div>
            <p className="small muted">o {dinero(PLANES.base.anual)} al año (2 meses gratis)</p>
            <p>Menú ilimitado, pedidos sin comisión, QR, fotos, horario, envío a domicilio y lo que más te piden.</p>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 14 }}>{DIAS_PRUEBA} días gratis, sin tarjeta. Si no te convence, no pagas nada.</p>
      </section>

      <footer className="pie" style={{ paddingBottom: 40 }}>Pidewat · Hecho en Durango, México</footer>
    </main>
  );
}
