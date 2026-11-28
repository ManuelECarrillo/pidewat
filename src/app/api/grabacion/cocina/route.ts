import { NextResponse } from "next/server";
import { productosDemo } from "@/lib/demo";
import { decodificar, extraDe, limpiarOpciones, textoSeleccion } from "@/lib/opciones";

type Orden = { id: string; numero: number; tipo: string; mesa: string | null; nombre: string | null; notas: string | null; items: { nombre: string; cantidad: number; precio: number; nota?: string }[]; total: number; estado: string; created_at: string };
let ordenes: Orden[] = [];

const permitida = () => process.env.PIDEWAT_GRABACION === "1";

export async function GET() {
  if (!permitida()) return new NextResponse(null, { status: 404 });
  return NextResponse.json({ ok: true, ordenes }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!permitida()) return new NextResponse(null, { status: 404 });
  const b = await req.json().catch(() => ({}));
  if (b.id && b.estado) {
    ordenes = ordenes.map((o) => o.id === b.id ? { ...o, estado: String(b.estado) } : o);
    return NextResponse.json({ ok: true });
  }
  const items = Array.isArray(b.items) ? b.items.map((x: { id?: unknown; cantidad?: unknown; o?: unknown; sin?: unknown }) => {
    const p = productosDemo.find((producto) => producto.id === String(x.id));
    if (!p) return null;
    const grupos = limpiarOpciones(p.opciones);
    const seleccion = decodificar(String(x.o || ""), grupos);
    const nota = [textoSeleccion(grupos, seleccion), ...(Array.isArray(x.sin) && x.sin.length ? [`Sin ${x.sin.map(String).join(", ")}`] : [])].filter(Boolean).join(" · ");
    const cantidad = Math.max(1, Number(x.cantidad) || 1);
    return { nombre: p.name, cantidad, precio: Number(p.price) + extraDe(grupos, seleccion), ...(nota ? { nota } : {}) };
  }).filter(Boolean) as Orden["items"] : [];
  if (!items.length) return NextResponse.json({ ok: false }, { status: 400 });
  const id = crypto.randomUUID();
  const orden: Orden = { id, numero: 7 + ordenes.length, tipo: b.tipo === "recoger" ? "recoger" : "mesa", mesa: String(b.mesa || "7"), nombre: String(b.nombre || "Cliente demo"), notas: null, items, total: items.reduce((s, x) => s + x.cantidad * x.precio, 0), estado: "nuevo", created_at: new Date().toISOString() };
  ordenes = [...ordenes, orden];
  return NextResponse.json({ ok: true, id, numero: orden.numero });
}
