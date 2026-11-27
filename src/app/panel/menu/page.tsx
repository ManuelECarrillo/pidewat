import { Acordeon, Desplegable } from "@/components/Acordeon";
import BotonEnviar from "@/components/BotonEnviar";
import Selector from "@/components/Selector";
import ImagenInput from "@/components/ImagenInput";
import OpcionesInput from "@/components/OpcionesInput";
import { dinero } from "@/lib/formato";
import { requiereDueno } from "@/lib/sesion";
import type { Categoria, Producto } from "@/lib/tipos";
import { alternarAgotado, borrarCategoria, borrarProducto, guardarCategoria, guardarProducto } from "../acciones";

function ValoresProducto({ p }: { p: Producto }) {
  return (
    <>
      <input type="hidden" name="category_id" value={p.category_id || ""} />
      <input type="hidden" name="description" value={p.description || ""} />
      <input type="hidden" name="image_url" value={p.image_url || ""} />
      <input type="hidden" name="available_present" value="1" />
      {p.available && <input type="hidden" name="available" value="on" />}
      <input type="hidden" name="ingredientes" value={(p.ingredientes || []).join(", ")} />
      <input type="hidden" name="opciones" value={JSON.stringify(p.opciones || [])} />
    </>
  );
}

function FormProducto({ p, categorias, negocioId }: { p?: Producto; categorias: Categoria[]; negocioId: string }) {
  return (
    <form action={guardarProducto}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <label className="f">Nombre
        <input className="i" name="name" required defaultValue={p?.name} placeholder="Ej. Gordita de chicharrón" />
      </label>
      <label className="f">Precio
          <input className="i" name="price" inputMode="decimal" required defaultValue={p ? String(p.price) : ""} placeholder="0" />
      </label>
      <details className="producto-avanzado">
        <summary>Agregar detalles opcionales</summary>
        <div className="producto-avanzado-cuerpo">
          <div className="f">Categoría
            <Selector name="category_id" valor={p?.category_id || ""}
              opciones={[{ value: "", label: "Sin categoría" }, ...categorias.map((c) => ({ value: c.id, label: c.name }))]} />
          </div>
          <label className="f">Descripción <span className="h">Opcional</span>
            <input className="i" name="description" defaultValue={p?.description || ""} placeholder="Ingredientes, tamaño…" />
          </label>
          <label className="f">Ingredientes que el cliente puede quitar <span className="h">Opcional. Separados por coma, ej. mostaza, mayonesa, cátsup. Al pedir, el cliente toca lo que no quiere.</span>
            <input className="i" name="ingredientes" defaultValue={(p?.ingredientes || []).join(", ")} placeholder="Ej. mostaza, mayonesa, cátsup, chile" />
          </label>
          <OpcionesInput valor={p?.opciones} />
          <ImagenInput name="image_url" negocioId={negocioId} valor={p?.image_url} />
        </div>
      </details>
      {p && <><input type="hidden" name="available_present" value="1" />{p.available && <input type="hidden" name="available" value="on" />}</>}
      <BotonEnviar>{p ? "Guardar cambios" : "Agregar"}</BotonEnviar>
    </form>
  );
}

