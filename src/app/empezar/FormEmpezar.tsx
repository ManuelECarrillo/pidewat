"use client";

import { useActionState, useEffect, useState } from "react";
import { guardarUtm, leerUtm, medir } from "@/lib/medicion";
import Link from "next/link";
import Antirrobot from "@/components/Antirrobot";
import { crearPrueba, enviarSolicitud, reenviarConfirmacion } from "./acciones";

const GIROS = ["Taquería", "Hamburguesas", "Hot dogs", "Food truck", "Fonda o cocina económica", "Antojitos", "Cafetería", "Otro"];
const VENTAS = process.env.NEXT_PUBLIC_PIDEWAT_WHATSAPP;

export default function FormEmpezar({ plan }: { plan: "esencial" | "restaurante" }) {
  const alta = plan === "esencial";
  const [r, enviar, pendiente] = useActionState(alta ? crearPrueba : enviarSolicitud, null);
  const [ver, setVer] = useState(false);
  const [giro, setGiro] = useState("");
  const [local, setLocal] = useState<"" | "sin-mesas" | "con-mesas">("");
  const [utm, setUtm] = useState("{}");
  useEffect(() => { guardarUtm(); setUtm(JSON.stringify(leerUtm())); medir("registro_inicio", { unaVez: true, detalle: plan }); }, [plan]);

  if (r?.ok && r.revisaCorreo) {
    return <RevisaCorreo correo={r.revisaCorreo} fallo={r.error === "envio"} />;
  }

  if (r?.ok && r.entrar) {
    return (
      <div className="card" role="status" style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: "1.25rem" }}>¡Tu cuenta está lista!</h2>
        <p>Entra con tu correo y tu contraseña para armar tu menú.</p>
        <Link className="btn btn-p btn-block" href="/entrar?sig=/panel/menu">Entrar a mi panel</Link>
      </div>
    );
  }

  if (r?.ok) {
    const texto = encodeURIComponent(`Hola, acabo de pedir mi prueba de Pidewat${r.negocio ? ` para ${r.negocio}` : ""}.`);
    return (
      <div className="card" role="status" style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: "1.25rem" }}>¡Listo! Recibimos tu solicitud.</h2>
        <p>Te escribimos por WhatsApp para mostrarte la pantalla de cocina en cuanto esté lista para tu negocio. Mientras, puedes empezar con el plan Esencial: <Link href="/empezar?plan=esencial">crear mi menú gratis</Link>.</p>
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
      <input type="hidden" name="local" value={local} />
      <Antirrobot />
      <label className="f">Nombre de tu negocio
        <input className="i" name="negocio" required maxLength={80} autoComplete="organization" placeholder="Ej. Tacos El Güero" aria-invalid={Boolean(err("negocio"))} />
        {err("negocio") && <span className="error-campo">{err("negocio")}</span>}
      </label>
      <label className="f">Tu nombre
        <input className="i" name="nombre" required maxLength={60} autoComplete="name" aria-invalid={Boolean(err("nombre"))} />
        {err("nombre") && <span className="error-campo">{err("nombre")}</span>}
      </label>
      <label className="f">Tu WhatsApp <span className="h">10 dígitos. {alta ? "Aquí te llegan los pedidos de tus clientes." : "Por aquí te escribimos."}</span>
        <input className="i" name="whatsapp" required inputMode="tel" autoComplete="tel-national" placeholder="618 123 4567" aria-invalid={Boolean(err("whatsapp"))} />
        {err("whatsapp") && <span className="error-campo">{err("whatsapp")}</span>}
      </label>
      {alta && (
        <>
          <label className="f">Tu correo <span className="h">Con este entras a tu panel.</span>
            <input className="i" name="correo" type="email" required maxLength={120} autoComplete="email" inputMode="email" aria-invalid={Boolean(err("correo"))} />
            {err("correo") && <span className="error-campo">{err("correo")}</span>}
          </label>
          <label className="f">Crea tu contraseña <span className="h">Mínimo 8 caracteres.</span>
            <span className="row" style={{ gap: 8 }}>
              <input className="i grow" name="clave" type={ver ? "text" : "password"} required minLength={8} maxLength={72} autoComplete="new-password" aria-invalid={Boolean(err("clave"))} style={{ minWidth: 0 }} />
              <button type="button" className="btn btn-sm" onClick={() => setVer(!ver)} aria-pressed={ver}>{ver ? "Ocultar" : "Ver"}</button>
            </span>
            {err("clave") && <span className="error-campo">{err("clave")}</span>}
          </label>
        </>
      )}
      <div className="f">¿Cómo atiendes? <span className="h">Lo puedes cambiar después en «Mi negocio»</span>
        <div className="chips chips-atencion" role="group" aria-label="Cómo atiendes">
          <button type="button" className={`chip-atencion ${local === "sin-mesas" ? "on" : ""}`} aria-pressed={local === "sin-mesas"} onClick={() => setLocal(local === "sin-mesas" ? "" : "sin-mesas")}>
            <svg className="chip-atencion-icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20h16M6.5 20v-8h11v8M4 12h16M8 8h8l1.5 4h-11L8 8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="chip-atencion-texto"><strong>Puesto o local</strong><span>Sin mesas</span></span>
          </button>
          <button type="button" className={`chip-atencion ${local === "con-mesas" ? "on" : ""}`} aria-pressed={local === "con-mesas"} onClick={() => setLocal(local === "con-mesas" ? "" : "con-mesas")}>
            <svg className="chip-atencion-icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 11h16M6 11v9M18 11v9M8 7h8v4H8zM3 20h18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="chip-atencion-texto"><strong>Restaurante</strong><span>Con mesas</span></span>
          </button>
        </div>
      </div>
      <div className="f">¿Qué vendes? <span className="h">Opcional</span>
        <div className="chips" role="group" aria-label="Tipo de negocio">
          {GIROS.map((g) => (
            <button key={g} type="button" className={giro === g ? "on" : ""} aria-pressed={giro === g} onClick={() => setGiro(giro === g ? "" : g)}>{g}</button>
          ))}
        </div>
      </div>
      {!alta && (
        <label className="f">Ciudad <span className="h">Opcional</span>
          <input className="i" name="ciudad" maxLength={60} autoComplete="address-level2" />
        </label>
      )}
      <label className="check" style={{ alignItems: "flex-start" }}>
        <input type="checkbox" name="privacidad" />
        <span className="small">{alta ? "Acepto el aviso de privacidad de Pidewat." : "Acepto que Pidewat use estos datos solo para contactarme por WhatsApp sobre mi demostración."} <a href="/privacidad">Aviso de privacidad</a></span>
      </label>
      {err("privacidad") && <p className="error-campo">{err("privacidad")}</p>}
      {r && !r.ok && !r.campo && <div className="alerta alerta-bad" style={{ marginBottom: 12 }}>{r.error}</div>}
      <button className="btn btn-p btn-block" disabled={pendiente} style={{ padding: 14, fontSize: "1.05rem" }}>
        {pendiente ? (alta ? "Creando tu cuenta…" : "Enviando…") : alta ? "Crear mi menú gratis" : "Solicitar demostración"}
      </button>
      {/* La solicitud de Restaurante no arranca ninguna prueba: no prometer los 14 días ahí */}
      <p className="small muted" style={{ textAlign: "center", margin: "10px 0 0" }}>
        {alta ? "Sin tarjeta. 14 días gratis desde hoy. Si al terminar no quieres seguir, no pagas nada." : "Sin tarjeta y sin compromiso. Solo es para mostrarte cómo funciona la pantalla de cocina."}
      </p>
    </form>
  );
}

function RevisaCorreo({ correo, fallo }: { correo: string; fallo: boolean }) {
  const [r, reenviar, pendiente] = useActionState(reenviarConfirmacion, null);
  return (
    <div className="card" role="status" style={{ marginTop: 18 }}>
      <h2 style={{ fontSize: "1.25rem" }}>¡Tu menú ya está creado! Confirma tu correo</h2>
      <p>{fallo ? "No pudimos mandar el correo en este momento. Toca «Reenviar» en un minuto." : <>Te mandamos un enlace a <strong>{correo}</strong>. Tócalo para entrar a tu panel y armar tu menú. Tus 14 días gratis ya empezaron.</>}</p>
      <p className="small muted">¿No lo ves? Revisa «Spam» o «Promociones».</p>
      <form action={reenviar}>
        <input type="hidden" name="correo" value={correo} />
        <button className="btn btn-block" disabled={pendiente || Boolean(r?.ok)}>{r?.ok ? "Listo, te lo reenviamos" : pendiente ? "Reenviando…" : "Reenviar el correo"}</button>
      </form>
    </div>
  );
}
