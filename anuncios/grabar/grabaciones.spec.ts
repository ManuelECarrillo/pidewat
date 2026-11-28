import { test, expect, webkit, type Locator, type Page } from "@playwright/test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const salida = join(process.cwd(), "docs", "anuncios", "grabaciones");
const temporal = mkdtempSync(join(tmpdir(), "pidewat-grabar-"));
mkdirSync(salida, { recursive: true });

type Fotograma = { archivo: string; segundos: number };
type Posicion = { paso: string; elemento: string; caja_px: { x: number; y: number; ancho: number; alto: number } | null; total_px: { x: number; y: number; ancho: number; alto: number } | null };

async function preparar(page: Page, ruta: string) {
  await page.goto(ruta);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.addStyleTag({ content: `
    .toque-grabacion { position: fixed; z-index: 9999; width: 56px; height: 56px; margin: -28px 0 0 -28px; border: 2px solid rgba(255,255,255,.93); border-radius: 50%; background: rgba(31,138,76,.18); box-shadow: 0 0 0 10px rgba(31,138,76,.11); pointer-events: none; }
  ` });
}

async function cajaVideo(page: Page, objetivo: Locator) {
  if (await objetivo.count() === 0) return null;
  const caja = await objetivo.boundingBox();
  if (!caja) return null;
  const escala = await page.evaluate(() => devicePixelRatio);
  return { x: Math.round(caja.x * escala), y: Math.round(caja.y * escala), ancho: Math.round(caja.width * escala), alto: Math.round(caja.height * escala) };
}
async function guardarPosicion(page: Page, lista: Posicion[], paso: string, elemento: string, objetivo: Locator) {
  const total = page.getByText(/^Total:/).last();
  lista.push({ paso, elemento, caja_px: await cajaVideo(page, objetivo), total_px: await cajaVideo(page, total) });
}
async function tocar(page: Page, objetivo: Locator, posiciones?: Posicion[], paso?: string) {
  await expect(objetivo).toBeVisible();
  if (posiciones && paso) await guardarPosicion(page, posiciones, paso, await objetivo.getAttribute("aria-label") || await objetivo.textContent() || "toque", objetivo);
  const caja = await objetivo.boundingBox();
  if (!caja) throw new Error("No se pudo localizar el toque");
  await page.evaluate(({ x, y }) => {
    document.querySelector(".toque-grabacion")?.remove();
    const punto = document.createElement("i"); punto.className = "toque-grabacion";
    punto.style.left = `${x}px`; punto.style.top = `${y}px`; document.body.appendChild(punto);
  }, { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 });
  await objetivo.click();
}

async function pedidoP1(page: Page, lista: Fotograma[], posiciones: Posicion[]) {
  const abrir = page.getByRole("button", { name: /Personalizar y agregar Hamburguesa de la casa/ });
  await tocar(page, abrir, posiciones, "hamburguesa-1"); await foto(page, "hamburguesa-1", .6, lista);
  await tocar(page, page.getByRole("button", { name: /Doble carne/ }), posiciones, "doble-carne"); await foto(page, "doble-carne", .6, lista);
  await tocar(page, page.getByRole("button", { name: /Queso extra/ }), posiciones, "queso-extra"); await foto(page, "queso-extra", .6, lista);
  await tocar(page, page.getByRole("button", { name: /Agregar 1/ }), posiciones, "agregar-primera"); await foto(page, "total-primera", .6, lista);
  await tocar(page, abrir, posiciones, "hamburguesa-2"); await foto(page, "hamburguesa-2", .6, lista);
  await tocar(page, page.getByRole("button", { name: /Clásica/ }), posiciones, "clasica"); await foto(page, "clasica", .6, lista);
  await tocar(page, page.getByRole("button", { name: /Cebolla/ }), posiciones, "sin-cebolla"); await foto(page, "sin-cebolla", .6, lista);
  await tocar(page, page.getByRole("button", { name: /Agregar 1/ }), posiciones, "agregar-segunda"); await foto(page, "total-segunda", .6, lista);
  await tocar(page, page.getByRole("button", { name: /Ver pedido/ }), posiciones, "carrito"); await foto(page, "carrito", .6, lista);
}

