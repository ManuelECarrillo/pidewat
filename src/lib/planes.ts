export const DIAS_PRUEBA = 14;
export const DIAS_GRACIA = 7;

// 2026-11-06: precio de lista sube de $149 a $259. Los que ya pagaban 149 tienen precio_mensual = 149 en su negocio.
export const PLANES = {
  base: { nombre: "Base", mensual: 259, anual: 2590 },
  // Plus ya no se vende (2026-10-30: un solo plan). Se queda por los negocios que lo tengan guardado.
  plus: { nombre: "Base", mensual: 259, anual: 2590 },
} as const;

export type Plan = keyof typeof PLANES;

// Lo que paga este negocio: su precio propio si lo tiene (clientes fundadores), si no el de lista. El año = 10 meses.
export function precioDe(n?: { precio_mensual?: number | string | null } | null) {
  const propio = n?.precio_mensual == null ? null : Number(n.precio_mensual);
  const mensual = propio != null && propio >= 0 ? propio : PLANES.base.mensual;
  return { mensual, anual: mensual * 10 };
}

// Slugs que no se pueden usar porque chocan con rutas de la app
export const SLUGS_RESERVADOS = new Set([
  "admin", "panel", "entrar", "salir", "api", "demo", "precios", "ayuda", "terminos", "privacidad",
  "_next", "favicon.ico", "manifest.webmanifest", "robots.txt", "sitemap.xml",
]);
