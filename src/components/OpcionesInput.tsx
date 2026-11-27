"use client";

import { useEffect, useRef, useState } from "react";
import { avisarCambio } from "./Selector";
import { limpiarOpciones } from "@/lib/opciones";

// Editor de tamaños y extras de un platillo. Guarda todo como JSON en un campo oculto "opciones";
// el servidor lo vuelve a limpiar (guardarProducto), así que aquí solo se cuida que sea fácil.
type G = { nombre: string; tipo: "una" | "varias"; obligatorio: boolean; max: string; opciones: { nombre: string; precio: string }[] };

const aEditable = (raw: unknown): G[] =>
  limpiarOpciones(raw).map((g) => ({
    ...g, max: String(g.max), opciones: g.opciones.map((o) => ({ nombre: o.nombre, precio: o.precio ? String(o.precio) : "" })),
  }));
const aGuardar = (gs: G[]) =>
  JSON.stringify(gs.map((g) => ({
    nombre: g.nombre, tipo: g.tipo, obligatorio: g.obligatorio, max: Number(g.max) || g.opciones.length,
    opciones: g.opciones.map((o) => ({ nombre: o.nombre, precio: Number(String(o.precio).replace(",", ".")) || 0 })),
  })));

const PLANTILLAS: Record<string, G> = {
  tamano: { nombre: "Tamaño", tipo: "una", obligatorio: true, max: "1", opciones: [{ nombre: "Chico", precio: "" }, { nombre: "Grande", precio: "15" }] },
  extras: { nombre: "Extras", tipo: "varias", obligatorio: false, max: "3", opciones: [{ nombre: "Queso extra", precio: "10" }] },
  sabor: { nombre: "Sabor", tipo: "una", obligatorio: true, max: "1", opciones: [{ nombre: "", precio: "" }] },
};

export default function OpcionesInput({ valor }: { valor?: unknown }) {
  const [gs, setGs] = useState<G[]>(() => aEditable(valor));
  const oculto = useRef<HTMLInputElement>(null);
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    avisarCambio(oculto.current);
  }, [gs]);

  const cambiarG = (i: number, c: Partial<G>) => setGs((x) => x.map((g, j) => (j === i ? { ...g, ...c } : g)));
  const cambiarO = (i: number, k: number, c: Partial<G["opciones"][number]>) =>
    setGs((x) => x.map((g, j) => (j === i ? { ...g, opciones: g.opciones.map((o, m) => (m === k ? { ...o, ...c } : o)) } : g)));

  return (
    <div className="f">
      Tamaños, sabores y extras <span className="h">Opcional. Ej. Chico / Grande +$15, o Extras: queso +$10. El precio que pongas aquí se suma al del platillo.</span>
      <input ref={oculto} type="hidden" name="opciones" value={aGuardar(gs)} />
      {gs.map((g, i) => (
        <div key={i} className="op-edit">
          <div className="row">
            <input className="i grow" value={g.nombre} onChange={(e) => cambiarG(i, { nombre: e.target.value })} placeholder="Nombre del grupo, ej. Tamaño" aria-label="Nombre del grupo" style={{ marginTop: 0 }} />
            <button type="button" className="btn btn-sm btn-bad" aria-label="Quitar grupo" onClick={() => setGs((x) => x.filter((_, j) => j !== i))}>✕</button>
          </div>
          <div className="seg" style={{ marginTop: 8 }}>
            <button type="button" className={g.tipo === "una" ? "on" : ""} onClick={() => cambiarG(i, { tipo: "una", obligatorio: true })}>El cliente elige uno</button>
            <button type="button" className={g.tipo === "varias" ? "on" : ""} onClick={() => cambiarG(i, { tipo: "varias", obligatorio: false })}>Puede elegir varios</button>
          </div>
          {g.tipo === "varias" && (
            <label className="row small" style={{ marginBottom: 8 }}>Máximo
              <input className="i" inputMode="numeric" value={g.max} onChange={(e) => cambiarG(i, { max: e.target.value.replace(/\D/g, "").slice(0, 2) })} style={{ width: 64, marginTop: 0, textAlign: "center" }} />
            </label>
          )}
          {g.opciones.map((o, k) => (
            <div key={k} className="row" style={{ marginBottom: 6 }}>
              <input className="i grow" value={o.nombre} onChange={(e) => cambiarO(i, k, { nombre: e.target.value })} placeholder="Opción, ej. Grande" aria-label="Opción" style={{ marginTop: 0, minWidth: 0 }} />
              <input className="i" value={o.precio} inputMode="decimal" onChange={(e) => cambiarO(i, k, { precio: e.target.value.replace(/[^0-9.,]/g, "") })} placeholder="+$0" aria-label="Precio extra" style={{ width: 76, marginTop: 0 }} />
              <button type="button" className="btn btn-sm" aria-label="Quitar opción" onClick={() => setGs((x) => x.map((gg, j) => (j === i ? { ...gg, opciones: gg.opciones.filter((_, m) => m !== k) } : gg)))}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-sm" onClick={() => cambiarG(i, { opciones: [...g.opciones, { nombre: "", precio: "" }] })}>＋ Otra opción</button>
        </div>
      ))}
      <div className="row wrap-flex" style={{ marginTop: 8 }}>
        <button type="button" className="btn btn-sm" onClick={() => setGs((x) => [...x, PLANTILLAS.tamano])}>＋ Tamaños</button>
        <button type="button" className="btn btn-sm" onClick={() => setGs((x) => [...x, PLANTILLAS.sabor])}>＋ Sabores</button>
        <button type="button" className="btn btn-sm" onClick={() => setGs((x) => [...x, PLANTILLAS.extras])}>＋ Extras</button>
      </div>
    </div>
  );
}
