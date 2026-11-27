"use server";

import { revalidatePath } from "next/cache";
import { correoActivo, correoConfirmar, enlaceAuth } from "@/lib/correo";
import { origen } from "@/lib/ip";
import { usuarioActual } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Reenvía el enlace para confirmar el correo del dueño que ya tiene sesión. Máximo uno por minuto.
export async function reenviarMiConfirmacion(_: { ok: boolean; mensaje: string } | null): Promise<{ ok: boolean; mensaje: string }> {
  const { user } = await usuarioActual();
  if (!user?.email || !user.user_metadata?.correo_pendiente) return { ok: true, mensaje: "Tu correo ya está confirmado." };
  if (!correoActivo()) return { ok: false, mensaje: "Por ahora no podemos mandar correos. Intenta más tarde." };
  const ultimo = Number(user.user_metadata?.confirmacion_enviada || 0);
  if (Date.now() - ultimo < 60_000) return { ok: true, mensaje: `Ya te lo mandamos a ${user.email}. Revisa también «Spam».` };
  const sb = supabaseAdmin();
  const { data } = await sb.auth.admin.generateLink({ type: "magiclink", email: user.email });
  const { data: n } = await sb.from("businesses").select("name").eq("owner_id", user.id).order("created_at").limit(1).maybeSingle();
  if (!data?.properties?.hashed_token) return { ok: false, mensaje: "No pudimos mandarlo. Intenta en unos minutos." };
  try {
    await correoConfirmar(user.email, n?.name || "tu negocio", enlaceAuth(data.properties.hashed_token, "magiclink", await origen()));
  } catch {
    return { ok: false, mensaje: "No pudimos mandarlo. Intenta en unos minutos." };
  }
  await sb.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, confirmacion_enviada: Date.now() } });
  return { ok: true, mensaje: `Listo, te lo mandamos a ${user.email}. Revisa también «Spam».` };
}

// El dueño escribió mal su correo al registrarse: lo corrige él mismo y le mandamos la confirmación al nuevo.
export async function cambiarMiCorreo(_: { ok: boolean; mensaje: string } | null, f: FormData): Promise<{ ok: boolean; mensaje: string }> {
  const { user } = await usuarioActual();
  if (!user?.email) return { ok: false, mensaje: "Vuelve a entrar a tu panel e intenta otra vez." };
  if (!user.user_metadata?.correo_pendiente) return { ok: false, mensaje: "Tu correo ya está confirmado." };
  const nuevo = String(f.get("correo") || "").trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(nuevo)) return { ok: false, mensaje: "Escribe un correo válido." };
  if (nuevo === user.email.toLowerCase()) return { ok: false, mensaje: "Es el mismo correo que ya tienes." };
  const ultimo = Number(user.user_metadata?.confirmacion_enviada || 0);
  if (Date.now() - ultimo < 60_000) return { ok: false, mensaje: "Espera un minuto e intenta otra vez." };

  const sb = supabaseAdmin();
  const meta = { ...user.user_metadata, correo_pendiente: true, confirmacion_enviada: Date.now() };
  const { error } = await sb.auth.admin.updateUserById(user.id, { email: nuevo, email_confirm: true, user_metadata: meta });
  if (error) return { ok: false, mensaje: /already|registered|exists/i.test(error.message) ? "Ese correo ya tiene una cuenta en Pidewat." : "No pudimos cambiarlo. Intenta en unos minutos." };
  await sb.from("businesses").update({ owner_email: nuevo }).eq("owner_id", user.id);

  if (correoActivo()) {
    const { data } = await sb.auth.admin.generateLink({ type: "magiclink", email: nuevo });
    const { data: n } = await sb.from("businesses").select("name").eq("owner_id", user.id).order("created_at").limit(1).maybeSingle();
    if (data?.properties?.hashed_token) {
      try { await correoConfirmar(nuevo, n?.name || "tu negocio", enlaceAuth(data.properties.hashed_token, "magiclink", await origen())); }
      catch (e) { console.error("correo confirmar (cambio)", (e as Error).message); }
    }
  }
  revalidatePath("/panel", "layout");
  return { ok: true, mensaje: `Listo, ahora tu correo es ${nuevo}. Te mandamos ahí el enlace para confirmarlo.` };
}
