import Link from "next/link";
import AvisoEstado, { pillEstado } from "@/components/AvisoEstado";
import { precioDe } from "@/lib/planes";
import InstalarApp from "@/components/InstalarApp";
import CompartirLink from "@/components/CompartirLink";
import BotonEnviar from "@/components/BotonEnviar";
import FormularioConAviso from "@/components/FormularioConAviso";
import { estadoNegocio } from "@/lib/estado";
import { siteUrl } from "@/lib/formato";
import { requiereDueno } from "@/lib/sesion";
import { guardarProducto } from "./acciones";

export default async function Panel() {
  const { sb, negocio } = await requiereDueno();
  const estado = estadoNegocio(negocio);
  const hace30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const hace7 = Date.now() - 7 * 86_400_000;

  const [{ data: pedidos }, { count: productos }, { data: mesa }] = await Promise.all([
    sb.from("order_events").select("total, items, created_at").eq("business_id", negocio.id).gte("created_at", hace30).order("created_at", { ascending: false }).limit(2000),
    sb.from("products").select("id", { count: "exact", head: true }).eq("business_id", negocio.id),
    negocio.cocina
      ? sb.from("orders").select("total, items, created_at").eq("business_id", negocio.id).neq("estado", "cancelado").gte("created_at", hace30).limit(2000)
      : Promise.resolve({ data: [] as { total: number; items: unknown; created_at: string }[] }),
  ]);
  const pedidosWhatsapp = pedidos || [];
  const pedidosMesa = mesa || [];
  const lista = [...pedidosWhatsapp, ...pedidosMesa];
  const semana = pedidosWhatsapp.filter((p) => new Date(p.created_at).getTime() > hace7);

  const conteo = new Map<string, number>();
  for (const p of lista) for (const l of (p.items as { nombre: string; cantidad: number }[]) || []) conteo.set(l.nombre, (conteo.get(l.nombre) || 0) + l.cantidad);
  const top = [...conteo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="stack">
      <div className="row between wrap-flex">
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{negocio.name}</h1>
        {pillEstado(estado)}
      </div>
      <AvisoEstado estado={estado} precio={precioDe(negocio).mensual} />
      <InstalarApp />

      {!productos && (
        <div className="alerta">
          Tu menú está vacío. <Link href="/panel/menu"><strong>Agrega tus primeros platillos</strong></Link>.
        </div>
      )}

      <section className="card acciones-diarias" aria-labelledby="acciones-diarias">
        <div>
          <h2 id="acciones-diarias">Acciones diarias</h2>
          <p className="small muted">Agrega un platillo sin crear una categoría primero.</p>
        </div>
        <FormularioConAviso accion={guardarProducto} className="alta-rapida" exito="Platillo agregado.">
          <label className="f">Nombre del platillo
            <input className="i" name="name" required placeholder="Ej. Hamburguesa clásica" />
          </label>
          <label className="f">Precio
            <input className="i" name="price" inputMode="decimal" required placeholder="0" />
          </label>
          <BotonEnviar>Agregar platillo</BotonEnviar>
        </FormularioConAviso>
        <div className="acciones-diarias-enlaces">
          <Link className="btn" href="/panel/menu#precios">Cambiar precio</Link>
          <Link className="btn" href="/panel/menu#disponibilidad">Marcar agotado</Link>
          <Link className="btn" href="/panel/menu#agregar">Agregar detalles o foto</Link>
        </div>
      </section>

      <div className="grid2">
        <CompartirLink url={`${siteUrl()}/${negocio.slug}`} nombre={negocio.name} color={negocio.color} />
        <div className="card">
          <h3>Pedidos enviados a tu WhatsApp <span className="small muted">(sin confirmar)</span></h3>
          <div className="row" style={{ gap: 24 }}>
            <div><div className="kpi">{semana.length}</div><div className="small muted">últimos 7 días</div></div>
            <div><div className="kpi">{pedidosWhatsapp.length}</div><div className="small muted">últimos 30 días</div></div>
          </div>
          {negocio.cocina && <p className="small muted" style={{ marginTop: 8 }}>{pedidosMesa.length} pedidos de mesa no cancelados en los últimos 30 días.</p>}
          {top.length > 0 && (
            <>
              <h4 style={{ margin: "12px 0 6px" }}>Lo que más aparece en pedidos</h4>
              <ol style={{ margin: 0, paddingLeft: 20 }}>{top.map(([n, c]) => <li key={n}>{n} <span className="muted">({c})</span></li>)}</ol>
            </>
          )}
          <p className="small muted" style={{ marginBottom: 0 }}>Cada pedido por WhatsApp cuenta cuando el cliente toca “Enviar pedido por WhatsApp”; no confirma que lo haya enviado ni pagado.</p>
        </div>
      </div>
    </div>
  );
}
