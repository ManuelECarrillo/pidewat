import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { siteUrl } from "./formato";

// Correo saliente por SMTP (Gmail con contraseña de aplicación, Brevo o Resend: todos dan SMTP).
// Variables en Vercel: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM. Sin ellas, correoActivo() = false
// y el registro entra directo sin verificar (como antes), para no romper nada mientras se configura.
export const correoActivo = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporte: Transporter | null = null;
function smtp() {
  if (!transporte) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporte = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port, secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporte;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function plantilla(titulo: string, texto: string, boton: string, url: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f6f3ee;font-family:Arial,Helvetica,sans-serif;color:#1d1b19">
<div style="max-width:480px;margin:0 auto;padding:28px 20px">
<p style="font-size:22px;font-weight:bold;margin:0 0 18px">Pide<span style="color:#1f8a4c">wat</span></p>
<div style="background:#fff;border-radius:16px;padding:24px">
<h1 style="font-size:20px;margin:0 0 10px">${esc(titulo)}</h1>
<p style="font-size:15px;line-height:1.5;margin:0 0 20px">${esc(texto)}</p>
<a href="${url}" style="display:inline-block;background:#1f8a4c;color:#fff;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:12px">${esc(boton)}</a>
<p style="font-size:12px;color:#6b665f;margin:20px 0 0">Si no fuiste tú, ignora este correo. El enlace vence en 1 hora.</p>
</div></div></body></html>`;
}

async function enviar(para: string, asunto: string, html: string, texto: string) {
  await smtp().sendMail({ from: process.env.SMTP_FROM || `Pidewat <${process.env.SMTP_USER}>`, to: para, subject: asunto, html, text: texto });
}

// El enlace apunta a NUESTRA ruta /auth/confirmar con el token_hash (no al dominio de Supabase), así no
// depende de la lista de redirecciones de Supabase y la sesión queda en nuestras cookies.
export const enlaceAuth = (tokenHash: string, tipo: "signup" | "magiclink" | "recovery" | "email_change", base = siteUrl()) =>
  `${base}/auth/confirmar?token_hash=${encodeURIComponent(tokenHash)}&type=${tipo}`;

export function correoConfirmar(para: string, negocio: string, url: string) {
  return enviar(para, "Confirma tu correo de Pidewat",
    plantilla("Confirma tu correo", `Tu menú de ${negocio} ya está creado y tus 14 días gratis empezaron. Confirma tu correo para poder recuperar tu contraseña si un día la olvidas.`, "Confirmar mi correo", url),
    `Confirma tu correo de Pidewat: ${url}`);
}

export function correoRecuperar(para: string, url: string) {
  return enviar(para, "Cambia tu contraseña de Pidewat",
    plantilla("Cambia tu contraseña", "Pediste cambiar tu contraseña. Toca el botón y escribe una nueva.", "Poner contraseña nueva", url),
    `Cambia tu contraseña de Pidewat: ${url}`);
}

// Alta desde el admin o «no puedo entrar»: enlace de un solo uso que deja al dueño en su panel, donde elige su contraseña.
export function correoAcceso(para: string, negocio: string, url: string) {
  return enviar(para, `Entra a tu panel de ${negocio} en Pidewat`,
    plantilla("Tu panel de Pidewat está listo", `Toca el botón para entrar al panel de ${negocio}. Ahí eliges tu contraseña y configuras tu menú. El botón sirve una sola vez.`, "Entrar a mi panel", url),
    `Entra a tu panel de Pidewat (sirve una sola vez y vence en 1 hora): ${url}`);
}
