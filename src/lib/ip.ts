import "server-only";
import { headers } from "next/headers";
import { createHmac } from "node:crypto";
import { siteUrl } from "./formato";

export async function ipYHuella() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || null;
  const huella = ip ? createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "pidewat").update(ip).digest("hex").slice(0, 32) : null;
  return { ip, huella };
}

// Base para los enlaces de correo: el dominio oficial, o la vista previa de Vercel de este proyecto.
// Nunca un host cualquiera (un host falso mandaría el enlace de recuperación a otro sitio).
export async function origen() {
  const oficial = siteUrl();
  const h = await headers();
  const host = (h.get("x-forwarded-host") || h.get("host") || "").toLowerCase();
  if (/^pidewat-[a-z0-9-]+-mecarrilloarevalo-5777s-projects\.vercel\.app$/.test(host)) return `https://${host}`;
  return oficial;
}
