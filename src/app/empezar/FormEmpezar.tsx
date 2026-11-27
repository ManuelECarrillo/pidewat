"use client";

import { useActionState, useEffect, useState } from "react";
import { guardarUtm, leerUtm, medir } from "@/lib/medicion";
import { enviarSolicitud } from "./acciones";

const GIROS = ["Taquería", "Hamburguesas", "Hot dogs", "Food truck", "Fonda o cocina económica", "Antojitos", "Cafetería", "Otro"];
const VENTAS = process.env.NEXT_PUBLIC_PIDEWAT_WHATSAPP;

export default function FormEmpezar({ plan }: { plan: "esencial" | "restaurante" }) {
  const [r, enviar, pendiente] = useActionState(enviarSolicitud, null);
  const [giro, setGiro] = useState("");
  const [utm, setUtm] = useState("{}");
  useEffect(() => { guardarUtm(); setUtm(JSON.stringify(leerUtm())); medir("registro_inicio", { unaVez: true, detalle: plan }); }, [plan]);

  if (r?.ok) {
    const texto = encodeURIComponent(`Hola, acabo de pedir mi prueba de Pidewat${r.negocio ? ` para ${r.negocio}` : ""}.`);
    return (
      <div className="card" role="status" style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: "1.25rem" }}>¡Listo! Recibimos tu solicitud.</h2>
        <ol className="pasos-lista">
          <li>Te escribimos por WhatsApp hoy, o el siguiente día hábil si ya es tarde.</li>
          <li>Nos mandas foto de tu menú y lo dejamos configurado contigo{plan === "restaurante" ? ", y te mostramos la pantalla de cocina" : ""}.</li>
          <li>Tus 14 días gratis empiezan cuando tu menú queda listo. No pedimos tarjeta.</li>
        </ol>
        {VENTAS && <a className="btn btn-wa btn-block" href={`https://wa.me/${VENTAS}?text=${texto}`}>¿Prisa? Escríbenos ahora por WhatsApp</a>}
      </div>
    );
  }

  const err = (c: string) => (r && !r.ok && r.campo === c ? r.error : null);
  return (
    <form action={enviar} className="card" style={{ marginTop: 18 }} noValidate>
      <input type="hidden" name="plan" value={plan} />
      <input type="hidden" name="utm" value={utm} />
      <input type="hidden" name="giro" value={giro} />
      <div className="trampa" aria-hidden="true"><label>Sitio web<input name="sitio_web" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="f">Nombre de tu negocio
        <input className="i" name="negocio" required maxLength={80} autoComplete="organization" placeholder="Ej. Tacos El Güero" aria-invalid={Boolean(err("negocio"))} />
        {err("negocio") && <span className="error-campo">{err("negocio")}</span>}
      </label>
      <label className="f">Tu nombre
        <input className="i" name="nombre" required maxLength={60} autoComplete="name" aria-invalid={Boolean(err("nombre"))} />
        {err("nombre") && <span className="error-campo">{err("nombre")}</span>}
      </label>
      <label className="f">Tu WhatsApp <span className="h">10 dígitos. Por aquí te escribimos para configurar tu menú.</span>
        <input className="i" name="whatsapp" required inputMode="tel" autoComplete="tel-national" placeholder="618 123 4567" aria-invalid={Boolean(err("whatsapp"))} />
        {err("whatsapp") && <span className="error-campo">{err("whatsapp")}</span>}
      </label>
      <div className="f">¿Qué vendes? <span className="h">Opcional</span>
        <div className="chips" role="group" aria-label="Tipo de negocio">
          {GIROS.map((g) => (
            <button key={g} type="button" className={giro === g ? "on" : ""} aria-pressed={giro === g} onClick={() => setGiro(giro === g ? "" : g)}>{g}</button>
          ))}
        </div>
      </div>
      <label className="f">Ciudad <span className="h">Opcional. En Durango te lo podemos instalar en persona.</span>
        <input className="i" name="ciudad" maxLength={60} autoComplete="address-level2" placeholder="Durango" />
      </label>
      <label className="check" style={{ alignItems: "flex-start" }}>
        <input type="checkbox" name="privacidad" />
        <span className="small">Acepto que Pidewat use estos datos solo para contactarme por WhatsApp sobre mi prueba. <a href="/privacidad">Aviso de privacidad</a></span>
      </label>
      {err("privacidad") && <p className="error-campo">{err("privacidad")}</p>}
      {r && !r.ok && !r.campo && <div className="alerta alerta-bad" style={{ marginBottom: 12 }}>{r.error}</div>}
      <button className="btn btn-p btn-block" disabled={pendiente} style={{ padding: 14, fontSize: "1.05rem" }}>
        {pendiente ? "Enviando…" : plan === "restaurante" ? "Solicitar demostración" : "Pedir mi prueba gratis"}
      </button>
      <p className="small muted" style={{ textAlign: "center", margin: "10px 0 0" }}>Sin tarjeta. Sin compromiso. Si al terminar los 14 días no quieres seguir, no pagas nada.</p>
    </form>
  );
}
