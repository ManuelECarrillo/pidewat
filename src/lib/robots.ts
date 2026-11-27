import "server-only";

// Protección contra registros automáticos, en capas:
// 1) campo trampa oculto, 2) tiempo mínimo para llenar el formulario, 3) límite por IP (en cada acción),
// 4) Cloudflare Turnstile si existen TURNSTILE_SECRET_KEY y NEXT_PUBLIC_TURNSTILE_SITE_KEY (gratis).
export const turnstileActivo = () => Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export async function pareceRobot(f: FormData, ip: string | null): Promise<boolean> {
  if (String(f.get("sitio_web") ?? "").trim()) return true;
  const t0 = Number(f.get("t0"));
  if (Number.isFinite(t0) && t0 > 0 && Date.now() - t0 < 2500) return true; // nadie llena el formulario en 2.5 s
  if (!turnstileActivo()) return false;
  const token = String(f.get("cf-turnstile-response") ?? "");
  if (!token) return true;
  try {
    const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token, ...(ip ? { remoteip: ip } : {}) });
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, cache: "no-store" });
    const j = (await r.json()) as { success?: boolean };
    return !j.success;
  } catch {
    return false; // si Cloudflare no responde, no bloqueamos a una persona real (quedan las otras capas)
  }
}
