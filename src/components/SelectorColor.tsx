"use client";

import { useRef, useState } from "react";

const COLORES = ["#d9480f", "#e4572e", "#c92a2a", "#a61e4d", "#862e9c", "#5f3dc4", "#1971c2", "#0c8599", "#2b8a3e", "#5c940d", "#e67700", "#495057"];

// --- Conversión de colores (HSV ↔ hex) para el cuadro de color libre ---
function hexAHsv(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}
function hsvAHex(h: number, s: number, v: number) {
  const f = (k: number) => { const x = (k + h / 60) % 6; return v - v * s * Math.max(0, Math.min(x, 4 - x, 1)); };
  return "#" + [f(5), f(3), f(1)].map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
}
const esHex = (t: string) => /^#[0-9a-f]{6}$/i.test(t);

// Arrastrar dentro de una caja y avisar la posición de 0 a 1 (sirve con dedo y con mouse)
function useArrastre(alMover: (x: number, y: number) => void) {
  const caja = useRef<HTMLDivElement>(null);
  const mover = (e: React.PointerEvent) => {
    const r = caja.current!.getBoundingClientRect();
    alMover(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
  };
  return {
    ref: caja,
    onPointerDown: (e: React.PointerEvent) => { caja.current!.setPointerCapture(e.pointerId); mover(e); },
    onPointerMove: (e: React.PointerEvent) => { if (e.buttons) mover(e); },
  };
}

// Paleta rápida + "Otro color" con cuadro libre (en lugar del selector de color gris del sistema).
export default function SelectorColor({ name, valor }: { name: string; valor: string }) {
  const [color, setColor] = useState(valor);
  const [libre, setLibre] = useState(false);
  const [hsv, setHsv] = useState(() => hexAHsv(esHex(valor) ? valor : "#e4572e"));
  const [texto, setTexto] = useState(valor);

  const poner = (h: number, s: number, v: number) => {
    setHsv({ h, s, v });
    const hex = hsvAHex(h, s, v);
    setColor(hex);
    setTexto(hex);
  };
  const cuadro = useArrastre((x, y) => poner(hsv.h, x, 1 - y));
  const barra = useArrastre((x) => poner(x * 359, hsv.s, hsv.v));

  const lista = COLORES.includes(color.toLowerCase()) ? COLORES : [color, ...COLORES];
  return (
    <div>
      <input type="hidden" name={name} value={color} />
      <div className="colores">
        {lista.map((c) => (
          <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={c === color} className={c === color ? "on" : ""}
            style={{ background: c }} onClick={() => { setColor(c); setTexto(c); setHsv(hexAHsv(c)); }} />
        ))}
        <button type="button" className={`otro-color ${libre ? "on" : ""}`} aria-label="Otro color" aria-expanded={libre} onClick={() => setLibre((l) => !l)} />
      </div>

      {libre && (
        <div className="color-libre">
          <div className="color-cuadro" {...cuadro} style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)` }} role="slider" aria-label="Intensidad del color"
            aria-valuetext={color}>
            <span className="color-punto" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: color }} />
          </div>
          <div className="color-barra" {...barra} role="slider" aria-label="Tono" aria-valuemin={0} aria-valuemax={359} aria-valuenow={Math.round(hsv.h)}>
            <span className="color-punto" style={{ left: `${(hsv.h / 359) * 100}%`, top: "50%", background: `hsl(${hsv.h} 100% 50%)` }} />
          </div>
          <div className="row" style={{ gap: 10 }}>
            <span className="color-muestra" style={{ background: color }} />
            <input className="i grow" style={{ marginTop: 0 }} value={texto} maxLength={7} aria-label="Código del color"
              onChange={(e) => {
                const t = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
                setTexto(t);
                if (esHex(t)) { setColor(t.toLowerCase()); setHsv(hexAHsv(t)); }
              }} />
          </div>
        </div>
      )}
    </div>
  );
}
