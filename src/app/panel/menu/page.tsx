import { Acordeon, Desplegable } from "@/components/Acordeon";
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
  const sueltos = productos.filter((x) => !x.category_id || !categorias.some((cat) => cat.id === x.category_id));
  const grupos = [
    ...categorias.map((cat) => ({ cat, items: productos.filter((x) => x.category_id === cat.id) })),
    ...(sueltos.length ? [{ cat: null, items: sueltos }] : []),
  ];

  return (
    <Acordeon>
    <div className="stack" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 0 }}>Mi menú</h1>
      <p className="muted" style={{ margin: 0 }}>Primero arma tus categorías y luego agrega tus {palabra}s dentro de cada una.</p>

      <section className="card">
        <h2 className="paso"><span>1</span> Tus categorías</h2>
        <p className="small muted">Ej. Gorditas, Bebidas, Postres. El número decide cuál sale primero en tu menú (1, 2, 3…).</p>
        {categorias.map((cat) => (
          <div key={cat.id} className="row" style={{ marginBottom: 8 }}>
            <form action={guardarCategoria} className="row grow">
              <input type="hidden" name="id" value={cat.id} />
              <input className="i" name="position" type="number" inputMode="numeric" defaultValue={cat.position} style={{ width: 56, marginTop: 0, textAlign: "center" }} aria-label="Orden" />
              <input className="i grow" name="name" defaultValue={cat.name} style={{ marginTop: 0, minWidth: 0 }} aria-label="Nombre" />
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
          <input className="i grow" name="name" placeholder={categorias.length ? "Otra categoría" : "Tu primera categoría, ej. Tacos"} required style={{ marginTop: 0, minWidth: 0 }} />
          <BotonEnviar className="btn btn-sm btn-p">＋ Agregar</BotonEnviar>
        </form>
      </section>

      <h2 className="paso" style={{ marginTop: 8 }}><span>2</span> Tus {palabra}s</h2>
      {!categorias.length && !sueltos.length && (
        <div className="alerta">Primero crea una categoría arriba. Luego aquí te aparece para agregarle {palabra}s.</div>
      )}

      {grupos.map(({ cat, items }) => (
        <section key={cat?.id || "sin"} className="card">
          <div className="row between" style={{ marginBottom: 10 }}>
            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{cat?.name || "Sin categoría"}</h3>
            <span className="small muted">{items.length} {items.length === 1 ? palabra : `${palabra}s`}</span>
          </div>
          {!items.length && <p className="small muted" style={{ marginTop: 0 }}>Todavía no hay {palabra}s aquí.</p>}
          {items.map((x) => (
            <Desplegable key={x.id} id={x.id} titulo={
              <span className="row between">
                <span className={x.available ? "" : "muted"} style={{ textDecoration: x.available ? undefined : "line-through" }}>{x.name}</span>
                <span>{dinero(Number(x.price))}</span>
              </span>
            }>
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
            </Desplegable>
          ))}
          {cat && (
            <Desplegable id={`nuevo-${cat.id}`} className="d d-nuevo" titulo={`＋ Agregar ${palabra} a ${cat.name}`}>
              <FormProducto categorias={categorias} negocioId={negocio.id} catDefecto={cat.id} />
            </Desplegable>
          )}
        </section>
      ))}
    </div>
    </Acordeon>
  );
}
