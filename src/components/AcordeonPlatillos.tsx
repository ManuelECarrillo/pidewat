"use client";

import { useEffect, useRef, useState } from "react";

// Solo un platillo abierto a la vez, para que la lista no se vuelva un revoltijo.
// Si el que estaba abierto tiene cambios sin guardar, pregunta antes de cerrarlo.
// Cada <details> de platillo lleva data-plato y su formulario de edición data-editar.
const foto = (form: HTMLFormElement | null) =>
  form ? new URLSearchParams([...new FormData(form)].map(([k, v]) => [k, typeof v === "string" ? v : v.name])).toString() : "";

// Regresa los campos de texto y los interruptores a como estaban al abrir el platillo
// (form.reset() no sirve aquí: deja vacíos los campos que pintó el servidor)
function restaurar(form: HTMLFormElement, antes: string) {
  const v = new URLSearchParams(antes);
  for (const el of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[name], textarea[name]")) {
    if (el instanceof HTMLInputElement && el.type === "checkbox") el.checked = v.has(el.name);
    else if (!(el instanceof HTMLInputElement && (el.type === "hidden" || el.type === "file"))) el.value = v.get(el.name) ?? "";
  }
}

export default function AcordeonPlatillos({ children }: { children: React.ReactNode }) {
  const caja = useRef<HTMLDivElement>(null);
  const fotos = useRef(new WeakMap<HTMLDetailsElement, string>());
  const [pregunta, setPregunta] = useState<{ viejo: HTMLDetailsElement; nuevo: HTMLDetailsElement; nombre: string } | null>(null);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    // "toggle" no burbujea, pero sí pasa por los papás en la fase de captura
    const alAbrir = (e: Event) => {
      const nuevo = e.target as HTMLDetailsElement;
      if (!nuevo.matches?.("details[data-plato]") || !nuevo.open) return;
      fotos.current.set(nuevo, foto(nuevo.querySelector("form[data-editar]")));
      for (const viejo of el.querySelectorAll<HTMLDetailsElement>("details[data-plato][open]")) {
        if (viejo === nuevo) continue;
        const form = viejo.querySelector<HTMLFormElement>("form[data-editar]");
        if (form && foto(form) !== fotos.current.get(viejo)) {
          const nombre = viejo.querySelector("summary")?.textContent?.trim().replace(/\$.*$/, "").trim() || "el platillo";
          setPregunta({ viejo, nuevo, nombre });
          return;
        }
        viejo.open = false;
      }
    };
    el.addEventListener("toggle", alAbrir, true);
    return () => el.removeEventListener("toggle", alAbrir, true);
  }, []);

  function guardar() {
    if (!pregunta) return;
    const form = pregunta.viejo.querySelector<HTMLFormElement>("form[data-editar]")!;
    if (!form.checkValidity()) {
      // Falta algo (ej. el precio): se queda abierto el anterior para que lo complete
      pregunta.nuevo.open = false;
      form.reportValidity();
    } else {
      form.requestSubmit();
      pregunta.viejo.open = false;
      pregunta.nuevo.scrollIntoView({ block: "nearest" });
    }
    setPregunta(null);
  }
  function descartar() {
    if (!pregunta) return;
    const form = pregunta.viejo.querySelector<HTMLFormElement>("form[data-editar]");
    if (form) restaurar(form, fotos.current.get(pregunta.viejo) ?? "");
    pregunta.viejo.open = false;
    setPregunta(null);
  }
  function seguir() {
    if (!pregunta) return;
    pregunta.nuevo.open = false;
    pregunta.viejo.scrollIntoView({ block: "nearest" });
    setPregunta(null);
  }

  return (
    <div ref={caja}>
      {children}
      {pregunta && (
        <>
          <div className="velo" onClick={seguir} />
          <div className="dialogo" role="alertdialog" aria-modal="true">
            <p style={{ fontWeight: 600, fontSize: "1.05rem", marginTop: 0 }}>Cambiaste “{pregunta.nombre}” y no lo has guardado.</p>
            <p className="small muted">¿Quieres guardar esos cambios antes de abrir otro?</p>
            <div className="stack" style={{ marginTop: 16, gap: 8 }}>
              <button type="button" className="btn btn-p btn-block" autoFocus onClick={guardar}>Guardar cambios</button>
              <button type="button" className="btn btn-block" onClick={descartar}>No guardar</button>
              <button type="button" className="btn btn-block" onClick={seguir}>Seguir editando “{pregunta.nombre}”</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
