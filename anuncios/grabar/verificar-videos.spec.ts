import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "docs", "anuncios", "grabaciones");
const videos = ["c1-pedido-hamburguesa", "c2-menu-qr-carrito", "c3-mesa-qr", "c4-mesa-a-cocina", "c5-dispositivos"];

test("los MP4 H.264 se reproducen y sus cuadros no están vacíos", async ({ page }) => {
  for (const nombre of videos) {
    const b64 = readFileSync(join(dir, `${nombre}.mp4`)).toString("base64");
    const datos = await page.evaluate(async ({ b64 }) => {
      const v = document.createElement("video"); v.muted = true; v.src = `data:video/mp4;base64,${b64}`;
      await new Promise<void>((ok, mal) => { v.onloadedmetadata = () => ok(); v.onerror = () => mal(new Error("MP4 no reproducible")); });
      const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight; const ctx = c.getContext("2d")!;
      const muestras: number[] = [];
      for (let t = 0; t < v.duration; t += 1) {
        v.currentTime = t; await new Promise<void>((ok) => { v.onseeked = () => ok(); });
        ctx.drawImage(v, 0, 0); const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let min = 255, max = 0; for (let i = 0; i < d.length; i += 997) { const n = d[i] + d[i + 1] + d[i + 2]; min = Math.min(min, n); max = Math.max(max, n); }
        muestras.push(max - min);
      }
      return { ancho: v.videoWidth, alto: v.videoHeight, duracion: v.duration, muestras };
    }, { b64 });
    expect(datos.ancho, nombre).toBe(1080);
    expect(datos.alto, nombre).toBeGreaterThan(2000);
    expect(datos.duracion, nombre).toBeGreaterThan(3);
    expect(datos.muestras.every((r) => r > 12), `${nombre} tiene cuadro vacío`).toBeTruthy();
    console.log(`${nombre}: ${datos.ancho}x${datos.alto}, ${datos.duracion.toFixed(1)} s, ${datos.muestras.length} cuadros revisados`);
  }
});
