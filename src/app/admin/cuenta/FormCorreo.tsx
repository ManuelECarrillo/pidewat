"use client";

import { useActionState } from "react";
import { cambiarMiCorreo } from "./acciones";

export default function FormCorreo({ actual }: { actual: string }) {
  const [r, enviar, pendiente] = useActionState(cambiarMiCorreo, null);
  return (
    <form action={enviar} className="card">
      <p className="small muted" style={{ marginTop: 0 }}>Hoy entras con <strong>{actual}</strong>. Pon un correo real tuyo para poder recuperar la contraseña.</p>
      <label className="f">Correo nuevo<input className="i" name="correo" type="email" required autoComplete="email" /></label>
      <label className="f">Escríbelo otra vez<input className="i" name="correo2" type="email" required autoComplete="off" /></label>
      {r && <div className={`alerta ${r.ok ? "alerta-ok" : "alerta-bad"}`} style={{ marginBottom: 12 }}>{r.mensaje}</div>}
      <button className="btn btn-p btn-block" disabled={pendiente}>{pendiente ? "Guardando…" : "Cambiar mi correo"}</button>
    </form>
  );
}
