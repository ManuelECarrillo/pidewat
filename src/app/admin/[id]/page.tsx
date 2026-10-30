import Link from "next/link";
import { notFound } from "next/navigation";
import { pillEstado } from "@/components/AvisoEstado";
import BotonEnviar from "@/components/BotonEnviar";
import FormConResultado from "@/components/FormConResultado";
import { estadoNegocio } from "@/lib/estado";
import { dinero, fecha, siteUrl } from "@/lib/formato";
import { PLANES } from "@/lib/planes";
import { requiereAdmin } from "@/lib/sesion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { NegocioCompleto } from "@/lib/tipos";
import { alternarPausa, cancelarCobro, extenderPrueba, guardarInterno, importarMenu, nuevaClave, registrarPago } from "../acciones";
import Selector from "@/components/Selector";

const EJEMPLO = `# Gorditas
Gordita de chicharrón | 28 | De maíz, hecha a mano
Gordita de asado | 28
# Bebidas
Agua de horchata 1 L | 35`;

export default async function AdminNegocio({ params }: { params: Promise<{ id: string }> }) {
  await requiereAdmin();
  const { id } = await params;
  const sb = supabaseAdmin();
  const { data: n } = await sb.from("businesses").select("*").eq("id", id).maybeSingle<NegocioCompleto>();
  if (!n) notFound();
  const e = estadoNegocio(n);
  const [{ data: pagos }, { count: productos }] = await Promise.all([
    sb.from("payments").select("*").eq("business_id", id).order("created_at", { ascending: false }),
    sb.from("products").select("id", { count: "exact", head: true }).eq("business_id", id),
  ]);
  const oculto = <input type="hidden" name="id" value={n.id} />;

  return (
    <div className="stack" style={{ maxWidth: 760 }}>
      <Link href="/admin" className="small">← Todos los negocios</Link>
      <div className="row between wrap-flex">
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{n.name}</h1>
        {pillEstado(e)}
      </div>
      <div className="small muted">
        <a href={`/${n.slug}`} target="_blank">{siteUrl()}/{n.slug}</a> · {n.owner_email} · WhatsApp {n.whatsapp} · {productos || 0} productos ·
        prueba hasta {fecha(n.trial_ends_at)}{n.paid_until ? ` · pagado hasta ${fecha(n.paid_until)}` : ""}
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Registrar pago manual</h3>
          <form action={registrarPago}>
            {oculto}
            <div className="row">
              <label className="f grow">Monto<input className="i" name="amount" inputMode="decimal" defaultValue={PLANES[n.plan].mensual} /></label>
              <label className="f grow">Meses<input className="i" name="months" type="number" min={1} max={24} defaultValue={1} /></label>
            </div>
            <div className="row">
              <div className="f grow">Forma
                <Selector name="method" opciones={["transferencia", "efectivo", "mercadopago", "otro"].map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) }))} />
              </div>
            </div>
            <label className="f">Nota<input className="i" name="note" /></label>
            <BotonEnviar>Registrar y extender</BotonEnviar>
          </form>
        </div>

        <div className="card stack">
          <h3>Acciones</h3>
          <form action={extenderPrueba} className="row">
            {oculto}
            <input className="i" name="dias" type="number" defaultValue={7} style={{ width: 80, marginTop: 0 }} aria-label="Días" />
            <BotonEnviar className="btn btn-sm">Extender prueba (días)</BotonEnviar>
          </form>
          <form action={alternarPausa}>
            {oculto}
            <BotonEnviar className={`btn btn-sm ${n.paused ? "btn-p" : "btn-bad"}`} confirmar={n.paused ? undefined : "¿Pausar el menú de este negocio?"}>
              {n.paused ? "Quitar pausa" : "Pausar menú"}
            </BotonEnviar>
          </form>
          {n.mp_preapproval_id && (
            <form action={cancelarCobro}>
              {oculto}
              <BotonEnviar className="btn btn-sm btn-bad" confirmar="¿Cancelar el cobro automático en Mercado Pago?">Cancelar cobro automático</BotonEnviar>
            </form>
          )}
          <FormConResultado action={nuevaClave} boton="Crear contraseña nueva">{oculto}</FormConResultado>
        </div>
      </div>

      <div className="card">
        <h3>Cargar menú desde texto</h3>
        <p className="small muted">Una categoría por línea con #, y cada producto como “Nombre | precio | descripción”. Pásale la foto del menú a Claude y pídele este formato.</p>
        <FormConResultado action={importarMenu} boton="Cargar menú">
          {oculto}
          <textarea className="i" name="texto" rows={10} placeholder={EJEMPLO} style={{ fontFamily: "ui-monospace, monospace", fontSize: ".85rem" }} />
          <label className="check" style={{ marginTop: 10 }}><input type="checkbox" name="reemplazar" /> Borrar el menú actual antes de cargar</label>
        </FormConResultado>
      </div>

      <div className="card">
        <h3>Datos internos</h3>
        <form action={guardarInterno}>
          {oculto}
          <div className="row">
            <label className="f grow">Link<input className="i" name="slug" defaultValue={n.slug} /></label>
          </div>
          <label className="f">Notas (solo las vemos nosotros)<textarea className="i" name="notes" defaultValue={n.notes || ""} /></label>
          <BotonEnviar>Guardar</BotonEnviar>
        </form>
      </div>

      <div className="card scroll-x">
        <h3>Pagos</h3>
        <table className="t">
          <thead><tr><th>Fecha</th><th>Monto</th><th>Meses</th><th>Forma</th><th>Nota</th></tr></thead>
          <tbody>
            {(pagos || []).map((p) => (
              <tr key={p.id}><td>{fecha(p.created_at)}</td><td>{dinero(Number(p.amount))}</td><td>{p.months}</td><td>{p.method}</td><td className="small">{p.note || p.mp_id || ""}</td></tr>
            ))}
            {!pagos?.length && <tr><td colSpan={5} className="muted">Sin pagos todavía.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
