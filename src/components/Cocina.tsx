"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dinero } from "@/lib/formato";

type Linea = { nombre: string; cantidad: number; precio: number; nota?: string };
type Orden = { id: string; numero: number; tipo?: string | null; mesa: string | null; nombre: string | null; notas: string | null; items: Linea[]; total: number; estado: string; created_at: string };
type Vista = "cocina" | "listos" | "todos";

const SIGUIENTE: Record<string, { estado: string; texto: string } | undefined> = {
  nuevo: { estado: "preparando", texto: "Empezar a preparar" },
  preparando: { estado: "listo", texto: "Ya está listo" },
  listo: { estado: "entregado", texto: "Entregado" },
};
const ETIQUETA: Record<string, string> = { nuevo: "Nuevo", preparando: "Preparando", listo: "Listo", entregado: "Entregado", cancelado: "Cancelado" };

function pitido() {
  try {
    const ctx = new AudioContext();
    [0, 0.25].forEach((t) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.25, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.2);
    });
  } catch {}
}

// Pantalla para la cocina o el mesero: pregunta cada 4 segundos si hay pedidos nuevos y suena cuando llegan.
export default function Cocina() {
  const [ordenes, setOrdenes] = useState<Orden[] | null>(null);
  const [vista, setVista] = useState<Vista>("cocina");
  const [sonido, setSonido] = useState(false);
  const [sinRed, setSinRed] = useState(false);
  const [seguro, setSeguro] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState<Set<string>>(() => new Set());
  const [fallos, setFallos] = useState<Record<string, { mensaje: string; estado: string }>>({});
  const [, setReloj] = useState(0);
  const vistos = useRef<Set<string> | null>(null);
  const sonidoRef = useRef(false);
  const moviendo = useRef(new Set<string>());
  sonidoRef.current = sonido;

  const cargar = useCallback(async () => {
    try {
      const r = await fetch("/api/cocina", { cache: "no-store" });
      const d = await r.json();
      if (!d.ok) throw new Error();
      const lista = d.ordenes as Orden[];
      const nuevos = lista.filter((o) => o.estado === "nuevo" && vistos.current && !vistos.current.has(o.id));
      if (nuevos.length && sonidoRef.current) pitido();
      vistos.current = new Set(lista.map((o) => o.id));
      setOrdenes(lista);
      setSinRed(false);
    } catch { setSinRed(true); }
  }, []);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 4000);
    const r = setInterval(() => setReloj((x) => x + 1), 30_000);
    return () => { clearInterval(t); clearInterval(r); };
  }, [cargar]);

  async function mover(id: string, estado: string) {
    if (moviendo.current.has(id)) return;
    const anterior = ordenes?.find((o) => o.id === id)?.estado;
    if (!anterior) return;
    moviendo.current.add(id);
    setSeguro(null);
    setActualizando((ids) => new Set(ids).add(id));
    setFallos((x) => { const { [id]: _, ...resto } = x; return resto; });
    setOrdenes((l) => l && l.map((o) => (o.id === id ? { ...o, estado } : o)));
    try {
      const r = await fetch("/api/cocina", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, estado }) });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d?.ok) throw new Error();
      setSinRed(false);
      cargar();
    } catch {
      setOrdenes((l) => l && l.map((o) => (o.id === id && o.estado === estado ? { ...o, estado: anterior } : o)));
      setFallos((x) => ({ ...x, [id]: { mensaje: "No se pudo guardar el cambio. Revisa la conexión y vuelve a intentarlo.", estado } }));
    } finally {
      moviendo.current.delete(id);
      setActualizando((ids) => { const siguiente = new Set(ids); siguiente.delete(id); return siguiente; });
    }
  }

  const lista = (ordenes || []).filter((o) =>
    vista === "cocina" ? o.estado === "nuevo" || o.estado === "preparando" : vista === "listos" ? o.estado === "listo" : true);
  const cuenta = (e: string[]) => (ordenes || []).filter((o) => e.includes(o.estado)).length;
  const minutos = (f: string) => Math.max(0, Math.round((Date.now() - new Date(f).getTime()) / 60_000));

  return (
    <div>
      <div className="row between wrap-flex" style={{ marginBottom: 10 }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Cocina</h1>
        <button className={`btn btn-sm ${sonido ? "" : "btn-p"}`} onClick={() => { setSonido((s) => !s); if (!sonido) pitido(); }}>
          {sonido ? "🔔 Sonido prendido" : "🔕 Prender sonido"}
        </button>
      </div>
      {!sonido && (
        <button className="alerta" style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 10, cursor: "pointer", font: "inherit" }} onClick={() => { setSonido(true); pitido(); }}>
          🔕 <strong>El sonido está apagado.</strong> Toca aquí para oír cuando llegue un pedido. (El navegador no deja prenderlo solo.)
        </button>
      )}
      {sinRed && <div className="alerta" style={{ marginBottom: 10 }}>Sin conexión. Reintentando…</div>}
      <div className="seg cocina-filtros">
        <button className={vista === "cocina" ? "on" : ""} onClick={() => setVista("cocina")}>Por preparar ({cuenta(["nuevo", "preparando"])})</button>
        <button className={vista === "listos" ? "on" : ""} onClick={() => setVista("listos")}>Listos ({cuenta(["listo"])})</button>
        <button className={vista === "todos" ? "on" : ""} onClick={() => setVista("todos")}>Hoy ({(ordenes || []).length})</button>
      </div>
      {ordenes === null && <p className="muted">Cargando…</p>}
      {ordenes && !lista.length && <p className="muted" style={{ padding: "24px 0" }}>{vista === "cocina" ? "No hay pedidos por preparar. Aquí aparecen en cuanto un cliente pida desde el QR." : "Nada por aquí."}</p>}
      <div className="cocina">
        {lista.map((o) => {
          const sig = SIGUIENTE[o.estado];
          const actualizandoOrden = actualizando.has(o.id);
          return (
            <article key={o.id} className={`card orden ${o.estado}`}>
              <div className="row between">
                <h3>#{o.numero} · {o.tipo === "recoger" ? "Para llevar" : `Mesa ${o.mesa || "?"}`}</h3>
                <span className="pill">{ETIQUETA[o.estado]}</span>
              </div>
              <div className="small muted" style={{ marginBottom: 6 }}>{o.nombre} · hace {minutos(o.created_at)} min</div>
              {o.items.map((l, i) => (
                <div key={i} className="lin">
                  <b>{l.cantidad} × {l.nombre}</b>
                  {l.nota && <div className="small">{l.nota}</div>}
                </div>
              ))}
              {o.notas && <div className="small" style={{ marginTop: 6 }}>📝 {o.notas}</div>}
              <div className="small muted" style={{ marginTop: 6 }}>Total {dinero(Number(o.total))}</div>
              {fallos[o.id] && (
                <div className="alerta alerta-bad small" role="status" style={{ marginTop: 10 }}>
                  {fallos[o.id].mensaje} <button className="btn" disabled={actualizandoOrden} onClick={() => mover(o.id, fallos[o.id].estado)}>Reintentar</button>
                </div>
              )}
              <div className="row" style={{ marginTop: 10 }}>
                {sig && <button className="btn btn-p grow" disabled={actualizandoOrden} onClick={() => mover(o.id, sig.estado)}>{actualizandoOrden ? "Guardando…" : sig.texto}</button>}
                {(o.estado === "nuevo" || o.estado === "preparando") && (
                  seguro === o.id
                    ? <button className="btn btn-bad" disabled={actualizandoOrden} onClick={() => mover(o.id, "cancelado")}>{actualizandoOrden ? "Guardando…" : "¿Seguro? Cancelar"}</button>
                    : <button className="btn" disabled={actualizandoOrden} onClick={() => setSeguro(o.id)}>Cancelar</button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
