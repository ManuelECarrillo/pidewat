import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Registra que un cliente mandó un pedido (para las estadísticas del dueño). Nunca bloquea el pedido.
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const uuid = /^[0-9a-f-]{36}$/i;
    if (!uuid.test(String(b.business_id))) return NextResponse.json({ ok: false }, { status: 400 });
    const items = Array.isArray(b.items)
      ? b.items.slice(0, 60).map((l: { nombre?: unknown; cantidad?: unknown; precio?: unknown }) => ({
          nombre: String(l.nombre ?? "").slice(0, 120),
          cantidad: Math.min(999, Math.max(0, Number(l.cantidad) || 0)),
          precio: Math.max(0, Number(l.precio) || 0),
        }))
      : [];
    const total = Math.min(1_000_000, Math.max(0, Number(b.total) || 0));
    const order_type = ["mesa", "recoger", "domicilio"].includes(b.order_type) ? b.order_type : null;
    await supabaseAdmin().from("order_events").insert({ business_id: b.business_id, total, items, order_type });
  } catch {}
  return NextResponse.json({ ok: true });
}
