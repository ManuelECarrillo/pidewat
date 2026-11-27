"use client";

import { useEffect, useState } from "react";

const PASOS = [
  { clave: "nuevo", texto: "Recibido" },
  { clave: "preparando", texto: "Preparando" },
  { clave: "listo", texto: "¡Listo!" },
];
const MENSAJE: Record<string, string> = {
  nuevo: "La cocina ya tiene tu pedido.",
  preparando: "Están preparando tu pedido.",
  listo: "Tu pedido está listo. Ya te lo llevan a tu mesa.",
  entregado: "Pedido entregado. ¡Buen provecho!",
  cancelado: "El negocio canceló este pedido. Pregunta en el mostrador.",
};

// Se actualiza solo cada 5 segundos mientras la pantalla esté a la vista
export default function EstadoPedido({ id, numero, mesa, estadoInicial }: { id: string; numero: number; mesa: string | null; estadoInicial: string }) {
  const [estado, setEstado] = useState(estadoInicial);
  useEffect(() => {
    if (estado === "entregado" || estado === "cancelado") return;
    const t = setInterval(async () => {
      if (document.hidden) return;
      try {
        const r = await fetch(`/api/orden/${id}`, { cache: "no-store" });
        const d = await r.json();
        if (d.ok) setEstado(d.estado);
      } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, [id, estado]);

  const paso = estado === "entregado" ? 3 : PASOS.findIndex((p) => p.clave === estado);
  return (
    <div className="card estado-pedido" role="status" aria-live="polite">
      <div className="small muted">Pedido{mesa ? ` · Mesa ${mesa}` : ""}</div>
      <div className="numero-pedido">#{numero}</div>
      {estado !== "cancelado" && (
        <ol className="pasos">
          {PASOS.map((p, i) => <li key={p.clave} className={i <= paso ? "on" : ""}>{p.texto}</li>)}
        </ol>
      )}
      <p style={{ margin: "10px 0 0", fontWeight: 600 }}>{MENSAJE[estado] || ""}</p>
    </div>
  );
}
