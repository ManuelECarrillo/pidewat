import AvisoEstado, { pillEstado } from "@/components/AvisoEstado";
import BotonEnviar from "@/components/BotonEnviar";
import { estadoNegocio } from "@/lib/estado";
import { dinero, fecha } from "@/lib/formato";
import { mpConfigurado } from "@/lib/mercadopago";
import { PLANES } from "@/lib/planes";
import { requiereDueno } from "@/lib/sesion";
import { irAPagar } from "./acciones";

export default async function PanelPlan({ searchParams }: { searchParams: Promise<{ mp?: string }> }) {
  const { sb, negocio, user } = await requiereDueno();
  const { mp } = await searchParams;
  const estado = estadoNegocio(negocio);
  const { data: pagos } = await sb.from("payments").select("*").eq("business_id", negocio.id).order("created_at", { ascending: false }).limit(24);
  const ventas = process.env.NEXT_PUBLIC_PIDEWA_WHATSAPP;
  const textoTransfer = encodeURIComponent(`Hola, quiero pagar Pidewa para ${negocio.name} por transferencia.`);

  return (
    <div className="stack" style={{ maxWidth: 720 }}>
      <div className="row between wrap-flex">
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Mi plan</h1>
        {pillEstado(estado)}
      </div>
      {mp === "ok" && <div className="alerta alerta-ok">¡Gracias! En cuanto Mercado Pago confirme el pago, tu plan se actualiza solo (tarda unos minutos).</div>}
      {mp === "pendiente" && <div className="alerta">Tu pago está pendiente. Si pagaste en OXXO, se acredita en unas horas.</div>}
      {mp === "error" && <div className="alerta alerta-bad">No se pudo abrir Mercado Pago. Intenta de nuevo o escríbenos.</div>}
      <AvisoEstado estado={estado} />
      {negocio.mp_preapproval_id && <div className="alerta alerta-ok">Tienes el cobro automático mensual activo con Mercado Pago.</div>}

      {mpConfigurado() ? (
        <div className="grid2">
          {(["base", "plus"] as const).map((plan) => (
            <div className="card" key={plan}>
              <div className="row between"><strong>Plan {PLANES[plan].nombre}</strong>{negocio.plan === plan && <span className="pill">Tu plan</span>}</div>
              <div className="kpi">{dinero(PLANES[plan].mensual)}<span className="small muted"> /mes</span></div>
              <p className="small muted">{plan === "base" ? "Todo para recibir pedidos por WhatsApp." : "Todo lo del Base + lo que más te piden."}</p>
              <form action={irAPagar}>
                <input type="hidden" name="plan" value={plan} />
                <label className="f small">Correo de tu cuenta de Mercado Pago
                  <input className="i" type="email" name="correo" required defaultValue={user.email || ""} />
                </label>
                <div className="stack">
                  <BotonEnviar className="btn btn-p btn-block">Pagar {dinero(PLANES[plan].mensual)} al mes (automático)</BotonEnviar>
                </div>
              </form>
              <form action={irAPagar} style={{ marginTop: 8 }}>
                <input type="hidden" name="plan" value={plan} />
                <input type="hidden" name="ciclo" value="anual" />
                <BotonEnviar className="btn btn-block">Pagar un año: {dinero(PLANES[plan].anual)}</BotonEnviar>
              </form>
            </div>
          ))}
        </div>
      ) : null}

      <div className="card">
        <h3>¿Prefieres transferencia o efectivo?</h3>
        <p className="small muted">Escríbenos y te pasamos los datos. Activamos tu plan en cuanto llegue el pago.</p>
        {ventas && <a className="btn btn-wa" href={`https://wa.me/${ventas}?text=${textoTransfer}`}>Pagar por transferencia</a>}
      </div>

      {pagos && pagos.length > 0 && (
        <div className="card scroll-x">
          <h3>Mis pagos</h3>
          <table className="t">
            <thead><tr><th>Fecha</th><th>Monto</th><th>Meses</th><th>Forma</th></tr></thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}><td>{fecha(p.created_at)}</td><td>{dinero(Number(p.amount))}</td><td>{p.months}</td><td>{p.method}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
