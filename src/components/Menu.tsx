"use client";

import { useEffect, useMemo, useState } from "react";
import type { Categoria, Negocio, Producto } from "@/lib/tipos";
import { dinero } from "@/lib/formato";
import { linkWhatsapp, mensajePedido, totalPedido, type LineaPedido } from "@/lib/whatsapp";

type Carrito = Record<string, number>;
type Tipo = "mesa" | "recoger" | "domicilio";

export default function Menu({
  negocio, categorias, productos, mesaInicial, link,
}: {
  negocio: Negocio; categorias: Categoria[]; productos: Producto[]; mesaInicial?: string; link: string;
}) {
  const clave = `pidewat:${negocio.slug}`;
  const [carrito, setCarrito] = useState<Carrito>({});
  const [abierto, setAbierto] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [catActiva, setCatActiva] = useState<string | null>(null);

  const tipos: Tipo[] = [
    ...(negocio.accepts_table ? (["mesa"] as Tipo[]) : []),
    ...(negocio.accepts_pickup ? (["recoger"] as Tipo[]) : []),
    ...(negocio.accepts_delivery ? (["domicilio"] as Tipo[]) : []),
  ];
  const [tipo, setTipo] = useState<Tipo>(mesaInicial && negocio.accepts_table ? "mesa" : tipos[0] || "recoger");
  const [mesa, setMesa] = useState(mesaInicial || "");
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");

  // El carrito y los datos del cliente se recuerdan en este celular
  useEffect(() => {
    try {
      const g = JSON.parse(localStorage.getItem(clave) || "{}");
      if (g.carrito) setCarrito(g.carrito);
      if (g.nombre) setNombre(g.nombre);
      if (g.direccion) setDireccion(g.direccion);
    } catch {}
  }, [clave]);
  useEffect(() => {
    try { localStorage.setItem(clave, JSON.stringify({ carrito, nombre, direccion })); } catch {}
  }, [clave, carrito, nombre, direccion]);

  const porId = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);
  const lineas: LineaPedido[] = Object.entries(carrito)
    .filter(([id, n]) => n > 0 && porId.get(id)?.available)
    .map(([id, n]) => { const p = porId.get(id)!; return { nombre: p.name, cantidad: n, precio: Number(p.price) }; });
  const piezas = lineas.reduce((s, l) => s + l.cantidad, 0);
  const envio = tipo === "domicilio" ? Number(negocio.delivery_fee) || 0 : 0;
  const total = totalPedido(lineas, envio);

  const cambiar = (id: string, d: number) =>
    setCarrito((c) => { const n = Math.max(0, (c[id] || 0) + d); const x = { ...c, [id]: n }; if (!n) delete x[id]; return x; });

  const q = buscar.trim().toLowerCase();
  const visibles = q ? productos.filter((p) => (p.name + " " + (p.description || "")).toLowerCase().includes(q)) : productos;
  const grupos = [
    ...categorias.map((c) => ({ id: c.id, nombre: c.name, items: visibles.filter((p) => p.category_id === c.id) })),
    { id: "otros", nombre: "Otros", items: visibles.filter((p) => !p.category_id || !categorias.some((c) => c.id === p.category_id)) },
  ].filter((g) => g.items.length);

  const falta = tipo === "domicilio" && !direccion.trim() ? "Escribe tu dirección" : !nombre.trim() ? "Escribe tu nombre" : null;

  function enviar() {
    const texto = mensajePedido({
      negocio: negocio.name, modo: negocio.mode, lineas, tipo, mesa, nombreCliente: nombre.trim(),
      direccion: direccion.trim(), notas: notas.trim(), envio, link,
    });
    if (negocio.id !== "demo") {
      const cuerpo = JSON.stringify({ business_id: negocio.id, total, order_type: tipo, items: lineas });
      try { navigator.sendBeacon("/api/pedido", new Blob([cuerpo], { type: "application/json" })); } catch {}
    }
    setCarrito({});
    setAbierto(false);
    window.location.href = linkWhatsapp(negocio.whatsapp, texto);
  }

  const etiquetaTipo = { mesa: "Comer aquí", recoger: "Recoger", domicilio: "A domicilio" };

  return (
    <>
      <div className="wrap" style={{ paddingBottom: 8 }}>
        {productos.length > 8 && (
          <input className="i" type="search" placeholder={negocio.mode === "menu" ? "Buscar platillo…" : "Buscar producto…"}
            value={buscar} onChange={(e) => setBuscar(e.target.value)} style={{ marginTop: 14 }} />
        )}
        {!q && grupos.length > 1 && (
          <nav className="tabs" style={{ marginTop: 10 }}>
            {grupos.map((g) => (
              <a key={g.id} href={`#c-${g.id}`} className={`tab ${catActiva === g.id ? "on" : ""}`} onClick={() => setCatActiva(g.id)}>
                {g.nombre}
              </a>
            ))}
          </nav>
        )}

        {grupos.map((g) => (
          <section key={g.id} id={`c-${g.id}`} style={{ scrollMarginTop: 60, paddingTop: 18 }}>
            <h2 style={{ fontSize: "1.15rem" }}>{g.nombre}</h2>
            {g.items.map((p) => {
              const n = carrito[p.id] || 0;
              return (
                <div key={p.id} className={`prod ${p.available ? "" : "agotado"}`}>
                  {p.image_url && <div className="prod-img" style={{ backgroundImage: `url(${p.image_url})` }} role="img" aria-label={p.name} />}
                  <div className="grow">
                    <h3>{p.name}</h3>
                    {p.description && <p>{p.description}</p>}
                    <div className="row between">
                      <span className="precio">{dinero(Number(p.price))}</span>
                      {!p.available ? (
                        <span className="pill">Agotado</span>
                      ) : n === 0 ? (
                        <button className="mas" aria-label={`Agregar ${p.name}`} onClick={() => cambiar(p.id, 1)}>+</button>
                      ) : (
                        <span className="cant">
                          <button aria-label="Quitar uno" onClick={() => cambiar(p.id, -1)}>−</button>
                          <span>{n}</span>
                          <button aria-label="Agregar uno" onClick={() => cambiar(p.id, 1)}>+</button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        ))}
        {!grupos.length && <p className="muted" style={{ padding: "24px 0" }}>{q ? "No encontramos nada con esa palabra." : "Pronto verás aquí el menú."}</p>}
      </div>

      {piezas > 0 && !abierto && (
        <div className="barra">
          <button className="btn btn-p" onClick={() => setAbierto(true)}>
            <span>Ver pedido · {piezas} {piezas === 1 ? "artículo" : "artículos"}</span>
            <span>{dinero(total)}</span>
          </button>
        </div>
      )}

      {abierto && (
        <>
          <div className="velo" onClick={() => setAbierto(false)} />
          <div className="hoja" role="dialog" aria-label="Tu pedido">
            <div className="row between" style={{ marginBottom: 8 }}>
              <h2 style={{ margin: 0 }}>Tu pedido</h2>
              <button className="btn btn-sm" onClick={() => setAbierto(false)}>Seguir viendo</button>
            </div>

            {Object.entries(carrito).filter(([id]) => porId.get(id)?.available).map(([id, n]) => {
              const p = porId.get(id)!;
              return (
                <div key={id} className="row between" style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                  <div className="grow">
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="small muted">{dinero(n * Number(p.price))}</div>
                  </div>
                  <span className="cant">
                    <button aria-label="Quitar uno" onClick={() => cambiar(id, -1)}>−</button>
                    <span>{n}</span>
                    <button aria-label="Agregar uno" onClick={() => cambiar(id, 1)}>+</button>
                  </span>
                </div>
              );
            })}

            <div style={{ marginTop: 16 }}>
              {tipos.length > 1 && (
                <div className="seg">
                  {tipos.map((t) => (
                    <button key={t} className={tipo === t ? "on" : ""} onClick={() => setTipo(t)}>{etiquetaTipo[t]}</button>
                  ))}
                </div>
              )}
              {tipo === "mesa" && (
                <label className="f">Número de mesa <span className="h">Opcional</span>
                  <input className="i" inputMode="numeric" value={mesa} onChange={(e) => setMesa(e.target.value)} />
                </label>
              )}
              <label className="f">Tu nombre
                <input className="i" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </label>
              {tipo === "domicilio" && (
                <label className="f">Dirección de entrega
                  {negocio.delivery_note && <span className="h">{negocio.delivery_note}</span>}
                  <textarea className="i" autoComplete="street-address" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, colonia y una referencia" />
                </label>
              )}
              <label className="f">Notas <span className="h">Ej. sin cebolla, con salsa aparte</span>
                <input className="i" value={notas} onChange={(e) => setNotas(e.target.value)} />
              </label>
            </div>

            {envio > 0 && <div className="row between small muted"><span>Envío</span><span>{dinero(envio)}</span></div>}
            <div className="row between" style={{ fontWeight: 800, fontSize: "1.15rem", margin: "6px 0 14px" }}>
              <span>Total</span><span>{dinero(total)}</span>
            </div>

            <button className="btn btn-wa btn-block" style={{ fontSize: "1.05rem", padding: 14 }} disabled={!lineas.length || Boolean(falta)} onClick={enviar}>
              {falta || "Enviar pedido por WhatsApp"}
            </button>
            <p className="small muted" style={{ textAlign: "center", marginTop: 10 }}>
              Se abre WhatsApp con tu pedido ya escrito. Solo dale enviar.
            </p>
          </div>
        </>
      )}
    </>
  );
}
