"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { extenderPago } from "@/lib/estado";
import { normalizarWhatsapp, siteUrl, slugify } from "@/lib/formato";
import { cancelarPreapproval } from "@/lib/mercadopago";
import { DIAS_PRUEBA, SLUGS_RESERVADOS } from "@/lib/planes";
import { requiereAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";

const claveNueva = () => {
  const letras = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(crypto.randomBytes(10), (b) => letras[b % letras.length]).join("");
};

export type ResultadoAlta = { ok: boolean; mensaje: string; whatsapp?: string; texto?: string };

// Alta de un negocio nuevo: crea la cuenta del dueño con contraseña y su negocio en prueba.
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

  const clave = claveNueva();
  let ownerId: string;
  const { data: creado, error } = await sb.auth.admin.createUser({ email: correo, password: clave, email_confirm: true });
  let claveTexto = clave;
  if (error) {
    // Si el dueño ya tenía cuenta (otro negocio), lo reutilizamos sin cambiarle la contraseña
    const { data: lista } = await sb.auth.admin.listUsers({ perPage: 1000 });
    const u = lista?.users.find((x) => x.email?.toLowerCase() === correo);
    if (!u) return { ok: false, mensaje: `No se pudo crear la cuenta: ${error.message}` };
    ownerId = u.id;
    claveTexto = "(la misma que ya tienes)";
  } else ownerId = creado.user.id;

  const trial = new Date(Date.now() + DIAS_PRUEBA * 86_400_000).toISOString();
  const { error: e2 } = await sb.from("businesses").insert({ name, slug, whatsapp, owner_id: ownerId, owner_email: correo, mode, trial_ends_at: trial });
  if (e2) return { ok: false, mensaje: `No se pudo crear el negocio: ${e2.message}` };

  revalidatePath("/admin");
  const texto = `¡Listo! Ya quedó tu menú de *${name}* 🎉

Tu link para clientes: ${siteUrl()}/${slug}

Tu panel para cambiar precios y platillos:
${siteUrl()}/entrar
Correo: ${correo}
Contraseña: ${claveTexto}
(Al entrar, cámbiala en "Mi negocio" por una que solo tú sepas.)

Tienes ${DIAS_PRUEBA} días gratis. Cualquier cosa me escribes por aquí.`;
  return { ok: true, mensaje: `Negocio creado: /${slug}`, whatsapp, texto };
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
  const cambios: Record<string, unknown> = { notes: String(f.get("notes") || "") || null, plan: f.get("plan") === "plus" ? "plus" : "base" };
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

export async function nuevaClave(_: ResultadoAlta | null, f: FormData): Promise<ResultadoAlta> {
  const { sb, n } = await negocio(f);
  if (!n.owner_id) return { ok: false, mensaje: "Este negocio no tiene dueño." };
  const clave = claveNueva();
  const { error } = await sb.auth.admin.updateUserById(n.owner_id, { password: clave });
  if (error) return { ok: false, mensaje: error.message };
  return {
    ok: true, mensaje: "Contraseña nueva creada.", whatsapp: n.whatsapp,
    texto: `Tu nueva contraseña de Pidewat es: ${clave}\nEntra en ${siteUrl()}/entrar con tu correo ${n.owner_email}`,
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
