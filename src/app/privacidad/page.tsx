import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Aviso de privacidad", description: "Cómo usa Pidewat los datos que nos compartes." };

export default function Privacidad() {
  const wa = process.env.NEXT_PUBLIC_PIDEWAT_WHATSAPP;
  return (
    <main className="wrap" style={{ maxWidth: 680, padding: "28px 16px 56px" }}>
      <Link href="/" className="marca">Pide<b>wat</b></Link>
      <h1 style={{ fontSize: "1.6rem", marginTop: 18 }}>Aviso de privacidad</h1>
      <p className="muted small">Última actualización: 27 de noviembre de 2026</p>
      <h2 style={{ fontSize: "1.1rem" }}>Qué datos pedimos</h2>
      <p>Cuando pides una prueba: nombre de tu negocio, tu nombre, tu WhatsApp y, si quieres, el tipo de negocio y la ciudad. Cuando usas Pidewat: tu correo para entrar al panel y la información de tu menú.</p>
      <h2 style={{ fontSize: "1.1rem" }}>Para qué los usamos</h2>
      <p>Solo para contactarte sobre tu prueba, configurar tu menú, darte soporte y cobrar tu plan si decides contratarlo. No vendemos ni rentamos tus datos.</p>
      <h2 style={{ fontSize: "1.1rem" }}>Tus clientes</h2>
      <p>Los pedidos que hacen tus clientes se envían a tu WhatsApp. Pidewat guarda solo lo necesario para tus estadísticas (productos, cantidades y total); no guarda el teléfono de tus clientes.</p>
      <h2 style={{ fontSize: "1.1rem" }}>Medición de la página</h2>
      <p>Contamos visitas y clics de esta página sin cookies y sin identificarte, para saber qué partes sirven.</p>
      <p>Si aceptas el aviso de cookies, usamos el píxel y la API de conversiones de Meta para medir visitas, pruebas activadas y solicitudes de demostración de nuestros anuncios. Meta recibe datos técnicos de la visita; tu correo y WhatsApp se envían cifrados con hash solo si aceptaste. Puedes rechazarlo en el aviso de cookies y Pidewat seguirá funcionando igual.</p>
      <h2 style={{ fontSize: "1.1rem" }}>Tus derechos</h2>
      <p>Puedes pedirnos ver, corregir o borrar tus datos, o dejar de recibir mensajes, escribiéndonos{wa ? <> por <a href={`https://wa.me/${wa}`}>WhatsApp</a></> : ""}.</p>
      <p>Responsable: Eduardo Carrillo Arévalo. Correo de contacto: <a href="mailto:pidewat.soporte@gmail.com">pidewat.soporte@gmail.com</a>.</p>
    </main>
  );
}
