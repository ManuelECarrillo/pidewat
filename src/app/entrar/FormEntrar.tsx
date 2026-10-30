"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseNavegador } from "@/lib/supabase/navegador";

// UX-005: que "olvidé mi contraseña" sea un botón que abre WhatsApp, no solo un texto
const ventas = process.env.NEXT_PUBLIC_PIDEWAT_WHATSAPP || "";

export default function FormEntrar() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");
    const { error } = await supabaseNavegador().auth.signInWithPassword({ email: correo.trim(), password: clave });
    setCargando(false);
    if (error) return setError("Correo o contraseña incorrectos.");
    router.replace("/panel");
    router.refresh();
  }

  return (
    <form onSubmit={entrar} className="card">
      <label className="f">Correo
        <input className="i" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
      </label>
      <label className="f">Contraseña
        <input className="i" type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
      </label>
      {error && <p style={{ color: "var(--bad)" }}>{error}</p>}
      <button className="btn btn-p btn-block" disabled={cargando}>{cargando ? "Entrando…" : "Entrar"}</button>
      <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
        ¿Olvidaste tu contraseña?{" "}
        {ventas ? (
          <a href={`https://wa.me/${ventas}?text=${encodeURIComponent("Hola, olvidé mi contraseña de Pidewat.")}`}>Escríbenos por WhatsApp</a>
        ) : "Escríbenos por WhatsApp"}{" "}
        y te mandamos una nueva.
      </p>
    </form>
  );
}
