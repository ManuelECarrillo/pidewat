"use client";

import { useState } from "react";
import { extraDe, faltaEnSeleccion, limpiarOpciones, textoSeleccion, type GrupoOpciones, type Seleccion } from "@/lib/opciones";
import { mensajePedido, totalPedido, type LineaPedido } from "@/lib/whatsapp";
import { dinero } from "@/lib/formato";
import { medir } from "@/lib/medicion";
import { textoWhatsapp } from "./formatoWa";
import s from "./Landing.module.css";

// Demo 100 % en el navegador con un negocio ficticio. No usa red, ni Supabase, ni abre WhatsApp:
// al final muestra en pantalla el mismo mensaje que arma Pidewat para un negocio real (mensajePedido).

type ProductoDemo = { id: string; cat: string; nombre: string; desc: string; precio: number; tono: string; quitar: string[]; grupos: GrupoOpciones[] };

const TAMANO_HAMBURGUESA = { nombre: "Tamaño", tipo: "una", obligatorio: true, opciones: [{ nombre: "Sencilla", precio: 0 }, { nombre: "Doble", precio: 35 }] };
const EXTRAS_HAMBURGUESA = { nombre: "Extras", tipo: "varias", max: 3, opciones: [{ nombre: "Queso", precio: 10 }, { nombre: "Tocino", precio: 15 }, { nombre: "Jalapeños", precio: 5 }] };

// limpiarOpciones valida todo igual que con un negocio real
const PRODUCTOS: ProductoDemo[] = [
  { id: "clasica", cat: "Hamburguesas", nombre: "Hamburguesa clásica", desc: "Carne a la plancha, lechuga, jitomate y cebolla.", precio: 95, tono: "#e4572e", quitar: ["Cebolla", "Jitomate", "Mostaza"], grupos: limpiarOpciones([TAMANO_HAMBURGUESA, EXTRAS_HAMBURGUESA]) },
  { id: "bbq", cat: "Hamburguesas", nombre: "Hamburguesa BBQ", desc: "Salsa BBQ y aros de cebolla.", precio: 115, tono: "#b45309", quitar: ["Aros de cebolla"], grupos: limpiarOpciones([TAMANO_HAMBURGUESA, EXTRAS_HAMBURGUESA]) },
  { id: "hotdog", cat: "Hot dogs", nombre: "Hot dog jumbo", desc: "Salchicha jumbo con todo.", precio: 45, tono: "#c2410c", quitar: ["Mayonesa", "Cátsup", "Mostaza"], grupos: limpiarOpciones([{ nombre: "Extras", tipo: "varias", max: 2, opciones: [{ nombre: "Tocino", precio: 12 }, { nombre: "Queso", precio: 8 }] }]) },
  { id: "papas", cat: "Papas", nombre: "Papas a la francesa", desc: "Recién hechas.", precio: 40, tono: "#ca8a04", quitar: [], grupos: limpiarOpciones([{ nombre: "Tamaño", tipo: "una", opciones: [{ nombre: "Chicas", precio: 0 }, { nombre: "Grandes", precio: 20 }] }]) },
  { id: "refresco", cat: "Bebidas", nombre: "Refresco 600 ml", desc: "Bien frío.", precio: 25, tono: "#0f766e", quitar: [], grupos: limpiarOpciones([{ nombre: "Sabor", tipo: "una", opciones: [{ nombre: "Cola", precio: 0 }, { nombre: "Naranja", precio: 0 }, { nombre: "Manzana", precio: 0 }] }]) },
];
const CATEGORIAS = ["Todo", ...Array.from(new Set(PRODUCTOS.map((p) => p.cat)))];

type Linea = { clave: string; p: ProductoDemo; sel: Seleccion; sin: string[]; n: number };
type Vista = "menu" | "ficha" | "carrito" | "whatsapp";
type Ficha = { p: ProductoDemo; sel: Seleccion; sin: string[]; n: number };

