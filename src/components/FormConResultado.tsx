"use client";

import { useActionState, useEffect, useState } from "react";
import QRCode from "qrcode";
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
  // Enlace de acceso: QR para que el dueño lo escanee con su celular ahí mismo
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    setQr(null);
    if (r?.enlace) QRCode.toDataURL(r.enlace, { margin: 1, width: 240 }).then(setQr).catch(() => setQr(null));
  }, [r?.enlace]);
  return (
    <form action={enviar}>
      {children}
      <button className="btn btn-p" disabled={pendiente}>{pendiente ? "Un momento…" : boton}</button>
      {r && (
        <div className={`alerta ${r.ok ? "alerta-ok" : "alerta-bad"}`} style={{ marginTop: 12 }}>
          <div>{r.mensaje}</div>
          {qr && (
            <div style={{ marginTop: 10, textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR para entrar al panel" width={240} height={240} style={{ background: "#fff", borderRadius: 12 }} />
              <div className="small muted">Que el dueño lo escanee con la cámara de su celular. Sirve una sola vez.</div>
            </div>
          )}
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
