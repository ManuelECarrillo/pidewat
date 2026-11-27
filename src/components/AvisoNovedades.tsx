"use client";

import { useTransition } from "react";
import { cerrarNovedades } from "@/app/panel/correo";
import { NOVEDADES } from "@/lib/novedades";

export default function AvisoNovedades() {
  const [cerrando, iniciar] = useTransition();
  return (
    <div className="alerta" role="status" style={{ marginBottom: 16 }}>
      <strong>{NOVEDADES.titulo}</strong>
      <p style={{ margin: "4px 0 10px" }}>{NOVEDADES.texto}</p>
      <button className="btn btn-sm" disabled={cerrando} onClick={() => iniciar(() => cerrarNovedades(NOVEDADES.version))}>
        {cerrando ? "Listo…" : "Entendido"}
      </button>
    </div>
  );
}
