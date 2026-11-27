"use server";

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
