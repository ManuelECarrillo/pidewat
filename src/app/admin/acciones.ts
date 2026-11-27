"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { extenderPago } from "@/lib/estado";
import { correoAcceso, correoActivo, enlaceAuth } from "@/lib/correo";
import { normalizarWhatsapp, siteUrl, slugify } from "@/lib/formato";
import { cancelarPreapproval } from "@/lib/mercadopago";
import { DIAS_PRUEBA, SLUGS_RESERVADOS } from "@/lib/planes";
import { requiereAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";

const claveNueva = () => {
  const letras = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(crypto.randomBytes(10), (b) => letras[b % letras.length]).join("");
};

// enlace: acceso de un solo uso al panel (se muestra también como QR para que el dueño lo escanee ahí mismo)
export type ResultadoAlta = { ok: boolean; mensaje: string; whatsapp?: string; texto?: string; enlace?: string };

// Alta de un negocio nuevo: crea la cuenta del dueño y su negocio en prueba, y regresa un enlace de acceso de un solo uso
// (QR o WhatsApp). El dueño entra directo a su panel y ahí elige su contraseña: nadie más la conoce.
export async function altaNegocio(_: ResultadoAlta | null, f: FormData): Promise<ResultadoAlta> {
  await requiereAdmin();
  const sb = supabaseAdmin();
  const name = String(f.get("name") || "").trim();
  const correo = String(f.get("email") || "").trim().toLowerCase();
  const whatsapp = normalizarWhatsapp(String(f.get("whatsapp") || ""));
  const slug = slugify(String(f.get("slug") || "") || name);
  const mode = f.get("mode") === "catalogo" ? "catalogo" : "menu";

  if (!name || !correo) return { ok: false, mensaje: "Faltan nombre o correo." };
  if (!/^[0-9]{12,13}$/.test(whatsapp)) return { ok: false, mensaje: "WhatsApp inválido: 10 dígitos." };
  if (slug.length < 3 || SLUGS_RESERVADOS.has(slug)) return { ok: false, mensaje: "Ese link no se puede usar." };
  const { data: existe } = await sb.from("businesses").select("id").eq("slug", slug).maybeSingle();
  if (existe) return { ok: false, mensaje: `El link /${slug} ya está ocupado.` };

  const cuenta = await cuentaDueno(sb, correo);
  if ("error" in cuenta) return { ok: false, mensaje: cuenta.error };

  const trial = new Date(Date.now() + DIAS_PRUEBA * 86_400_000).toISOString();
  const { error: e2 } = await sb.from("businesses").insert({ name, slug, whatsapp, owner_id: cuenta.id, owner_email: correo, mode, trial_ends_at: trial });
  if (e2) return { ok: false, mensaje: `No se pudo crear el negocio: ${e2.message}` };

  revalidatePath("/admin");
  const enlace = await enlaceEntrada(sb, correo);
  if (!enlace) return { ok: true, mensaje: `Negocio creado: /${slug}, pero no se pudo crear el enlace de acceso. Usa «Enlace de acceso» en su ficha.` };
  const salio = await mandarAcceso(correo, name, enlace);
  return { ok: true, mensaje: `Negocio creado: /${slug}. ${avisoEnvio(correo, salio)}`, whatsapp, enlace, texto: textoBienvenida(name, slug, enlace, true) };
}

// Crea la cuenta del dueño con una contraseña al azar que nadie ve (la elige él al entrar con el enlace);
// si ya tenía cuenta (otro negocio), la reutiliza sin tocarla.
async function cuentaDueno(sb: ReturnType<typeof supabaseAdmin>, correo: string): Promise<{ id: string } | { error: string }> {
  const { data: creado, error } = await sb.auth.admin.createUser({ email: correo, password: claveNueva() + claveNueva(), email_confirm: true });
  if (!error) return { id: creado.user.id };
  const { data: lista } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const u = lista?.users.find((x) => x.email?.toLowerCase() === correo);
  if (!u) return { error: `No se pudo crear la cuenta: ${error.message}` };
  return { id: u.id };
}

// Enlace de un solo uso que deja al dueño dentro de su panel (vence según Supabase, normalmente 1 hora).
async function enlaceEntrada(sb: ReturnType<typeof supabaseAdmin>, correo: string): Promise<string | null> {
  const { data, error } = await sb.auth.admin.generateLink({ type: "magiclink", email: correo });
  if (error || !data?.properties?.hashed_token) return null;
  return enlaceAuth(data.properties.hashed_token, "magiclink", siteUrl());
}

// Manda el enlace de acceso al correo del dueño para que entre solo, sin pasar por WhatsApp. true si salió.
async function mandarAcceso(correo: string, negocio: string, enlace: string): Promise<boolean> {
  if (!correoActivo()) return false;
  try { await correoAcceso(correo, negocio, enlace); return true; }
  catch (e) { console.error("correo de acceso", e); return false; }
}

const avisoEnvio = (correo: string, salio: boolean) =>
  salio ? `Le llegó a ${correo} un correo para entrar a su panel. Si estás con él, también puede escanear el QR.`
        : `No se pudo mandar el correo a ${correo}: que escanee el QR o mándale el enlace.`;

function textoBienvenida(name: string, slug: string, enlace: string, prueba: boolean) {
  return `¡Listo! Ya quedó tu menú de *${name}* 🎉

Tu link para clientes: ${siteUrl()}/${slug}

Toca este enlace para entrar a tu panel y elegir tu contraseña (sirve una sola vez y vence en 1 hora):
${enlace}
${prueba ? `\nTienes ${DIAS_PRUEBA} días gratis. ` : "\n"}Cualquier cosa me escribes por aquí.`;
}

// Para un negocio que armamos nosotros antes de tener los datos del dueño: le crea su cuenta
// y, si se escriben, corrige nombre y WhatsApp. Regresa el mensaje de bienvenida para mandárselo.
export async function darCuenta(_: ResultadoAlta | null, f: FormData): Promise<ResultadoAlta> {
  const { sb, id, n } = await negocio(f);
  const correo = String(f.get("email") || "").trim().toLowerCase();
  const name = String(f.get("name") || "").trim() || n.name;
  const wa = String(f.get("whatsapp") || "").trim();
  const whatsapp = wa ? normalizarWhatsapp(wa) : n.whatsapp;
  if (!/^\S+@\S+\.\S+$/.test(correo)) return { ok: false, mensaje: "Escribe el correo del dueño." };
  if (!/^[0-9]{12,13}$/.test(whatsapp)) return { ok: false, mensaje: "WhatsApp inválido: 10 dígitos." };

  const cuenta = await cuentaDueno(sb, correo);
  if ("error" in cuenta) return { ok: false, mensaje: cuenta.error };
  const { error } = await sb.from("businesses").update({ owner_id: cuenta.id, owner_email: correo, name, whatsapp }).eq("id", id);
  if (error) return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };

  revalidatePath(`/admin/${id}`);
  revalidatePath(`/${n.slug}`);
  const pagado = !!n.paid_until && new Date(n.paid_until) > new Date();
  const enlace = await enlaceEntrada(sb, correo);
  if (!enlace) return { ok: true, mensaje: `Cuenta lista para ${correo}, pero no se pudo crear el enlace de acceso. Intenta con «Enlace de acceso».` };
  const salio = await mandarAcceso(correo, name, enlace);
  return { ok: true, mensaje: `Cuenta lista. ${avisoEnvio(correo, salio)}`, whatsapp, enlace, texto: textoBienvenida(name, n.slug, enlace, !pagado) };
}

