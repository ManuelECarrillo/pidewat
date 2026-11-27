import Link from "next/link";
import BotonEnviar from "@/components/BotonEnviar";
import { fecha } from "@/lib/formato";
import { requiereAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cambiarSolicitud } from "./acciones";

export const dynamic = "force-dynamic";
export const metadata = { title: "Embudo de la landing" };

type Solicitud = { id: string; creado: string; negocio: string; nombre: string; whatsapp: string; giro: string | null; ciudad: string | null; plan: string; estado: string; business_id: string | null; utm: Record<string, string> };

const ETAPAS = [
  ["landing_visita", "Visitas a la landing"],
  ["ver_demo", "Clic en ver demostración"],
  ["demo_interaccion", "Usaron la demo"],
  ["probar_click", "Clic en probar gratis"],
  ["registro_inicio", "Abrieron el registro"],
] as const;

// Embudo de los últimos 30 días. Un registro es una SOLICITUD gratis, no una venta: los pagos se cuentan aparte.
export default async function Embudo({ searchParams }: { searchParams: Promise<{ campana?: string }> }) {
  await requiereAdmin();
  const { campana } = await searchParams;
  const sb = supabaseAdmin();
  const desde = new Date(Date.now() - 30 * 86_400_000).toISOString();
  let qe = sb.from("eventos_landing").select("evento, utm_campaign").gte("creado", desde).limit(100000);
  if (campana) qe = qe.eq("utm_campaign", campana);
  const [{ data: eventos }, { data: sols }] = await Promise.all([
    qe,
    sb.from("solicitudes").select("*").gte("creado", desde).order("creado", { ascending: false }).limit(500),
  ]);
  const solicitudes = ((sols || []) as Solicitud[]).filter((s) => !campana || s.utm?.utm_campaign === campana);
  const cuenta = (e: string) => (eventos || []).filter((x) => x.evento === e).length;
  const pruebas = solicitudes.filter((s) => s.estado === "prueba" && s.business_id);
  const ligados = pruebas.map((s) => s.business_id) as string[];
  const vacio = Promise.resolve({ data: [] as never[] });
  const [{ data: negocios }, { data: productos }, { data: wa }, { data: mesa }, { data: pagos }] = await Promise.all([
    ligados.length ? sb.from("businesses").select("id, owner_id, trial_ends_at, paid_until").in("id", ligados) : vacio,
    ligados.length ? sb.from("products").select("business_id").in("business_id", ligados) : vacio,
    ligados.length ? sb.from("order_events").select("business_id").in("business_id", ligados) : vacio,
    ligados.length ? sb.from("orders").select("business_id").in("business_id", ligados).neq("estado", "cancelado") : vacio,
    ligados.length ? sb.from("payments").select("business_id").in("business_id", ligados) : vacio,
  ]);
  const ns = (negocios || []) as { id: string; owner_id: string; trial_ends_at: string; paid_until: string | null }[];
  // Correo confirmado: se lee de Auth (solo dueños de estas pruebas)
  const confirmados = new Set<string>();
  await Promise.all(ns.map(async (n) => {
    const { data } = await sb.auth.admin.getUserById(n.owner_id);
    if (data?.user?.email_confirmed_at) confirmados.add(n.id);
  }));
  const contar = (xs: { business_id: string }[] | null) => { const m = new Map<string, number>(); for (const x of xs || []) m.set(x.business_id, (m.get(x.business_id) || 0) + 1); return m; };
  const porProductos = contar(productos as { business_id: string }[]);
  const porPedidos = contar([...((wa || []) as { business_id: string }[]), ...((mesa || []) as { business_id: string }[])]);
  const ahora = Date.now();
  const activos = ns.filter((n) => new Date(n.trial_ends_at).getTime() > ahora).length;
  const configurados = ligados.filter((id) => (porProductos.get(id) || 0) >= 3).length;
  const usoReal = ligados.filter((id) => (porPedidos.get(id) || 0) >= 1).length;
  const pagaron = new Set(((pagos || []) as { business_id: string }[]).map((p) => p.business_id)).size;
  const campanas = [...new Set((eventos || []).map((e) => e.utm_campaign).filter(Boolean))] as string[];

  const filas: [string, number][] = [
    ...ETAPAS.map(([k, t]) => [t, cuenta(k)] as [string, number]),
    ["Se registraron (cuenta + negocio creados)", pruebas.length],
    ["Confirmaron su correo", confirmados.size],
    ["Prueba vigente hoy", activos],
    ["Menú configurado (3+ platillos)", configurados],
    ["Uso real (recibieron al menos 1 pedido)", usoReal],
    ["Pagaron una mensualidad", pagaron],
    ["Solicitudes de demostración (Restaurante)", solicitudes.filter((s) => s.plan === "restaurante").length],
  ];
  const base = filas[0][1] || 1;

  return (
    <div className="stack" style={{ maxWidth: 900 }}>
      <div className="row between wrap-flex">
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Embudo de la landing · 30 días</h1>
        <Link href="/admin" className="btn btn-sm">Volver</Link>
      </div>
      {campanas.length > 0 && (
        <div className="row wrap-flex small">
          <span className="muted">Campaña:</span>
          <Link href="/admin/embudo" className={`btn btn-sm ${campana ? "" : "btn-p"}`}>Todas</Link>
          {campanas.map((c) => <Link key={c} href={`/admin/embudo?campana=${encodeURIComponent(c)}`} className={`btn btn-sm ${campana === c ? "btn-p" : ""}`}>{c}</Link>)}
        </div>
      )}
      <div className="card scroll-x">
        <table className="t">
          <thead><tr><th>Paso</th><th>Total</th><th>% de visitas</th></tr></thead>
          <tbody>{filas.map(([t, n]) => <tr key={t}><td>{t}</td><td>{n}</td><td>{((n / base) * 100).toFixed(1)} %</td></tr>)}</tbody>
        </table>
        <p className="small muted" style={{ margin: "8px 0 0" }}>Visitas y clics se cuentan sin cookies. Registrarse es gratis: no es una venta. «Uso real» cuenta pedidos enviados a WhatsApp o de mesa, no dinero cobrado.</p>
      </div>
      <div className="card scroll-x">
        <h3>Solicitudes</h3>
        {!solicitudes.length && <p className="muted small">Todavía no hay solicitudes.</p>}
        {solicitudes.map((s) => (
          <div key={s.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
            <div className="row between wrap-flex">
              <strong>{s.negocio}</strong>
              <span className="pill">{s.estado}{s.plan === "restaurante" ? " · Restaurante" : ""}</span>
            </div>
            <div className="small muted">{s.nombre} · {[s.giro, s.ciudad].filter(Boolean).join(" · ")} · {fecha(s.creado)}{s.utm?.utm_campaign ? ` · ${s.utm.utm_campaign}` : ""}</div>
            <div className="row wrap-flex" style={{ marginTop: 8 }}>
              <a className="btn btn-sm btn-wa" href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(`Hola ${s.nombre}, soy de Pidewat. Recibimos tu solicitud de prueba para ${s.negocio}. ¿Me mandas una foto de tu menú para dejarlo listo?`)}`}>WhatsApp</a>
              {s.estado === "nueva" && <form action={cambiarSolicitud}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="estado" value="contactada" /><BotonEnviar className="btn btn-sm">Ya le escribí</BotonEnviar></form>}
              {s.estado !== "prueba" && (
                <form action={cambiarSolicitud} className="row">
                  <input type="hidden" name="id" value={s.id} /><input type="hidden" name="estado" value="prueba" />
                  <input className="i" name="slug" placeholder="link del negocio creado" style={{ marginTop: 0, width: 170 }} />
                  <BotonEnviar className="btn btn-sm btn-p">Prueba activada</BotonEnviar>
                </form>
              )}
              {s.estado !== "descartada" && <form action={cambiarSolicitud}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="estado" value="descartada" /><BotonEnviar className="btn btn-sm" confirmar={`¿Descartar la solicitud de ${s.negocio}?`}>Descartar</BotonEnviar></form>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
