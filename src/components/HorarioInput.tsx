"use client";

import { useRef, useState } from "react";
import { NOMBRES_DIA, type Horario, type Turno } from "@/lib/horario";
import Selector, { avisarCambio } from "./Selector";

const HORAS = Array.from({ length: 48 }, (_, i) => {
  const v = `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`;
  const h = Math.floor(i / 2), etiqueta = `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${i % 2 ? "30" : "00"} ${h < 12 ? "am" : "pm"}`;
  return { value: v, label: etiqueta };
});
const ORDEN = [1, 2, 3, 4, 5, 6, 0]; // lunes primero
const BASE: Turno = { abre: "09:00", cierra: "18:00" };

// Horario por día. Con él, el menú no deja mandar pedidos cuando el negocio está cerrado.
export default function HorarioInput({ valor, textoLibre }: { valor: Horario | null; textoLibre: string }) {
  const [usar, setUsar] = useState(Boolean(valor));
  const [dias, setDias] = useState<(Turno | null)[]>(valor?.dias || [null, BASE, BASE, BASE, BASE, BASE, BASE]);
  const caja = useRef<HTMLDivElement>(null);

  const cambiar = (d: number, t: Turno | null) => { setDias((x) => x.map((v, i) => (i === d ? t : v))); avisarCambio(caja.current); };
  const copiarLunes = () => { setDias((x) => x.map((v) => (v ? { ...(x[1] || BASE) } : v))); avisarCambio(caja.current); };

  return (
    <div className="f" ref={caja}>
      <input type="hidden" name="horario" value={usar ? JSON.stringify({ dias }) : ""} />
      <label className="check" style={{ marginBottom: 6 }}>
        <input type="checkbox" checked={usar} onChange={(e) => setUsar(e.target.checked)} /> Solo recibir pedidos en mi horario
      </label>
      {!usar ? (
        <label className="f">Horario que ven tus clientes <span className="h">Sin este interruptor, tus clientes pueden pedir a cualquier hora</span>
          <input className="i" name="hours" defaultValue={textoLibre} placeholder="Lun a Sáb 8:00 a 17:00" />
        </label>
      ) : (
        <div className="horario">
          {ORDEN.map((d) => {
            const t = dias[d];
            return (
              <div key={d} className="horario-dia">
                <label className="check" style={{ margin: 0 }}>
                  <input type="checkbox" checked={Boolean(t)} onChange={(e) => cambiar(d, e.target.checked ? { ...(dias[1] || BASE) } : null)} />
                  <span style={{ minWidth: 84 }}>{NOMBRES_DIA[d]}</span>
                </label>
                {t ? (
                  <div className="row horario-horas">
                    <Selector key={`a${d}${t.abre}`} name={`abre-${d}`} valor={t.abre} opciones={HORAS} ariaLabel={`${NOMBRES_DIA[d]} abre`} onCambio={(v) => cambiar(d, { ...t, abre: v })} />
                    <span className="small muted">a</span>
                    <Selector key={`c${d}${t.cierra}`} name={`cierra-${d}`} valor={t.cierra} opciones={HORAS} ariaLabel={`${NOMBRES_DIA[d]} cierra`} onCambio={(v) => cambiar(d, { ...t, cierra: v })} />
                  </div>
                ) : (
                  <span className="small muted">Cerrado</span>
                )}
              </div>
            );
          })}
          <button type="button" className="btn btn-sm" onClick={copiarLunes}>Poner el horario del lunes a todos los días abiertos</button>
          <p className="small muted" style={{ margin: 0 }}>Fuera de este horario tus clientes ven tu menú, pero no pueden mandar pedidos. Hora del centro de México.</p>
        </div>
      )}
    </div>
  );
}
