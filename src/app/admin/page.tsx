import Link from "next/link";
import { pillEstado } from "@/components/AvisoEstado";
import FormConResultado from "@/components/FormConResultado";
import { estadoNegocio } from "@/lib/estado";
import { dinero, fecha } from "@/lib/formato";
import { PLANES } from "@/lib/planes";
import { requiereAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { NegocioCompleto } from "@/lib/tipos";
import { altaNegocio } from "./acciones";
import Selector from "@/components/Selector";

export default async function Admin() {
  await requiereAdmin();
  const sb = supabaseAdmin();
  const { data } = await sb.from("businesses").select("*").order("created_at", { ascending: false });
  const negocios = ((data || []) as NegocioCompleto[]).map((n) => ({ n, e: estadoNegocio(n) }));
  const hace30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data: pedidos } = await sb.from("order_events").select("business_id").gte("created_at", hace30).limit(50000);
  const pedidosPor = new Map<string, number>();
  for (const p of pedidos || []) pedidosPor.set(p.business_id, (pedidosPor.get(p.business_id) || 0) + 1);

  const activos = negocios.filter((x) => x.e.clave === "activo");
  const mrr = activos.reduce((s, x) => s + PLANES[x.n.plan].mensual, 0);
  const cuenta = (k: string) => negocios.filter((x) => x.e.clave === k).length;
  // Pruebas que vencen en 3 días o menos: toca mandar el mensaje del día 12
  const porVencer = negocios.filter((x) => x.e.clave === "prueba" && x.e.diasRestantes <= 3);

  return (
    <div className="stack">
      <div className="grid2">
        <div className="card">
          <div className="small muted">Ingreso mensual (pagando)</div>
          <div className="kpi">{dinero(mrr)}</div>
          <div className="small muted">{activos.length} pagando · {cuenta("prueba")} en prueba · {cuenta("vencido")} vencidos · {cuenta("pausado")} en pausa</div>
        </div>
        <div className="card">
          <div className="small muted">Pruebas por vencer (≤ 3 días)</div>
          {porVencer.length ? porVencer.map(({ n, e }) => (
            <div key={n.id} className="row between small" style={{ marginTop: 6 }}>
              <Link href={`/admin/${n.id}`}>{n.name}</Link>
              <a className="btn btn-sm btn-wa" target="_blank" href={`https://wa.me/${n.whatsapp}?text=${encodeURIComponent(`Hola, ¿cómo le ha ido con su menú de Pidewat? Su prueba gratis vence en ${e.clave === "prueba" ? e.diasRestantes : 0} días. Con ${dinero(PLANES.base.mensual)} al mes sigue igual. ¿Lo activamos?`)}`}>Recordar</a>
            </div>
          )) : <div className="muted small" style={{ marginTop: 6 }}>Nada por ahora.</div>}
        </div>
      </div>

      <details className="d">
        <summary>＋ Dar de alta un negocio</summary>
        <div>
          <FormConResultado action={altaNegocio} boton="Crear negocio y cuenta">
            <label className="f">Nombre del negocio<input className="i" name="name" required /></label>
            <label className="f">Link <span className="h">Opcional. Si lo dejas vacío se arma con el nombre (ej. el-fogon)</span><input className="i" name="slug" /></label>
            <label className="f">WhatsApp del negocio <span className="h">10 dígitos</span><input className="i" name="whatsapp" inputMode="tel" required /></label>
            <label className="f">Correo del dueño <span className="h">Con esto entra a su panel</span><input className="i" name="email" type="email" required /></label>
            <div className="f">Tipo
              <Selector name="mode" opciones={[{ value: "menu", label: "Restaurante (menú)" }, { value: "catalogo", label: "Tienda (catálogo)" }]} />
            </div>
          </FormConResultado>
        </div>
      </details>

      <div className="card scroll-x">
        <table className="t">
          <thead><tr><th>Negocio</th><th>Estado</th><th>Plan</th><th>Pedidos 30 d</th><th>Alta</th></tr></thead>
          <tbody>
            {negocios.map(({ n, e }) => (
              <tr key={n.id}>
                <td><Link href={`/admin/${n.id}`}><strong>{n.name}</strong></Link><div className="small muted">/{n.slug}</div></td>
                <td>{pillEstado(e)}</td>
                <td>{PLANES[n.plan].nombre}{n.mp_preapproval_id ? " · automático" : ""}</td>
                <td>{pedidosPor.get(n.id) || 0}</td>
                <td className="small">{fecha(n.created_at)}</td>
              </tr>
            ))}
            {!negocios.length && <tr><td colSpan={5} className="muted">Todavía no hay negocios.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
