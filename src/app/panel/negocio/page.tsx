import BotonEnviar from "@/components/BotonEnviar";
import ImagenInput from "@/components/ImagenInput";
import { siteUrl } from "@/lib/formato";
import { requiereDueno } from "@/lib/sesion";
import { guardarNegocio } from "../acciones";

export default async function PanelNegocio({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { negocio: n } = await requiereDueno();
  const { ok, error } = await searchParams;
  return (
    <form action={guardarNegocio} className="stack" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: "1.5rem" }}>Mi negocio</h1>
      {ok && <div className="alerta alerta-ok">Cambios guardados. Tu menú se actualiza en menos de un minuto.</div>}
      {error === "whatsapp" && <div className="alerta alerta-bad">Revisa el número de WhatsApp: 10 dígitos, ej. 618 123 4567.</div>}

      <div className="card">
        <label className="f">Nombre del negocio<input className="i" name="name" required defaultValue={n.name} /></label>
        <label className="f">WhatsApp donde recibes pedidos <span className="h">10 dígitos. Ej. 618 123 4567</span>
          <input className="i" name="whatsapp" inputMode="tel" required defaultValue={n.whatsapp.replace(/^521?/, "")} />
        </label>
        <label className="f">Descripción corta<input className="i" name="description" defaultValue={n.description || ""} placeholder="Ej. Gorditas y antojitos duranguenses" /></label>
        <label className="f">Dirección<input className="i" name="address" defaultValue={n.address || ""} /></label>
        <label className="f">Horario<input className="i" name="hours" defaultValue={n.hours || ""} placeholder="Lun a Sáb 8:00 a 17:00" /></label>
        <p className="small muted" style={{ marginBottom: 0 }}>Tu link: {siteUrl()}/{n.slug} (para cambiarlo, escríbenos).</p>
      </div>

      <div className="card">
        <h3>Imagen</h3>
        <ImagenInput name="logo_url" negocioId={n.id} valor={n.logo_url} etiqueta="Logo" />
        <ImagenInput name="cover_url" negocioId={n.id} valor={n.cover_url} etiqueta="Foto de portada" />
        <label className="f">Color principal
          <input className="i" type="color" name="color" defaultValue={n.color} style={{ width: 80, padding: 4 }} />
        </label>
        <label className="f">Tipo de negocio
          <select className="i" name="mode" defaultValue={n.mode}>
            <option value="menu">Restaurante / comida (menú y platillos)</option>
            <option value="catalogo">Tienda (catálogo y productos)</option>
          </select>
        </label>
      </div>

      <div className="card">
        <h3>¿Cómo pueden pedir?</h3>
        <label className="check"><input type="checkbox" name="accepts_table" defaultChecked={n.accepts_table} /> Para comer aquí (en mesa)</label>
        <label className="check"><input type="checkbox" name="accepts_pickup" defaultChecked={n.accepts_pickup} /> Pasan a recoger</label>
        <label className="check"><input type="checkbox" name="accepts_delivery" defaultChecked={n.accepts_delivery} /> Envío a domicilio</label>
        <label className="f">Costo de envío<input className="i" name="delivery_fee" inputMode="decimal" defaultValue={String(n.delivery_fee)} /></label>
        <label className="f">Nota de envío <span className="h">Ej. Solo colonias cercanas, envío gratis arriba de $300</span>
          <input className="i" name="delivery_note" defaultValue={n.delivery_note || ""} />
        </label>
      </div>

      <BotonEnviar className="btn btn-p btn-block">Guardar</BotonEnviar>
    </form>
  );
}
