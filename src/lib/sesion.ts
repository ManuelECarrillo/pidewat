import "server-only";
import { redirect } from "next/navigation";
import { supabaseServidor } from "./supabase/servidor";
import type { NegocioCompleto } from "./tipos";

export async function usuarioActual() {
  const sb = await supabaseServidor();
  const { data } = await sb.auth.getUser();
  return { sb, user: data.user };
}

export async function esAdmin() {
  const { sb, user } = await usuarioActual();
  if (!user) return false;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return Boolean(data);
}

// Para las páginas /panel: exige sesión y devuelve el negocio del dueño.
export async function requiereDueno() {
  const { sb, user } = await usuarioActual();
  if (!user) redirect("/entrar");
  const { data: negocio } = await sb
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle<NegocioCompleto>();
  if (!negocio) {
    if (await esAdmin()) redirect("/admin");
    redirect("/entrar?error=sin-negocio");
  }
  return { sb, user, negocio };
}

export async function requiereAdmin() {
  const { sb, user } = await usuarioActual();
  if (!user) redirect("/entrar");
  if (!(await esAdmin())) redirect("/panel");
  return { sb, user };
}
