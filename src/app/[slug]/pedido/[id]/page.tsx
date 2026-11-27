import { notFound } from "next/navigation";
import EstadoPedido from "@/components/EstadoPedido";
import { dinero } from "@/lib/formato";
import { UUID } from "@/lib/lineasServidor";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tu pedido", robots: { index: false } };

type Linea = { nombre: string; cantidad: number; precio: number; nota?: string };

export default async function PaginaPedido({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  if (!UUID.test(id)) notFound();
  const sb = supabaseAdmin();
  const { data: o } = await sb.from("orders").select("id, business_id, numero, mesa, nombre, notas, items, total, estado").eq("id", id).maybeSingle();
  if (!o) notFound();
  const { data: n } = await sb.from("businesses").select("slug, name, color, whatsapp").eq("id", o.business_id).maybeSingle();
  if (!n || n.slug !== slug) notFound();
  const items = (o.items || []) as Linea[];

  return (
    <main className="pedido-seguimiento" style={{ ["--c" as string]: n.color }}>
      <div className="wrap pedido-wrap">
        <header className="pedido-local">
          <p>Seguimiento de tu pedido</p>
          <strong>{n.name}</strong>
        </header>

        <EstadoPedido id={o.id} numero={o.numero} mesa={o.mesa} estadoInicial={o.estado} />

        <section className="card pedido-detalle" aria-labelledby="detalle-titulo">
          <div className="pedido-detalle-cabecera">
            <div>
              <p className="pedido-sobretitulo">Resumen</p>
              <h2 id="detalle-titulo">Lo que pediste</h2>
            </div>
            <span>{items.length} {items.length === 1 ? "artículo" : "artículos"}</span>
          </div>

          <div className="pedido-lineas">
            {items.map((l, i) => (
              <article key={i} className="pedido-linea">
                <div className="pedido-linea-descripcion">
                  <span className="pedido-cantidad">{l.cantidad}×</span>
                  <div>
                    <strong>{l.nombre}</strong>
                    {l.nota && <p>{l.nota}</p>}
                  </div>
                </div>
                <strong className="pedido-subtotal">{dinero(l.cantidad * l.precio)}</strong>
              </article>
            ))}
          </div>

          {o.notas && <p className="pedido-nota"><span aria-hidden="true">Nota</span>{o.notas}</p>}
          <div className="pedido-total"><span>Total</span><strong>{dinero(Number(o.total))}</strong></div>
          <p className="pedido-pago">Pagas en el local, como siempre.</p>
        </section>

        <nav className="pedido-acciones" aria-label="Acciones del pedido">
          <a className="btn btn-p" href={`/${n.slug}?mesa=${encodeURIComponent(o.mesa || "")}`}>Pedir algo más</a>
          <a className="btn" href={`https://wa.me/${n.whatsapp}`}>Escribir al negocio</a>
        </nav>
      </div>
    </main>
  );
}
