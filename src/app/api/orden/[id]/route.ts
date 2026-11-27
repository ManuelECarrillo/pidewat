import { NextResponse } from "next/server";
import { UUID } from "@/lib/lineasServidor";
import { supabaseAdmin } from "@/lib/supabase/admin";

// El cliente consulta cómo va su pedido. El id es largo y al azar: solo lo tiene quien lo pidió.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ ok: false }, { status: 404 });
  const { data } = await supabaseAdmin().from("orders").select("numero, estado, updated_at").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, ...data }, { headers: { "Cache-Control": "no-store" } });
}