async function negocio(f: FormData) {
  await requiereAdmin();
  const id = String(f.get("id"));
  const sb = supabaseAdmin();
  const { data } = await sb.from("businesses").select("*").eq("id", id).single();
  return { sb, id, n: data! };
}

export async function registrarPago(f: FormData) {
  const { sb, id, n } = await negocio(f);
  const meses = Math.min(24, Math.max(1, Number(f.get("months")) || 1));
  const amount = Math.max(0, Number(f.get("amount")) || 0);
  const method = ["transferencia", "efectivo", "mercadopago", "otro"].includes(String(f.get("method"))) ? String(f.get("method")) : "otro";
  const plan = f.get("plan") === "plus" ? "plus" : "base";
  await sb.from("payments").insert({ business_id: id, amount, method, months: meses, note: String(f.get("note") || "") || null });
  await sb.from("businesses").update({ paid_until: extenderPago(n.paid_until, meses, n.trial_ends_at), plan, paused: false }).eq("id", id);
  revalidatePath(`/admin/${id}`);
  revalidatePath(`/${n.slug}`);
}

export async function extenderPrueba(f: FormData) {
  const { sb, id, n } = await negocio(f);
  const dias = Math.min(60, Math.max(1, Number(f.get("dias")) || 7));
  const base = Math.max(Date.now(), new Date(n.trial_ends_at).getTime());
  await sb.from("businesses").update({ trial_ends_at: new Date(base + dias * 86_400_000).toISOString() }).eq("id", id);
  revalidatePath(`/admin/${id}`);
  revalidatePath(`/${n.slug}`);
}

export async function alternarPausa(f: FormData) {
  const { sb, id, n } = await negocio(f);
  await sb.from("businesses").update({ paused: !n.paused }).eq("id", id);
  revalidatePath(`/admin/${id}`);
  revalidatePath(`/${n.slug}`);
}

