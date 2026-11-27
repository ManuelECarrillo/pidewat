"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { tarjetaPng, guardar } from "@/lib/tarjetaQr";

export default function CompartirLink({ url, nombre, color }: { url: string; nombre: string; color: string }) {
  const [qr, setQr] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [mesas, setMesas] = useState(0);
  const [bajando, setBajando] = useState(false);
  const [estadoQr, setEstadoQr] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, { width: 1024, margin: 2, color: { dark: "#111111", light: "#ffffff" } }).then(setQr);
  }, [url]);

  async function copiar() {
    try { await navigator.clipboard.writeText(url); setCopiado(true); setTimeout(() => setCopiado(false), 1500); } catch {}
  }
  async function descargarQr() {
    setBajando(true);
    setEstadoQr("");
    try {
      const u = new URL(url);
      const png = await tarjetaPng({ url }, { nombre, color, dominio: u.host + u.pathname });
      const r = await guardar([png], `qr-${u.pathname.replace(/\W/g, "") || "menu"}`, `QR de ${nombre}`);
      if (r === "compartido") setEstadoQr("Elige dónde compartir tu QR.");
      if (r === "descargado") setEstadoQr("QR guardado en tu dispositivo.");
    } catch { setEstadoQr("No se pudo preparar el QR. Intenta de nuevo."); }
    finally { setBajando(false); }
  }
  const compartir = () => {
    const texto = `Ya puedes hacer tu pedido de ${nombre} desde aquí 👉 ${url}`;
    if (navigator.share) navigator.share({ title: nombre, text: texto, url }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`);
  };

  return (
    <div className="card">
      <h3>Comparte tu menú</h3>
      <div className="row wrap-flex" style={{ marginBottom: 12 }}>
        <code style={{ background: "var(--bg)", padding: "8px 10px", borderRadius: 8, wordBreak: "break-all" }} className="grow">{url}</code>
      </div>
      <div className="row wrap-flex">
        <button className="btn btn-sm" onClick={copiar}>{copiado ? "¡Copiado!" : "Copiar link"}</button>
        <button className="btn btn-sm btn-wa" onClick={compartir}>Compartir link</button>
        <a className="btn btn-sm" href={`${new URL(url).pathname}?desde=panel`}>Ver mi menú</a>
      </div>
      {qr && (
        <div className="row wrap-flex" style={{ marginTop: 14, alignItems: "flex-start" }}>
          <img src={qr} alt="Código QR de tu menú" width={140} height={140} style={{ border: "1px solid var(--line)", borderRadius: 10 }} />
          <div className="stack grow">
            <p className="small" style={{ margin: 0, fontWeight: 700 }}>Código QR</p>
            <button className="btn" onClick={descargarQr} disabled={bajando}>{bajando ? "Preparando…" : "Compartir o guardar QR"}</button>
            {estadoQr && <p className="small muted" role="status" style={{ margin: 0 }}>{estadoQr}</p>}
            <a className="btn" href={`/panel/qr${mesas ? `?mesas=${mesas}` : ""}`}>Crear tarjetas para mesas</a>
            <label className="small muted">Una tarjeta por mesa (número en el QR):
              <input className="i" type="number" min={0} max={60} value={mesas || ""} placeholder="0 = una sola tarjeta"
                onChange={(e) => setMesas(Math.min(60, Math.max(0, Number(e.target.value) || 0)))} />
            </label>
          </div>
        </div>
      )}
      <p className="small muted" style={{ marginTop: 10, marginBottom: 0, borderLeft: `3px solid ${color}`, paddingLeft: 8 }}>
        Ponlo en tu bio de Instagram, en tu estado de WhatsApp y en cada mesa.
      </p>
    </div>
  );
}
