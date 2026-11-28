import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const EVENTOS = new Set(["landing_visita", "ver_demo", "demo_interaccion", "probar_click", "registro_inicio", "registro_enviado", "cookies_aceptar", "cookies_rechazar"]);
const corto = (x: unknown, n: number) => (typeof x === "string" && x.trim() ? x.trim().slice(0, n) : null);

// Embudo de la landing. Sin cookies ni datos personales: evento, página y UTM de la campaña.
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    if (!EVENTOS.has(b?.evento)) return NextResponse.json({ ok: false }, { status: 400 });
    const u = b?.utm && typeof b.utm === "object" ? b.utm : {};
    await supabaseAdmin().from("eventos_landing").insert({
      evento: b.evento, pagina: corto(b.pagina, 60), detalle: corto(b.detalle, 40),
      utm_source: corto(u.utm_source, 100), utm_medium: corto(u.utm_medium, 100),
      utm_campaign: corto(u.utm_campaign, 100), utm_content: corto(u.utm_content, 100),
    });
  } catch {}
  return NextResponse.json({ ok: true });
}
