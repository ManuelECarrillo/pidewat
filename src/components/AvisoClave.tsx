"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Al entrar, recomienda cambiar la contraseña que le mandamos por WhatsApp (hasta que la cambie).
export default function AvisoClave() {
  const ruta = usePathname();
  const [ver, setVer] = useState(false);
  useEffect(() => {
    try { setVer(sessionStorage.getItem("pidewat:clave-despues") !== "1"); } catch { setVer(true); }
  }, []);
  if (!ver || ruta.startsWith("/panel/qr")) return null;
  const despues = () => { try { sessionStorage.setItem("pidewat:clave-despues", "1"); } catch {} setVer(false); };
  return (
    <div className="alerta" style={{ marginBottom: 16 }}>
      <strong>Te recomendamos cambiar tu contraseña.</strong>
      <p style={{ margin: "4px 0 10px" }}>La que te mandamos por WhatsApp la pudo ver alguien más. Pon una que solo tú sepas.</p>
      <div className="row wrap-flex">
        <Link className="btn btn-sm btn-p" href="/panel/negocio#clave" onClick={despues}>Cambiarla ahora</Link>
        <button type="button" className="btn btn-sm" onClick={despues}>Después</button>
      </div>
    </div>
  );
}
