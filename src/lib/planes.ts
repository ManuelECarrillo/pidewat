export const DIAS_PRUEBA = 14;
export const DIAS_GRACIA = 7;

export const PLANES = {
  base: { nombre: "Base", mensual: 149, anual: 1490 },
  // Plus ya no se vende (2026-10-30: un solo plan). Se queda por los negocios que lo tengan guardado.
  plus: { nombre: "Base", mensual: 149, anual: 1490 },
} as const;

export type Plan = keyof typeof PLANES;

// Slugs que no se pueden usar porque chocan con rutas de la app
export const SLUGS_RESERVADOS = new Set([
  "admin", "panel", "entrar", "salir", "api", "demo", "precios", "ayuda", "terminos", "privacidad",
  "_next", "favicon.ico", "manifest.webmanifest", "robots.txt", "sitemap.xml",
]);
