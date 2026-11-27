"use server";

import { correoActivo, correoRecuperar, enlaceAuth } from "@/lib/correo";
import { ipYHuella, origen } from "@/lib/ip";
import { pareceRobot } from "@/lib/robots";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type Res = { ok: boolean; error?: string };

// Siempre responde igual exista o no la cuenta (no revela qué correos están registrados).
export async function pedirRecuperacion(_: Res | null, f: FormData): Promise<Res> {
  if (!correoActivo()) return { ok: false, error: "La recuperación por correo aún no está disponible. Intenta más tarde." };
  const correo = String(f.get("correo") ?? "").trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return { ok: false, error: "Revisa tu correo." };
  const { ip, huella } = await ipYHuella();
  if (await pareceRobot(f, ip)) return { ok: true };
  const sb = supabaseAdmin();
  if (huella) {
    const desde = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await sb.from("eventos_landing").select("id", { count: "exact", head: true }).eq("detalle", `recuperar:${huella}`).gte("creado", desde);
    if ((count ?? 0) >= 5) return { ok: true };
    await sb.from("eventos_landing").insert({ evento: "registro_enviado", pagina: "/recuperar", detalle: `recuperar:${huella}` });
  }
  const { data, error } = await sb.auth.admin.generateLink({ type: "recovery", email: correo });
  if (!error && data?.properties?.hashed_token) {
    try { await correoRecuperar(correo, enlaceAuth(data.properties.hashed_token, "recovery", await origen())); }
    catch (e) { console.error("correo recuperar", (e as Error).message); return { ok: false, error: "No pudimos mandar el correo. Intenta en unos minutos." }; }
  }
  return { ok: true };
}

// Después de tocar el enlace del correo ya hay sesión: aquí solo se pone la contraseña nueva.
export async function guardarClaveNueva(_: Res | null, f: FormData): Promise<Res> {
  const clave = String(f.get("clave") ?? "");
  if (clave.length < 8 || clave.length > 72) return { ok: false, error: "Tu contraseña debe tener al menos 8 caracteres." };
  const sb = await supabaseServidor();
  const { data } = await sb.auth.getUser();
  if (!data.user) return { ok: false, error: "El enlace venció. Pide otro desde «Olvidé mi contraseña»." };
  const { error } = await sb.auth.updateUser({ password: clave, data: { clave_cambiada: true } });
  if (error) return { ok: false, error: /same|different/i.test(error.message) ? "Usa una contraseña distinta a la anterior." : "No se pudo guardar. Intenta otra vez." };
  return { ok: true };
}
