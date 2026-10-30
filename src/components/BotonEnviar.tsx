"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

// Botón de formulario que muestra "Guardando…" y, si se pide, una confirmación con el estilo de la app.
export default function BotonEnviar({ children, className = "btn btn-p", confirmar }: { children: React.ReactNode; className?: string; confirmar?: string }) {
  const { pending } = useFormStatus();
  const [preguntando, setPreguntando] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={boton} className={className} disabled={pending}
        onClick={(e) => { if (confirmar) { e.preventDefault(); setPreguntando(true); } }}>
        {pending ? "Guardando…" : children}
      </button>
      {preguntando && (
        <>
          <div className="velo" onClick={() => setPreguntando(false)} />
          <div className="dialogo" role="alertdialog" aria-modal="true">
            <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>{confirmar}</p>
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
              <button type="button" className="btn" onClick={() => setPreguntando(false)}>Cancelar</button>
              <button type="button" className="btn btn-p" autoFocus
                onClick={() => { setPreguntando(false); boton.current?.form?.requestSubmit(boton.current); }}>
                Sí, continuar
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
