"use client";

import { useRef, useState } from "react";
import { avisarCambio } from "./Selector";

const COLORES = ["#d9480f", "#e4572e", "#c92a2a", "#a61e4d", "#862e9c", "#5f3dc4", "#1971c2", "#0c8599", "#2b8a3e", "#5c940d", "#e67700", "#495057"];

function hslAHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))).toString(16).padStart(2, "0");
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexAHsl(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return { h: 0, s: 0, l: Math.round(l * 100) };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: Math.round((h * 60 + 360) % 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Paleta de colores propia (sin el selector gris del sistema): colores sugeridos o cualquier otro con las barras.
export default function SelectorColor({ name, valor }: { name: string; valor: string }) {
  const [color, setColor] = useState(valor);
  const [otro, setOtro] = useState(false);
  const [texto, setTexto] = useState(valor);
  const caja = useRef<HTMLDivElement>(null);
  const hsl = hexAHsl(/^#[0-9a-f]{6}$/i.test(color) ? color : "#e4572e");

  const poner = (c: string) => { setColor(c); setTexto(c); avisarCambio(caja.current); };
  const lista = COLORES.includes(color.toLowerCase()) ? COLORES : [color, ...COLORES];

  return (
    <div ref={caja}>
      <input type="hidden" name={name} value={color} />
      <div className="colores">
        {lista.map((c) => (
          <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={c === color} className={c === color ? "on" : ""}
            style={{ background: c }} onClick={() => poner(c)} />
        ))}
        <button type="button" className={`colores-otro ${otro ? "on" : ""}`} aria-expanded={otro} aria-label="Elegir otro color" onClick={() => setOtro((o) => !o)} />
      </div>
      {otro && (
        <div className="paleta">
          <div className="row">
            <div className="paleta-muestra" style={{ background: color }} />
            <label className="small grow">Código
              <input className="i" value={texto} maxLength={7} spellCheck={false} autoCapitalize="off"
                onChange={(e) => { const v = e.target.value.trim(); setTexto(v); if (/^#[0-9a-f]{6}$/i.test(v)) { setColor(v.toLowerCase()); avisarCambio(caja.current); } }} />
            </label>
          </div>
          <label className="small">Color
            <input type="range" className="barra-color barra-tono" min={0} max={359} value={hsl.h} aria-label="Color"
              onChange={(e) => poner(hslAHex(Number(e.target.value), Math.max(hsl.s, 45), hsl.l > 8 && hsl.l < 92 ? hsl.l : 45))} />
          </label>
          <label className="small">Más claro o más oscuro
            <input type="range" className="barra-color" min={15} max={70} value={Math.min(70, Math.max(15, hsl.l))} aria-label="Claro u oscuro"
              style={{ background: `linear-gradient(to right, ${hslAHex(hsl.h, hsl.s, 15)}, ${hslAHex(hsl.h, hsl.s, 42)}, ${hslAHex(hsl.h, hsl.s, 70)})` }}
              onChange={(e) => poner(hslAHex(hsl.h, hsl.s, Number(e.target.value)))} />
          </label>
          <label className="small">Intensidad
            <input type="range" className="barra-color" min={0} max={100} value={hsl.s} aria-label="Intensidad"
              style={{ background: `linear-gradient(to right, ${hslAHex(hsl.h, 0, hsl.l)}, ${hslAHex(hsl.h, 100, hsl.l)})` }}
              onChange={(e) => poner(hslAHex(hsl.h, Number(e.target.value), hsl.l))} />
          </label>
          <p className="small muted" style={{ margin: 0 }}>Tip: los colores medios u oscuros se leen mejor con letra blanca.</p>
        </div>
      )}
    </div>
  );
}
