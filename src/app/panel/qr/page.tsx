import Link from "next/link";
import QRCode from "qrcode";
import { siteUrl } from "@/lib/formato";
import { requiereDueno } from "@/lib/sesion";
import Imprimir from "./Imprimir";

// Hoja para imprimir: una tarjeta general o una por mesa (el QR ya trae el número de mesa).
export default async function HojaQR({ searchParams }: { searchParams: Promise<{ mesas?: string }> }) {
  const { negocio } = await requiereDueno();
  const n = Math.min(60, Math.max(0, Number((await searchParams).mesas) || 0));
  const base = `${siteUrl()}/${negocio.slug}`;
  const tarjetas = n ? Array.from({ length: n }, (_, i) => ({ mesa: String(i + 1), url: `${base}?mesa=${i + 1}` })) : [{ mesa: "", url: base }];
  const svgs = await Promise.all(tarjetas.map((t) => QRCode.toString(t.url, { type: "svg", margin: 1 })));

  return (
    <div>
      <style>{`
        .top { display: none }
        .hoja-qr { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
        .tq { border: 2px dashed #bbb; border-radius: 16px; padding: 16px; text-align: center; break-inside: avoid; background: #fff; }
        .tq svg { width: 100%; max-width: 190px; height: auto; }
        @media print { .no-print { display: none } body { background: #fff } .tq { border-color: #ddd } }
      `}</style>
      <div className="no-print row between wrap-flex" style={{ marginBottom: 16 }}>
        <Link href="/panel" className="btn btn-sm">← Volver</Link>
        <p className="muted grow" style={{ margin: 0 }}>Imprime en hojas tamaño carta y recorta por la línea punteada.</p>
        <Imprimir />
      </div>
      <div className="hoja-qr">
        {tarjetas.map((t, i) => (
          <div className="tq" key={t.url}>
            <div style={{ fontWeight: 800, fontSize: "1.15rem", color: negocio.color }}>{negocio.name}</div>
            <div style={{ fontWeight: 700, margin: "4px 0 8px" }}>Escanea y pide por WhatsApp</div>
            <div dangerouslySetInnerHTML={{ __html: svgs[i] }} />
            {t.mesa && <div style={{ fontWeight: 800, fontSize: "1.3rem", marginTop: 6 }}>Mesa {t.mesa}</div>}
            <div className="small muted" style={{ marginTop: 4 }}>{base.replace(/^https?:\/\//, "")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
