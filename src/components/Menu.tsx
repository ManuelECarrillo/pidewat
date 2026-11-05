"use client";

import { useEffect, useMemo, useState } from "react";
import type { Categoria, NegocioMenu, Producto } from "@/lib/tipos";
import { dinero } from "@/lib/formato";
import { abiertoAhora, proximaApertura } from "@/lib/horario";
import { linkWhatsapp, mensajePedido, totalPedido, type LineaPedido } from "@/lib/whatsapp";

// La llave de cada línea del carrito es el id del producto, o "id~ing1|ing2" si le quitaron ingredientes.
// Así "3 hot dogs normales" y "1 sin mayonesa" son líneas distintas con su propio contador.
type Carrito = Record<string, number>;
type Tipo = "mesa" | "recoger" | "domicilio";
type Eleccion = { p: Producto; sin: string[]; cantidad: number };

const claveLinea = (id: string, sin: string[]) => (sin.length ? `${id}~${[...sin].sort().join("|")}` : id);
const leerClave = (k: string) => { const [id, s] = k.split("~"); return { id, sin: s ? s.split("|") : [] }; };
const ingredientesDe = (p?: Producto) => (p?.ingredientes || []).filter(Boolean);
// "Sin mostaza, mayonesa ni cátsup", en el orden en que el negocio escribió los ingredientes
function textoSin(sin: string[], p?: Producto) {
  if (!sin.length) return "";
  const orden = ingredientesDe(p).map((x) => x.toLowerCase());
  const l = sin.map((x) => x.toLowerCase()).sort((a, b) => orden.indexOf(a) - orden.indexOf(b));
  return `Sin ${l.length === 1 ? l[0] : `${l.slice(0, -1).join(", ")} ni ${l[l.length - 1]}`}`;
}
// Para el que cocina: si el producto se puede personalizar, cada línea dice cómo va
const notaLinea = (sin: string[], p?: Producto) => (ingredientesDe(p).length ? textoSin(sin, p) || "Con todo" : "");

