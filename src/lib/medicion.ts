"use client";

// Medición propia de la landing: sin cookies, sin datos personales, sin píxel de terceros.
// Cada evento manda solo su nombre, la página y las UTM de la visita (guardadas en esta pestaña).
// Un registro gratis NO es una compra: las suscripciones pagadas se cuentan aparte, en el servidor.
export type EventoLanding =
  | "landing_visita" | "ver_demo" | "demo_interaccion" | "probar_click"
  | "registro_inicio" | "registro_enviado";

const LLAVE = "pidewat:utm";
const CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

// Guarda las UTM de la primera página que abre la persona (así no se pierden al ir a /empezar)
export function guardarUtm() {
  try {
    const q = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const c of CAMPOS) { const v = q.get(c); if (v) utm[c] = v.slice(0, 100); }
    if (Object.keys(utm).length) sessionStorage.setItem(LLAVE, JSON.stringify(utm));
  } catch {}
}

export function leerUtm(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(LLAVE) || "{}"); } catch { return {}; }
}

const yaEnviados = new Set<string>();

// `unaVez`: para eventos que solo cuentan una vez por visita (ej. la primera interacción con la demo)
export function medir(evento: EventoLanding, opciones: { unaVez?: boolean; detalle?: string } = {}) {
  if (opciones.unaVez) { if (yaEnviados.has(evento)) return; yaEnviados.add(evento); }
  try {
    const cuerpo = JSON.stringify({ evento, pagina: window.location.pathname, detalle: opciones.detalle?.slice(0, 40), utm: leerUtm() });
    navigator.sendBeacon("/api/medir", new Blob([cuerpo], { type: "application/json" }));
  } catch {}
}
