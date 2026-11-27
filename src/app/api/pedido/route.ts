import { NextResponse } from "next/server";
import { estadoNegocio } from "@/lib/estado";
import { abiertoAhora, leerHorario } from "@/lib/horario";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { calcularLineas, huellaIp, leerItems } from "@/lib/lineasServidor";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_POR_MINUTO = 20;
const MAX_POR_PERSONA = 5;

// Registra que un cliente mandó un pedido (para las estadísticas del dueño). Nunca bloquea el pedido.
// No confiamos en lo que manda el navegador: los nombres, precios y el total salen de la base.
export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!UUID.test(String(b.business_id))) return NextResponse.json({ ok: false }, { status: 400 });
    const sb = supabaseAdmin();

    const { data: n } = await sb.from("businesses").select("*").eq("id", b.business_id).maybeSingle();
    if (!n || !estadoNegocio(n).activo) return NextResponse.json({ ok: true });
    const horario = leerHorario(n.horario);
    if (horario && !abiertoAhora(horario)) return NextResponse.json({ ok: true }); // fuera de horario no cuenta

    // Límite por negocio: más de 20 pedidos en un minuto no es un restaurante, es alguien inflando las estadísticas
    const haceUnMinuto = new Date(Date.now() - 60_000).toISOString();
    const { count } = await sb.from("order_events").select("id", { count: "exact", head: true }).eq("business_id", n.id).gte("created_at", haceUnMinuto);
    if ((count ?? 0) >= MAX_POR_MINUTO) return NextResponse.json({ ok: true });

    // SEG-010: y por persona, para que una sola no se acabe el cupo del negocio ni infle sus números.
    // Si todavía no se corre la migración del 2026-10-30 (columna ip_hash), la consulta falla y no se aplica.
    const ip_hash = huellaIp(req);
    if (ip_hash) {
      const { count: deEsaPersona, error } = await sb.from("order_events").select("id", { count: "exact", head: true }).eq("ip_hash", ip_hash).gte("created_at", haceUnMinuto);
      if (!error && (deEsaPersona ?? 0) >= MAX_POR_PERSONA) return NextResponse.json({ ok: true });
    }

    const pedidos = leerItems(b.items);
    if (!pedidos.length) return NextResponse.json({ ok: true });
    const items = (await calcularLineas(sb, n.id, pedidos)).map(({ nombre, cantidad, precio, nota }) => ({ nombre, cantidad, precio, ...(nota ? { nota } : {}) }));
    if (!items.length) return NextResponse.json({ ok: true });

    // QA-001: solo las formas de pedir que el negocio tiene prendidas (si no da envío, no se suma envío)
    const permitidos = { mesa: n.accepts_table, recoger: n.accepts_pickup, domicilio: n.accepts_delivery } as Record<string, boolean>;
    const order_type = permitidos[String(b.order_type)] ? String(b.order_type) : null;
    const envio = order_type === "domicilio" ? Number(n.delivery_fee) || 0 : 0;
    const total = items.reduce((s, l) => s + l.cantidad * l.precio, 0) + envio;
    const fila: Record<string, unknown> = { business_id: n.id, total, items, order_type };
    const { error } = await sb.from("order_events").insert(ip_hash ? { ...fila, ip_hash } : fila);
    if (error?.code === "PGRST204" || error?.code === "42703") await sb.from("order_events").insert(fila); // aún sin la columna ip_hash
  } catch {}
  return NextResponse.json({ ok: true });
}
