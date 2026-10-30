import Link from "next/link";
import type { Estado } from "@/lib/estado";
import { dinero, fecha } from "@/lib/formato";
import { PLANES } from "@/lib/planes";

export default function AvisoEstado({ estado }: { estado: Estado }) {
  if (estado.clave === "activo") return null;
  if (estado.clave === "prueba")
    return (
      <div className={`alerta ${estado.diasRestantes <= 3 ? "" : "alerta-ok"}`}>
        Estás en tu prueba gratis: te {estado.diasRestantes === 1 ? "queda 1 día" : `quedan ${estado.diasRestantes} días`}.{" "}
        <Link href="/panel/plan"><strong>Activar plan ({dinero(PLANES.base.mensual)} al mes)</strong></Link>
      </div>
    );
  if (estado.clave === "vencido")
    return (
      <div className="alerta alerta-bad">
        Tu plan venció. Tu menú se pausa en {estado.diasGracia} {estado.diasGracia === 1 ? "día" : "días"}. <Link href="/panel/plan"><strong>Pagar {dinero(PLANES.base.mensual)}</strong></Link>
      </div>
    );
  return (
    <div className="alerta alerta-bad">
      Tu menú está en pausa y tus clientes no pueden pedir. Tus platillos siguen guardados. <Link href="/panel/plan"><strong>Reactivar</strong></Link>
    </div>
  );
}

export function pillEstado(estado: Estado) {
  const cls = estado.clave === "activo" ? "pill-ok" : estado.clave === "prueba" ? "pill-warn" : "pill-bad";
  const texto = estado.clave === "activo" ? `Activo hasta ${fecha(estado.hasta)}` : estado.etiqueta;
  return <span className={`pill ${cls}`}>{texto}</span>;
}
