"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Categoria, NegocioMenu, Producto } from "@/lib/tipos";
import { dinero } from "@/lib/formato";
import { abiertoAhora, proximaApertura } from "@/lib/horario";
import { linkWhatsapp, mensajePedido, totalPedido, type LineaPedido } from "@/lib/whatsapp";
import { codificar, decodificar, extraDe, faltaEnSeleccion, limpiarOpciones, textoSeleccion, type GrupoOpciones, type Seleccion } from "@/lib/opciones";

// La llave de cada línea del carrito es el id del producto, o "id~ing1|ing2" si le quitaron ingredientes,
// o "id~ing1|ing2~0.1,1.0" si además eligió tamaño o extras (ver lib/opciones).
// Así "3 hot dogs normales" y "1 sin mayonesa" son líneas distintas con su propio contador.
type Carrito = Record<string, number>;
type Tipo = "mesa" | "recoger" | "domicilio";
type Eleccion = { p: Producto; sin: string[]; sel: Seleccion; cantidad: number };

const claveLinea = (id: string, sin: string[], sel = "") =>
  sel ? `${id}~${[...sin].sort().join("|")}~${sel}` : sin.length ? `${id}~${[...sin].sort().join("|")}` : id;
const leerClave = (k: string) => { const [id, s, o] = k.split("~"); return { id, sin: s ? s.split("|") : [], o: o || "" }; };
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
  const [pendienteBorrado, setPendienteBorrado] = useState<string | null>(null);
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
  const gruposDe = useMemo(() => {
    const m = new Map<string, GrupoOpciones[]>();
    for (const p of productos) m.set(p.id, limpiarOpciones(p.opciones));
    return (p?: Producto) => (p ? m.get(p.id) || [] : []);
  }, [productos]);
  const personalizable = (p: Producto) => ingredientesDe(p).length > 0 || gruposDe(p).length > 0;
  // Si el negocio cambió las opciones de un platillo, la línea vieja que ya no cuadra se descarta sola
  const entradas = Object.entries(carrito)
    .map(([k, n]) => {
      const c = leerClave(k);
      const p = porId.get(c.id);
      const grupos = gruposDe(p);
      const sel = decodificar(c.o, grupos);
      return { k, n, ...c, p, sel, valida: Boolean(p?.available) && !faltaEnSeleccion(grupos, sel) && codificar(sel) === c.o };
    })
    .filter((e) => e.n > 0 && e.valida);
  const unitario = (e: (typeof entradas)[number]) => Number(e.p!.price) + extraDe(gruposDe(e.p), e.sel);
  const notaDe = (e: (typeof entradas)[number]) => [textoSeleccion(gruposDe(e.p), e.sel), notaLinea(e.sin, e.p)].filter(Boolean).join(" · ");
  const lineas: LineaPedido[] = entradas.map((e) => ({ nombre: e.p!.name, cantidad: e.n, precio: unitario(e), nota: notaDe(e) || undefined }));
  const enCarrito = (id: string) => entradas.reduce((s, e) => s + (e.id === id ? e.n : 0), 0);
  const piezas = lineas.reduce((s, l) => s + l.cantidad, 0);
  const envio = tipo === "domicilio" ? Number(negocio.delivery_fee) || 0 : 0;
  const total = totalPedido(lineas, envio);

  const cambiar = (k: string, d: number) =>
    setCarrito((c) => { const n = Math.max(0, (c[k] || 0) + d); const x = { ...c, [k]: n }; if (!n) delete x[k]; return x; });
  const quitarUno = (k: string) => {
    if ((carrito[k] || 0) <= 1) setPendienteBorrado(k);
    else cambiar(k, -1);
  };
  // Productos con ingredientes: el "+" abre una hojita para quitar lo que no quieren
  // Si un grupo de "elige uno" es obligatorio, arranca con la primera opción ya marcada
  const agregar = (p: Producto) => (personalizable(p)
    ? setEleccion({ p, sin: [], sel: gruposDe(p).map((g) => (g.tipo === "una" && g.obligatorio ? [0] : [])), cantidad: 1 })
    : cambiar(p.id, 1));
  const confirmarEleccion = () => {
    if (!eleccion || faltaEnSeleccion(gruposDe(eleccion.p), eleccion.sel)) return;
    cambiar(claveLinea(eleccion.p.id, eleccion.sin, codificar(eleccion.sel)), eleccion.cantidad);
    setEleccion(null);
  };

  const q = buscar.trim().toLowerCase();
  const visibles = q ? productos.filter((p) => (p.name + " " + (p.description || "")).toLowerCase().includes(q)) : productos;
  const grupos = [
    ...categorias.map((c) => ({ id: c.id, nombre: c.name, items: visibles.filter((p) => p.category_id === c.id) })),
    { id: "otros", nombre: "Otros", items: visibles.filter((p) => !p.category_id || !categorias.some((c) => c.id === p.category_id)) },
  ].filter((g) => g.items.length);

  // Plan Restaurante: los pedidos para comer aquí (con mesa) y para recoger van directo a la pantalla de cocina.
  // A domicilio sigue por WhatsApp, porque hay que acordar la dirección y el envío.
  const aCocina = Boolean(negocio.cocina) && (tipo === "mesa" || tipo === "recoger") && negocio.id !== "demo";
  const [enviando, setEnviando] = useState(false);
  const [errorCocina, setErrorCocina] = useState(false);
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const errorDireccion = tipo === "domicilio" && !direccion.trim();
  const errorMesa = aCocina && tipo === "mesa" && !mesa.trim();
  const errorNombre = !nombre.trim();
  const falta = errorDireccion ? "Escribe tu dirección"
    : errorMesa ? "Escribe tu número de mesa"
    : errorNombre ? "Escribe tu nombre" : null;

  const itemsServidor = () => entradas.map((e) => ({ id: e.id, cantidad: e.n, ...(e.o ? { o: e.o } : {}), ...(e.sin.length ? { sin: e.sin } : {}) }));

  // Una clave por pedido: si se corta la conexión y el cliente vuelve a tocar, no se crea otro pedido.
  // Cambia solo cuando cambia el carrito.
  const claveEnvio = useRef<{ carrito: string; clave: string } | null>(null);
  function clavePedido() {
    const firma = JSON.stringify(carrito);
    if (claveEnvio.current?.carrito !== firma) claveEnvio.current = { carrito: firma, clave: crypto.randomUUID() };
    return claveEnvio.current.clave;
  }

  async function enviarACocina() {
    if (enviando) return;
    setEnviando(true);
    setErrorCocina(false);
    const corte = new AbortController();
    const espera = setTimeout(() => corte.abort(), 12_000);
    try {
      const r = await fetch("/api/orden", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: corte.signal,
        body: JSON.stringify({ business_id: negocio.id, clave: clavePedido(), tipo, mesa: tipo === "mesa" ? mesa.trim() : "", nombre: nombre.trim(), notas: notas.trim(), items: itemsServidor() }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.motivo);
      setCarrito({});
      window.location.href = `/${negocio.slug}/pedido/${d.id}`;
    } catch {
      setErrorCocina(true);
      setEnviando(false);
    } finally {
      clearTimeout(espera);
    }
  }

  function enviar(porWhatsapp = false) {
    if (falta) { setMostrarErrores(true); return; }
    if (negocio.horario && !abiertoAhora(negocio.horario)) { setCerrado(proximaApertura(negocio.horario) || "Por ahora no está recibiendo pedidos"); return; }
    if (aCocina && !porWhatsapp) { enviarACocina(); return; }
    const texto = mensajePedido({
      negocio: negocio.name, modo: negocio.mode, lineas, tipo, mesa, nombreCliente: nombre.trim(),
      direccion: direccion.trim(), notas: notas.trim(), envio, link,
    });
    if (negocio.id !== "demo") {
      const items = itemsServidor();
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
          <section key={g.id} id={`c-${g.id}`} className="grupo-menu" style={{ scrollMarginTop: 60, paddingTop: 18 }}>
            <h2 style={{ fontSize: "1.15rem" }}>{g.nombre}</h2>
            <div className="lista-productos">
            {g.items.map((p) => {
              const n = enCarrito(p.id);
              const conIngredientes = personalizable(p);
              const inicialPlatillo = p.name.trim().charAt(0).toUpperCase() || "•";
              return (
                <article key={p.id} className={`prod ${p.available ? "" : "agotado"}`}>
                  <div
                    className={`prod-img ${p.image_url ? "prod-img-foto" : "prod-img-sello"}`}
                    style={p.image_url ? { backgroundImage: `url(${p.image_url})` } : undefined}
                    role="img"
                    aria-label={p.image_url ? p.name : `Identificador de ${p.name}`}
                  >
                    {!p.image_url && <>
                      <span aria-hidden="true">{inicialPlatillo}</span>
                    </>}
                  </div>
                  <div className="grow prod-contenido">
                    <h3>{p.name}</h3>
                    {p.description && <p>{p.description}</p>}
                    <div className="prod-pie">
                      <span className="precio">{dinero(Number(p.price))}</span>
                      {!p.available ? (
                        <span className="pill pill-bad">Agotado</span>
                      ) : cerrado ? (
                        <span className="pill pill-warn">Pedidos cerrados</span>
                      ) : conIngredientes ? (
                        <span className="prod-accion">
                          {n > 0 && <span className="pill">{n} en tu pedido</span>}
                          <button className="prod-agregar" aria-label={`Personalizar y agregar ${p.name}`} onClick={() => agregar(p)}>
                            <span aria-hidden="true">+</span> Agregar
                          </button>
                        </span>
                      ) : n === 0 ? (
                        <button className="prod-agregar" aria-label={`Agregar ${p.name}`} onClick={() => cambiar(p.id, 1)}>
                          <span aria-hidden="true">+</span> Agregar
                        </button>
                      ) : (
                        <span className="cant">
                          <button aria-label="Quitar uno" onClick={() => quitarUno(p.id)}>−</button>
                          <span>{n}</span>
                          <button aria-label="Agregar uno" onClick={() => cambiar(p.id, 1)}>+</button>
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
            </div>
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

            {entradas.map((e) => {
              const { k, n, sin, p } = e;
              const nota = notaDe(e);
              return (
                <div key={k} className="row between" style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                  <div className="grow">
                    <div style={{ fontWeight: 600 }}>{p!.name}</div>
                    {nota && <div className={`small ${sin.length ? "sin-txt" : "muted"}`}>{nota}</div>}
                    <div className="small muted">{dinero(n * unitario(e))}</div>
                  </div>
                  <span className="cant">
                    <button aria-label="Quitar uno" onClick={() => quitarUno(k)}>−</button>
                    <span>{n}</span>
                    <button aria-label="Agregar uno" onClick={() => cambiar(k, 1)}>+</button>
                  </span>
                </div>
              );
            })}
            {entradas.some((e) => personalizable(e.p!)) && (
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
                <label className="f">Número de mesa {!aCocina && <span className="h">Opcional</span>}
                  <input className="i" inputMode="numeric" value={mesa} onChange={(e) => setMesa(e.target.value)} aria-invalid={mostrarErrores && errorMesa} aria-describedby={mostrarErrores && errorMesa ? "error-mesa" : undefined} />
                  {mostrarErrores && errorMesa && <span className="error-campo" id="error-mesa" role="alert">Escribe tu número de mesa para enviarlo a la cocina.</span>}
                </label>
              )}
              <label className="f">Tu nombre
                <input className="i" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} aria-invalid={mostrarErrores && errorNombre} aria-describedby={mostrarErrores && errorNombre ? "error-nombre" : undefined} />
                {mostrarErrores && errorNombre && <span className="error-campo" id="error-nombre" role="alert">Escribe tu nombre para continuar.</span>}
              </label>
              {tipo === "domicilio" && (
                <label className="f">Dirección de entrega
                  {negocio.delivery_note && <span className="h">{negocio.delivery_note}</span>}
                  <textarea className="i" autoComplete="street-address" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, colonia y una referencia" aria-invalid={mostrarErrores && errorDireccion} aria-describedby={mostrarErrores && errorDireccion ? "error-direccion" : undefined} />
                  {mostrarErrores && errorDireccion && <span className="error-campo" id="error-direccion" role="alert">Escribe la dirección de entrega.</span>}
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
              {aCocina ? (
                <>
                  <button className="btn btn-p btn-block" style={{ fontSize: "1.05rem", padding: 14 }} disabled={!lineas.length || Boolean(cerrado) || enviando} onClick={() => enviar()}>
                    {cerrado ? "Cerrado ahorita" : enviando ? "Enviando…" : "Enviar pedido a la cocina"}
                  </button>
                  {errorCocina ? (
                    <div className="alerta" style={{ marginTop: 8 }}>
                      No se pudo mandar a la cocina. Revisa tu señal y vuelve a tocar el botón (no se duplica), o{" "}
                      <button className="btn btn-sm btn-wa" onClick={() => enviar(true)}>mándalo por WhatsApp</button>
                    </div>
                  ) : (
                    <p className="small muted" style={{ textAlign: "center", margin: "8px 0 0" }}>
                      Tu pedido llega directo a la cocina y aquí ves cuando está listo. Pagas en el local.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <button className="btn btn-wa btn-block" style={{ fontSize: "1.05rem", padding: 14 }} disabled={!lineas.length || Boolean(cerrado)} onClick={() => enviar()}>
                    {cerrado ? "Cerrado ahorita" : "Enviar pedido por WhatsApp"}
                  </button>
                  <p className="small muted" style={{ textAlign: "center", margin: "8px 0 0" }}>
                    Se abre WhatsApp con tu pedido ya escrito. Solo dale enviar.
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {eleccion && (() => {
        const ingr = ingredientesDe(eleccion.p);
        const grupos = gruposDe(eleccion.p);
        const falta = faltaEnSeleccion(grupos, eleccion.sel);
        const precioUno = Number(eleccion.p.price) + extraDe(grupos, eleccion.sel);
        const quitar = (x: string) => setEleccion((e) => e && ({ ...e, sin: e.sin.includes(x) ? e.sin.filter((y) => y !== x) : [...e.sin, x] }));
        const cant = (d: number) => setEleccion((e) => e && ({ ...e, cantidad: Math.min(50, Math.max(1, e.cantidad + d)) }));
        // "Elige uno": tocar otra cambia la elegida. "Varias": se prenden y apagan hasta el máximo.
        const tocar = (gi: number, oi: number) => setEleccion((e) => {
          if (!e) return e;
          const g = grupos[gi];
          const ya = e.sel[gi] || [];
          let nuevo: number[];
          if (g.tipo === "una") nuevo = ya.includes(oi) && !g.obligatorio ? [] : [oi];
          else if (ya.includes(oi)) nuevo = ya.filter((x) => x !== oi);
          else if (ya.length >= g.max) return e;
          else nuevo = [...ya, oi];
          return { ...e, sel: e.sel.map((s, i) => (i === gi ? nuevo : s)) };
        });
        return (
          <>
            <div className="velo" onClick={() => setEleccion(null)} />
            <div className="hoja" role="dialog" aria-label={`Arma tu ${eleccion.p.name}`}>
              <div className="row between" style={{ marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{eleccion.p.name}</h2>
                <button className="btn btn-sm" onClick={() => setEleccion(null)}>Cancelar</button>
              </div>
              {grupos.map((g, gi) => (
                <div key={gi} className="grupo-op">
                  <div className="row between">
                    <h3>{g.nombre}</h3>
                    <span className="small muted">
                      {g.tipo === "una" ? (g.obligatorio ? "Elige uno" : "Opcional, elige uno") : `${g.obligatorio ? "Elige" : "Opcional, hasta"} ${g.max}`}
                    </span>
                  </div>
                  {g.opciones.map((o, oi) => {
                    const on = (eleccion.sel[gi] || []).includes(oi);
                    const lleno = g.tipo === "varias" && !on && (eleccion.sel[gi] || []).length >= g.max;
                    return (
                      <button key={oi} type="button" className={`op ${on ? "on" : ""}`} aria-pressed={on} disabled={lleno} onClick={() => tocar(gi, oi)}>
                        <span className={`marca-op ${g.tipo === "una" ? "redonda" : ""}`} aria-hidden>{on ? "✓" : ""}</span>
                        <span className="grow">{o.nombre}</span>
                        {o.precio > 0 && <span className="muted">+{dinero(o.precio)}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
              {ingr.length > 0 && (
                <>
                  <p className="small muted" style={{ marginTop: grupos.length ? 16 : 4 }}>Toca lo que <b>no</b> quieres. Si lo quieres con todo, déjalo así.</p>
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
                </>
              )}
              <div className="row between" style={{ marginTop: 18 }}>
                <span style={{ fontWeight: 600 }}>¿Cuántos así?</span>
                <span className="cant">
                  <button aria-label="Uno menos" onClick={() => cant(-1)}>−</button>
                  <span>{eleccion.cantidad}</span>
                  <button aria-label="Uno más" onClick={() => cant(1)}>+</button>
                </span>
              </div>
              <div className="hoja-pie">
                <button className="btn btn-p btn-block" style={{ fontSize: "1.05rem", padding: 14 }} disabled={Boolean(falta)} onClick={confirmarEleccion}>
                  {falta || `Agregar ${eleccion.cantidad} · ${dinero(eleccion.cantidad * precioUno)}`}
                </button>
                <p className="small muted" style={{ textAlign: "center", margin: "8px 0 0" }}>
                  ¿Uno diferente? Agrega este y vuelve a tocar + para armar el otro.
                </p>
              </div>
            </div>
          </>
        );
      })()}

      {pendienteBorrado && (() => {
        const linea = entradas.find((e) => e.k === pendienteBorrado);
        if (!linea) return null;
        return (
          <>
            <div className="velo" onClick={() => setPendienteBorrado(null)} />
            <div className="dialogo" role="dialog" aria-modal="true" aria-labelledby="quitar-titulo">
              <h2 id="quitar-titulo" style={{ fontSize: "1.15rem" }}>¿Quitar {linea.p!.name}?</h2>
              <p className="muted">Es el último de este platillo en tu pedido.</p>
              <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button className="btn" autoFocus onClick={() => setPendienteBorrado(null)}>Conservar</button>
                <button className="btn btn-bad" onClick={() => { cambiar(pendienteBorrado, -1); setPendienteBorrado(null); }}>Sí, quitar</button>
              </div>
            </div>
          </>
        );
      })()}
    </>
  );
}
