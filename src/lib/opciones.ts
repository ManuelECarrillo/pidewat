// Tamaños, sabores y extras de un platillo (plan Esencial).
// Ej. "Tamaño" (elige uno, obligatorio): Chico +0, Grande +15 · "Extras" (varios, máx. 3): Queso +10, Tocino +15
// Se guarda en products.opciones (jsonb). Si está vacío, el platillo se pide como siempre.

export type Opcion = { nombre: string; precio: number };
export type GrupoOpciones = { nombre: string; tipo: "una" | "varias"; obligatorio: boolean; max: number; opciones: Opcion[] };
// Lo que eligió el cliente: por cada grupo, las posiciones de las opciones que tocó
export type Seleccion = number[][];

const MAX_GRUPOS = 6;
const MAX_OPCIONES = 12;

const texto = (x: unknown, max: number) => String(x ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const precio = (x: unknown) => {
  const n = Math.round((Number(x) || 0) * 100) / 100;
  return Math.min(9999, Math.max(0, n));
};

// Acepta lo que venga (del panel o de la base) y regresa siempre algo válido y acotado
export function limpiarOpciones(raw: unknown): GrupoOpciones[] {
  let v = raw;
  if (typeof v === "string") { try { v = JSON.parse(v); } catch { return []; } }
  if (!Array.isArray(v)) return [];
  const grupos: GrupoOpciones[] = [];
  for (const g of v.slice(0, MAX_GRUPOS)) {
    if (!g || typeof g !== "object") continue;
    const o = g as Record<string, unknown>;
    const nombre = texto(o.nombre, 40);
    const vistos = new Set<string>();
    const opciones = (Array.isArray(o.opciones) ? o.opciones : []).slice(0, MAX_OPCIONES * 2)
      .map((x) => ({ nombre: texto((x as Opcion)?.nombre, 40), precio: precio((x as Opcion)?.precio) }))
      .filter((x) => { const l = x.nombre.toLowerCase(); if (!x.nombre || vistos.has(l)) return false; vistos.add(l); return true; })
      .slice(0, MAX_OPCIONES);
    if (!nombre || !opciones.length) continue;
    const tipo = o.tipo === "varias" ? "varias" : "una";
    const max = tipo === "una" ? 1 : Math.min(opciones.length, Math.max(1, Math.floor(Number(o.max) || opciones.length)));
    grupos.push({ nombre, tipo, obligatorio: tipo === "una" ? o.obligatorio !== false : Boolean(o.obligatorio), max, opciones });
  }
  return grupos;
}

// "0.1,1.0,1.2" ⇄ [[1],[0,2]] — va dentro de la llave del carrito
export function codificar(sel: Seleccion) {
  return sel.flatMap((ops, g) => [...ops].sort((a, b) => a - b).map((o) => `${g}.${o}`)).join(",");
}
export function decodificar(s: string | undefined, grupos: GrupoOpciones[]): Seleccion {
  const sel: Seleccion = grupos.map(() => []);
  for (const par of (s || "").split(",")) {
    const [g, o] = par.split(".").map((x) => Number(x));
    if (Number.isInteger(g) && Number.isInteger(o) && sel[g] && grupos[g].opciones[o] && !sel[g].includes(o)) sel[g].push(o);
  }
  return sel;
}

// Regresa el primer problema ("Elige tu Tamaño") o null si está completa
export function faltaEnSeleccion(grupos: GrupoOpciones[], sel: Seleccion): string | null {
  for (let i = 0; i < grupos.length; i++) {
    const g = grupos[i];
    const n = sel[i]?.length || 0;
    if (g.obligatorio && n === 0) return `Elige ${g.nombre.toLowerCase()}`;
    if (n > g.max) return `Máximo ${g.max} en ${g.nombre.toLowerCase()}`;
  }
  return null;
}

export const extraDe = (grupos: GrupoOpciones[], sel: Seleccion) =>
  grupos.reduce((s, g, i) => s + (sel[i] || []).reduce((t, o) => t + (g.opciones[o]?.precio || 0), 0), 0);

// "Grande · Queso, Tocino"
export function textoSeleccion(grupos: GrupoOpciones[], sel: Seleccion) {
  return grupos.map((g, i) => (sel[i] || []).map((o) => g.opciones[o]?.nombre).filter(Boolean).join(", ")).filter(Boolean).join(" · ");
}
