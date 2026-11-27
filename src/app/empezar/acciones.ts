"use server";

import { headers } from "next/headers";
import { createHmac } from "node:crypto";
import { normalizarWhatsapp } from "@/lib/formato";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type ResultadoSolicitud = { ok: boolean; error?: string; campo?: string; plan?: "esencial" | "restaurante"; negocio?: string };

const txt = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const GIROS = new Set(["Taquería", "Hamburguesas", "Hot dogs", "Food truck", "Fonda o cocina económica", "Antojitos", "Cafetería", "Otro"]);

// Guarda la solicitud de prueba. No crea la cuenta sola: la prueba empieza cuando configuramos su menú
// (eso se le dice claro en la pantalla de confirmación). Nunca pide tarjeta.
export async function enviarSolicitud(_: ResultadoSolicitud | null, f: FormData): Promise<ResultadoSolicitud> {
  if (txt(f, "sitio_web", 100)) return { ok: true }; // campo trampa: solo lo llenan los robots
  const negocio = txt(f, "negocio", 80);
  const nombre = txt(f, "nombre", 60);
  const whatsapp = normalizarWhatsapp(txt(f, "whatsapp", 20));
  const giro = GIROS.has(txt(f, "giro", 40)) ? txt(f, "giro", 40) : null;
  const ciudad = txt(f, "ciudad", 60) || null;
  const plan = f.get("plan") === "restaurante" ? "restaurante" : "esencial";
  if (negocio.length < 2) return { ok: false, campo: "negocio", error: "Escribe el nombre de tu negocio." };
  if (nombre.length < 2) return { ok: false, campo: "nombre", error: "Escribe tu nombre." };
  if (!/^[0-9]{12,13}$/.test(whatsapp)) return { ok: false, campo: "whatsapp", error: "Revisa tu WhatsApp: son 10 dígitos." };
  if (f.get("privacidad") !== "on") return { ok: false, campo: "privacidad", error: "Necesitamos tu permiso para escribirte por WhatsApp." };

  let utm: Record<string, string> = {};
  try {
    const u = JSON.parse(String(f.get("utm") || "{}"));
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) if (typeof u[k] === "string") utm[k] = u[k].slice(0, 100);
  } catch { utm = {}; }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim();
  const ip_hash = ip ? createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "pidewat").update(ip).digest("hex").slice(0, 32) : null;
  const sb = supabaseAdmin();
  // Freno simple contra envíos en serie desde el mismo lugar
  if (ip_hash) {
    const { count } = await sb.from("solicitudes").select("id", { count: "exact", head: true }).eq("ip_hash", ip_hash).gte("creado", new Date(Date.now() - 3_600_000).toISOString());
    if ((count ?? 0) >= 5) return { ok: false, error: "Recibimos varias solicitudes desde aquí. Escríbenos directo por WhatsApp." };
  }
  const { error } = await sb.from("solicitudes").insert({ negocio, nombre, whatsapp, giro, ciudad, plan, utm, ip_hash, acepto_privacidad: true });
  if (error) { console.error("solicitud", error.message); return { ok: false, error: "No se pudo enviar. Intenta otra vez o escríbenos por WhatsApp." }; }
  await sb.from("eventos_landing").insert({ evento: "registro_enviado", pagina: "/empezar", detalle: plan, utm_source: utm.utm_source ?? null, utm_medium: utm.utm_medium ?? null, utm_campaign: utm.utm_campaign ?? null, utm_content: utm.utm_content ?? null });
  return { ok: true, plan, negocio };
}
