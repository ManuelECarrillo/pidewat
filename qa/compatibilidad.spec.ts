import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { linkWhatsapp } from "../src/lib/whatsapp";

const capturas = path.resolve(process.cwd(), "docs/anuncios/qa");

async function capturar(page: Page, nombre: string) {
  // Revelar usa IntersectionObserver: al recorrer la landing la captura representa la página como la ve alguien al bajar.
  await page.evaluate(async () => {
    const paso = Math.max(320, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.body.scrollHeight; y += paso) {
      window.scrollTo(0, y);
      await new Promise((resolver) => window.setTimeout(resolver, 80));
    }
    window.scrollTo(0, 0);
  });
  await mkdir(capturas, { recursive: true });
  await page.screenshot({ path: path.join(capturas, nombre), fullPage: true });
}

test.describe("compatibilidad pública", () => {
  test("landing, variantes y consentimiento", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Usamos cookies de Meta para medir nuestros anuncios")).toBeVisible();
    await capturar(page, `landing-${testInfo.project.name}-antes.png`);
    await page.getByRole("button", { name: "Rechazar" }).click();
    await expect(page.getByText("Usamos cookies de Meta para medir nuestros anuncios")).toBeHidden();
    await capturar(page, `landing-${testInfo.project.name}-despues.png`);

    await page.goto("/?p=puestos");
    await expect(page.getByText("Para taquerías, hamburguesas, hot dogs y food trucks")).toBeVisible();
    await page.goto("/?p=restaurantes");
    await expect(page.getByText("Para fondas y restaurantes con mesas")).toBeVisible();
    await expect(page.getByText("Tu menú con QR en cada mesa.")).toBeVisible();
  });

  test("demo, menú público, carrito y enlace de WhatsApp", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("button", { name: /personalizar y agregar gordita de chicharrón prensado/i }).click();
    await page.getByText("Queso extra").click();
    await page.getByRole("dialog").getByRole("button", { name: /^Agregar 1/ }).click();
    await page.getByRole("button", { name: /carrito|ver pedido/i }).click();
    const pedido = page.getByRole("dialog", { name: "Tu pedido" });
    await pedido.getByRole("textbox", { name: "Tu nombre" }).fill("Ana");
    // El sandbox bloquea la salida a WhatsApp; verificamos el botón y la URL que usa.
    await expect(pedido.getByRole("button", { name: "Enviar pedido por WhatsApp" })).toBeVisible();
    expect(linkWhatsapp("5216180000000", "Pedido QA")).toBe("https://api.whatsapp.com/send?phone=5216180000000&text=Pedido%20QA");
  });

  test("registro y entrar validan sin crear cuentas", async ({ page }) => {
    await page.goto("/empezar?plan=esencial");
    // La protección antirobot necesita un intervalo humano antes de enviar.
    await expect(page.locator('input[name="t0"]')).not.toHaveValue("");
    await page.waitForTimeout(2_600);
    await page.getByRole("button", { name: "Crear mi menú gratis" }).click();
    await expect(page.getByText(/escribe el nombre de tu negocio/i)).toBeVisible();
    await page.goto("/entrar");
    await expect(page.getByRole("heading", { name: "Entrar a tu panel" })).toBeVisible();
  });
});

test("panel, QR, plan y cocina del negocio ficticio", async ({ page }) => {
  test.skip(!process.env.QA_PANEL_STORAGE_STATE, "Requiere QA_PANEL_STORAGE_STATE con la sesión del negocio ficticio; no crea ni usa cuentas reales.");
  await page.goto("/panel");
  await expect(page.getByRole("link", { name: /menú/i })).toBeVisible();
  await page.goto("/panel/qr");
  await expect(page.getByText(/QR/i).first()).toBeVisible();
  await page.goto("/panel/plan");
  await expect(page.getByRole("heading", { name: "Mi plan" })).toBeVisible();
  await page.goto("/panel/cocina");
  await expect(page.locator("body")).toContainText(/cocina|pedidos/i);
});