export default async function PanelMenu({ searchParams }: { searchParams: Promise<{ bienvenida?: string }> }) {
  const { bienvenida } = await searchParams;
  const { sb, negocio } = await requiereDueno();
  const [{ data: c }, { data: p }] = await Promise.all([
    sb.from("categories").select("*").eq("business_id", negocio.id).order("position").order("name"),
    sb.from("products").select("*").eq("business_id", negocio.id).order("position").order("name"),
  ]);
  const categorias = (c || []) as Categoria[];
  const productos = (p || []) as Producto[];
  const palabra = negocio.mode === "menu" ? "platillo" : "producto";

  return (
    <Acordeon>
    <div className="stack" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 0 }}>Mi menú</h1>
      {bienvenida && (
        <div className="alerta alerta-ok" role="status">
          <strong>¡Tu cuenta está lista!</strong> Tienes 14 días gratis, sin tarjeta. Tu menú ya tiene link: <a href={`/${negocio.slug}`}>pidewat.vercel.app/{negocio.slug}</a>. Agrega tu primer {palabra} aquí abajo; en cuanto guardes uno, ya se puede pedir.
        </div>
      )}
      <p className="muted" style={{ margin: 0 }}>Empieza con nombre y precio. Categorías, fotos, tamaños y extras se agregan solo cuando los necesitas.</p>

      <section className="card" id="agregar" style={{ scrollMarginTop: 72 }}>
        <h2 style={{ fontSize: "1.15rem" }}>Agregar {palabra}</h2>
        <FormProducto categorias={categorias} negocioId={negocio.id} />
      </section>

      <section id="precios" aria-labelledby="tus-productos" style={{ scrollMarginTop: 72 }}>
        <div className="row between" style={{ margin: "4px 0 8px" }}>
          <h2 id="tus-productos" style={{ fontSize: "1.15rem", margin: 0 }}>Tus {palabra}s</h2>
          <span className="small muted">{productos.length}</span>
        </div>
        {!productos.length ? (
          <div className="alerta">Aún no tienes {palabra}s. Agrega el primero arriba: no necesitas una categoría.</div>
        ) : (
          <div className="productos-rapidos" id="disponibilidad" style={{ scrollMarginTop: 72 }}>
            {productos.map((x) => (
              <article key={x.id} className="card producto-rapido">
                <div className="row between" style={{ alignItems: "flex-start" }}>
                  <div className="grow">
                    <h3 className={x.available ? "" : "muted"} style={{ textDecoration: x.available ? undefined : "line-through" }}>{x.name}</h3>
                    <p className="small muted" style={{ margin: 0 }}>{categorias.find((cat) => cat.id === x.category_id)?.name || "Sin categoría"}</p>
                  </div>
                  <span className={`pill ${x.available ? "pill-ok" : "pill-warn"}`}>{x.available ? "Disponible" : "Agotado"}</span>
                </div>
                <div className="producto-rapido-acciones">
                  <form action={guardarProducto} className="precio-rapido">
                    <ValoresProducto p={x} />
                    <input type="hidden" name="id" value={x.id} />
                    <label className="small muted" htmlFor={`precio-${x.id}`}>Precio</label>
                    <input id={`precio-${x.id}`} className="i" name="price" inputMode="decimal" defaultValue={String(x.price)} aria-label={`Precio de ${x.name}`} />
                    <BotonEnviar className="btn">Guardar precio</BotonEnviar>
                  </form>
                  <form action={alternarAgotado}>
                    <input type="hidden" name="id" value={x.id} />
                    <input type="hidden" name="available" value={String(!x.available)} />
                    <BotonEnviar className={`btn btn-block ${x.available ? "" : "btn-p"}`}>{x.available ? "Marcar agotado" : "Marcar disponible"}</BotonEnviar>
                  </form>
                </div>
                <Desplegable id={x.id} titulo="Editar detalles, foto o extras">
                  <FormProducto p={x} categorias={categorias} negocioId={negocio.id} />
                  <form action={borrarProducto} style={{ marginTop: 10 }}>
                    <input type="hidden" name="id" value={x.id} />
                    <BotonEnviar className="btn btn-bad" confirmar={`¿Borrar “${x.name}”?`}>Borrar {palabra}</BotonEnviar>
                  </form>
                </Desplegable>
              </article>
            ))}
          </div>
        )}
      </section>

      <details className="card categorias-config">
        <summary>Organizar categorías</summary>
        <div className="categorias-config-cuerpo">
          <p className="small muted">Ej. Gorditas, Bebidas, Postres. El número decide cuál sale primero en tu menú.</p>
          {categorias.map((cat) => (
            <div key={cat.id} className="row" style={{ marginBottom: 8 }}>
              <form action={guardarCategoria} className="row grow">
                <input type="hidden" name="id" value={cat.id} />
                <input className="i" name="position" type="number" inputMode="numeric" defaultValue={cat.position} style={{ width: 56, marginTop: 0, textAlign: "center" }} aria-label={`Orden de ${cat.name}`} />
                <input className="i grow" name="name" defaultValue={cat.name} style={{ marginTop: 0, minWidth: 0 }} aria-label="Nombre" />
                <BotonEnviar className="btn">Guardar</BotonEnviar>
              </form>
              <form action={borrarCategoria}>
                <input type="hidden" name="id" value={cat.id} />
                <BotonEnviar className="btn btn-bad" confirmar={`¿Borrar la categoría “${cat.name}”? Sus ${palabra}s pasan a “Sin categoría”.`}>Quitar</BotonEnviar>
              </form>
            </div>
          ))}
          <form action={guardarCategoria} className="row wrap-flex" style={{ marginTop: 12 }}>
            <input type="hidden" name="position" value={categorias.length + 1} />
            <input className="i grow" name="name" placeholder={categorias.length ? "Otra categoría" : "Tu primera categoría, ej. Tacos"} required style={{ marginTop: 0, minWidth: 180 }} />
            <BotonEnviar className="btn btn-p">Agregar categoría</BotonEnviar>
          </form>
        </div>
      </details>
    </div>
    </Acordeon>
  );
}
