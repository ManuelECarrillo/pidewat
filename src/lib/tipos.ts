import type { Horario } from "./horario";

export type Negocio = {
  id: string;
  slug: string;
  name: string;
  whatsapp: string;
  description: string | null;
  address: string | null;
  hours: string | null;
  horario: Horario | null;
  logo_url: string | null;
  cover_url: string | null;
  color: string;
  mode: "menu" | "catalogo";
  accepts_table: boolean;
  accepts_pickup: boolean;
  accepts_delivery: boolean;
  delivery_fee: number;
  delivery_note: string | null;
  plan: "base" | "plus";
  trial_ends_at: string;
  paid_until: string | null;
  paused: boolean;
};

export type NegocioCompleto = Negocio & {
  owner_id: string | null;
  owner_email: string | null;
  mp_preapproval_id: string | null;
  notes: string | null;
  created_at: string;
};

export type Categoria = { id: string; business_id: string; name: string; position: number };

export type Producto = {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  position: number;
};

// Lo que sale en el menú público. Plan, prueba y pagos no: el público no tiene por qué saber quién paga.
export type NegocioMenu = Omit<Negocio, "plan" | "trial_ends_at" | "paid_until" | "paused">;
export const COLUMNAS_MENU =
  "id, slug, name, whatsapp, description, address, hours, logo_url, cover_url, color, mode, accepts_table, accepts_pickup, accepts_delivery, delivery_fee, delivery_note, horario";
