import Link from "next/link";
import AvisoEstado, { pillEstado } from "@/components/AvisoEstado";
import CompartirLink from "@/components/CompartirLink";
import { estadoNegocio } from "@/lib/estado";
import { dinero, siteUrl } from "@/lib/formato";
import { requiereDueno } from "@/lib/sesion";

export default async function Panel() {
  const { sb, negocio } = await requiereDueno();
  const estado = estadoNegocio(negocio);
  const hace30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const hace7 = Date.now() - 7 * 86_400_000;

  const [{ data: pedidos }, { count: productos }] = await Promise.all([
    sb.from("order_events").select("total, items, created_at").eq("business_id", negocio.id).gte("created_at", hace30).order("created_at", { ascending: false }).limit(2000),
    sb.from("products").select("id", { count: "exact", head: true }).eq("business_id", negocio.id),
  ]);
  const lista = pedidos || [];
  const semana = lista.filter((p) => new Date(p.created_at).getTime() > hace7);
  const suma = (xs: typeof lista) => xs.reduce((s, p) => s + Number(p.total), 0);

  const conteo = new Map<string, number>();
  for (const p of lista) for (const l of (p.items as { nombre: string; cantidad: number }[]) || []) conteo.set(l.nombre, (conteo.get(l.nombre) || 0) + l.cantidad);
  const top = [...conteo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="stack">
      <div className="row between wrap-flex">
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{negocio.name}</h1>
        {pillEstado(estado)}
      </div>
      <AvisoEstado estado={estado} />

      {!productos && (
        <div className="alerta">
          Tu menú está vacío. <Link href="/panel/menu"><strong>Agrega tus primeros platillos</strong></Link>.
        </div>
      )}

      <div className="grid2">
        <CompartirLink url={`${siteUrl()}/${negocio.slug}`} nombre={negocio.name} color={negocio.color} />
        <div className="card">
          <h3>Pedidos por WhatsApp</h3>
          <div className="row" style={{ gap: 24 }}>
            <div><div className="kpi">{semana.length}</div><div className="small muted">últimos 7 días</div></div>
            <div><div className="kpi">{lista.length}</div><div className="small muted">últimos 30 días</div></div>
          </div>
          <p className="small muted" style={{ marginTop: 8 }}>
            {dinero(suma(lista))} en pedidos enviados en 30 días, sin pagar comisión.
          </p>
          {negocio.plan === "plus" ? (
            top.length > 0 && (
              <>
                <h4 style={{ margin: "12px 0 6px" }}>Lo que más te piden</h4>
                <ol style={{ margin: 0, paddingLeft: 20 }}>{top.map(([n, c]) => <li key={n}>{n} <span className="muted">({c})</span></li>)}</ol>
              </>
            )
          ) : (
            <p className="small muted">Con el plan Plus ves también lo que más te piden.</p>
          )}
          <p className="small muted" style={{ marginBottom: 0 }}>Cuenta cada vez que un cliente toca “Enviar pedido por WhatsApp”.</p>
        </div>
      </div>
    </div>
  );
}
