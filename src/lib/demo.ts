import type { Categoria, Negocio, Producto } from "./tipos";

// Negocio de demostración (inventado) para enseñar Pidewat sin base de datos: /demo
const B = "demo";

export const negocioDemo: Negocio = {
  id: B,
  slug: "demo",
  name: "El Fogón de Durango",
  whatsapp: process.env.NEXT_PUBLIC_PIDEWAT_WHATSAPP || "5216180000000",
  description: "Gorditas, caldillo y antojitos duranguenses hechos al momento.",
  address: "Av. 20 de Noviembre 123, Centro, Durango",
  hours: "Lun a Sáb 8:00 a 17:00 · Dom 9:00 a 15:00",
  logo_url: null,
  cover_url: null,
  color: "#d9480f",
  mode: "menu",
  accepts_table: true,
  accepts_pickup: true,
  accepts_delivery: true,
  delivery_fee: 25,
  delivery_note: "Solo zona Centro y colonias cercanas.",
  plan: "base",
  trial_ends_at: "2099-01-01T00:00:00Z",
  paid_until: null,
  paused: false,
};

const cats: [string, string][] = [
  ["gorditas", "Gorditas"],
  ["platillos", "Platillos"],
  ["tacos", "Tacos"],
  ["bebidas", "Bebidas"],
  ["postres", "Postres"],
];

export const categoriasDemo: Categoria[] = cats.map(([id, name], i) => ({ id, business_id: B, name, position: i }));

const p = (category_id: string, name: string, price: number, description: string | null = null, available = true): Omit<Producto, "position" | "id"> => ({
  business_id: B, category_id, name, price, description, image_url: null, available,
});

const lista = [
  p("gorditas", "Gordita de chicharrón prensado", 28, "De maíz, hecha a mano en comal."),
  p("gorditas", "Gordita de asado rojo", 28),
  p("gorditas", "Gordita de rajas con queso", 28),
  p("gorditas", "Gordita de frijoles con queso", 24),
  p("gorditas", "Gordita de picadillo", 28, null, false),
  p("platillos", "Caldillo duranguense", 120, "Carne seca, chile pasado y papa. Con tortillas de harina."),
  p("platillos", "Asado rojo de puerco", 115, "Con arroz, frijoles y tortillas."),
  p("platillos", "Enchiladas rojas (4)", 95, "Rellenas de queso, con lechuga y crema."),
  p("platillos", "Chile relleno", 105, "De queso, capeado, en caldillo de jitomate."),
  p("tacos", "Orden de tacos de barbacoa (5)", 90),
  p("tacos", "Orden de tacos de asada (5)", 95),
  p("tacos", "Taco de tripa", 22),
  p("bebidas", "Agua fresca de horchata (1 L)", 35),
  p("bebidas", "Agua fresca de jamaica (1 L)", 35),
  p("bebidas", "Refresco de vidrio", 25),
  p("bebidas", "Café de olla", 20),
  p("postres", "Flan napolitano", 40),
  p("postres", "Arroz con leche", 35),
];

export const productosDemo: Producto[] = lista.map((x, i) => ({ ...x, id: `d${i}`, position: i }));
