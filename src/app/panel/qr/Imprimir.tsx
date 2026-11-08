"use client";
import { useEffect, useState } from "react";
import { hojasPng, guardar, type Tarjeta } from "@/lib/tarjetaQr";

// En la app instalada del celular, "imprimir" del navegador casi nunca hace nada.
// Por eso el botón principal guarda las hojas como imagen (galería, WhatsApp a la papelería o impresora).
export default function Imprimir({ tarjetas, nombre, color, dominio }: { tarjetas: Tarjeta[]; nombre: string; color: string; dominio: string }) {
  const [app, setApp] = useState(false);
  const [estado, setEstado] = useState<"" | "preparando" | "listo">("");

  useEffect(() => {
    const movil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const instalada = window.matchMedia("(display-mode: standalone)").matches;
    setApp(movil || instalada);
  }, []);

  async function guardarHojas() {
    setEstado("preparando");
    try {
      const hojas = await hojasPng(tarjetas, { nombre, color, dominio });
      const r = await guardar(hojas, `tarjetas-qr`, `Tarjetas QR de ${nombre}`);
      setEstado(r === "cancelado" ? "" : "listo");
    } catch { setEstado(""); }
  }

  const hojas = Math.ceil(tarjetas.length / 6);
  const btnGuardar = (
    <button className={`btn ${app ? "btn-p" : ""}`} onClick={guardarHojas} disabled={estado === "preparando"}>
      {estado === "preparando" ? "Preparando…" : `Guardar ${hojas > 1 ? `${hojas} hojas` : "hoja"} para imprimir`}
    </button>
  );
  const btnImprimir = <button className={`btn ${app ? "" : "btn-p"}`} onClick={() => window.print()}>Imprimir</button>;

  return (
    <div className="stack" style={{ alignItems: "flex-end", gap: 6 }}>
      <div className="row wrap-flex" style={{ justifyContent: "flex-end" }}>
        {app ? <>{btnGuardar}{btnImprimir}</> : <>{btnImprimir}{btnGuardar}</>}
      </div>
      {estado === "listo" && (
        <p className="small muted" style={{ margin: 0, textAlign: "right" }}>
          Listo. Imprímelas desde tu galería, o mándalas por WhatsApp a una papelería (tamaño carta).
        </p>
      )}
    </div>
  );
}
