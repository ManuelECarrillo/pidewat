"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import s from "./Landing.module.css";

// Aparece suave cuando entra en pantalla.
// Mejora progresiva: el HTML llega VISIBLE (sin JS, buscadores y vistas previas lo ven todo).
// Solo si el bloque todavía está abajo de la pantalla al cargar, se oculta y aparece al llegar a él.
// Con "reducir movimiento" el CSS lo deja fijo.
// `como="li"` para usarlo directo dentro de listas sin romper el HTML.
export default function Revelar({
  children, retraso = 0, className = "", como = "div",
}: { children: ReactNode; retraso?: number; className?: string; como?: "div" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // ya se ve: no se anima
    setOculto(true);
    const io = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting)) { setOculto(false); io.disconnect(); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const props = {
    className: `${s.revelar} ${oculto ? s.oculto : ""} ${className}`,
    style: { transitionDelay: oculto ? "0ms" : `${retraso}ms` },
  };
  return como === "li"
    ? <li ref={ref as React.RefObject<HTMLLIElement>} {...props}>{children}</li>
    : <div ref={ref as React.RefObject<HTMLDivElement>} {...props}>{children}</div>;
}
