"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requiereDueno } from "@/lib/sesion";
import { normalizarWhatsapp } from "@/lib/formato";
import type { ResultadoAlta } from "@/app/admin/acciones";

const txt = (f: FormData, k: string, max = 300) => String(f.get(k) ?? "").trim().slice(0, max) || null;
const num = (f: FormData, k: string) => Math.max(0, Number(String(f.get(k) ?? "0").replace(/[^0-9.]/g, "")) || 0);
const si = (f: FormData, k: string) => f.get(k) === "on";

function refrescar(slug: string) {
  revalidatePath(`/${slug}`);
  revalidatePath("/panel", "layout");
}

// SEG-008: solo enlaces https (nada de "javascript:" ni "data:") en fotos y logos
const imagen = (f: FormData, k: string) => {
  const url = txt(f, k, 500);
  return url && /^https:\/\//i.test(url) ? url : null;
};

export async function guardarProducto(f: FormData) {
  const { sb, negocio } = await requiereDueno();
  const id = txt(f, "id", 40);
  // SEG-008: la categoría tiene que ser de este negocio; si no, el platillo queda en "Otros"
  let category_id = txt(f, "category_id", 40);
  if (category_id) {
    const { data: cat } = await sb.from("categories").select("id").eq("id", category_id).eq("business_id", negocio.id).maybeSingle();
    if (!cat) category_id = null;
  }
  const datos = {
    business_id: negocio.id,
    name: txt(f, "name", 120) || "Sin nombre",
    description: txt(f, "description", 400),
    price: num(f, "price"),
    category_id,
    image_url: imagen(f, "image_url"),
    available: !f.has("available_present") || si(f, "available"),
  };
  if (id) await sb.from("products").update(datos).eq("id", id).eq("business_id", negocio.id);
  else await sb.from("products").insert({ ...datos, position: Date.now() % 1_000_000_000 });
  refrescar(negocio.slug);
}

export async function alternarAgotado(f: FormData) {
  const { sb, negocio } = await requiereDueno();
  await sb.from("products").update({ available: f.get("available") === "true" }).eq("id", String(f.get("id"))).eq("business_id", negocio.id);
  refrescar(negocio.slug);
}

export async function borrarProducto(f: FormData) {
  const { sb, negocio } = await requiereDueno();
  await sb.from("products").delete().eq("id", String(f.get("id"))).eq("business_id", negocio.id);
  refrescar(negocio.slug);
}

export async function guardarCategoria(f: FormData) {
  const { sb, negocio } = await requiereDueno();
  const id = txt(f, "id", 40);
  const name = txt(f, "name", 60);
  if (!name) return;
  const position = Number(f.get("position")) || 0;
  if (id) await sb.from("categories").update({ name, position }).eq("id", id).eq("business_id", negocio.id);
  else await sb.from("categories").insert({ business_id: negocio.id, name, position });
  refrescar(negocio.slug);
}

export async function borrarCategoria(f: FormData) {
  const { sb, negocio } = await requiereDueno();
  await sb.from("categories").delete().eq("id", String(f.get("id"))).eq("business_id", negocio.id);
  refrescar(negocio.slug);
}

export async function guardarNegocio(f: FormData) {
  const { sb, negocio } = await requiereDueno();
  const whatsapp = normalizarWhatsapp(String(f.get("whatsapp") ?? ""));
  if (!/^[0-9]{10,15}$/.test(whatsapp)) redirect("/panel/negocio?error=whatsapp");
  const color = String(f.get("color") ?? "");
  await sb.from("businesses").update({
    name: txt(f, "name", 80) || negocio.name,
    whatsapp,
    description: txt(f, "description", 300),
    address: txt(f, "address", 200),
    hours: txt(f, "hours", 200),
    logo_url: imagen(f, "logo_url"),
    cover_url: imagen(f, "cover_url"),
    color: /^#[0-9a-f]{6}$/i.test(color) ? color : negocio.color,
    mode: f.get("mode") === "catalogo" ? "catalogo" : "menu",
    accepts_table: si(f, "accepts_table"),
    accepts_pickup: si(f, "accepts_pickup"),
    accepts_delivery: si(f, "accepts_delivery"),
    delivery_fee: num(f, "delivery_fee"),
    delivery_note: txt(f, "delivery_note", 200),
  }).eq("id", negocio.id);
  refrescar(negocio.slug);
  redirect("/panel/negocio?ok=1");
}

// El dueño cambia la contraseña que le mandamos por WhatsApp (así deja de servir si alguien ve ese chat).
export async function cambiarClave(_: ResultadoAlta | null, f: FormData): Promise<ResultadoAlta> {
  const { sb } = await requiereDueno();
  const clave = String(f.get("clave") ?? "");
  if (clave.length < 8) return { ok: false, mensaje: "Usa al menos 8 letras o números." };
  if (clave !== String(f.get("clave2") ?? "")) return { ok: false, mensaje: "Las dos contraseñas no son iguales." };
  const { error } = await sb.auth.updateUser({ password: clave });
  if (error) return { ok: false, mensaje: "No se pudo cambiar. Intenta con otra contraseña o escríbenos por WhatsApp." };
  return { ok: true, mensaje: "Listo, tu contraseña cambió. Úsala la próxima vez que entres." };
}
