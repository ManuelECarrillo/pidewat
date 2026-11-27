import { NextResponse } from "next/server";
import { estadoNegocio } from "@/lib/estado";
import { abiertoAhora, leerHorario } from "@/lib/horario";
import { calcularLineas, huellaIp, leerItems, UUID } from "@/lib/lineasServidor";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_POR_MINUTO = 20;
const MAX_POR_PERSONA = 4;
const txt = (x: unknown, max: number) => String(x ?? "").replace(/\s+/g, " ").trim().slice(0, max) || null;
const no = (motivo: string, status = 400) => NextResponse.json({ ok: false, motivo }, { status });

// Plan Restaurante: el cliente pide desde el QR de su mesa y el pedido cae en la pantalla de cocina.
// Si algo falla, el menú le ofrece mandarlo por WhatsApp como siempre.
export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return no("datos"); }
  if (!UUID.test(String(b.business_id))) return no("negocio");
  const sb = supabaseAdmin();
  const { data: n } = await sb.from("businesses").select("*").eq("id", b.business_id).maybeSingle();
  if (!n || !n.cocina || !n.accepts_table || !estadoNegocio(n).activo) return no("sin-cocina");
  const horario = leerHorario(n.horario);
  if (horario && !abiertoAhora(horario)) return no("cerrado");

  const mesa = txt(b.mesa, 6);
  const nombre = txt(b.nombre, 60);
  if (!mesa || !nombre) return no("faltan-datos");

  const haceUnMinuto = new Date(Date.now() - 60_000).toISOString();
  const { count } = await sb.from("orders").select("id", { count: "exact", head: true }).eq("business_id", n.id).gte("created_at", haceUnMinuto);
  if ((count ?? 0) >= MAX_POR_MINUTO) return no("muchos", 429);
  const ip_hash = huellaIp(req);
  if (ip_hash) {
    const { count: c } = await sb.from("orders").select("id", { count: "exact", head: true }).eq("ip_hash", ip_hash).gte("created_at", haceUnMinuto);
    if ((c ?? 0) >= MAX_POR_PERSONA) return no("muchos", 429);
  }

  const items = await calcularLineas(sb, n.id, leerItems(b.items));
  if (!items.length) return no("vacio");
  const total = items.reduce((s, l) => s + l.cantidad * l.precio, 0);

  // Número corto para gritarlo en la cocina: se reinicia cada día. México centro es UTC-6 todo el año desde 2022.
  const SEIS_H = 6 * 3_600_000;
  const inicioDia = new Date(Math.floor((Date.now() - SEIS_H) / 86_400_000) * 86_400_000 + SEIS_H);
  const { count: deHoy } = await sb.from("orders").select("id", { count: "exact", head: true }).eq("business_id", n.id).gte("created_at", inicioDia.toISOString());

  const { data: orden, error } = await sb.from("orders").insert({
    business_id: n.id, numero: (deHoy ?? 0) + 1, tipo: "mesa", mesa, nombre, notas: txt(b.notas, 200), items, total, ip_hash,
  }).select("id, numero").single();
  if (error || !orden) return no("guardar", 500);

  // También cuenta en las estadísticas del dueño, igual que un pedido por WhatsApp
  await sb.from("order_events").insert({ business_id: n.id, total, items: items.map(({ nombre, cantidad, precio, nota }) => ({ nombre, cantidad, precio, ...(nota ? { nota } : {}) })), order_type: "mesa", ...(ip_hash ? { ip_hash } : {}) });
  return NextResponse.json({ ok: true, id: orden.id, numero: orden.numero });
}
