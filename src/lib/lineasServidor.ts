import "server-only";
import { createHmac } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { codificar, decodificar, extraDe, faltaEnSeleccion, limpiarOpciones, textoSeleccion } from "./opciones";

// SEG-010: la IP se guarda revuelta (HMAC con una llave del servidor), nunca tal cual:
// sirve para contar pedidos por persona sin guardar un dato personal.
export function huellaIp(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
  if (!ip) return null;
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "pidewat").update(ip).digest("hex").slice(0, 32);
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ItemPedido = { id: string; cantidad: number; o: string; sin: string[] };
export type LineaServidor = { producto_id: string; nombre: string; cantidad: number; precio: number; nota: string };

// Lo que manda el navegador, acotado: máx. 60 líneas, 99 piezas por línea
export function leerItems(raw: unknown): ItemPedido[] {
  const r: ItemPedido[] = [];
  for (const l of Array.isArray(raw) ? raw.slice(0, 60) : []) {
    const id = String(l?.id ?? "");
    const cantidad = Math.min(99, Math.max(0, Math.floor(Number(l?.cantidad) || 0)));
    const o = String(l?.o ?? "").slice(0, 200);
    const sin = (Array.isArray(l?.sin) ? l.sin : []).slice(0, 12).map((x: unknown) => String(x).slice(0, 30));
    if (UUID.test(id) && cantidad > 0) r.push({ id, cantidad, o, sin });
  }
  return r;
}

// No confiamos en el navegador: nombre, precio, extras y "sin…" se recalculan con lo que hay en la base.
// Una línea con opciones que ya no existen o incompletas se descarta.
export async function calcularLineas(sb: SupabaseClient, businessId: string, items: ItemPedido[]): Promise<LineaServidor[]> {
  if (!items.length) return [];
  const ids = [...new Set(items.map((i) => i.id))];
  const { data } = await sb.from("products").select("*").eq("business_id", businessId).in("id", ids);
  const porId = new Map((data || []).map((p) => [p.id as string, p]));
  const lineas: LineaServidor[] = [];
  for (const it of items) {
    const p = porId.get(it.id);
    if (!p || p.available === false) continue;
    const grupos = limpiarOpciones(p.opciones);
    const sel = decodificar(it.o, grupos);
    if (faltaEnSeleccion(grupos, sel) || codificar(sel) !== it.o) continue;
    const ingr: string[] = (p.ingredientes || []).filter(Boolean);
    const sin = ingr.filter((x) => it.sin.some((y) => y.toLowerCase() === x.toLowerCase()));
    const nota = [textoSeleccion(grupos, sel), sin.length ? `Sin ${sin.map((x) => x.toLowerCase()).join(", ")}` : ""].filter(Boolean).join(" · ");
    lineas.push({ producto_id: p.id, nombre: p.name, cantidad: it.cantidad, precio: Number(p.price) + extraDe(grupos, sel), nota });
  }
  return lineas;
}
