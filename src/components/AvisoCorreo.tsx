"use client";

import { useActionState, useState } from "react";
import { cambiarMiCorreo, reenviarMiConfirmacion } from "@/app/panel/correo";

// Se registró y entró directo: falta confirmar el correo para poder recuperar la contraseña.
// Si lo escribió mal, lo corrige aquí mismo (sin escribirnos).
export default function AvisoCorreo({ correo }: { correo: string }) {
  const [r, reenviar, pendiente] = useActionState(reenviarMiConfirmacion, null);
  const [c, cambiar, cambiando] = useActionState(cambiarMiCorreo, null);
  const [editar, setEditar] = useState(false);
  return (
    <div className="alerta" role="status" style={{ marginBottom: 16 }}>
      <strong>Confirma tu correo cuando puedas.</strong>
      <p style={{ margin: "4px 0 10px" }}>
        Te mandamos un enlace a <b>{correo}</b>. Así podrás recuperar tu contraseña si un día la olvidas.
      </p>
      {editar && !c?.ok ? (
        <form action={cambiar} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <input className="i" name="correo" type="email" inputMode="email" autoComplete="email" required defaultValue={correo} aria-label="Tu correo correcto" style={{ flex: "1 1 220px" }} />
          <button className="btn btn-sm" disabled={cambiando}>{cambiando ? "Guardando…" : "Guardar correo"}</button>
          <button type="button" className="btn btn-sm" onClick={() => setEditar(false)}>Cancelar</button>
          {c && <span className="small" role="status" style={{ flexBasis: "100%" }}>{c.mensaje}</span>}
        </form>
      ) : (
        <form action={reenviar} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <button className="btn btn-sm" disabled={pendiente}>{pendiente ? "Enviando…" : "Mandarlo otra vez"}</button>
          <button type="button" className="btn btn-sm" onClick={() => setEditar(true)}>Mi correo está mal</button>
          {(c?.ok ? c : r) && <span className="small" role="status" style={{ flexBasis: "100%" }}>{(c?.ok ? c : r)!.mensaje}</span>}
        </form>
      )}
    </div>
  );
}
