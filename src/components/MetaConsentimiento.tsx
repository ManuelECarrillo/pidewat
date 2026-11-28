"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { medir } from "@/lib/medicion";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const LLAVE = "pidewat:meta-consentimiento";
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const RUTAS_PROPIAS = new Set(["/", "/demo", "/empezar", "/terminos", "/privacidad", "/entrar"]);

function cargarPixel() {
  if (!PIXEL || document.querySelector("script[data-pidewat-meta]")) return;
  const fbq = (...args: unknown[]) => { (fbq as typeof fbq & { queue?: unknown[][] }).queue?.push(args); };
  (fbq as typeof fbq & { queue?: unknown[][]; loaded?: boolean; version?: string }).queue = [];
  (fbq as typeof fbq & { loaded?: boolean }).loaded = true;
  (fbq as typeof fbq & { version?: string }).version = "2.0";
  window.fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  script.dataset.pidewatMeta = "true";
  document.head.append(script);
  window.fbq("init", PIXEL);
}

// El píxel no existe en el DOM hasta que la persona acepta; rechazar conserva solo nuestro conteo agregado.
export default function MetaConsentimiento() {
  const ruta = usePathname();
  const busqueda = useSearchParams();
  const [eleccion, setEleccion] = useState<"aceptar" | "rechazar" | null>(null);
  const esPaginaPropia = RUTAS_PROPIAS.has(ruta);
  // En el panel no mostramos el aviso ni contamos visitas: solo deduplicamos el alta
  // si esta persona ya habÃ­a aceptado la mediciÃ³n en una pÃ¡gina propia.
  const esAltaEnPanel = ruta === "/panel" && Boolean(busqueda.get("meta_event"));

  useEffect(() => {
    try { setEleccion(localStorage.getItem(LLAVE) as "aceptar" | "rechazar" | null); } catch { setEleccion("rechazar"); }
  }, []);

  useEffect(() => {
    if (eleccion !== "aceptar" || !PIXEL || (!esPaginaPropia && !esAltaEnPanel)) return;
    cargarPixel();
    if (esPaginaPropia) window.fbq?.("track", "PageView");
    if (ruta === "/demo") window.fbq?.("track", "ViewContent", { content_name: "demo" });
    const eventId = busqueda.get("meta_event");
    if (esAltaEnPanel && eventId) {
      window.fbq?.("track", "CompleteRegistration", { content_name: "esencial", status: "trial" }, { eventID: eventId });
      window.history.replaceState({}, "", "/panel?bienvenida=1");
    }
  }, [eleccion, esAltaEnPanel, esPaginaPropia, ruta, busqueda]);

  useEffect(() => {
    const conversion = (evento: Event) => {
      if (eleccion !== "aceptar" || !esPaginaPropia) return;
      const detalle = (evento as CustomEvent<{ nombre: string; eventId: string; contenido: string }>).detail;
      if (detalle) window.fbq?.("track", detalle.nombre, { content_name: detalle.contenido }, { eventID: detalle.eventId });
    };
    window.addEventListener("pidewat:conversion-meta", conversion);
    return () => window.removeEventListener("pidewat:conversion-meta", conversion);
  }, [eleccion, esPaginaPropia]);

  const decidir = (valor: "aceptar" | "rechazar") => {
    try {
      localStorage.setItem(LLAVE, valor);
      document.cookie = `pidewat_meta_consentimiento=${valor}; Path=/; Max-Age=15552000; SameSite=Lax`;
    } catch {}
    setEleccion(valor);
    medir(valor === "aceptar" ? "cookies_aceptar" : "cookies_rechazar", { unaVez: true });
  };

  if (!esPaginaPropia || eleccion !== null) return null;
  return (
    <aside className="aviso-cookies" aria-label="Preferencias de cookies">
      <span>Usamos cookies de Meta para medir nuestros anuncios</span>
      <div>
        <button type="button" onClick={() => decidir("aceptar")}>Aceptar</button>
        <button type="button" className="aviso-cookies-rechazar" onClick={() => decidir("rechazar")}>Rechazar</button>
      </div>
    </aside>
  );
}
