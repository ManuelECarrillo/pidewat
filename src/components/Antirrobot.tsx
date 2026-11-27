"use client";

import { useEffect, useState } from "react";

// Campo trampa + hora de inicio + Cloudflare Turnstile (solo si hay llave pública). Va dentro del <form>.
const SITIO = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function Antirrobot() {
  const [t0, setT0] = useState("");
  useEffect(() => {
    setT0(String(Date.now()));
    if (!SITIO || document.getElementById("cf-turnstile")) return;
    const s = document.createElement("script");
    s.id = "cf-turnstile";
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, []);
  return (
    <>
      <input type="hidden" name="t0" value={t0} />
      <div className="trampa" aria-hidden="true"><label>Sitio web<input name="sitio_web" tabIndex={-1} autoComplete="off" /></label></div>
      {SITIO && <div className="cf-turnstile" data-sitekey={SITIO} data-language="es" data-theme="light" style={{ margin: "4px 0 12px" }} />}
    </>
  );
}
