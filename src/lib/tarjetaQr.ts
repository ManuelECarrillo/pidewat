"use client";
import QRCode from "qrcode";

// Dibuja las tarjetas QR como imágenes PNG en el celular (sin depender de imprimir desde el navegador,
// que en la app instalada no hace nada en muchos teléfonos).

export type Tarjeta = { url: string; mesa?: string };
type Datos = { nombre: string; color: string; dominio: string };

const ANCHO = 1200, ALTO = 1600;

function texto(ctx: CanvasRenderingContext2D, t: string, x: number, y: number, max: number, peso: number, tam: number, color: string) {
  let s = tam;
  do { ctx.font = `${peso} ${s}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`; s -= 2; } while (ctx.measureText(t).width > max && s > 20);
  ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText(t, x, y);
}

// Una tarjeta en (x, y) con escala k (1 = 1200x1600)
function dibujar(ctx: CanvasRenderingContext2D, tj: Tarjeta, d: Datos, x: number, y: number, k: number) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, ANCHO, ALTO);
  ctx.fillStyle = d.color || "#1f8a4c"; ctx.fillRect(0, 0, ANCHO, 26);
  texto(ctx, d.nombre, ANCHO / 2, 170, ANCHO - 120, 800, 92, d.color || "#1d1b19");
  texto(ctx, "Escanea y pide por WhatsApp", ANCHO / 2, 260, ANCHO - 140, 700, 62, "#1d1b19");
  const qr = QRCode.create(tj.url, { errorCorrectionLevel: "M" });
  const n = qr.modules.size, lado = 860, celda = lado / (n + 4), ox = (ANCHO - lado) / 2, oy = 330;
  ctx.fillStyle = "#111111";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
    if (qr.modules.data[r * n + c]) ctx.fillRect(Math.floor(ox + (c + 2) * celda), Math.floor(oy + (r + 2) * celda), Math.ceil(celda), Math.ceil(celda));
  if (tj.mesa) texto(ctx, `Mesa ${tj.mesa}`, ANCHO / 2, 1330, ANCHO - 140, 900, 110, "#1d1b19");
  texto(ctx, d.dominio, ANCHO / 2, tj.mesa ? 1440 : 1340, ANCHO - 140, 500, 44, "#6f6a64");
  texto(ctx, "Pidewat", ANCHO / 2, 1530, 400, 700, 40, "#9a948c");
  ctx.restore();
}

function aBlob(cv: HTMLCanvasElement): Promise<Blob> {
  return new Promise((ok, mal) => cv.toBlob((b) => (b ? ok(b) : mal(new Error("sin imagen"))), "image/png"));
}

// Una sola tarjeta, tamaño grande
export async function tarjetaPng(tj: Tarjeta, d: Datos): Promise<Blob> {
  const cv = document.createElement("canvas"); cv.width = ANCHO; cv.height = ALTO;
  dibujar(cv.getContext("2d")!, tj, d, 0, 0, 1);
  return aBlob(cv);
}

// Hojas tamaño carta (300 dpi) con 6 tarjetas cada una y línea punteada para recortar
export async function hojasPng(tarjetas: Tarjeta[], d: Datos): Promise<Blob[]> {
  const W = 2550, H = 3300, M = 120, cols = 2, filas = 3;
  const cw = (W - M * 2) / cols, ch = (H - M * 2) / filas;
  const k = Math.min((cw - 60) / ANCHO, (ch - 60) / ALTO);
  const hojas: Blob[] = [];
  for (let i = 0; i < tarjetas.length; i += cols * filas) {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    tarjetas.slice(i, i + cols * filas).forEach((tj, j) => {
      const cx = M + (j % cols) * cw, cy = M + Math.floor(j / cols) * ch;
      ctx.setLineDash([18, 14]); ctx.strokeStyle = "#bbbbbb"; ctx.lineWidth = 4; ctx.strokeRect(cx + 10, cy + 10, cw - 20, ch - 20);
      dibujar(ctx, tj, d, cx + (cw - ANCHO * k) / 2, cy + (ch - ALTO * k) / 2, k);
    });
    hojas.push(await aBlob(cv));
  }
  return hojas;
}

// Abre "Compartir" del celular (guardar en galería, mandar por WhatsApp, imprimir) o descarga.
export async function guardar(blobs: Blob[], base: string, titulo: string): Promise<"compartido" | "descargado" | "cancelado"> {
  const files = blobs.map((b, i) => new File([b], blobs.length > 1 ? `${base}-${i + 1}.png` : `${base}.png`, { type: "image/png" }));
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files })) {
    try { await nav.share({ files, title: titulo }); return "compartido"; }
    catch (e) { if ((e as Error)?.name === "AbortError") return "cancelado"; }
  }
  for (const f of files) {
    const u = URL.createObjectURL(f);
    const a = document.createElement("a"); a.href = u; a.download = f.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
    await new Promise((r) => setTimeout(r, 300));
  }
  return "descargado";
}
