"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function CompartirLink({ url, nombre, color }: { url: string; nombre: string; color: string }) {
  const [qr, setQr] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [mesas, setMesas] = useState(0);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 1024, margin: 2, color: { dark: "#111111", light: "#ffffff" } }).then(setQr);
  }, [url]);

  async function copiar() {
    try { await navigator.clipboard.writeText(url); setCopiado(true); setTimeout(() => setCopiado(false), 1500); } catch {}
  }
  const compartir = () => {
    const texto = `Ya puedes hacer tu pedido de ${nombre} desde aquí 👉 ${url}`;
    if (navigator.share) navigator.share({ title: nombre, text: texto, url }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`);
  };

  return (
    <div className="card">
      <h3>Tu link y tu QR</h3>
      <div className="row wrap-flex" style={{ marginBottom: 12 }}>
        <code style={{ background: "var(--bg)", padding: "8px 10px", borderRadius: 8, wordBreak: "break-all" }} className="grow">{url}</code>
      </div>
      <div className="row wrap-flex">
        <button className="btn btn-sm" onClick={copiar}>{copiado ? "¡Copiado!" : "Copiar link"}</button>
        <button className="btn btn-sm btn-wa" onClick={compartir}>Compartir</button>
        {/* En la misma ventana: en la app instalada, abrir otra ventana hacía que "atrás" sacara de la app */}
        <a className="btn btn-sm" href={`${new URL(url).pathname}?desde=panel`}>Ver mi menú</a>
      </div>
      {qr && (
        <div className="row wrap-flex" style={{ marginTop: 14, alignItems: "flex-start" }}>
          <img src={qr} alt="Código QR de tu menú" width={140} height={140} style={{ border: "1px solid var(--line)", borderRadius: 10 }} />
          <div className="stack grow">
            <a className="btn btn-sm" href={qr} download={`qr-${nombre}.png`}>Descargar QR</a>
            <a className="btn btn-sm" href={`/panel/qr${mesas ? `?mesas=${mesas}` : ""}`}>Imprimir tarjetas para mesas</a>
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
