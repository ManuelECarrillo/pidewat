"use client";

import { useEffect, useRef, useState } from "react";

export type Opcion = { value: string; label: string; hint?: string };

// Lista desplegable con el estilo de la app (reemplaza al <select> gris del sistema).
export default function Selector({
  name, opciones, valor, ariaLabel,
}: {
  name: string; opciones: Opcion[]; valor?: string; ariaLabel?: string;
}) {
  const [actual, setActual] = useState(valor ?? opciones[0]?.value ?? "");
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => { if (!caja.current?.contains(e.target as Node)) setAbierto(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(false); };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", fuera); document.removeEventListener("keydown", esc); };
  }, [abierto]);

  const elegida = opciones.find((o) => o.value === actual);

  return (
    <div className="sel" ref={caja}>
      <input type="hidden" name={name} value={actual} />
      <button type="button" className={`sel-btn ${abierto ? "on" : ""}`} aria-haspopup="listbox" aria-expanded={abierto} aria-label={ariaLabel}
        onClick={() => setAbierto((a) => !a)}>
        <span className="grow" style={{ textAlign: "left" }}>{elegida?.label ?? "Elegir…"}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {abierto && (
        <ul className="sel-lista" role="listbox">
          {opciones.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === actual}>
              <button type="button" className={o.value === actual ? "on" : ""} onClick={() => { setActual(o.value); setAbierto(false); }}>
                <span className="grow">
                  {o.label}
                  {o.hint && <span className="small muted" style={{ display: "block" }}>{o.hint}</span>}
                </span>
                {o.value === actual && (
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
