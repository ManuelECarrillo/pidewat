/*
 * Capturas de auditoría. Ejecutar con la app local en http://localhost:3130:
 *   node docs/ui-ux/scripts/capturar-antes.cjs
 * Para la evidencia posterior: node docs/ui-ux/scripts/capturar-antes.cjs despues
 *
 * No abre WhatsApp ni envía pedidos. Solo llega al botón de envío.
 */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("C:/Users/Familia CA/.claude/skills/gstack/node_modules/playwright-core");

const baseUrl = process.env.PIDEWAT_AUDIT_URL || "http://localhost:3130";
const destino = process.argv[2] || process.env.PIDEWAT_CAPTURAS || "antes";
const output = path.resolve(__dirname, "../capturas", destino);
const viewports = [
  { nombre: "movil-360", width: 360, height: 800, isMobile: true },
  { nombre: "movil-390", width: 390, height: 844, isMobile: true },
  { nombre: "escritorio-1440", width: 1440, height: 1000, isMobile: false },
];

fs.mkdirSync(output, { recursive: true });

function archivo(pantalla, viewport) {
  return path.join(output, `${pantalla}-${viewport.nombre}.png`);
}

async function esperarMenu(page) {
  await page.goto(`${baseUrl}/demo`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "El Fogón de Durango" }).waitFor();
}

async function capturarDemo(page, viewport) {
  await esperarMenu(page);
  await page.screenshot({ path: archivo("menu-publico", viewport), fullPage: true });

  const buscar = page.getByPlaceholder("Buscar platillo…");
  await buscar.fill("Agua fresca");
  await page.getByRole("button", { name: "Agregar Agua fresca" }).click();
  const hojaTamano = page.getByRole("dialog", { name: "Arma tu Agua fresca" });
  await hojaTamano.getByRole("button", { name: /1 litro/ }).click();
  await page.screenshot({ path: archivo("hoja-tamano", viewport), fullPage: false });
  await hojaTamano.getByRole("button", { name: /Agregar 1/ }).click();

  await buscar.fill("Gordita de chicharrón prensado");
  await page.getByRole("button", { name: "Agregar Gordita de chicharrón prensado" }).click();
  const hojaExtras = page.getByRole("dialog", { name: "Arma tu Gordita de chicharrón prensado" });
  await hojaExtras.getByRole("button", { name: /Queso extra/ }).click();
  await hojaExtras.getByRole("button", { name: /Salsa/ }).click();
  await page.screenshot({ path: archivo("hoja-extras-ingredientes", viewport), fullPage: false });
  await hojaExtras.getByRole("button", { name: /Agregar 1/ }).click();

  await page.getByRole("button", { name: /Ver pedido/ }).click();
  await page.getByRole("button", { name: "Recoger" }).click();
  await page.getByLabel("Tu nombre").fill("Ana");
  // Se llega a un botón habilitado, pero no se toca: abriría WhatsApp.
  await page.getByRole("button", { name: "Enviar pedido por WhatsApp" }).waitFor();
  await page.screenshot({ path: archivo("carrito", viewport), fullPage: false });
}

async function capturarRuta(page, viewport, pantalla, ruta) {
  await page.goto(`${baseUrl}${ruta}`, { waitUntil: "networkidle" });
  // La landing revela contenido al entrar al viewport. Recórrela antes de la
  // captura completa para documentar la pantalla ya vista por una persona.
  if (ruta === "/") {
    await page.evaluate(async () => {
      const pausa = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const alto = document.documentElement.scrollHeight;
      for (let y = 0; y < alto; y += Math.max(400, window.innerHeight - 80)) {
        window.scrollTo(0, y);
        await pausa(80);
      }
      window.scrollTo(0, 0);
      await pausa(120);
    });
  }
  await page.screenshot({ path: archivo(pantalla, viewport), fullPage: true });
}

async function main() {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.isMobile,
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      await capturarDemo(page, viewport);
      await capturarRuta(page, viewport, "entrar", "/entrar");
      await capturarRuta(page, viewport, "landing", "/");
      await capturarRuta(page, viewport, "empezar", "/empezar");
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
