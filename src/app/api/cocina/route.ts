import { NextResponse } from "next/server";
import { UUID } from "@/lib/lineasServidor";
import { supabaseServidor } from "@/lib/supabase/servidor";

const ESTADOS = new Set(["nuevo", "preparando", "listo", "entregado", "cancelado"]);

async function negocioDelDueno() {
  const sb = await supabaseServidor();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { sb, negocio: null };
  const { data: negocio } = await sb.from("businesses").select("id, cocina").eq("owner_id", u.user.id).order("created_at").limit(1).maybeSingle();
  return { sb, negocio };
}

// La pantalla de cocina pregunta cada pocos segundos. Usa la sesión del dueño: RLS solo deja ver sus órdenes.
export async function GET() {
  const { sb, negocio } = await negocioDelDueno();
  if (!negocio?.cocina) return NextResponse.json({ ok: false }, { status: 403 });
  const desde = new Date(Date.now() - 16 * 3_600_000).toISOString();
  const { data } = await sb.from("orders").select("id, numero, tipo, mesa, nombre, notas, items, total, estado, created_at, updated_at")
    .eq("business_id", negocio.id).gte("created_at", desde).order("created_at", { ascending: true }).limit(200);
  return NextResponse.json({ ok: true, ordenes: data || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const { sb, negocio } = await negocioDelDueno();
  if (!negocio?.cocina) return NextResponse.json({ ok: false }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!UUID.test(String(b.id)) || !ESTADOS.has(String(b.estado))) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await sb.from("orders").update({ estado: b.estado, updated_at: new Date().toISOString() }).eq("id", b.id).eq("business_id", negocio.id);
  return NextResponse.json({ ok: !error });
}
