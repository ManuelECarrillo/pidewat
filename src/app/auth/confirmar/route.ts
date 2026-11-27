import { NextResponse, type NextRequest } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

// Destino de los enlaces de correo (confirmar cuenta, recuperar contraseña, cambio de correo).
// verifyOtp deja la sesión en cookies y manda a cada quien a su siguiente paso.
const TIPOS = new Set(["signup", "magiclink", "recovery", "email_change"]);

export async function GET(req: NextRequest) {
  const token_hash = req.nextUrl.searchParams.get("token_hash") || "";
  const type = req.nextUrl.searchParams.get("type") || "";
  const ir = (ruta: string) => NextResponse.redirect(new URL(ruta, req.nextUrl.origin));
  if (!token_hash || !TIPOS.has(type)) return ir("/entrar?error=enlace");
  const sb = await supabaseServidor();
  const { data, error } = await sb.auth.verifyOtp({ token_hash, type: type as "signup" | "magiclink" | "recovery" | "email_change" });
  if (error) return ir(type === "recovery" ? "/recuperar?error=enlace" : "/entrar?error=enlace");
  // Tocar cualquier enlace que mandamos a su correo prueba que el correo es suyo: quita el aviso de confirmarlo
  const confirmaCorreo = Boolean(data.user?.user_metadata?.correo_pendiente);
  if (confirmaCorreo) await sb.auth.updateUser({ data: { correo_pendiente: false } });
  if (type === "recovery") return ir("/nueva-clave");
  if (type === "email_change") return ir("/admin?correo=ok");
  // Confirmó su correo después de registrarse, o entró con el enlace de acceso que le mandamos desde el admin
  return ir(confirmaCorreo ? "/panel?correo=ok" : "/panel?bienvenida=1");
}
