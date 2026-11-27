"use server";

import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { createHmac, randomUUID } from "node:crypto";
import { correoActivo, correoConfirmar, enlaceAuth } from "@/lib/correo";
import { ipYHuella, origen } from "@/lib/ip";
import { pareceRobot } from "@/lib/robots";
import { redirect } from "next/navigation";
import { normalizarWhatsapp as normalizarWhatsapp, slugify } from "@/lib/formato";
import { DIAS_PRUEBA, SLUGS_RESERVADOS } from "@/lib/planes";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { enviarConversionMeta } from "@/lib/meta";

export type ResultadoSolicitud = { ok: boolean; error?: string; campo?: string; plan?: "esencial" | "restaurante"; negocio?: string; entrar?: boolean; revisaCorreo?: string; eventoMeta?: string; nombreEventoMeta?: "CompleteRegistration" | "Lead"; contenidoMeta?: "esencial" | "restaurante_demo" };

const txt = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const GIROS = new Set(["Taquería", "Hamburguesas", "Hot dogs", "Food truck", "Fonda o cocina económica", "Antojitos", "Cafetería", "Otro"]);
const idEventoMeta = (f: FormData) => {
  const id = txt(f, "meta_event_id", 80);
  return /^[a-z0-9-]{20,80}$/i.test(id) ? id : randomUUID();
};

// El envío corre después de persistir nuestro embudo y no cambia el resultado de la persona.
async function medirConversionMeta(opciones: { evento: "CompleteRegistration" | "Lead"; id: string; contenido: "esencial" | "restaurante_demo"; correo?: string; whatsapp: string; utm: Record<string, string>; plan: "esencial" | "restaurante" }) {
  const h = await headers();
  const aceptoCookies = (await cookies()).get("pidewat_meta_consentimiento")?.value === "aceptar";
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || null;
  const horaFbclid = Number(opciones.utm.fbclid_visto_ms);
  const conversion = {
    evento: opciones.evento, eventId: opciones.id, contenido: opciones.contenido,
    ip, agente: h.get("user-agent"), fbclid: opciones.utm.fbclid,
    fbclidVistoMs: Number.isSafeInteger(horaFbclid) && horaFbclid > 0 ? horaFbclid : undefined,
    correo: opciones.correo, whatsapp: opciones.whatsapp, puedeUsarDatosDeContacto: aceptoCookies,
    utmContent: opciones.utm.utm_content, url: `${await origen()}/empezar?plan=${opciones.plan}`,
  };
  after(() => enviarConversionMeta(conversion));
}

// Plan Restaurante (en pruebas): solo guarda la solicitud de demostración. Nunca pide tarjeta.
export async function enviarSolicitud(_: ResultadoSolicitud | null, f: FormData): Promise<ResultadoSolicitud> {
  if (await pareceRobot(f, (await ipYHuella()).ip)) return { ok: true }; // a un robot no se le dice que lo detectamos
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
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "fbclid_visto_ms"]) if (typeof u[k] === "string") utm[k] = u[k].slice(0, 100);
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
  const eventoMeta = idEventoMeta(f);
  await medirConversionMeta({ evento: "Lead", id: eventoMeta, contenido: "restaurante_demo", whatsapp, utm, plan: "restaurante" });
  return { ok: true, plan, negocio, eventoMeta, nombreEventoMeta: "Lead", contenidoMeta: "restaurante_demo" };
}

