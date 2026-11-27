export const DIAS_PRUEBA = 14;
export const DIAS_GRACIA = 7;

// 2026-11-27: dos planes. En la base se siguen llamando "base" y "plus" para no tocar datos.
// Los clientes fundadores conservan su precio en precio_mensual (ej. 149).
export const PLANES = {
  base: { nombre: "Esencial", mensual: 199, anual: 1990 },
  plus: { nombre: "Restaurante", mensual: 499, anual: 4990 },
} as const;

export type Plan = keyof typeof PLANES;

// Lo que paga este negocio: su precio propio si lo tiene (clientes fundadores), si no el de lista. El año = 10 meses.
export function precioDe(n?: { precio_mensual?: number | string | null; plan?: string | null } | null) {
  const propio = n?.precio_mensual == null ? null : Number(n.precio_mensual);
  const lista = n?.plan === "plus" ? PLANES.plus.mensual : PLANES.base.mensual;
  const mensual = propio != null && propio >= 0 ? propio : lista;
  return { mensual, anual: mensual * 10 };
}

// Slugs que no se pueden usar porque chocan con rutas de la app
export const SLUGS_RESERVADOS = new Set([
  "admin", "panel", "entrar", "salir", "api", "demo", "precios", "ayuda", "terminos", "privacidad",
  "_next", "favicon.ico", "manifest.webmanifest", "robots.txt", "sitemap.xml",
]);
