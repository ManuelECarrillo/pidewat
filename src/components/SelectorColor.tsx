"use client";

import { useState } from "react";

const COLORES = ["#d9480f", "#e4572e", "#c92a2a", "#a61e4d", "#862e9c", "#5f3dc4", "#1971c2", "#0c8599", "#2b8a3e", "#5c940d", "#e67700", "#495057"];

// Paleta de colores en lugar del selector de color del sistema.
export default function SelectorColor({ name, valor }: { name: string; valor: string }) {
  const [color, setColor] = useState(valor);
  const lista = COLORES.includes(color.toLowerCase()) ? COLORES : [color, ...COLORES];
  return (
    <div className="colores">
      <input type="hidden" name={name} value={color} />
      {lista.map((c) => (
        <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={c === color} className={c === color ? "on" : ""}
          style={{ background: c }} onClick={() => setColor(c)} />
      ))}
    </div>
  );
}