// Plan Esencial: alta automática, sin intervención de nadie.
// Crea la cuenta + su negocio con 14 días y deja al dueño DENTRO de su panel en ese momento (Eduardo 27/11:
// ir al correo y regresar da flojera). Si hay correo configurado, además le manda un enlace para confirmar su
// correo; mientras no lo confirme ve un aviso en su panel (correo_pendiente).
// (correo_pendiente es solo nuestro: en Supabase la cuenta queda confirmada para que pueda entrar.)
export async function crearPrueba(_: ResultadoSolicitud | null, f: FormData): Promise<ResultadoSolicitud> {
  const { ip, huella } = await ipYHuella();
  if (await pareceRobot(f, ip)) return { ok: false, error: "No se pudo crear la cuenta. Intenta otra vez en un momento." };
  const negocio = txt(f, "negocio", 80);
  const nombre = txt(f, "nombre", 60);
  const whatsapp = normalizarWhatsapp(txt(f, "whatsapp", 20));
  const correo = txt(f, "correo", 120).toLowerCase();
  const clave = String(f.get("clave") ?? "");
  const giro = GIROS.has(txt(f, "giro", 40)) ? txt(f, "giro", 40) : null;
  if (negocio.length < 2) return { ok: false, campo: "negocio", error: "Escribe el nombre de tu negocio." };
  if (nombre.length < 2) return { ok: false, campo: "nombre", error: "Escribe tu nombre." };
  if (!/^[0-9]{12,13}$/.test(whatsapp)) return { ok: false, campo: "whatsapp", error: "Revisa tu WhatsApp: son 10 dígitos." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return { ok: false, campo: "correo", error: "Revisa tu correo." };
  if (clave.length < 8 || clave.length > 72) return { ok: false, campo: "clave", error: "Tu contraseña debe tener al menos 8 caracteres." };
  if (f.get("privacidad") !== "on") return { ok: false, campo: "privacidad", error: "Necesitamos que aceptes el aviso de privacidad." };

  let utm: Record<string, string> = {};
  try {
    const u = JSON.parse(String(f.get("utm") || "{}"));
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "fbclid_visto_ms"]) if (typeof u[k] === "string") utm[k] = u[k].slice(0, 100);
  } catch { utm = {}; }

  const sb = supabaseAdmin();
  if (huella) {
    const { count } = await sb.from("solicitudes").select("id", { count: "exact", head: true }).eq("ip_hash", huella).gte("creado", new Date(Date.now() - 3_600_000).toISOString());
    if ((count ?? 0) >= 3) return { ok: false, error: "Se crearon varias cuentas desde aquí. Intenta más tarde." };
  }
  // Freno global: si de pronto llegan demasiados registros (ataque), pausa el alta automática
  const { count: ultimaHora } = await sb.from("solicitudes").select("id", { count: "exact", head: true }).eq("estado", "prueba").gte("creado", new Date(Date.now() - 3_600_000).toISOString());
  if ((ultimaHora ?? 0) >= 40) return { ok: false, error: "Estamos recibiendo muchos registros. Intenta en unos minutos." };

  // Link libre: tacos-el-guero, tacos-el-guero-2, …
  const base = slugify(negocio).slice(0, 34) || "mi-negocio";
  let slug = SLUGS_RESERVADOS.has(base) || base.length < 3 ? `${base}-menu` : base;
  for (let i = 2; i < 30; i++) {
    const { data: ocupado } = await sb.from("businesses").select("id").eq("slug", slug).maybeSingle();
    if (!ocupado) break;
    slug = `${base}-${i}`;
  }

  const verificar = correoActivo();
  // eligió su propia contraseña: sin aviso de cambiarla
  const { data: alta, error: eAlta } = await sb.auth.admin.createUser({ email: correo, password: clave, email_confirm: true, user_metadata: { nombre, clave_cambiada: true, correo_pendiente: verificar } });
  const userId = alta?.user?.id;
  const errAlta = eAlta?.message;
  if (!userId) {
    const ya = /already|registered|exists/i.test(errAlta || "");
    return ya
      ? { ok: false, campo: "correo", error: "Ese correo ya tiene cuenta. Entra desde «Entrar» o recupera tu contraseña." }
      : { ok: false, error: "No se pudo crear la cuenta. Intenta otra vez." };
  }
  const trial = new Date(Date.now() + DIAS_PRUEBA * 86_400_000).toISOString();
  const { data: neg, error: e2 } = await sb.from("businesses")
    .insert({ name: negocio, slug, whatsapp, owner_id: userId, owner_email: correo, mode: "menu", plan: "base", trial_ends_at: trial, accepts_table: txt(f, "local", 12) !== "sin-mesas", accepts_pickup: true })
    .select("id").single();
  if (e2 || !neg) {
    await sb.auth.admin.deleteUser(userId); // no dejar cuentas sin negocio
    console.error("alta negocio", e2?.message);
    return { ok: false, error: "No se pudo crear tu negocio. Intenta otra vez." };
  }
  await sb.from("solicitudes").insert({ negocio, nombre, whatsapp, giro, ciudad: null, plan: "esencial", estado: "prueba", business_id: neg.id, utm, ip_hash: huella, acepto_privacidad: true });
  await sb.from("eventos_landing").insert({ evento: "registro_enviado", pagina: "/empezar", detalle: "prueba_activada", utm_source: utm.utm_source ?? null, utm_medium: utm.utm_medium ?? null, utm_campaign: utm.utm_campaign ?? null, utm_content: utm.utm_content ?? null });
  const eventoMeta = idEventoMeta(f);
  await medirConversionMeta({ evento: "CompleteRegistration", id: eventoMeta, contenido: "esencial", correo, whatsapp, utm, plan: "esencial" });

  if (verificar) await mandarConfirmacion(sb, correo, negocio);
  const { error: e3 } = await (await supabaseServidor()).auth.signInWithPassword({ email: correo, password: clave });
  if (e3) return { ok: true, plan: "esencial", negocio, entrar: true };
  redirect(`/panel?bienvenida=1&meta_event=${encodeURIComponent(eventoMeta)}`);
}

