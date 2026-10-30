"use client";

import { useRef, useState } from "react";
import { avisarCambio } from "./Selector";
import { supabaseNavegador } from "@/lib/supabase/navegador";

// Achica la foto en el celular antes de subirla (máx. 1000 px, JPG) para que el menú cargue rápido.
async function achicar(archivo: File, max = 1000): Promise<Blob> {
  const img = await createImageBitmap(archivo);
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * k);
  c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return new Promise((ok, mal) => c.toBlob((b) => (b ? ok(b) : mal(new Error("No se pudo leer la foto"))), "image/jpeg", 0.82));
}

export default function ImagenInput({ name, negocioId, valor, etiqueta = "Foto" }: { name: string; negocioId: string; valor?: string | null; etiqueta?: string }) {
  const [url, setUrl] = useState(valor || "");
  const [estado, setEstado] = useState("");
  const caja = useRef<HTMLDivElement>(null);
  const poner = (u: string) => { setUrl(u); avisarCambio(caja.current); };

  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setEstado("Subiendo…");
    try {
      const blob = await achicar(f);
      const ruta = `${negocioId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const sb = supabaseNavegador();
      const { error } = await sb.storage.from("imagenes").upload(ruta, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;
      poner(sb.storage.from("imagenes").getPublicUrl(ruta).data.publicUrl);
      setEstado("");
    } catch {
      setEstado("No se pudo subir. Intenta con otra foto.");
    }
  }

  return (
    <div className="f" ref={caja}>
      {etiqueta}
      <input type="hidden" name={name} value={url} />
      <div className="row" style={{ marginTop: 6 }}>
        {url && <div className="prod-img" style={{ backgroundImage: `url(${url})`, width: 64, height: 64 }} />}
        <label className="btn btn-sm">
          {url ? "Cambiar" : "Subir foto"}
          <input type="file" accept="image/*" onChange={subir} style={{ display: "none" }} />
        </label>
        {url && <button type="button" className="btn btn-sm btn-bad" onClick={() => poner("")}>Quitar</button>}
      </div>
      {estado && <div className="small muted" style={{ marginTop: 4 }}>{estado}</div>}
    </div>
  );
}