export default function Menu({
  negocio, categorias, productos, mesaInicial, link,
}: {
  negocio: NegocioMenu; categorias: Categoria[]; productos: Producto[]; mesaInicial?: string; link: string;
}) {
  const clave = `pidewat:${negocio.slug}`;
  const [carrito, setCarrito] = useState<Carrito>({});
  const [abierto, setAbierto] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [catActiva, setCatActiva] = useState<string | null>(null);
  const [eleccion, setEleccion] = useState<Eleccion | null>(null);
  // Fuera del horario se puede ver el menú, pero no mandar pedidos. Se calcula en el celular y se revisa cada minuto.
  const [cerrado, setCerrado] = useState<string | null>(null);
  useEffect(() => {
    const h = negocio.horario;
    if (!h) return;
    const revisar = () => setCerrado(abiertoAhora(h) ? null : proximaApertura(h) || "Por ahora no está recibiendo pedidos");
    revisar();
    const t = setInterval(revisar, 60_000);
    return () => clearInterval(t);
  }, [negocio.horario]);

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
  const entradas = Object.entries(carrito)
    .map(([k, n]) => ({ k, n, ...leerClave(k) }))
    .filter((e) => e.n > 0 && porId.get(e.id)?.available);
  const lineas: LineaPedido[] = entradas.map((e) => {
    const p = porId.get(e.id)!;
    return { nombre: p.name, cantidad: e.n, precio: Number(p.price), nota: notaLinea(e.sin, p) || undefined };
  });
  const enCarrito = (id: string) => entradas.reduce((s, e) => s + (e.id === id ? e.n : 0), 0);
  const piezas = lineas.reduce((s, l) => s + l.cantidad, 0);
  const envio = tipo === "domicilio" ? Number(negocio.delivery_fee) || 0 : 0;
  const total = totalPedido(lineas, envio);

  const cambiar = (k: string, d: number) =>
    setCarrito((c) => { const n = Math.max(0, (c[k] || 0) + d); const x = { ...c, [k]: n }; if (!n) delete x[k]; return x; });
  // Productos con ingredientes: el "+" abre una hojita para quitar lo que no quieren
  const agregar = (p: Producto) => (ingredientesDe(p).length ? setEleccion({ p, sin: [], cantidad: 1 }) : cambiar(p.id, 1));
  const confirmarEleccion = () => {
    if (!eleccion) return;
    cambiar(claveLinea(eleccion.p.id, eleccion.sin), eleccion.cantidad);
    setEleccion(null);
  };

  const q = buscar.trim().toLowerCase();
  const visibles = q ? productos.filter((p) => (p.name + " " + (p.description || "")).toLowerCase().includes(q)) : productos;
  const grupos = [
    ...categorias.map((c) => ({ id: c.id, nombre: c.name, items: visibles.filter((p) => p.category_id === c.id) })),
    { id: "otros", nombre: "Otros", items: visibles.filter((p) => !p.category_id || !categorias.some((c) => c.id === p.category_id)) },
  ].filter((g) => g.items.length);

  const falta = tipo === "domicilio" && !direccion.trim() ? "Escribe tu dirección" : !nombre.trim() ? "Escribe tu nombre" : null;

  function enviar() {
    if (negocio.horario && !abiertoAhora(negocio.horario)) { setCerrado(proximaApertura(negocio.horario) || "Por ahora no está recibiendo pedidos"); return; }
    const texto = mensajePedido({
      negocio: negocio.name, modo: negocio.mode, lineas, tipo, mesa, nombreCliente: nombre.trim(),
      direccion: direccion.trim(), notas: notas.trim(), envio, link,
    });
    if (negocio.id !== "demo") {
      const items = entradas.map((e) => ({ id: e.id, cantidad: e.n }));
      const cuerpo = JSON.stringify({ business_id: negocio.id, order_type: tipo, items });
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
        {cerrado && (
          <div className="cerrado-aviso" role="status">
            <strong>Cerrado en este momento.</strong> {cerrado}. Puedes ver el menú, pero los pedidos se reciben en horario.
          </div>
        )}
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
              const n = enCarrito(p.id);
              const conIngredientes = ingredientesDe(p).length > 0;
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
                      ) : cerrado ? null : conIngredientes ? (
                        <span className="row" style={{ gap: 8 }}>
                          {n > 0 && <span className="pill">{n} en tu pedido</span>}
                          <button className="mas" aria-label={`Agregar ${p.name}`} onClick={() => agregar(p)}>+</button>
                        </span>
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

      {piezas > 0 && !abierto && !cerrado && (
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

            {entradas.map(({ k, n, id, sin }) => {
              const p = porId.get(id)!;
              return (
                <div key={k} className="row between" style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                  <div className="grow">
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {notaLinea(sin, p) && <div className={`small ${sin.length ? "sin-txt" : "muted"}`}>{notaLinea(sin, p)}</div>}
                    <div className="small muted">{dinero(n * Number(p.price))}</div>
                  </div>
                  <span className="cant">
                    <button aria-label="Quitar uno" onClick={() => cambiar(k, -1)}>−</button>
                    <span>{n}</span>
                    <button aria-label="Agregar uno" onClick={() => cambiar(k, 1)}>+</button>
                  </span>
                </div>
              );
            })}
            {entradas.some((e) => ingredientesDe(porId.get(e.id)).length > 0) && (
              <p className="small muted" style={{ margin: "8px 0 0" }}>¿Uno diferente? Toca “Seguir viendo” y agrégalo otra vez con el +.</p>
            )}

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

            <div className="hoja-pie">
              {envio > 0 && <div className="row between small muted"><span>Envío</span><span>{dinero(envio)}</span></div>}
              <div className="row between" style={{ fontWeight: 800, fontSize: "1.15rem", margin: "2px 0 10px" }}>
                <span>Total</span><span>{dinero(total)}</span>
              </div>
              <button className="btn btn-wa btn-block" style={{ fontSize: "1.05rem", padding: 14 }} disabled={!lineas.length || Boolean(falta) || Boolean(cerrado)} onClick={enviar}>
                {cerrado ? "Cerrado ahorita" : falta || "Enviar pedido por WhatsApp"}
              </button>
              <p className="small muted" style={{ textAlign: "center", margin: "8px 0 0" }}>
                Se abre WhatsApp con tu pedido ya escrito. Solo dale enviar.
              </p>
            </div>
          </div>
        </>
      )}

      {eleccion && (() => {
        const ingr = ingredientesDe(eleccion.p);
        const quitar = (x: string) => setEleccion((e) => e && ({ ...e, sin: e.sin.includes(x) ? e.sin.filter((y) => y !== x) : [...e.sin, x] }));
        const cant = (d: number) => setEleccion((e) => e && ({ ...e, cantidad: Math.min(50, Math.max(1, e.cantidad + d)) }));
        return (
          <>
            <div className="velo" onClick={() => setEleccion(null)} />
            <div className="hoja" role="dialog" aria-label={`Arma tu ${eleccion.p.name}`}>
              <div className="row between" style={{ marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{eleccion.p.name}</h2>
                <button className="btn btn-sm" onClick={() => setEleccion(null)}>Cancelar</button>
              </div>
              <p className="small muted" style={{ marginTop: 4 }}>Toca lo que <b>no</b> quieres. Si lo quieres con todo, déjalo así.</p>
              <div className="ingr">
                {ingr.map((x) => {
                  const fuera = eleccion.sin.includes(x);
                  return (
                    <button key={x} type="button" className={fuera ? "fuera" : ""} aria-pressed={!fuera} onClick={() => quitar(x)}>
                      {fuera ? `Sin ${x.toLowerCase()}` : `✓ ${x}`}
                    </button>
                  );
                })}
              </div>
              <div className="row between" style={{ marginTop: 18 }}>
                <span style={{ fontWeight: 600 }}>¿Cuántos así?</span>
                <span className="cant">
                  <button aria-label="Uno menos" onClick={() => cant(-1)}>−</button>
                  <span>{eleccion.cantidad}</span>
                  <button aria-label="Uno más" onClick={() => cant(1)}>+</button>
                </span>
              </div>
              <div className="hoja-pie">
                <button className="btn btn-p btn-block" style={{ fontSize: "1.05rem", padding: 14 }} onClick={confirmarEleccion}>
                  Agregar {eleccion.cantidad} · {dinero(eleccion.cantidad * Number(eleccion.p.price))}
                </button>
                <p className="small muted" style={{ textAlign: "center", margin: "8px 0 0" }}>
                  ¿Unos con todo y otros sin algo? Agrega estos y vuelve a tocar + para armar los otros.
                </p>
              </div>
            </div>
          </>
        );
      })()}
    </>
  );
}
