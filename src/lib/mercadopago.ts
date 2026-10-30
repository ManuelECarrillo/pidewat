import "server-only";
import crypto from "node:crypto";
import { PLANES, type Plan } from "./planes";
import { siteUrl } from "./formato";

const API = "https://api.mercadopago.com";

export const mpConfigurado = () => Boolean(process.env.MP_ACCESS_TOKEN);

async function mp<T>(ruta: string, init?: RequestInit): Promise<T> {
  const r = await fetch(API + ruta, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Mercado Pago ${ruta}: ${r.status} ${await r.text()}`);
  return r.json() as Promise<T>;
}

// La referencia viaja con el cobro y regresa en el webhook: "<negocio>|<mensual|anual>|<plan>"
export const referencia = (negocioId: string, ciclo: "mensual" | "anual", plan: Plan) => `${negocioId}|${ciclo}|${plan}`;
export function leerReferencia(ref: string | null | undefined) {
  const [id, ciclo, plan] = String(ref || "").split("|");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !(ciclo === "mensual" || ciclo === "anual") || !(plan === "base" || plan === "plus")) return null;
  return { id, ciclo, plan } as { id: string; ciclo: "mensual" | "anual"; plan: Plan };
}

// Cobro automático cada mes (Mercado Pago Suscripciones). Devuelve el link de pago.
export async function crearSuscripcion(o: { negocioId: string; nombre: string; plan: Plan; correo: string }) {
  const r = await mp<{ id: string; init_point: string }>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: `Pidewat ${PLANES[o.plan].nombre} · ${o.nombre}`,
      external_reference: referencia(o.negocioId, "mensual", o.plan),
      payer_email: o.correo,
      back_url: `${siteUrl()}/panel/plan?mp=ok`,
      auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: PLANES[o.plan].mensual, currency_id: "MXN" },
      status: "pending",
    }),
  });
  return r.init_point;
}

// Pago único de un año (Checkout Pro). Acepta tarjeta, OXXO y transferencia.
export async function crearPagoAnual(o: { negocioId: string; nombre: string; plan: Plan; correo?: string }) {
  const r = await mp<{ init_point: string }>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: [{ title: `Pidewat ${PLANES[o.plan].nombre} anual · ${o.nombre}`, quantity: 1, unit_price: PLANES[o.plan].anual, currency_id: "MXN" }],
      external_reference: referencia(o.negocioId, "anual", o.plan),
      payer: o.correo ? { email: o.correo } : undefined,
      back_urls: { success: `${siteUrl()}/panel/plan?mp=ok`, pending: `${siteUrl()}/panel/plan?mp=pendiente`, failure: `${siteUrl()}/panel/plan?mp=error` },
      auto_return: "approved",
      notification_url: `${siteUrl()}/api/mp/webhook`,
      statement_descriptor: "PIDEWAT",
    }),
  });
  return r.init_point;
}

export type Preapproval = { id: string; status: string; external_reference: string; payer_email?: string };
export type PagoAutorizado = { id: number; preapproval_id: string; status: string; transaction_amount: number; payment?: { id: number; status: string } };
export type Pago = { id: number; status: string; transaction_amount: number; external_reference: string };

export const obtenerPreapproval = (id: string) => mp<Preapproval>(`/preapproval/${encodeURIComponent(id)}`);
export const obtenerPagoAutorizado = (id: string) => mp<PagoAutorizado>(`/authorized_payments/${encodeURIComponent(id)}`);
export const obtenerPago = (id: string) => mp<Pago>(`/v1/payments/${encodeURIComponent(id)}`);
export const cancelarPreapproval = (id: string) =>
  mp<Preapproval>(`/preapproval/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify({ status: "cancelled" }) });

// Revisa la firma x-signature del webhook (si configuraste MP_WEBHOOK_SECRET).
export function firmaValida(req: Request, dataId: string) {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  // SEG-007: sin la clave secreta no podemos saber si el aviso es de Mercado Pago, así que lo rechazamos
  if (!secreto) {
    console.error("webhook MP rechazado: falta MP_WEBHOOK_SECRET en Vercel");
    return false;
  }
  const firma = req.headers.get("x-signature") || "";
  const reqId = req.headers.get("x-request-id") || "";
  const partes = Object.fromEntries(firma.split(",").map((p) => p.trim().split("=") as [string, string]));
  if (!partes.ts || !partes.v1) return false;
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifiesto = `id:${id};request-id:${reqId};ts:${partes.ts};`;
  const esperado = crypto.createHmac("sha256", secreto).update(manifiesto).digest("hex");
  return esperado.length === partes.v1.length && crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(partes.v1));
}