// Enlace de un solo uso para confirmar el correo. Si falla el envío no se frena el alta: el aviso del panel deja reenviarlo.
async function mandarConfirmacion(sb: ReturnType<typeof supabaseAdmin>, correo: string, negocio: string) {
  try {
    const { data } = await sb.auth.admin.generateLink({ type: "magiclink", email: correo });
    if (data?.properties?.hashed_token) await correoConfirmar(correo, negocio, enlaceAuth(data.properties.hashed_token, "magiclink", await origen()));
  } catch (e) {
    console.error("correo confirmar", (e as Error).message);
  }
}

// Reenviar el enlace de confirmación (cuenta creada pero sin confirmar). Siempre responde lo mismo.
export async function reenviarConfirmacion(_: { ok: boolean } | null, f: FormData): Promise<{ ok: boolean }> {
  const correo = txt(f, "correo", 120).toLowerCase();
  if (!correoActivo() || !correo) return { ok: true };
  const { huella } = await ipYHuella();
  const sb = supabaseAdmin();
  if (huella) {
    const { count } = await sb.from("eventos_landing").select("id", { count: "exact", head: true }).eq("evento", "registro_enviado").eq("detalle", `reenvio:${huella}`).gte("creado", new Date(Date.now() - 3_600_000).toISOString());
    if ((count ?? 0) >= 3) return { ok: true };
    await sb.from("eventos_landing").insert({ evento: "registro_enviado", pagina: "/empezar", detalle: `reenvio:${huella}` });
  }
  const { data: neg } = await sb.from("businesses").select("name").eq("owner_email", correo).limit(1).maybeSingle();
  const { data } = await sb.auth.admin.generateLink({ type: "magiclink", email: correo });
  if (data?.properties?.hashed_token && data.user && (!data.user.email_confirmed_at || data.user.user_metadata?.correo_pendiente)) {
    try { await correoConfirmar(correo, neg?.name || "tu negocio", enlaceAuth(data.properties.hashed_token, "magiclink", await origen())); } catch (e) { console.error("reenvio", (e as Error).message); }
  }
  return { ok: true };
}
