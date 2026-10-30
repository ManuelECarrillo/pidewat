"use client";

import { useActionState } from "react";
import type { ResultadoAlta } from "@/app/admin/acciones";

// Formulario que muestra lo que respondió el servidor y, si trae texto, un botón para mandarlo por WhatsApp.
export default function FormConResultado({
  action, children, boton,
}: {
  action: (prev: ResultadoAlta | null, f: FormData) => Promise<ResultadoAlta>;
  children: React.ReactNode;
  boton: string;
}) {
  const [r, enviar, pendiente] = useActionState(action, null);
  return (
    <form action={enviar}>
      {children}
      <button className="btn btn-p" disabled={pendiente}>{pendiente ? "Un momento…" : boton}</button>
      {r && (
        <div className={`alerta ${r.ok ? "alerta-ok" : "alerta-bad"}`} style={{ marginTop: 12 }}>
          <div>{r.mensaje}</div>
          {r.texto && (
            <>
              <pre className="burbuja" style={{ marginTop: 10 }}>{r.texto}</pre>
              <div className="row wrap-flex" style={{ marginTop: 10 }}>
                <a className="btn btn-sm btn-wa" target="_blank" href={`https://wa.me/${r.whatsapp}?text=${encodeURIComponent(r.texto)}`}>Mandar por WhatsApp</a>
                <button type="button" className="btn btn-sm" onClick={() => navigator.clipboard.writeText(r.texto!)}>Copiar</button>
              </div>
            </>
          )}
        </div>
      )}
    </form>
  );
}
