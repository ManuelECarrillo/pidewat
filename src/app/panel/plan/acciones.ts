"use server";

import { redirect } from "next/navigation";
import { crearPagoAnual, crearSuscripcion } from "@/lib/mercadopago";
import { precioDe } from "@/lib/planes";
import { requiereDueno } from "@/lib/sesion";

export async function irAPagar(f: FormData) {
  const { negocio, user } = await requiereDueno();
  const plan = f.get("plan") === "plus" ? "plus" : "base";
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
