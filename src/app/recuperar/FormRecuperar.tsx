"use client";

import { useActionState } from "react";
import Antirrobot from "@/components/Antirrobot";
import { pedirRecuperacion } from "./acciones";

export default function FormRecuperar() {
  const [r, enviar, pendiente] = useActionState(pedirRecuperacion, null);
  if (r?.ok) {
    return (
      <div className="card" role="status">
        <h2 style={{ fontSize: "1.2rem" }}>Revisa tu correo</h2>
        <p>Si ese correo tiene cuenta en Pidewat, te mandamos un enlace para poner una contraseña nueva. Vence en 1 hora. Revisa también «Spam» o «Promociones».</p>
      </div>
    );
  }
  return (
    <form action={enviar} className="card" noValidate>
      <Antirrobot />
      <label className="f">Tu correo
        <input className="i" name="correo" type="email" required autoComplete="email" inputMode="email" aria-invalid={Boolean(r?.error)} />
        {r?.error && <span className="error-campo">{r.error}</span>}
      </label>
      <button className="btn btn-p btn-block" disabled={pendiente}>{pendiente ? "Enviando…" : "Mandarme el enlace"}</button>
    </form>
  );
}
