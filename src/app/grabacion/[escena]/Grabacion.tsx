"use client";

import { useEffect, useState } from "react";
import Cocina from "@/components/Cocina";
import Menu from "@/components/Menu";
import { categoriasDemo, negocioDemo, productosDemo } from "@/lib/demo";
import { tarjetaPng } from "@/lib/tarjetaQr";
import type { NegocioMenu } from "@/lib/tipos";
import s from "./grabacion.module.css";

type Escena = "pedido" | "qr" | "mesa" | "orden" | "cocina" | "dispositivos";

const negocio: NegocioMenu = (({ plan: _plan, trial_ends_at: _trial, paid_until: _paid, paused: _paused, ...n }) => n)(negocioDemo);
const negocioCocina: NegocioMenu = { ...negocio, id: "grabacion-demo", cocina: true };
// La app normal conserva su origen recibido. Esta ruta local de evidencia usa
// explícitamente el destino público que verá una persona en el anuncio.
const origenGrabacion = "https://pidewat.vercel.app";
const link = `${origenGrabacion}/demo`;

function TarjetaQr({ mesa }: { mesa?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let url = "";
    tarjetaPng({ url: `${link}${mesa ? `?mesa=${mesa}` : ""}`, mesa }, { nombre: negocio.name, color: negocio.color, dominio: origenGrabacion })
      .then((blob) => { url = URL.createObjectURL(blob); setSrc(url); });
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [mesa]);
  return <div className={s.qrCard}>{src ? <img src={src} alt={`Tarjeta QR real${mesa ? ` de la mesa ${mesa}` : ""}`} /> : <p>Generando tarjeta QR…</p>}</div>;
}

function Mensaje({ texto, cerrar }: { texto: string; cerrar: () => void }) {
  return <div className={s.mensajePantalla} data-testid="mensaje-whatsapp">
    <div className={s.mensajeBarra}><span>WhatsApp</span><button onClick={cerrar}>Volver al menú</button></div>
    <pre className="burbuja">{texto}</pre>
    <p className={s.mensajeNota}>Mensaje listo para enviar</p>
  </div>;
}

function MenuGrabable({ mesa, cocina = false }: { mesa?: string; cocina?: boolean }) {
  const [mensaje, setMensaje] = useState("");
  if (mensaje) return <Mensaje texto={mensaje} cerrar={() => setMensaje("")} />;
  const n = cocina ? negocioCocina : negocio;
  return <Menu negocio={n} categorias={categoriasDemo} productos={productosDemo} mesaInicial={mesa} link={link} onMensajePedido={setMensaje} apiCocina={cocina ? "/api/grabacion/cocina" : undefined} onCocinaEnviada={cocina ? () => window.location.assign("/grabacion/cocina") : undefined} />;
}

export default function Grabacion({ escena }: { escena: Escena }) {
  if (escena === "qr") return <main className={s.panel}><header><span>Panel del dueño</span><h1>Tarjetas QR</h1><p>El mismo generador de tarjetas que usa el panel.</p></header><TarjetaQr /><section className={s.menuDebajo}><MenuGrabable /></section></main>;
  if (escena === "cocina") return <main className={s.panel}><p className={s.pruebas}>Plan Restaurante · en pruebas</p><Cocina apiUrl="/api/grabacion/cocina" /></main>;
  // La composición de dispositivos la realiza Playwright con PNG de pantallas
  // ya cargadas. No usamos iframes aquí: en una captura inmediata pueden verse
  // vacíos aunque las pantallas reales sí estén disponibles.
  if (escena === "dispositivos") return <main className={s.dispositivos}><h1>Pidewat en cada dispositivo</h1><p>Capturas reales para composición de grabación.</p></main>;
  const mesa = escena === "mesa" || escena === "orden" ? "7" : undefined;
  return <main className="menu-publico" style={{ ["--c" as string]: negocio.color }}><div className="portada" /><div className="wrap cabecera"><div className="logo">F</div><h1>{negocio.name}</h1><p className="muted">{mesa ? `Mesa ${mesa} · menú de demostración` : negocio.description}</p></div><MenuGrabable mesa={mesa} cocina={escena === "orden"} /></main>;
}
