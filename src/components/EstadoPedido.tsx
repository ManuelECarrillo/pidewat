"use client";

import { useEffect, useRef, useState } from "react";

const PASOS = [
  { clave: "nuevo", texto: "Recibido" },
  { clave: "preparando", texto: "Preparando" },
  { clave: "listo", texto: "Listo" },
];

const MENSAJE: Record<string, string> = {
  nuevo: "La cocina ya tiene tu pedido",
  preparando: "Lo están preparando",
  entregado: "Ya te entregaron el pedido. ¡Buen provecho!",
  cancelado: "El negocio canceló este pedido. Pregunta en el mostrador.",
};

type Conexion = "conectado" | "actualizando" | "sin-conexion";

function MarcaListo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m5 12 4.2 4.2L19.5 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Se actualiza solo cada 5 segundos mientras la pantalla esté a la vista.
export default function EstadoPedido({ id, numero, mesa, paraLlevar = false, estadoInicial }: { id: string; numero: number; mesa: string | null; paraLlevar?: boolean; estadoInicial: string }) {
  const [estado, setEstado] = useState(estadoInicial);
  const [conexion, setConexion] = useState<Conexion>("conectado");
  const [acabaDeQuedarListo, setAcabaDeQuedarListo] = useState(false);
  const estadoAnterior = useRef(estadoInicial);

  useEffect(() => {
    if (estado === "listo" && estadoAnterior.current !== "listo") {
      setAcabaDeQuedarListo(true);
      const quitarAviso = window.setTimeout(() => setAcabaDeQuedarListo(false), 4_000);
      estadoAnterior.current = estado;
      return () => window.clearTimeout(quitarAviso);
    }
    estadoAnterior.current = estado;
  }, [estado]);

  useEffect(() => {
    if (estado === "entregado" || estado === "cancelado") return;
    const t = setInterval(async () => {
      if (document.hidden) return;
      setConexion("actualizando");
      try {
        const r = await fetch(`/api/orden/${id}`, { cache: "no-store" });
        const d = await r.json();
        if (d.ok) {
          setEstado(d.estado);
          setConexion("conectado");
        } else {
          setConexion("sin-conexion");
        }
      } catch {
        setConexion("sin-conexion");
      }
    }, 5000);
    return () => clearInterval(t);
  }, [id, estado]);

  const pasoActual = PASOS.findIndex((p) => p.clave === estado);
  const esFinal = estado === "entregado" || estado === "cancelado";
  const mostrarPasos = estado !== "cancelado";
  const etiquetaConexion = conexion === "actualizando" ? "Actualizando…" : conexion === "sin-conexion" ? "Sin conexión" : "Al día";

  return (
    <section className={`card estado-pedido estado-${estado}`} aria-labelledby="pedido-titulo">
      <div className="estado-pedido-cabecera">
        <div>
          <p className="pedido-sobretitulo">{paraLlevar ? "Tu número de pedido" : "Muestra esto al mesero"}</p>
          <h1 id="pedido-titulo">Tu pedido</h1>
        </div>
        {!esFinal && <span className={`pedido-conexion ${conexion}`} aria-live="polite"><i aria-hidden="true" />{etiquetaConexion}</span>}
      </div>

      <div className="pedido-identidad" aria-label={`Pedido número ${numero}${paraLlevar ? ", para recoger" : mesa ? `, mesa ${mesa}` : ""}`}>
        <div className="pedido-numero">
          <span>Pedido</span>
          <strong>#{numero}</strong>
        </div>
        <div className="pedido-mesa">
          <span>{paraLlevar ? "Entrega" : "Mesa"}</span>
          <strong>{paraLlevar ? "Recoger" : mesa || "—"}</strong>
        </div>
      </div>

      {estado === "listo" && (
        <div className={`pedido-listo ${acabaDeQuedarListo ? "recien-listo" : ""}`} role="status" aria-live="assertive">
          <span className="pedido-listo-icono"><MarcaListo /></span>
          <div><strong>¡Tu pedido está listo!</strong><span>{paraLlevar ? `Pasa por él y di tu número: #${numero}.` : "Ya va camino a tu mesa."}</span></div>
        </div>
      )}

      {mostrarPasos && (
        <div className="progreso-pedido" aria-label="Avance del pedido">
          <ol className="pasos-pedido">
            {PASOS.map((p, i) => {
              const completo = estado === "entregado" || i < pasoActual;
              const actual = !esFinal && i === pasoActual;
              return (
                <li key={p.clave} className={`${completo ? "completo" : ""} ${actual ? "actual" : ""}`} aria-current={actual ? "step" : undefined}>
                  <span className="paso-marca">{completo ? <MarcaListo /> : i + 1}</span>
                  <span>{p.texto}</span>
                </li>
              );
            })}
          </ol>
          {!esFinal && estado !== "listo" && (
            <p className="pedido-mensaje" aria-live="polite">{MENSAJE[estado] || "Estamos consultando el estado de tu pedido."}</p>
          )}
        </div>
      )}

      {estado === "cancelado" && <p className="pedido-final cancelado" role="status">{MENSAJE.cancelado}</p>}
      {estado === "entregado" && <p className="pedido-final entregado" role="status">{MENSAJE.entregado}</p>}
      {conexion === "sin-conexion" && <p className="pedido-sin-conexion" role="status">No pudimos actualizar por ahora. Revisaremos de nuevo automáticamente.</p>}
    </section>
  );
}