const nuevaFicha = (p: ProductoDemo): Ficha => ({ p, sel: p.grupos.map(() => []), sin: [], n: 1 });
const claveDe = (f: { p: ProductoDemo; sel: Seleccion; sin: string[] }) =>
  `${f.p.id}|${f.sel.map((g) => [...g].sort().join(".")).join("/")}|${[...f.sin].sort().join(",")}`;
const unitario = (f: { p: ProductoDemo; sel: Seleccion }) => f.p.precio + extraDe(f.p.grupos, f.sel);
const notaDe = (f: { p: ProductoDemo; sel: Seleccion; sin: string[] }) => {
  const sin = f.sin.length ? `Sin ${f.sin.map((x) => x.toLowerCase()).join(", ")}` : "";
  return [textoSeleccion(f.p.grupos, f.sel), sin].filter(Boolean).join(" · ");
};

export const PASOS_DEMO = ["Abre el menú", "Elige una hamburguesa", "Agrega tamaño y extras", "Elige la cantidad", "Toca «Pedir»", "Te llega ordenado a WhatsApp"];

export default function Demo({ onPaso }: { onPaso?: (paso: number) => void }) {
  const [vista, setVista] = useState<Vista>("menu");
  const [cat, setCat] = useState("Todo");
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [error, setError] = useState("");
  const [carrito, setCarrito] = useState<Linea[]>([]);
  const [tipo, setTipo] = useState<"mesa" | "recoger">("recoger");
  const [nombre, setNombre] = useState("");

  // Cuenta la primera vez que alguien toca la demo (una vez por visita)
  const tocar = () => medir("demo_interaccion", { unaVez: true });

  const visibles = cat === "Todo" ? PRODUCTOS : PRODUCTOS.filter((p) => p.cat === cat);
  const lineas: LineaPedido[] = carrito.map((l) => ({ nombre: l.p.nombre, cantidad: l.n, precio: unitario(l), nota: notaDe(l) || undefined }));
  const total = totalPedido(lineas);
  const piezas = carrito.reduce((a, l) => a + l.n, 0);

  const mensaje = mensajePedido({
    negocio: "Burger Norte", modo: "menu", lineas, tipo, mesa: tipo === "mesa" ? "4" : undefined,
    nombreCliente: nombre.trim() || undefined, link: "pidewat.vercel.app/demo",
  });

  const ir = (v: Vista, paso: number) => { setVista(v); onPaso?.(paso); };

  function abrir(p: ProductoDemo) {
    tocar(); setError(""); setFicha(nuevaFicha(p)); ir("ficha", 2);
  }

  function elegir(g: number, o: number) {
    if (!ficha) return;
    tocar(); setError("");
    const grupo = ficha.p.grupos[g];
    const actual = ficha.sel[g] || [];
    let siguiente: number[];
    if (grupo.tipo === "una") siguiente = [o];
    else if (actual.includes(o)) siguiente = actual.filter((x) => x !== o);
    else if (actual.length >= grupo.max) { setError(`Máximo ${grupo.max} en ${grupo.nombre.toLowerCase()}`); return; }
    else siguiente = [...actual, o];
    setFicha({ ...ficha, sel: ficha.sel.map((x, i) => (i === g ? siguiente : x)) });
  }

  function quitar(x: string) {
    if (!ficha) return;
    tocar();
    setFicha({ ...ficha, sin: ficha.sin.includes(x) ? ficha.sin.filter((y) => y !== x) : [...ficha.sin, x] });
  }

  function agregar() {
    if (!ficha) return;
    const falta = faltaEnSeleccion(ficha.p.grupos, ficha.sel);
    if (falta) { setError(falta); return; }
    const clave = claveDe(ficha);
    setCarrito((c) => c.some((l) => l.clave === clave)
      ? c.map((l) => (l.clave === clave ? { ...l, n: Math.min(20, l.n + ficha.n) } : l))
      : [...c, { clave, p: ficha.p, sel: ficha.sel, sin: ficha.sin, n: ficha.n }]);
    setFicha(null);
    ir("menu", 4);
  }

  function cambiar(clave: string, d: number) {
    tocar();
    setCarrito((c) => c.map((l) => (l.clave === clave ? { ...l, n: l.n + d } : l)).filter((l) => l.n > 0));
  }

  function reiniciar() {
    setCarrito([]); setFicha(null); setNombre(""); setTipo("recoger"); setError(""); setCat("Todo"); ir("menu", 0);
  }

  return (
    <div className={s.demo}>
      {vista === "menu" && (
        <div className={s.dPantalla}>
          <div className={s.appPortada}>
            <div className={s.appLogo} aria-hidden="true">BN</div>
            <div>
              <div className={s.appNegocio}>Burger Norte</div>
              <div className={s.appSub}>Negocio de demostración</div>
            </div>
          </div>
          <div className={s.dCats} role="group" aria-label="Categorías">
            {CATEGORIAS.map((c) => (
              <button key={c} type="button" className={c === cat ? s.dCatActiva : s.dCat} aria-pressed={c === cat} onClick={() => { tocar(); setCat(c); }}>
                {c}
              </button>
            ))}
          </div>
          <ul className={s.dLista}>
            {visibles.map((p) => (
              <li key={p.id}>
                <button type="button" className={s.dPlato} onClick={() => abrir(p)}>
                  <span className={s.appFoto} style={{ background: `radial-gradient(circle at 35% 35%, #fde68a, ${p.tono})` }} aria-hidden="true" />
                  <span className={s.appPlatoTexto}>
                    <strong>{p.nombre}</strong>
                    <small>{p.desc}</small>
                    <b>{dinero(p.precio)}</b>
                  </span>
                  <span className={s.appMas} aria-hidden="true">+</span>
                </button>
              </li>
            ))}
          </ul>
          {piezas > 0 && (
            <button type="button" className={s.dBarra} onClick={() => ir("carrito", 4)}>
              <span>{piezas} {piezas === 1 ? "producto" : "productos"} · {dinero(total)}</span>
              <span className={s.appBarraBoton}>Ver pedido</span>
            </button>
          )}
        </div>
      )}

      {vista === "ficha" && ficha && (
        <div className={s.dPantalla}>
          <button type="button" className={s.dVolver} onClick={() => { setFicha(null); ir("menu", 1); }}>← Menú</button>
          <div className={s.dFichaFoto} style={{ background: `radial-gradient(circle at 35% 35%, #fde68a, ${ficha.p.tono})` }} aria-hidden="true" />
          <h4 className={s.dFichaNombre}>{ficha.p.nombre}</h4>
          <p className={s.dFichaDesc}>{ficha.p.desc}</p>

          {ficha.p.grupos.map((g, gi) => (
            <fieldset key={g.nombre} className={s.dGrupo}>
              <legend>
                {g.nombre}
                <small>{g.tipo === "una" ? (g.obligatorio ? "Elige uno" : "Opcional") : `Hasta ${g.max}`}</small>
              </legend>
              <div className={s.dChips}>
                {g.opciones.map((o, oi) => {
                  const activo = (ficha.sel[gi] || []).includes(oi);
                  return (
                    <button key={o.nombre} type="button" className={activo ? s.dChipActivo : s.dChip} aria-pressed={activo} onClick={() => { elegir(gi, oi); if (gi > 0 || g.tipo === "varias") onPaso?.(2); }}>
                      {o.nombre}{o.precio > 0 && <span> +{dinero(o.precio)}</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {ficha.p.quitar.length > 0 && (
            <fieldset className={s.dGrupo}>
              <legend>Quitar <small>Toca lo que no quieras</small></legend>
              <div className={s.dChips}>
                {ficha.p.quitar.map((x) => {
                  const fuera = ficha.sin.includes(x);
                  return (
                    <button key={x} type="button" className={fuera ? s.dChipFuera : s.dChip} aria-pressed={fuera} onClick={() => quitar(x)}>
                      {fuera ? `Sin ${x.toLowerCase()}` : x}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className={s.dCantidad}>
            <span>Cantidad</span>
            <div className={s.dStepper}>
              <button type="button" aria-label="Una menos" disabled={ficha.n <= 1} onClick={() => { tocar(); setFicha({ ...ficha, n: Math.max(1, ficha.n - 1) }); onPaso?.(3); }}>−</button>
              <output aria-live="polite">{ficha.n}</output>
              <button type="button" aria-label="Una más" disabled={ficha.n >= 20} onClick={() => { tocar(); setFicha({ ...ficha, n: Math.min(20, ficha.n + 1) }); onPaso?.(3); }}>+</button>
            </div>
          </div>

          {error && <p className={s.dError} role="alert">{error}</p>}
          <button type="button" className={s.dPrincipal} onClick={agregar}>
            Agregar · {dinero(unitario(ficha) * ficha.n)}
          </button>
        </div>
      )}

      {vista === "carrito" && (
        <div className={s.dPantalla}>
          <button type="button" className={s.dVolver} onClick={() => ir("menu", 1)}>← Seguir pidiendo</button>
          <h4 className={s.dFichaNombre}>Tu pedido</h4>
          <ul className={s.dCarrito}>
            {carrito.map((l) => (
              <li key={l.clave}>
                <div>
                  <strong>{l.p.nombre}</strong>
                  {notaDe(l) && <small>{notaDe(l)}</small>}
                  <b>{dinero(unitario(l) * l.n)}</b>
                </div>
                <div className={s.dStepper}>
                  <button type="button" aria-label={`Quitar uno de ${l.p.nombre}`} onClick={() => cambiar(l.clave, -1)}>−</button>
                  <output>{l.n}</output>
                  <button type="button" aria-label={`Agregar uno de ${l.p.nombre}`} disabled={l.n >= 20} onClick={() => cambiar(l.clave, 1)}>+</button>
                </div>
              </li>
            ))}
          </ul>
          <fieldset className={s.dGrupo}>
            <legend>¿Cómo lo quieres?</legend>
            <div className={s.dChips}>
              <button type="button" className={tipo === "recoger" ? s.dChipActivo : s.dChip} aria-pressed={tipo === "recoger"} onClick={() => { tocar(); setTipo("recoger"); }}>Paso a recoger</button>
              <button type="button" className={tipo === "mesa" ? s.dChipActivo : s.dChip} aria-pressed={tipo === "mesa"} onClick={() => { tocar(); setTipo("mesa"); }}>Para comer aquí · mesa 4</button>
            </div>
          </fieldset>
          <label className={s.dCampo}>
            Tu nombre <small>(opcional)</small>
            <input value={nombre} maxLength={30} onChange={(e) => { tocar(); setNombre(e.target.value); }} placeholder="Ej. Mariana" autoComplete="off" />
          </label>
          <div className={s.dTotal}><span>Total</span><strong>{dinero(total)}</strong></div>
          <button type="button" className={s.dWhatsapp} disabled={!carrito.length} onClick={() => ir("whatsapp", 5)}>
            Pedir por WhatsApp
          </button>
        </div>
      )}

      {vista === "whatsapp" && (
        <div className={`${s.dPantalla} ${s.dWa}`}>
          <div className={s.dWaCabeza}>
            <span className={s.chatAvatar} aria-hidden="true">BN</span>
            <span><strong>Burger Norte</strong><small>WhatsApp del negocio (simulado)</small></span>
          </div>
          <div className={s.dWaFondo}>
            <div className={s.burbuja}>
              <div className={s.burbujaTexto}>{textoWhatsapp(mensaje)}</div>
              <div className={s.burbujaHora}>ahora <span aria-hidden="true">✓✓</span></div>
            </div>
          </div>
          <p className={s.dNotaWa}>Así le llega el pedido al negocio. En esta demo no se envía nada.</p>
          <button type="button" className={s.dPrincipal} onClick={reiniciar}>Volver a probar</button>
        </div>
      )}
    </div>
  );
}
