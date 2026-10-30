const pesos = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const dinero = (n: number) => pesos.format(n);

export const fecha = (iso: string | Date) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Mexico_City" });

export function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// Acepta "618 123 4567", "+52 1 618...", etc. y deja solo dígitos con lada 52.
export function normalizarWhatsapp(texto: string) {
  const d = texto.replace(/\D/g, "");
  if (d.length === 10) return "52" + d;
  return d;
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
