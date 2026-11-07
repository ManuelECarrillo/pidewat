import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Cuenta visitas y toques de la página corta de anuncios. Sin datos personales.
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const tipo = b?.tipo === "toque" ? "toque" : b?.tipo === "visita" ? "visita" : null;
    if (!tipo) return NextResponse.json({ ok: false }, { status: 400 });
    const utm = typeof b?.utm === "string" ? b.utm.slice(0, 80) : null;
    await supabaseAdmin().from("eventos_anuncio").insert({ tipo, pagina: "prueba", utm });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
