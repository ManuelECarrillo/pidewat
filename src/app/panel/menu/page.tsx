import BotonEnviar from "@/components/BotonEnviar";
import Selector from "@/components/Selector";
import ImagenInput from "@/components/ImagenInput";
import { dinero } from "@/lib/formato";
import { requiereDueno } from "@/lib/sesion";
import type { Categoria, Producto } from "@/lib/tipos";
import { alternarAgotado, borrarCategoria, borrarProducto, guardarCategoria, guardarProducto } from "../acciones";

function FormProducto({ p, categorias, negocioId, catDefecto }: { p?: Producto; categorias: Categoria[]; negocioId: string; catDefecto?: string }) {
  return (
    <form action={guardarProducto}>
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
  const grupos = [
    ...categorias.map((cat) => ({ cat, items: productos.filter((x) => x.category_id === cat.id) })),
    { cat: null, items: productos.filter((x) => !x.category_id || !categorias.some((cat) => cat.id === x.category_id)) },
  ];

  return (
    <div className="stack" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.5rem" }}>Mi menú</h1>

      <details className="d">
        <summary>＋ Agregar {palabra}</summary>
        <div><FormProducto categorias={categorias} negocioId={negocio.id} /></div>
      </details>

      {grupos.map(({ cat, items }) =>
        !cat && !items.length ? null : (
          <section key={cat?.id || "sin"} className="card">
            <div className="row between">
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>{cat?.name || "Sin categoría"}</h2>
              <span className="small muted">{items.length}</span>
            </div>
            {items.map((x) => (
              <details key={x.id} className="d" style={{ marginTop: 10 }}>
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
                  <FormProducto p={x} categorias={categorias} negocioId={negocio.id} />
                  <form action={borrarProducto} style={{ marginTop: 10 }}>
                    <input type="hidden" name="id" value={x.id} />
                    <BotonEnviar className="btn btn-sm btn-bad" confirmar={`¿Borrar “${x.name}”?`}>Borrar</BotonEnviar>
                  </form>
                </div>
              </details>
            ))}
            {cat && (
              <details className="d" style={{ marginTop: 10 }}>
                <summary className="small">＋ Agregar {palabra} a {cat.name}</summary>
                <div><FormProducto categorias={categorias} negocioId={negocio.id} catDefecto={cat.id} /></div>
              </details>
            )}
          </section>
        ),
      )}

      <section className="card">
        <h2 style={{ fontSize: "1.1rem" }}>Categorías</h2>
        <p className="small muted">El número de orden decide cuál sale primero (1, 2, 3…).</p>
        {categorias.map((cat) => (
          <div key={cat.id} className="row" style={{ marginBottom: 8 }}>
            <form action={guardarCategoria} className="row grow">
              <input type="hidden" name="id" value={cat.id} />
              <input className="i" name="position" type="number" defaultValue={cat.position} style={{ width: 70, marginTop: 0 }} aria-label="Orden" />
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
    </div>
  );
}
