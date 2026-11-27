"use server";

import { requiereAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { usuarioActual } from "@/lib/sesion";

export type Res = { ok: boolean; mensaje: string };

// Cambia el correo con el que entra el admin (para dejar de usar uno ficticio y poder recuperar la contraseña).
// Se escribe dos veces para no quedarse fuera por un error de dedo. La contraseña no cambia.
export async function cambiarMiCorreo(_: Res | null, f: FormData): Promise<Res> {
  await requiereAdmin();
  const { user } = await usuarioActual();
  if (!user) return { ok: false, mensaje: "Vuelve a entrar." };
  const a = String(f.get("correo") ?? "").trim().toLowerCase();
  const b = String(f.get("correo2") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a)) return { ok: false, mensaje: "Revisa el correo." };
  if (a !== b) return { ok: false, mensaje: "Los dos correos no son iguales." };
  const { error } = await supabaseAdmin().auth.admin.updateUserById(user.id, { email: a, email_confirm: true });
  if (error) return { ok: false, mensaje: /already|exists/i.test(error.message) ? "Ese correo ya tiene otra cuenta." : "No se pudo cambiar." };
  return { ok: true, mensaje: `Listo. Desde ahora entras con ${a} y tu misma contraseña.` };
}
