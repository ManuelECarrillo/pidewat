"use client";

import { useEffect, useState } from "react";

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// Botón para poner Pidewat en la pantalla de inicio, sin descargar nada de una tienda.
// Android/Chrome: abre el aviso del sistema. iPhone: muestra los 3 pasos de Safari.
export default function InstalarApp({ variante = "tarjeta" }: { variante?: "tarjeta" | "boton" }) {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [instalada, setInstalada] = useState(true); // se oculta hasta saber
  const [ios, setIos] = useState(false);
  const [ayuda, setAyuda] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalada(standalone);
    const ua = navigator.userAgent;
    setIos(/iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1));
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const guardar = (e: Event) => { e.preventDefault(); setEvento(e as EventoInstalar); };
    const listo = () => { setInstalada(true); setEvento(null); };
    window.addEventListener("beforeinstallprompt", guardar);
    window.addEventListener("appinstalled", listo);
    return () => { window.removeEventListener("beforeinstallprompt", guardar); window.removeEventListener("appinstalled", listo); };
  }, []);

  if (instalada) return null;

  async function instalar() {
    if (evento) {
      await evento.prompt();
      const r = await evento.userChoice;
      if (r.outcome === "accepted") setInstalada(true);
      setEvento(null);
    } else setAyuda(true);
  }

  const boton = (
    <button type="button" className={variante === "boton" ? "btn btn-block" : "btn btn-p"} onClick={instalar}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="6" y="2" width="12" height="20" rx="3" /><path d="M12 7v7m-3-3 3 3 3-3" />
      </svg>
      Instalar app
    </button>
  );

  return (
    <>
      {variante === "boton" ? boton : (
        <div className="card row wrap-flex instalar" style={{ gap: 14 }}>
          <img src="/icon-192.png" alt="" width={48} height={48} style={{ borderRadius: 12 }} />
          <div style={{ flex: "1 1 180px" }}>
            <strong>Ten Pidewat en tu celular</strong>
            <div className="small muted">Ábrelo desde tu pantalla de inicio, como cualquier app.</div>
          </div>
          {boton}
        </div>
      )}

      {ayuda && (
        <>
          <div className="velo" onClick={() => setAyuda(false)} />
          <div className="hoja" role="dialog" aria-label="Cómo instalar">
            <div className="row between" style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Instalar Pidewat</h2>
              <button type="button" className="btn btn-sm" onClick={() => setAyuda(false)}>Cerrar</button>
            </div>
            {ios ? (
              <ol className="pasos">
                <li>Abre esta página en <strong>Safari</strong>.</li>
                <li>Toca el botón <strong>Compartir</strong>{" "}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1971c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-4px" }} aria-label="icono compartir">
                    <path d="M12 3v12m-4-8 4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
                  </svg>{" "}abajo de la pantalla.</li>
                <li>Baja y elige <strong>“Agregar a inicio”</strong>.</li>
                <li>Toca <strong>Agregar</strong>. Listo: Pidewat queda en tu pantalla de inicio.</li>
              </ol>
            ) : (
              <ol className="pasos">
                <li>Abre esta página en <strong>Chrome</strong>.</li>
                <li>Toca el menú <strong>⋮</strong> arriba a la derecha.</li>
                <li>Elige <strong>“Instalar app”</strong> o <strong>“Agregar a pantalla principal”</strong>.</li>
                <li>Confirma. Pidewat queda en tu pantalla de inicio.</li>
              </ol>
            )}
          </div>
        </>
      )}
    </>
  );
}
