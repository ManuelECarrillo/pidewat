import { dinero } from "./formato";

export type LineaPedido = { nombre: string; cantidad: number; precio: number; nota?: string };

export type DatosPedido = {
  negocio: string;
  modo: "menu" | "catalogo";
  lineas: LineaPedido[];
  tipo: "mesa" | "recoger" | "domicilio";
  mesa?: string;
  nombreCliente?: string;
  direccion?: string;
  notas?: string;
  envio?: number;
  link: string;
};

export function totalPedido(lineas: LineaPedido[], envio = 0) {
  return lineas.reduce((s, l) => s + l.cantidad * l.precio, 0) + envio;
}

// Arma el texto que le llega al negocio por WhatsApp, ya ordenado.
export function mensajePedido(p: DatosPedido) {
  const r: string[] = [];
  r.push(`Hola *${p.negocio}*, quiero hacer un pedido:`);
  r.push("");
  for (const l of p.lineas) {
    r.push(`• ${l.cantidad} x ${l.nombre} — ${dinero(l.cantidad * l.precio)}`);
    if (l.nota) r.push(`   _${l.nota}_`);
  }
  r.push("");
  const envio = p.tipo === "domicilio" ? p.envio || 0 : 0;
  if (envio > 0) r.push(`Envío: ${dinero(envio)}`);
  r.push(`*Total: ${dinero(totalPedido(p.lineas, envio))}*`);
  r.push("");
  if (p.tipo === "mesa") r.push(`📍 Para comer aquí${p.mesa ? `, mesa ${p.mesa}` : ""}`);
  if (p.tipo === "recoger") r.push(p.modo === "menu" ? "🥡 Paso a recoger" : "🛍️ Paso a recoger");
  if (p.tipo === "domicilio") r.push(`🛵 A domicilio: ${p.direccion || ""}`);
  if (p.nombreCliente) r.push(`👤 ${p.nombreCliente}`);
  if (p.notas) r.push(`📝 ${p.notas}`);
  r.push("");
  r.push(`_Pedido hecho en ${p.link}_`);
  return r.join("\n");
}

export const linkWhatsapp = (numero: string, texto: string) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
