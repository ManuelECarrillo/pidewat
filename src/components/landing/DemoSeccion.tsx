"use client";

import { useState } from "react";
import Demo, { PASOS_DEMO } from "./Demo";
import { Telefono } from "./Mockups";
import s from "./Landing.module.css";

// La demo dentro de un celular, con la lista de pasos al lado que se ilumina según avanza
export default function DemoSeccion() {
  const [paso, setPaso] = useState(0);
  return (
    <div className={s.demoGrid}>
      <ol className={s.demoPasos}>
        {PASOS_DEMO.map((t, i) => (
          <li key={t} className={i === paso ? s.demoPasoActivo : i < paso ? s.demoPasoHecho : ""} aria-current={i === paso ? "step" : undefined}>
            <span>{String(i + 1).padStart(2, "0")}</span>{t}
          </li>
        ))}
      </ol>
      <div className={s.demoTelefono}>
        <p className={s.demoAviso}>Demo con un negocio ficticio. No se envía ningún pedido real.</p>
        <Telefono className={s.telefonoDemo} etiqueta="Demostración interactiva del menú de Pidewat" interactivo>
          <Demo onPaso={(p) => setPaso((a) => (p === 0 ? 0 : Math.max(a, p)))} />
        </Telefono>
      </div>
    </div>
  );
}
