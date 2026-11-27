import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Condiciones de contratación", description: "Condiciones sencillas para usar Pidewat." };

// Los datos del responsable se conservan como marcador hasta que Eduardo los confirme.
export default function Terminos() {
  return (
    <main className="wrap" style={{ maxWidth: 720, padding: "28px 16px 56px" }}>
      <Link href="/" className="marca">Pide<b>wat</b></Link>
      <h1 style={{ fontSize: "1.6rem", marginTop: 18 }}>Condiciones de contratación</h1>
      <p className="muted small">Última actualización: 27 de noviembre de 2026</p>
      <h2>Prueba y planes</h2>
      <p>Pidewat Esencial tiene 14 días gratis y no pide tarjeta. Al terminar, tú decides si sigues: mensualidad de $249 MXN con cobro automático por Mercado Pago, o pago anual de $2,490 MXN en una sola exhibición. El pago anual no incluye meses sin intereses.</p>
      <h2>Cancelar y menú pausado</h2>
      <p>Puedes cancelar el cobro automático cuando quieras desde «Mi plan». Tu menú seguirá disponible hasta la fecha que ya pagaste. Si al terminar la prueba o un periodo pagado no pagas, hay 7 días de gracia y después el menú se pausa; no se borra tu información.</p>
      <h2>Pedidos por WhatsApp</h2>
      <p>Pidewat no cobra comisión por pedido. El cliente final arma su pedido y se abre WhatsApp con el mensaje preparado. Abrir WhatsApp no garantiza que el mensaje se envíe.</p>
      <h2>Plan Restaurante</h2>
      <p>El plan Restaurante está en pruebas y no se puede contratar todavía. Solo puedes solicitar una demostración.</p>
      <h2>Contacto</h2>
      <p>Responsable: Eduardo Carrillo Arévalo. Correo de contacto: <a href="mailto:pidewat.soporte@gmail.com">pidewat.soporte@gmail.com</a>.</p>
      <p><Link href="/privacidad">Consulta también el aviso de privacidad.</Link></p>
    </main>
  );
}
