"use server";

import { revalidatePath } from "next/cache";
import { requiereAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ESTADOS = new Set(["nueva", "contactada", "prueba", "descartada"]);

export async function cambiarSolicitud(f: FormData) {
  await requiereAdmin();
  const id = String(f.get("id"));
  const estado = String(f.get("estado"));
  if (!ESTADOS.has(estado)) return;
  const slug = String(f.get("slug") || "").trim();
  const cambios: Record<string, unknown> = { estado };
  // Al pasar a "prueba" se liga con el negocio que creamos, para medir menús configurados y pagos
  if (estado === "prueba" && slug) {
    const { data: n } = await supabaseAdmin().from("businesses").select("id").eq("slug", slug).maybeSingle();
    if (n) cambios.business_id = n.id;
  }
  await supabaseAdmin().from("solicitudes").update(cambios).eq("id", id);
  revalidatePath("/admin/embudo");
}
