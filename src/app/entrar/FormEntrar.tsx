"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseNavegador } from "@/lib/supabase/navegador";

// Solo rutas propias del panel o el admin, nunca otro sitio
const destinoSeguro = (sig?: string) => (sig && /^\/(panel|admin)(\/|\?|$)/.test(sig) ? sig : "/panel");

export default function FormEntrar({ sig }: { sig?: string }) {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [tocado, setTocado] = useState(false);
  // UX-012: avisar del correo mal escrito junto al campo, antes de enviar
  const correoMal = tocado && correo.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");
    const { error } = await supabaseNavegador().auth.signInWithPassword({ email: correo.trim(), password: clave });
    setCargando(false);
    if (error) return setError(/confirm/i.test(error.message) ? "Primero confirma tu correo: te mandamos un enlace cuando te registraste. Si no lo ves, revisa «Spam»." : "Correo o contraseña incorrectos.");
    router.replace(destinoSeguro(sig));
    router.refresh();
  }

  return (
    <form onSubmit={entrar} className="card">
      <label className="f">Correo
        <input className="i" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)}
          onBlur={() => setTocado(true)} aria-invalid={correoMal || undefined} aria-describedby={correoMal ? "correo-ayuda" : undefined} />
        {correoMal && <span id="correo-ayuda" className="small" style={{ color: "var(--bad)" }}>Revisa tu correo: parece que le falta algo (ejemplo: nombre@gmail.com).</span>}
      </label>
      <label className="f">Contraseña
        <input className="i" type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
      </label>
      {error && <p role="alert" style={{ color: "var(--bad)" }}>{error}</p>}
      <button className="btn btn-p btn-block" disabled={cargando}>{cargando ? "Entrando…" : "Entrar"}</button>
      <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
        ¿Olvidaste tu contraseña? <a href="/recuperar">Te mandamos un enlace a tu correo</a>.
      </p>
    </form>
  );
}
