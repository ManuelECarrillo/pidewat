"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { guardarClaveNueva } from "../recuperar/acciones";

export default function FormClave() {
  const [r, enviar, pendiente] = useActionState(guardarClaveNueva, null);
  const [ver, setVer] = useState(false);
  if (r?.ok) {
    return (
      <div className="card" role="status">
        <h2 style={{ fontSize: "1.2rem" }}>Listo, ya tienes contraseña nueva</h2>
        <Link className="btn btn-p btn-block" href="/panel">Ir a mi panel</Link>
      </div>
    );
  }
  return (
    <form action={enviar} className="card" noValidate>
      <label className="f">Contraseña nueva <span className="h">Mínimo 8 caracteres.</span>
        <span className="row" style={{ gap: 8 }}>
          <input className="i grow" name="clave" type={ver ? "text" : "password"} required minLength={8} maxLength={72} autoComplete="new-password" aria-invalid={Boolean(r?.error)} style={{ minWidth: 0 }} />
          <button type="button" className="btn btn-sm" onClick={() => setVer(!ver)} aria-pressed={ver}>{ver ? "Ocultar" : "Ver"}</button>
        </span>
        {r?.error && <span className="error-campo">{r.error}</span>}
      </label>
      <button className="btn btn-p btn-block" disabled={pendiente}>{pendiente ? "Guardando…" : "Guardar contraseña"}</button>
    </form>
  );
}
