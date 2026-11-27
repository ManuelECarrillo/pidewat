"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type AccionFormulario = (formData: FormData) => void | Promise<void>;

function AvisoExito({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  const [visible, setVisible] = useState(false);
  const estabaGuardando = useRef(false);

  useEffect(() => {
    if (pending) {
      estabaGuardando.current = true;
      return;
    }
    if (!estabaGuardando.current) return;

    estabaGuardando.current = false;
    setVisible(true);
    const ocultar = window.setTimeout(() => setVisible(false), 2_600);
    return () => window.clearTimeout(ocultar);
  }, [pending]);

  return visible ? <p className="aviso-exito" role="status">{children}</p> : null;
}

// Conserva las server actions existentes y avisa al terminar el guardado.
export default function FormularioConAviso({ accion, children, className, exito }: {
  accion: AccionFormulario;
  children: React.ReactNode;
  className?: string;
  exito: string;
}) {
  return (
    <form action={accion} className={className}>
      {children}
      <AvisoExito>{exito}</AvisoExito>
    </form>
  );
}
