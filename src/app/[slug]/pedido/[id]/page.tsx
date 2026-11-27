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
    <main style={{ ["--c" as string]: n.color }}>
      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 40 }}>
        <p className="muted" style={{ margin: 0 }}>{n.name}</p>
        <EstadoPedido id={o.id} numero={o.numero} mesa={o.mesa} estadoInicial={o.estado} />
        <section className="card" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: "1.05rem" }}>Lo que pediste</h2>
          {items.map((l, i) => (
            <div key={i} className="row between" style={{ padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
              <div className="grow">
                <div>{l.cantidad} × {l.nombre}</div>
                {l.nota && <div className="small muted">{l.nota}</div>}
              </div>
              <span>{dinero(l.cantidad * l.precio)}</span>
            </div>
          ))}
          {o.notas && <p className="small muted" style={{ margin: "8px 0 0" }}>📝 {o.notas}</p>}
          <div className="row between" style={{ fontWeight: 800, marginTop: 10 }}><span>Total</span><span>{dinero(Number(o.total))}</span></div>
          <p className="small muted" style={{ margin: "6px 0 0" }}>Pagas en el local, como siempre.</p>
        </section>
        <div className="row wrap-flex" style={{ marginTop: 16 }}>
          <a className="btn" href={`/${n.slug}?mesa=${encodeURIComponent(o.mesa || "")}`}>Pedir algo más</a>
          <a className="btn" href={`https://wa.me/${n.whatsapp}`}>Escribir al negocio</a>
        </div>
      </div>
    </main>
  );
}