async function foto(page: Page, nombre: string, segundos: number, lista: Fotograma[]) {
  const archivo = join(temporal, `${String(lista.length).padStart(2, "0")}-${nombre}.png`);
  await page.screenshot({ path: archivo, animations: "disabled" });
  lista.push({ archivo, segundos });
}

async function quitarToque(page: Page) {
  await page.evaluate(() => document.querySelector(".toque-grabacion")?.remove());
}

// Codificador de respaldo: WebCodecs entrega H.264 y este muxer m\u00ednimo escribe MP4.
// Se usa porque algunas sesiones aisladas no heredan el PATH aunque ffmpeg est\u00e9 instalado en Windows.
async function mp4(page: Page, nombre: string, lista: Fotograma[]) {
  const entradas = lista.map((f) => ({ png: readFileSync(f.archivo).toString("base64"), cuadros: Math.max(1, Math.round(f.segundos * 30)) }));
  const base64 = await page.evaluate(async (frames) => {
    const u8 = (...n: number[]) => new Uint8Array(n);
    const u16 = (n: number) => u8(n >>> 8, n & 255);
    const u32 = (n: number) => u8((n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255);
    const texto = (x: string) => new TextEncoder().encode(x);
    const unir = (...a: Uint8Array[]) => { const r = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; a.forEach((x) => { r.set(x, i); i += x.length; }); return r; };
    const caja = (tipo: string, ...a: Uint8Array[]) => { const d = unir(...a); return unir(u32(d.length + 8), texto(tipo), d); };
    const lleno = (tipo: string, flags: number, ...a: Uint8Array[]) => caja(tipo, u8(0, (flags >>> 16) & 255, (flags >>> 8) & 255, flags & 255), ...a);
    const ceros = (n: number) => new Uint8Array(n);
    const fijo = (n: number) => u32(n * 65536);
    const muestras: { d: Uint8Array; key: boolean }[] = []; let avcc = new Uint8Array();
    const config = { codec: "avc1.420033", width: 1080, height: 2338, bitrate: 8_000_000, framerate: 30, avc: { format: "avc" as const } };
    if (!(await VideoEncoder.isConfigSupported(config)).supported) throw new Error("Chromium no soporta H.264 WebCodecs");
    const encoder = new VideoEncoder({ output(chunk, meta) { if (meta?.decoderConfig?.description) avcc = new Uint8Array(meta.decoderConfig.description as ArrayBuffer); const d = new Uint8Array(chunk.byteLength); chunk.copyTo(d); muestras.push({ d, key: chunk.type === "key" }); }, error(e) { throw e; } });
    encoder.configure(config);
    const canvas = new OffscreenCanvas(1080, 2338), ctx = canvas.getContext("2d")!; let numero = 0;
    for (const f of frames) {
      const bin = Uint8Array.from(atob(f.png), (c) => c.charCodeAt(0));
      const img = await createImageBitmap(new Blob([bin], { type: "image/png" }));
      ctx.drawImage(img, 0, 0, 1080, 2338); img.close();
      for (let i = 0; i < f.cuadros; i++) { const v = new VideoFrame(canvas, { timestamp: numero * 33333, duration: 33333 }); encoder.encode(v, { keyFrame: numero % 150 === 0 }); v.close(); numero++; }
    }
    await encoder.flush(); encoder.close();
    const duracion = numero * 3000, matriz = unir(fijo(1), u32(0), u32(0), u32(0), fijo(1), u32(0), u32(0), u32(0), fijo(1));
    const mvhd = lleno("mvhd", 0, u32(0), u32(0), u32(90000), u32(duracion), fijo(1), u16(0x100), ceros(10), matriz, ceros(24), u32(2));
    const tkhd = lleno("tkhd", 7, u32(0), u32(0), u32(1), u32(0), u32(duracion), ceros(8), u16(0), u16(0), u16(0), u16(0), matriz, fijo(1080), fijo(2338));
    const mdhd = lleno("mdhd", 0, u32(0), u32(0), u32(90000), u32(duracion), u16(0x55c4), u16(0));
    const hdlr = lleno("hdlr", 0, u32(0), texto("vide"), ceros(12), texto("VideoHandler\0"));
    const avc1 = unir(ceros(6), u16(1), ceros(16), u16(1080), u16(2338), u32(0x00480000), u32(0x00480000), u32(0), u16(1), u8(7), texto("Pidewat"), ceros(24), u16(24), u16(0xffff), caja("avcC", avcc));
    const stsd = lleno("stsd", 0, u32(1), caja("avc1", avc1));
    const stts = lleno("stts", 0, u32(1), u32(numero), u32(3000));
    const stsc = lleno("stsc", 0, u32(1), u32(1), u32(numero), u32(1));
    const stsz = lleno("stsz", 0, u32(0), u32(muestras.length), ...muestras.map((m) => u32(m.d.length)));
    const stss = lleno("stss", 0, u32(muestras.filter((m) => m.key).length), ...muestras.map((m, i) => m.key ? u32(i + 1) : new Uint8Array()).filter((x) => x.length));
    const stco = (offset: number) => lleno("stco", 0, u32(1), u32(offset));
    const armar = (offset: number) => caja("moov", mvhd, caja("trak", tkhd, caja("mdia", mdhd, hdlr, caja("minf", lleno("vmhd", 1, u16(0), u16(0), u16(0), u16(0)), caja("dinf", caja("dref", u32(0), u32(1), lleno("url ", 1))), caja("stbl", stsd, stts, stsc, stsz, stco(offset), stss)))));
    const ftyp = caja("ftyp", texto("isom"), u32(0x200), texto("isom"), texto("iso2"), texto("avc1"), texto("mp41"));
    const previo = armar(0), moov = armar(ftyp.length + previo.length + 8), archivo = unir(ftyp, moov, caja("mdat", ...muestras.map((m) => m.d)));
    let binario = ""; for (let i = 0; i < archivo.length; i += 0x8000) binario += String.fromCharCode(...archivo.subarray(i, i + 0x8000));
    return btoa(binario);
  }, entradas);
  writeFileSync(join(salida, `${nombre}.mp4`), Buffer.from(base64, "base64"));
}

async function hamburguesa(page: Page, lista: Fotograma[], posiciones?: Posicion[]) {
  await tocar(page, page.getByRole("button", { name: /Personalizar y agregar Hamburguesa de la casa/ }), posiciones, "abrir-hamburguesa");
  await foto(page, "hamburguesa", 1.2, lista);
  await tocar(page, page.getByRole("button", { name: /Doble carne/ }), posiciones, "doble-carne");
  await foto(page, "tamano", 1, lista);
  await tocar(page, page.getByRole("button", { name: /Queso extra/ }), posiciones, "queso-extra");
  await foto(page, "queso", 1, lista);
  await tocar(page, page.getByRole("button", { name: /Cebolla/ }), posiciones, "sin-cebolla");
  await foto(page, "sin-cebolla", 1.2, lista);
  await tocar(page, page.getByRole("button", { name: /Agregar 1/ }), posiciones, "agregar-hamburguesa");
  await foto(page, "total", 1, lista);
  await tocar(page, page.getByRole("button", { name: /Ver pedido/ }), posiciones, "ver-pedido");
  await foto(page, "carrito", 1.4, lista);
}

async function finalizarWhatsapp(page: Page, lista: Fotograma[], mesa = false, posiciones?: Posicion[]) {
  if (!mesa) await tocar(page, page.getByRole("button", { name: "Recoger" }), posiciones, "recoger");
  const nombre = page.getByLabel("Tu nombre");
  await nombre.fill("Ana demo");
  await foto(page, "datos", 1, lista);
  await tocar(page, page.getByRole("button", { name: "Enviar pedido por WhatsApp" }), posiciones, "enviar-whatsapp");
  await expect(page.getByTestId("mensaje-whatsapp")).toBeVisible();
  await foto(page, "mensaje", 2.2, lista);
}

test.afterAll(() => { if (existsSync(temporal)) rmSync(temporal, { recursive: true, force: true }); });

test("C1 pedido de hamburguesa y captura P3", async ({ page }) => {
  const lista: Fotograma[] = []; const posiciones: Posicion[] = [];
  await preparar(page, "/grabacion/pedido"); await foto(page, "menu", 1, lista);
  await pedidoP1(page, lista, posiciones); await finalizarWhatsapp(page, lista, false, posiciones);
  await quitarToque(page);
  await page.screenshot({ path: join(salida, "p3-mensaje-pedido.png"), animations: "disabled" });
  await mp4(page, "c1-pedido-hamburguesa", lista);
  writeFileSync(join(salida, "c1-pedido-hamburguesa-posiciones.json"), JSON.stringify({ video_px: { ancho: 1080, alto: 2338 }, pasos: posiciones }, null, 2));
});

test("C2 menú, tarjeta QR y carrito", async ({ page }) => {
  const lista: Fotograma[] = [];
  await preparar(page, "/grabacion/pedido"); await foto(page, "menu", .8, lista);
  await preparar(page, "/grabacion/qr"); await foto(page, "tarjeta-qr", 1.8, lista);
  await preparar(page, "/grabacion/pedido");
  await hamburguesa(page, lista); await finalizarWhatsapp(page, lista);
  await mp4(page, "c2-menu-qr-carrito", lista);
});

test("C3 pedido desde mesa y captura R3", async ({ page }) => {
  const lista: Fotograma[] = [];
  await preparar(page, "/grabacion/mesa"); await foto(page, "menu-mesa-7", 1.1, lista);
  await hamburguesa(page, lista);
  const nombre = page.getByLabel("Tu nombre"); await nombre.fill("Ana demo");
  await foto(page, "pedido-mesa", 1.8, lista);
  await quitarToque(page);
  await page.screenshot({ path: join(salida, "r3-menu-pedido-mesa.png"), animations: "disabled" });
  await tocar(page, page.getByRole("button", { name: "Enviar pedido por WhatsApp" }));
  await expect(page.getByTestId("mensaje-whatsapp")).toBeVisible(); await foto(page, "mensaje-mesa", 2, lista);
  await mp4(page, "c3-mesa-qr", lista);
});

test("C4 mesa a cocina", async ({ page }) => {
  const lista: Fotograma[] = []; const posiciones: Posicion[] = [];
  await preparar(page, "/grabacion/orden"); await foto(page, "qr-mesa-7", 1, lista);
  await hamburguesa(page, lista, posiciones);
  await page.getByLabel("Tu nombre").fill("Ana demo"); await foto(page, "enviar-cocina", 1, lista);
  await tocar(page, page.getByRole("button", { name: "Enviar pedido a la cocina" }), posiciones, "enviar-cocina");
  await page.waitForURL("**/grabacion/cocina"); await expect(page.getByText(/Mesa 7/)).toBeVisible(); await foto(page, "recibido", 1.4, lista);
  await tocar(page, page.getByRole("button", { name: "Empezar a preparar" }), posiciones, "empezar-preparar"); await foto(page, "preparando", 1.4, lista);
  await tocar(page, page.getByRole("button", { name: "Ya está listo" }), posiciones, "ya-listo");
  await tocar(page, page.getByRole("button", { name: /Listos \(1\)/ }), posiciones, "pestana-listos");
  await expect(page.getByRole("heading", { name: "#7 · Mesa 7" })).toBeVisible();
  await foto(page, "listos-mesa-7", 1.5, lista);
  await mp4(page, "c4-mesa-a-cocina", lista);
  writeFileSync(join(salida, "c4-mesa-a-cocina-posiciones.json"), JSON.stringify({ video_px: { ancho: 1080, alto: 2338 }, pasos: posiciones }, null, 2));
});

test("C5 dispositivos", async ({ page }) => {
  const lista: Fotograma[] = [];
  // P2 uses the current public demo, not the old recording fixture.  Write the
  // two source images directly where Remotion reads them so C5 and P2 cannot
  // silently diverge to an older restaurant name.
  const raizAnuncios = existsSync(join(process.cwd(), "anuncios")) ? join(process.cwd(), "anuncios") : process.cwd();
  const android = join(raizAnuncios, "public", "assets", "grabaciones", "p2-android-360.png");
  const iphone = join(raizAnuncios, "public", "assets", "grabaciones", "p2-iphone-390.png");
  const tablet = join(temporal, "tablet-qr.png");
  const computadora = join(temporal, "computadora-cocina.png");

  await page.setViewportSize({ width: 360, height: 800 });
  await preparar(page, "/demo");
  await expect(page.getByRole("button", { name: /Personalizar y agregar Hamburguesa de la casa/ })).toBeVisible();
  await page.getByRole("button", { name: "Aceptar" }).click();
  await page.screenshot({ path: android, animations: "disabled" });

  const navegadorWebkit = await webkit.launch();
  try {
    const contextoWebkit = await navegadorWebkit.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const paginaIphone = await contextoWebkit.newPage();
    await paginaIphone.goto(`${process.env.GRABACION_BASE_URL || "http://127.0.0.1:3001"}/demo`);
    await paginaIphone.evaluate(() => localStorage.clear());
    await paginaIphone.reload();
    await expect(paginaIphone.getByRole("button", { name: /Personalizar y agregar Hamburguesa de la casa/ })).toBeVisible();
    await paginaIphone.getByRole("button", { name: "Aceptar" }).click();
    await paginaIphone.screenshot({ path: iphone, animations: "disabled" });
    await contextoWebkit.close();
  } finally { await navegadorWebkit.close(); }

  await page.setViewportSize({ width: 820, height: 1180 });
  await preparar(page, "/grabacion/qr");
  await expect(page.getByAltText("Tarjeta QR real")).toBeVisible();
  await page.screenshot({ path: tablet, animations: "disabled" });

  await page.setViewportSize({ width: 1440, height: 900 });
  await preparar(page, "/grabacion/cocina");
  await expect(page.getByText(/Plan Restaurante/)).toBeVisible();
  await page.screenshot({ path: computadora, animations: "disabled" });

  const datos = [android, iphone, tablet, computadora].map((archivo) => `data:image/png;base64,${readFileSync(archivo).toString("base64")}`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setContent(`<!doctype html><style>
    *{box-sizing:border-box}body{margin:0;background:#e9e3da;font-family:system-ui;color:#1d1b19}.titulo{margin:12px 0 8px;text-align:center;font-size:18px;font-weight:900}.rejilla{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 10px 14px}.marco{margin:0;padding:5px;background:#20201f;border:5px solid #20201f;box-shadow:0 5px 12px #0004;overflow:hidden}.marco.phone{border-radius:20px}.marco.tablet{border-radius:12px}.marco.pc{border-width:5px 5px 14px;border-radius:8px}.etiqueta{display:block;margin:0 0 4px;color:white;text-align:center;font-size:9px;font-weight:800}.pantalla{display:block;width:100%;height:245px;object-fit:cover;object-position:top}.tablet .pantalla{height:180px}.pc .pantalla{height:155px}
  </style><div class="titulo">Pidewat en cada dispositivo</div><div class="rejilla"><figure class="marco phone"><figcaption class="etiqueta">Android · Chromium · 360×800</figcaption><img class="pantalla" src="${datos[0]}"></figure><figure class="marco phone"><figcaption class="etiqueta">iPhone · WebKit · 390×844</figcaption><img class="pantalla" src="${datos[1]}"></figure><figure class="marco tablet"><figcaption class="etiqueta">Tablet · panel QR · 820×1180</figcaption><img class="pantalla" src="${datos[2]}"></figure><figure class="marco pc"><figcaption class="etiqueta">Computadora · cocina · 1440×900</figcaption><img class="pantalla" src="${datos[3]}"></figure></div>`);
  await page.locator("img").last().waitFor({ state: "visible" });
  await foto(page, "dispositivos-reales", 4, lista);
  await mp4(page, "c5-dispositivos", lista);
});