export async function guardarInterno(f: FormData) {
  const { sb, id, n } = await negocio(f);
  const slug = slugify(String(f.get("slug") || n.slug));
  const cambios: Record<string, unknown> = { notes: String(f.get("notes") || "") || null };
  if (f.has("plan")) cambios.plan = f.get("plan") === "plus" ? "plus" : "base";
  // La pantalla de cocina solo se prende a mano, negocio por negocio
  if (f.has("cocina_present")) cambios.cocina = f.get("cocina") === "on";
  if (f.has("precio_mensual")) {
    const t = String(f.get("precio_mensual") || "").replace(/[^0-9.]/g, "");
    cambios.precio_mensual = t ? Math.max(0, Number(t) || 0) : null;
  }
  if (slug !== n.slug && slug.length >= 3 && !SLUGS_RESERVADOS.has(slug)) cambios.slug = slug;
  await sb.from("businesses").update(cambios).eq("id", id);
  revalidatePath(`/admin/${id}`);
  revalidatePath(`/${n.slug}`);
}

export async function cancelarCobro(f: FormData) {
  const { sb, id, n } = await negocio(f);
  if (n.mp_preapproval_id) {
    try { await cancelarPreapproval(n.mp_preapproval_id); } catch (e) { console.error(e); }
    await sb.from("businesses").update({ mp_preapproval_id: null }).eq("id", id);
  }
  revalidatePath(`/admin/${id}`);
}

// Si el dueño no puede entrar: enlace de acceso de un solo uso (no cambia ni revela su contraseña).
// Al entrar le aparece el aviso para elegir una contraseña nueva.
export async function nuevaClave(_: ResultadoAlta | null, f: FormData): Promise<ResultadoAlta> {
  const { sb, n } = await negocio(f);
  if (!n.owner_id || !n.owner_email) return { ok: false, mensaje: "Este negocio no tiene dueño." };
  await sb.auth.admin.updateUserById(n.owner_id, { user_metadata: { clave_cambiada: false } });
  const enlace = await enlaceEntrada(sb, n.owner_email);
  if (!enlace) return { ok: false, mensaje: "No se pudo crear el enlace. Intenta otra vez." };
  const salio = await mandarAcceso(n.owner_email, n.name, enlace);
  return {
    ok: true, mensaje: avisoEnvio(n.owner_email, salio), whatsapp: n.whatsapp, enlace,
    texto: `Toca este enlace para entrar a tu panel de Pidewat y elegir una contraseña nueva (sirve una sola vez y vence en 1 hora):\n${enlace}`,
  };
}

// Carga un menú completo pegado como texto (Claude lo saca de la foto del menú del cliente):
//   # Categoría
//   Nombre | precio | descripción (opcional)
export async function importarMenu(_: ResultadoAlta | null, f: FormData): Promise<ResultadoAlta> {
  const { sb, id, n } = await negocio(f);
  const lineas = String(f.get("texto") || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const reemplazar = f.get("reemplazar") === "on";
  if (reemplazar) {
    await sb.from("products").delete().eq("business_id", id);
    await sb.from("categories").delete().eq("business_id", id);
  }
  const { data: actuales } = await sb.from("categories").select("id, name, position").eq("business_id", id);
  const cats = new Map((actuales || []).map((c) => [c.name.toLowerCase(), c.id as string]));
  let posCat = (actuales || []).reduce((m, c) => Math.max(m, c.position), 0);
  let catActual: string | null = null;
  const productos: Record<string, unknown>[] = [];
  const errores: string[] = [];

  for (const l of lineas) {
    if (l.startsWith("#")) {
      const nombre = l.replace(/^#+/, "").trim();
      if (!nombre) continue;
      const k = nombre.toLowerCase();
      if (!cats.has(k)) {
        const { data } = await sb.from("categories").insert({ business_id: id, name: nombre, position: ++posCat }).select("id").single();
        if (data) cats.set(k, data.id);
      }
      catActual = cats.get(k) || null;
      continue;
    }
    const [nombre, precio, ...desc] = l.split("|").map((x) => x.trim());
    const price = Number((precio || "").replace(/[^0-9.]/g, ""));
    if (!nombre || !Number.isFinite(price) || !precio) { errores.push(l); continue; }
    productos.push({ business_id: id, category_id: catActual, name: nombre.slice(0, 120), price, description: desc.join(" | ") || null, position: productos.length });
  }
  if (productos.length) {
    const { error } = await sb.from("products").insert(productos);
    if (error) return { ok: false, mensaje: error.message };
  }
  revalidatePath(`/admin/${id}`);
  revalidatePath(`/${n.slug}`);
  return {
    ok: true,
    mensaje: `Se cargaron ${productos.length} productos.${errores.length ? ` No se entendieron ${errores.length} líneas: ${errores.slice(0, 5).join(" · ")}` : ""}`,
  };
}
