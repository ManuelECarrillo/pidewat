"use client";

import { createContext, useContext, useRef, useState } from "react";

// Tarjetas que se abren de una en una. Si la abierta tiene cambios sin guardar,
// antes de abrir otra pregunta si guardarlos (con el estilo de la app, no la ventana gris del sistema).
type Ctx = { abierta: string | null; pedir: (id: string) => void; marcar: (id: string, form: HTMLFormElement | null) => void; limpiar: (id: string) => void; version: (id: string) => number };
const Contexto = createContext<Ctx | null>(null);

export function Acordeon({ children }: { children: React.ReactNode }) {
  const [abierta, setAbierta] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<{ siguiente: string | null } | null>(null);
  const [versiones, setVersiones] = useState<Record<string, number>>({});
  const sucia = useRef<{ id: string; form: HTMLFormElement | null } | null>(null);

  const cambiarA = (id: string | null) => {
    setAbierta(id);
    if (id) requestAnimationFrame(() => document.getElementById(`ac-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  };
  const pedir = (id: string) => {
    const siguiente = abierta === id ? null : id;
    if (sucia.current && sucia.current.id === abierta) setPendiente({ siguiente });
    else cambiarA(siguiente);
  };

  function guardar() {
    const f = sucia.current?.form;
    sucia.current = null;
    f?.requestSubmit();
    cambiarA(pendiente?.siguiente ?? null);
    setPendiente(null);
  }
  function descartar() {
    const id = sucia.current?.id;
    sucia.current = null;
    // Se vuelve a dibujar la tarjeta para regresar a lo que estaba guardado
    if (id) setVersiones((v) => ({ ...v, [id]: (v[id] || 0) + 1 }));
    cambiarA(pendiente?.siguiente ?? null);
    setPendiente(null);
  }

  return (
    <Contexto.Provider value={{
      abierta, pedir,
      marcar: (id, form) => { sucia.current = { id, form }; },
      limpiar: (id) => { if (sucia.current?.id === id) sucia.current = null; },
      version: (id) => versiones[id] || 0,
    }}>
      {children}
      {pendiente && (
        <>
          <div className="velo" onClick={() => setPendiente(null)} />
          <div className="dialogo" role="alertdialog" aria-modal="true">
            <p style={{ fontWeight: 600, fontSize: "1.05rem", marginTop: 0 }}>Tienes cambios sin guardar</p>
            <p className="small muted">¿Quieres guardarlos antes de {pendiente.siguiente ? "abrir el otro" : "cerrar"}?</p>
            <div className="stack" style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-p btn-block" autoFocus onClick={guardar}>Guardar cambios</button>
              <button type="button" className="btn btn-block" onClick={descartar}>No guardar</button>
              <button type="button" className="btn btn-block" style={{ border: 0 }} onClick={() => setPendiente(null)}>Seguir editando</button>
            </div>
          </div>
        </>
      )}
    </Contexto.Provider>
  );
}

export function Desplegable({ id, titulo, children, className = "d", tituloClassName, style }: {
  id: string; titulo: React.ReactNode; children: React.ReactNode; className?: string; tituloClassName?: string; style?: React.CSSProperties;
}) {
  const c = useContext(Contexto)!;
  const abierta = c.abierta === id;
  return (
    <div id={`ac-${id}`} className={`${className} ${abierta ? "on" : ""}`} style={{ scrollMarginTop: 70, ...style }}>
      <button type="button" className={`d-titulo ${tituloClassName || ""}`} aria-expanded={abierta} onClick={() => c.pedir(id)}>
        <span className="grow">{titulo}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="d-flecha"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {/* Se queda montada aunque esté cerrada, para que un "Guardar" que viene del aviso termine de enviarse */}
      <div key={c.version(id)} hidden={!abierta} className="d-cuerpo"
        onInput={(e) => c.marcar(id, (e.target as HTMLElement).closest("form"))}
        onSubmit={() => c.limpiar(id)}>
        {children}
      </div>
    </div>
  );
}
