"use client";

import { useState } from "react";
import Selector from "./Selector";
import { NOMBRE_DIA, SEMANA, textoHorario, type Dia, type Horario, type Turno } from "@/lib/horario";

// Horas cada media hora, con la lista de la app (sin el reloj gris del sistema)
const HORAS = Array.from({ length: 48 }, (_, i) => {
  const v = `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`;
  return { value: v, label: v.replace(/^0(\d)/, "$1") };
});
const BASE: Turno = { abre: "08:00", cierra: "17:00" };

// Horario por día. Se manda como JSON en el campo "horario"; vacío = sin horario (siempre se puede pedir).
export default function EditorHorario({ valor, texto }: { valor: Horario | null; texto: string }) {
  const [usar, setUsar] = useState(Boolean(valor));
  const [h, setH] = useState<Horario>(valor ?? Object.fromEntries(SEMANA.map((d) => [d, d === "dom" ? null : BASE])));

  const cambiar = (d: Dia, t: Turno | null) => setH((x) => ({ ...x, [d]: t }));
  const copiarATodos = (t: Turno) => setH((x) => Object.fromEntries(SEMANA.map((d) => [d, x[d] ? t : null])));

  return (
    <div>
      <input type="hidden" name="horario" value={usar ? JSON.stringify(h) : ""} />
      {/* El texto que sale en el menú: se arma solo con el horario, o se escribe a mano si no se usa */}
      {usar && <input type="hidden" name="hours" value={textoHorario(h)} />}
      <label className="check">
        <input type="checkbox" checked={usar} onChange={(e) => setUsar(e.target.checked)} />
        No recibir pedidos fuera de mi horario
      </label>
      {usar && (
        <div className="stack" style={{ gap: 6 }}>
          {SEMANA.map((d) => {
            const t = h[d] ?? null;
            return (
              <div key={d} className="horario-dia">
                <label className="check" style={{ margin: 0, minWidth: 92 }}>
                  <input type="checkbox" checked={Boolean(t)} onChange={(e) => cambiar(d, e.target.checked ? BASE : null)} />
                  {NOMBRE_DIA[d]}
                </label>
                {t ? (
                  <div className="row grow" style={{ gap: 6 }}>
                    <div className="grow"><Selector key={`${d}a${t.abre}`} opciones={HORAS} valor={t.abre} ariaLabel={`${NOMBRE_DIA[d]} abre`} onChange={(v) => cambiar(d, { ...t, abre: v })} /></div>
                    <span className="small muted">a</span>
                    <div className="grow"><Selector key={`${d}c${t.cierra}`} opciones={HORAS} valor={t.cierra} ariaLabel={`${NOMBRE_DIA[d]} cierra`} onChange={(v) => cambiar(d, { ...t, cierra: v })} /></div>
                  </div>
                ) : (
                  <span className="muted grow">Cerrado</span>
                )}
              </div>
            );
          })}
          {h.lun && (
            <button type="button" className="btn btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => copiarATodos(h.lun!)}>
              Usar el horario del lunes en todos los días abiertos
            </button>
          )}
          <p className="small muted" style={{ margin: 0 }}>Así se verá: {textoHorario(h) || "sin días abiertos"}. Si cierras pasada la medianoche, pon la hora de cierre (ej. 2:00).</p>
        </div>
      )}
      {!usar && (
        <label className="f">Horario que ven tus clientes <span className="h">Solo informativo: así se puede pedir a cualquier hora</span>
          <input className="i" name="hours" defaultValue={texto} placeholder="Lun a Sáb 8:00 a 17:00" />
        </label>
      )}
    </div>
  );
}
