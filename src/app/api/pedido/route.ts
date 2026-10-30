import { NextResponse } from "next/server";
import { estadoNegocio } from "@/lib/estado";
import { supabaseAdmin } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_POR_MINUTO = 20;

// Registra que un cliente mandó un pedido (para las estadísticas del dueño). Nunca bloquea el pedido.
// No confiamos en lo que manda el navegador: los nombres, precios y el total salen de la base.
export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!UUID.test(String(b.business_id))) return NextResponse.json({ ok: false }, { status: 400 });
    const sb = supabaseAdmin();

    const { data: n } = await sb.from("businesses").select("id, delivery_fee, trial_ends_at, paid_until, paused").eq("id", b.business_id).maybeSingle();
    if (!n || !estadoNegocio(n).activo) return NextResponse.json({ ok: true });

    // Límite por negocio: más de 20 pedidos en un minuto no es un restaurante, es alguien inflando las estadísticas
    const haceUnMinuto = new Date(Date.now() - 60_000).toISOString();
    const { count } = await sb.from("order_events").select("id", { count: "exact", head: true }).eq("business_id", n.id).gte("created_at", haceUnMinuto);
    if ((count ?? 0) >= MAX_POR_MINUTO) return NextResponse.json({ ok: true });

    const pedidos = new Map<string, number>();
    for (const l of Array.isArray(b.items) ? b.items.slice(0, 60) : []) {
      const id = String(l?.id ?? "");
      const cantidad = Math.min(99, Math.max(0, Math.floor(Number(l?.cantidad) || 0)));
      if (UUID.test(id) && cantidad > 0) pedidos.set(id, (pedidos.get(id) || 0) + cantidad);
    }
    if (!pedidos.size) return NextResponse.json({ ok: true });

    const { data: productos } = await sb.from("products").select("id, name, price").eq("business_id", n.id).in("id", [...pedidos.keys()]);
    const items = (productos || []).map((p) => ({ nombre: p.name, cantidad: pedidos.get(p.id)!, precio: Number(p.price) }));
    if (!items.length) return NextResponse.json({ ok: true });

    const order_type = ["mesa", "recoger", "domicilio"].includes(b.order_type) ? b.order_type : null;
    const envio = order_type === "domicilio" ? Number(n.delivery_fee) || 0 : 0;
    const total = items.reduce((s, l) => s + l.cantidad * l.precio, 0) + envio;
    await sb.from("order_events").insert({ business_id: n.id, total, items, order_type });
  } catch {}
  return NextResponse.json({ ok: true });
}
