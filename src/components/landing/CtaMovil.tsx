"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BotonProbar } from "./Medicion";
import s from "./Landing.module.css";

export default function CtaMovil({ href, children }: { href: string; children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const actualizar = () => {
      const hero = document.getElementById("inicio");
      const final = document.getElementById("cta-final");
      if (!hero || !final) return;
      const pasoHero = window.scrollY > hero.offsetHeight * .7;
      const cercaDelFinal = final.getBoundingClientRect().top < window.innerHeight * 1.15;
      setVisible(pasoHero && !cercaDelFinal);
    };
    actualizar();
    window.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar);
    return () => {
      window.removeEventListener("scroll", actualizar);
      window.removeEventListener("resize", actualizar);
    };
  }, []);

  if (!visible) return null;
  return (
    <div className={s.ctaMovil}>
      <BotonProbar href={href} origen="movil" className={s.ctaMovilBoton}>{children}</BotonProbar>
    </div>
  );
}
