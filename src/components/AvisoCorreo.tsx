"use client";

import { useActionState } from "react";
import { reenviarMiConfirmacion } from "@/app/panel/correo";

// Se registró y entró directo: falta confirmar el correo para poder recuperar la contraseña.
export default function AvisoCorreo({ correo }: { correo: string }) {
  const [r, reenviar, pendiente] = useActionState(reenviarMiConfirmacion, null);
  return (
    <div className="alerta" role="status" style={{ marginBottom: 16 }}>
      <strong>Confirma tu correo cuando puedas.</strong>
      <p style={{ margin: "4px 0 10px" }}>
        Te mandamos un enlace a <b>{correo}</b>. Así podrás recuperar tu contraseña si un día la olvidas.
        Si el correo está mal escrito, escríbenos.
      </p>
      <form action={reenviar}>
        <button className="btn btn-sm" disabled={pendiente}>{pendiente ? "Enviando…" : "Mandarlo otra vez"}</button>
        {r && <span className="small" style={{ marginLeft: 10 }} role="status">{r.mensaje}</span>}
      </form>
    </div>
  );
}
