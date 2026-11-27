"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cancelarPreapproval, crearPagoAnual, crearSuscripcion } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { precioDe } from "@/lib/planes";
import { requiereDueno } from "@/lib/sesion";

export async function irAPagar(f: FormData) {
  const { negocio, user } = await requiereDueno();
  // El plan lo decide el negocio (lo asigna el admin), no el formulario
  const plan = negocio.plan === "plus" ? "plus" : "base";
  const ciclo = f.get("ciclo") === "anual" ? "anual" : "mensual";
  const correo = String(f.get("correo") || user.email || "").trim();
  let destino: string;
  try {
    destino = ciclo === "anual"
      ? await crearPagoAnual({ negocioId: negocio.id, nombre: negocio.name, plan, correo, monto: precioDe(negocio).anual })
      : await crearSuscripcion({ negocioId: negocio.id, nombre: negocio.name, plan, correo, monto: precioDe(negocio).mensual });
  } catch (e) {
    console.error(e);
    redirect("/panel/plan?mp=error");
  }
  redirect(destino);
}

// El dueño cancela su cobro automático cuando quiera. Su menú sigue hasta la fecha que ya pagó.
export async function cancelarMiCobro() {
  const { negocio } = await requiereDueno();
  if (negocio.mp_preapproval_id) {
    try { await cancelarPreapproval(negocio.mp_preapproval_id); } catch (e) { console.error(e); redirect("/panel/plan?mp=error"); }
    // El dueño no tiene permiso de escribir esta columna: lo hace el servidor después de comprobar que es su negocio
    await supabaseAdmin().from("businesses").update({ mp_preapproval_id: null }).eq("id", negocio.id).eq("mp_preapproval_id", negocio.mp_preapproval_id);
  }
  revalidatePath("/panel/plan");
  redirect("/panel/plan?mp=cancelado");
}
