import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const out = join(process.cwd(), "public", "assets", "sfx");
mkdirSync(out, { recursive: true });
const rate = 44100;
function wav(name, seconds, fn) {
  const n = Math.floor(rate * seconds), b = Buffer.alloc(44 + n * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.max(-1, Math.min(1, fn(i / rate))) * 32767, 44 + i * 2);
  writeFileSync(join(out, `${name}.wav`), b);
}
const env = (t, d) => Math.exp(-7 * t / d);
wav("ping", .28, t => .22 * env(t,.28) * (Math.sin(2*Math.PI*880*t) + .55*Math.sin(2*Math.PI*1320*t)));
wav("tap", .12, t => .28 * env(t,.12) * Math.sin(2*Math.PI*(180 - 90*t)*t));
wav("whoosh", .36, t => .12 * env(t,.36) * (Math.random()*2-1) * Math.sin(Math.PI*t/.36));
wav("bell", .8, t => .19 * env(t,.8) * (Math.sin(2*Math.PI*1175*t) + .42*Math.sin(2*Math.PI*1760*t)));
