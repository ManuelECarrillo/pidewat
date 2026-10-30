import { DIAS_GRACIA } from "./planes";
import type { Negocio } from "./tipos";

export type Estado =
  | { clave: "prueba"; etiqueta: string; diasRestantes: number; activo: true }
  | { clave: "activo"; etiqueta: string; hasta: Date; activo: true }
  | { clave: "vencido"; etiqueta: string; diasGracia: number; activo: true }
  | { clave: "pausado"; etiqueta: string; activo: false };

const DIA = 86_400_000;

// Un negocio está en línea si sigue en prueba, si pagó, o si lleva menos de DIAS_GRACIA vencido.
// Si no, su link muestra "menú en pausa" (no se borra nada).
export function estadoNegocio(n: Pick<Negocio, "trial_ends_at" | "paid_until" | "paused">, ahora = new Date()): Estado {
  if (n.paused) return { clave: "pausado", etiqueta: "En pausa", activo: false };

  const finPrueba = new Date(n.trial_ends_at);
  const pagadoHasta = n.paid_until ? new Date(n.paid_until) : null;

  if (pagadoHasta && pagadoHasta > ahora) {
    return { clave: "activo", etiqueta: "Activo", hasta: pagadoHasta, activo: true };
  }
  if (!pagadoHasta && finPrueba > ahora) {
    const dias = Math.ceil((finPrueba.getTime() - ahora.getTime()) / DIA);
    return { clave: "prueba", etiqueta: `Prueba: ${dias} ${dias === 1 ? "día" : "días"}`, diasRestantes: dias, activo: true };
  }

  const vencio = pagadoHasta && pagadoHasta > finPrueba ? pagadoHasta : finPrueba;
  const finGracia = vencio.getTime() + DIAS_GRACIA * DIA;
  if (finGracia > ahora.getTime()) {
    const dias = Math.ceil((finGracia - ahora.getTime()) / DIA);
    return { clave: "vencido", etiqueta: `Vencido: se pausa en ${dias} ${dias === 1 ? "día" : "días"}`, diasGracia: dias, activo: true };
  }
  return { clave: "pausado", etiqueta: "En pausa por falta de pago", activo: false };
}

// Suma meses a partir de la fecha más tarde entre hoy, lo ya pagado y el fin de la prueba
// (si paga durante la prueba, no pierde los días gratis que le quedaban).
export function extenderPago(paidUntil: string | null, meses: number, finPrueba?: string | null, ahora = new Date()): string {
  const fechas = [ahora.getTime(), paidUntil ? new Date(paidUntil).getTime() : 0, finPrueba ? new Date(finPrueba).getTime() : 0];
  const d = new Date(Math.max(...fechas));
  d.setMonth(d.getMonth() + meses);
  return d.toISOString();
}
