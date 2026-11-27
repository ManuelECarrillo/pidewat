// Render sin CLI: evita que la detección de configuración suba fuera del sandbox.
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const id = process.argv[2];
const output = process.argv[3];
if (!id || !output) throw new Error("Uso: node scripts/render-sandbox.mjs P1v2-9x16 salida/pilotos/P1-9x16.mp4");
console.log(`Bundling ${id}…`);
mkdirSync(resolve(root, output, ".."), { recursive: true });
const serveUrl = await bundle({
  entryPoint: resolve(root, "src/index.ts"), rootDir: root, publicDir: resolve(root, "public"), enableCaching: false,
  webpackOverride: (config) => ({ ...config, cache: false, resolve: { ...config.resolve, modules: [resolve(root, "node_modules")], symlinks: false } }),
});
const composition = await selectComposition({ serveUrl, id });
console.log(`Rendering ${id}…`);
await renderMedia({ composition, serveUrl, codec: "h264", audioCodec: "aac", crf: 20, outputLocation: resolve(root, output), concurrency: 2 });
console.log(`Done: ${output}`);
