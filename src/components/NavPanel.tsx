"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const I = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const SECCIONES = [
  { href: "/panel", texto: "Inicio", icono: I("M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z") },
  { href: "/panel/menu", texto: "Menú", icono: I("M4 6h16M4 12h16M4 18h10") },
  { href: "/panel/negocio", texto: "Mi negocio", icono: I("M4 9h16l-1-5H5zM5 9v11h14V9M9 20v-6h6v6") },
  { href: "/panel/plan", texto: "Plan", icono: I("M3 7h18v10H3zM3 11h18M7 15h3") },
];

// Las 4 secciones siempre a la vista (sin menú que haya que deslizar).
export default function NavPanel() {
  const ruta = usePathname();
  return (
    <nav className="nav" aria-label="Secciones">
      {SECCIONES.map((s) => {
        const activa = s.href === "/panel" ? ruta === "/panel" : ruta.startsWith(s.href);
        return (
          <Link key={s.href} href={s.href} className={activa ? "on" : ""} aria-current={activa ? "page" : undefined}>
            {s.icono}
            <span>{s.texto}</span>
          </Link>
        );
      })}
    </nav>
  );
}
