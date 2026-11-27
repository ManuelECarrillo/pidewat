import AvisoEstado, { pillEstado } from "@/components/AvisoEstado";
import BotonEnviar from "@/components/BotonEnviar";
import { estadoNegocio } from "@/lib/estado";
import { dinero, fecha } from "@/lib/formato";
import { mpConfigurado } from "@/lib/mercadopago";
import { PLANES, precioDe } from "@/lib/planes";
import { requiereDueno } from "@/lib/sesion";
import { cancelarMiCobro, irAPagar } from "./acciones";

export default async function PanelPlan({ searchParams }: { searchParams: Promise<{ mp?: string }> }) {
  const { sb, negocio, user } = await requiereDueno();
  const { mp } = await searchParams;
  const estado = estadoNegocio(negocio);
  const { data: pagos } = await sb.from("payments").select("*").eq("business_id", negocio.id).order("created_at", { ascending: false }).limit(24);
  const ventas = process.env.NEXT_PUBLIC_PIDEWAT_WHATSAPP;
  const { mensual: precio, anual } = precioDe(negocio);
  const textoTransfer = encodeURIComponent(`Hola, quiero pagar Pidewat (${dinero(precio)} al mes) para ${negocio.name} por transferencia.`);
  const textoActivar = encodeURIComponent(`Hola, quiero activar Pidewat (${dinero(precio)} al mes) para ${negocio.name}. ¿Cómo pago?`);

  return (
    <div className="stack" style={{ maxWidth: 720 }}>
      <div className="row between wrap-flex">
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Mi plan</h1>
        {pillEstado(estado)}
      </div>
      {mp === "ok" && <div className="alerta alerta-ok">¡Gracias! En cuanto Mercado Pago confirme el pago, tu plan se actualiza solo (tarda unos minutos).</div>}
      {mp === "pendiente" && <div className="alerta">Tu pago está pendiente. Si pagaste en OXXO, se acredita en unas horas.</div>}
      {mp === "error" && <div className="alerta alerta-bad">No se pudo completar con Mercado Pago. Intenta de nuevo o escríbenos.</div>}
      {mp === "correo" && <div className="alerta alerta-bad">Mercado Pago no reconoció ese correo. Escribe el correo con el que entras a tu cuenta de Mercado Pago.</div>}
      {mp === "cancelado" && <div className="alerta">Cancelaste el cobro automático. Ya no se te cobrará; tu menú sigue activo hasta la fecha que ya pagaste.</div>}
      <AvisoEstado estado={estado} precio={precio} />
      {negocio.mp_preapproval_id && (
        <div className="alerta alerta-ok">
          Tienes el cobro automático mensual activo con Mercado Pago.
          <form action={cancelarMiCobro} style={{ marginTop: 8 }}>
            <BotonEnviar className="btn btn-sm" confirmar="¿Cancelar el cobro automático? Tu menú sigue activo hasta la fecha que ya pagaste.">Cancelar cobro automático</BotonEnviar>
          </form>
        </div>
      )}

      <div className="card" style={{ maxWidth: 460 }}>
        <div className="row between"><strong>Plan Pidewat</strong><span className="pill">{PLANES[negocio.plan === "plus" ? "plus" : "base"].nombre}</span></div>
        <div className="kpi" style={{ margin: "6px 0 2px" }}>{dinero(precio)}<span className="small muted" style={{ fontWeight: 600 }}> MXN al mes</span></div>
        <p className="small muted" style={{ marginTop: 0 }}>O {dinero(anual)} por un año (te ahorras 2 meses). Menú ilimitado, pedidos sin comisión, QR y fotos.</p>
        {mpConfigurado() ? (
          <>
            <form action={irAPagar}>
              <input type="hidden" name="plan" value="base" />
              <label className="f small">Correo de tu cuenta de Mercado Pago
                <input className="i" type="email" name="correo" required defaultValue={user.email || ""} aria-describedby="ayuda-correo-mp" />
                <span id="ayuda-correo-mp" className="small muted">Debe ser el mismo con el que entras a Mercado Pago.</span>
              </label>
              <BotonEnviar className="btn btn-p btn-block">Pagar {dinero(precio)} al mes (automático)</BotonEnviar>
              <p className="small muted" style={{ margin: "8px 0 0" }}>Mercado Pago te pide autorizar el cobro mensual. Nada se cobra sin tu autorización y lo cancelas aquí cuando quieras. Tu prueba gratis no pidió tarjeta.</p>
            </form>
            <form action={irAPagar} style={{ marginTop: 8 }}>
              <input type="hidden" name="plan" value="base" />
              <input type="hidden" name="ciclo" value="anual" />
              <BotonEnviar className="btn btn-block">Pagar un año: {dinero(anual)}</BotonEnviar>
            </form>
          </>
        ) : (
          ventas && <a className="btn btn-p btn-block" href={`https://wa.me/${ventas}?text=${textoActivar}`}>Activar mi plan por {dinero(precio)} al mes</a>
        )}
      </div>

      <div className="card">
        <h3>¿Prefieres transferencia o efectivo?</h3>
        <p className="small muted">Son {dinero(precio)} al mes. Escríbenos y te pasamos los datos; activamos tu plan en cuanto llegue el pago.</p>
        {ventas && <a className="btn btn-wa" href={`https://wa.me/${ventas}?text=${textoTransfer}`}>Pagar por transferencia</a>}
      </div>

      {pagos && pagos.length > 0 && (
        <section className="card">
          <h3>Mis pagos</h3>
          <div className="historial-pagos">
            {pagos.map((p) => (
              <article className="pago-historial" key={p.id}>
                <div><span className="small muted">Fecha</span><strong>{fecha(p.created_at)}</strong></div>
                <div><span className="small muted">Monto</span><strong>{dinero(Number(p.amount))}</strong></div>
                <div><span className="small muted">Meses</span><span>{p.months}</span></div>
                <div><span className="small muted">Forma</span><span>{p.method}</span></div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
