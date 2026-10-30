import BotonEnviar from "@/components/BotonEnviar";
import Selector from "@/components/Selector";
import ImagenInput from "@/components/ImagenInput";
import { dinero } from "@/lib/formato";
import { requiereDueno } from "@/lib/sesion";
import type { Categoria, Producto } from "@/lib/tipos";
import AcordeonPlatillos from "@/components/AcordeonPlatillos";
import { alternarAgotado, borrarCategoria, borrarProducto, guardarCategoria, guardarProducto } from "../acciones";

function FormProducto({ p, categorias, negocioId, catDefecto }: { p?: Producto; categorias: Categoria[]; negocioId: string; catDefecto?: string }) {
  return (
    <form action={guardarProducto} data-editar>
      {p && <input type="hidden" name="id" value={p.id} />}
      <label className="f">Nombre
        <input className="i" name="name" required defaultValue={p?.name} placeholder="Ej. Gordita de chicharrón" />
      </label>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <label className="f grow">Precio
          <input className="i" name="price" inputMode="decimal" required defaultValue={p ? String(p.price) : ""} placeholder="0" />
        </label>
        <div className="f grow">Categoría
          <Selector name="category_id" valor={p?.category_id || catDefecto || ""}
            opciones={[{ value: "", label: "Sin categoría" }, ...categorias.map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
      </div>
      <label className="f">Descripción <span className="h">Opcional</span>
        <input className="i" name="description" defaultValue={p?.description || ""} placeholder="Ingredientes, tamaño…" />
      </label>
      <ImagenInput name="image_url" negocioId={negocioId} valor={p?.image_url} />
      <input type="hidden" name="available_present" value="1" />
      <label className="check"><input type="checkbox" name="available" defaultChecked={p ? p.available : true} /> Disponible</label>
      <BotonEnviar>{p ? "Guardar cambios" : "Agregar"}</BotonEnviar>
    </form>
  );
}

export default async function PanelMenu() {
  const { sb, negocio } = await requiereDueno();
  const [{ data: c }, { data: p }] = await Promise.all([
    sb.from("categories").select("*").eq("business_id", negocio.id).order("position").order("name"),
    sb.from("products").select("*").eq("business_id", negocio.id).order("position").order("name"),
  ]);
  const categorias = (c || []) as Categoria[];
  const productos = (p || []) as Producto[];
  const palabra = negocio.mode === "menu" ? "platillo" : "producto";
  const sinCategoria = productos.filter((x) => !x.category_id || !categorias.some((cat) => cat.id === x.category_id));

  return (
    <div className="stack" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.5rem" }}>Mi menú</h1>

      {/* Paso 1: primero las categorías, para que el dueño no se pierda */}
      <section className="card">
        <h2 style={{ fontSize: "1.1rem" }}><span className="paso">1</span> Tus categorías</h2>
        <p className="small muted">Por ejemplo: Gorditas, Platillos, Bebidas. El número decide el orden en tu menú (1 sale primero).</p>
        {categorias.map((cat) => (
          <div key={cat.id} className="row" style={{ marginBottom: 8 }}>
            <form action={guardarCategoria} className="row grow">
              <input type="hidden" name="id" value={cat.id} />
              <input className="i" name="position" type="number" defaultValue={cat.position} style={{ width: 64, marginTop: 0 }} aria-label="Orden" />
              <input className="i grow" name="name" defaultValue={cat.name} style={{ marginTop: 0 }} aria-label="Nombre" />
              <BotonEnviar className="btn btn-sm">Guardar</BotonEnviar>
            </form>
            <form action={borrarCategoria}>
              <input type="hidden" name="id" value={cat.id} />
              <BotonEnviar className="btn btn-sm btn-bad" confirmar={`¿Borrar la categoría “${cat.name}”? Sus ${palabra}s pasan a “Sin categoría”.`}>✕</BotonEnviar>
            </form>
          </div>
        ))}
        <form action={guardarCategoria} className="row" style={{ marginTop: 12 }}>
          <input type="hidden" name="position" value={categorias.length + 1} />
          <input className="i grow" name="name" placeholder="Nueva categoría, ej. Bebidas" required style={{ marginTop: 0 }} />
          <BotonEnviar className="btn btn-sm btn-p">Agregar</BotonEnviar>
        </form>
      </section>

      {/* Paso 2: los platillos, dentro de su categoría */}
      <h2 style={{ fontSize: "1.1rem", margin: "8px 0 0" }}><span className="paso">2</span> Tus {palabra}s</h2>
      {!categorias.length && (
        <div className="alerta">Primero crea una categoría arriba. Luego aquí le agregas sus {palabra}s.</div>
      )}

      <AcordeonPlatillos>
        {categorias.map((cat) => {
          const items = productos.filter((x) => x.category_id === cat.id);
          return (
            <section key={cat.id} className="card" style={{ marginBottom: 14 }}>
              <div className="row between">
                <h3 style={{ margin: 0 }}>{cat.name}</h3>
                <span className="small muted">{items.length} {items.length === 1 ? palabra : `${palabra}s`}</span>
              </div>
              {items.map((x) => <Platillo key={x.id} x={x} categorias={categorias} negocioId={negocio.id} />)}
              <details className="d d-agregar" data-plato style={{ marginTop: 10 }}>
                <summary>＋ Agregar {palabra} a {cat.name}</summary>
                <div><FormProducto categorias={categorias} negocioId={negocio.id} catDefecto={cat.id} /></div>
              </details>
            </section>
          );
        })}

        {(sinCategoria.length > 0 || !categorias.length) && (
          <section className="card">
            <h3 style={{ margin: 0 }}>Sin categoría</h3>
            {categorias.length > 0 && <p className="small muted" style={{ margin: "4px 0 0" }}>Ábrelos y elige su categoría para que se vean ordenados.</p>}
            {sinCategoria.map((x) => <Platillo key={x.id} x={x} categorias={categorias} negocioId={negocio.id} />)}
            {!categorias.length && (
              <details className="d d-agregar" data-plato style={{ marginTop: 10 }}>
                <summary>＋ Agregar {palabra}</summary>
                <div><FormProducto categorias={categorias} negocioId={negocio.id} /></div>
              </details>
            )}
          </section>
        )}
      </AcordeonPlatillos>
    </div>
  );
}

function Platillo({ x, categorias, negocioId }: { x: Producto; categorias: Categoria[]; negocioId: string }) {
  return (
    <details className="d" data-plato style={{ marginTop: 10 }}>
      <summary>
        <div className="row between">
          <span className={x.available ? "" : "muted"} style={{ textDecoration: x.available ? undefined : "line-through" }}>{x.name}</span>
          <span className="row"><span>{dinero(Number(x.price))}</span></span>
        </div>
      </summary>
      <div>
        <form action={alternarAgotado} style={{ marginBottom: 12 }}>
          <input type="hidden" name="id" value={x.id} />
          <input type="hidden" name="available" value={String(!x.available)} />
          <BotonEnviar className={`btn btn-sm ${x.available ? "" : "btn-p"}`}>{x.available ? "Marcar agotado" : "Ya hay, marcar disponible"}</BotonEnviar>
        </form>
        <FormProducto p={x} categorias={categorias} negocioId={negocioId} />
        <form action={borrarProducto} style={{ marginTop: 10 }}>
          <input type="hidden" name="id" value={x.id} />
          <BotonEnviar className="btn btn-sm btn-bad" confirmar={`¿Borrar “${x.name}”?`}>Borrar</BotonEnviar>
        </form>
      </div>
    </details>
  );
}
