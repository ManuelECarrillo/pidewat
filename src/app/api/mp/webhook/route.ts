import { NextResponse } from "next/server";
import { extenderPago } from "@/lib/estado";
import {
  firmaValida, leerReferencia, obtenerPago, obtenerPagoAutorizado, obtenerPreapproval,
} from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Plan } from "@/lib/planes";

// Mercado Pago avisa aquí de cada suscripción y cobro. Nunca confiamos en lo que llega:
// volvemos a pedir el dato a la API de Mercado Pago con nuestra llave.
export async function POST(req: Request) {
  const url = new URL(req.url);
  let cuerpo: { type?: string; topic?: string; data?: { id?: string | number } } = {};
  try { cuerpo = await req.json(); } catch {}
  const tipo = cuerpo.type || cuerpo.topic || url.searchParams.get("type") || url.searchParams.get("topic") || "";
  const id = String(cuerpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (!id) return NextResponse.json({ ok: true });
  if (!firmaValida(req, id)) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    if (tipo === "subscription_preapproval") await suscripcion(id);
    else if (tipo === "subscription_authorized_payment") await cobroMensual(id);
    else if (tipo === "payment") await pagoUnico(id);
  } catch (e) {
    console.error("webhook MP", tipo, id, e);
    return NextResponse.json({ ok: false }, { status: 500 }); // Mercado Pago reintenta
  }
  return NextResponse.json({ ok: true });
}

async function suscripcion(id: string) {
  const s = await obtenerPreapproval(id);
  const ref = leerReferencia(s.external_reference);
  if (!ref) return;
  const sb = supabaseAdmin();
  if (s.status === "authorized") await sb.from("businesses").update({ mp_preapproval_id: s.id, plan: ref.plan }).eq("id", ref.id);
  if (s.status === "cancelled") await sb.from("businesses").update({ mp_preapproval_id: null }).eq("id", ref.id).eq("mp_preapproval_id", s.id);
}

async function cobroMensual(id: string) {
  const c = await obtenerPagoAutorizado(id);
  if (c.payment?.status !== "approved") return;
  const s = await obtenerPreapproval(c.preapproval_id);
  const ref = leerReferencia(s.external_reference);
  if (!ref) return;
  await abonar(ref.id, ref.plan, Number(c.transaction_amount), 1, `ap_${c.id}`);
}

async function pagoUnico(id: string) {
  const p = await obtenerPago(id);
  const ref = leerReferencia(p.external_reference);
  // Solo los pagos anuales: los cobros de la suscripción ya llegan como subscription_authorized_payment
  if (p.status !== "approved" || !ref || ref.ciclo !== "anual") return;
  await abonar(ref.id, ref.plan, Number(p.transaction_amount), 12, `p_${p.id}`);
}

async function abonar(negocioId: string, plan: Plan, monto: number, meses: number, mpId: string) {
  const sb = supabaseAdmin();
  // mp_id es único: si Mercado Pago avisa dos veces, el segundo insert falla y no se suma doble
  const { error } = await sb.from("payments").insert({ business_id: negocioId, amount: monto, method: "mercadopago", months: meses, mp_id: mpId });
  if (error) {
    if (error.code === "23505") return;
    throw error;
  }
  const { data: n } = await sb.from("businesses").select("paid_until, trial_ends_at").eq("id", negocioId).single();
  await sb.from("businesses").update({ paid_until: extenderPago(n?.paid_until ?? null, meses, n?.trial_ends_at), plan, paused: false }).eq("id", negocioId);
}
