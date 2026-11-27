"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { guardarUtm, medir } from "@/lib/medicion";

// Se monta una vez en la landing: guarda las UTM del anuncio (para que lleguen a /empezar)
// y cuenta la visita. No usa cookies ni datos personales.
export function MedirVisita() {
  useEffect(() => {
    guardarUtm();
    medir("landing_visita", { unaVez: true });
  }, []);
  return null;
}

type Origen = "hero" | "planes" | "final" | "barra";

// Botón de "Probar gratis": cuenta el clic y lleva a /empezar. Es un link normal,
// así que funciona aunque la medición falle.
export function BotonProbar({
  href, origen, className, children,
}: { href: string; origen: Origen; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={className} onClick={() => medir("probar_click", { detalle: origen })}>
      {children}
    </Link>
  );
}

// "Ver cómo funciona": baja a la demo y lo cuenta
export function BotonVerDemo({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a href="#demo" className={className} onClick={() => medir("ver_demo")}>
      {children}
    </a>
  );
}
