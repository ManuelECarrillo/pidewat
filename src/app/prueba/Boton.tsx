"use client";
import { useEffect } from "react";

function enviar(tipo: "visita" | "toque") {
  const utm = new URLSearchParams(window.location.search).get("utm_content") || "";
  const cuerpo = JSON.stringify({ tipo, utm });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon("/api/evento", new Blob([cuerpo], { type: "application/json" }));
    else fetch("/api/evento", { method: "POST", body: cuerpo, keepalive: true });
  } catch {}
}

export function Visita() {
  useEffect(() => { enviar("visita"); }, []);
  return null;
}

export function BotonWhatsApp({ href, texto, className }: { href: string; texto: string; className?: string }) {
  return <a href={href} className={className} onClick={() => enviar("toque")}>{texto}</a>;
}
