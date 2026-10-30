"use client";

import { useFormStatus } from "react-dom";

export default function BotonEnviar({ children, className = "btn btn-p", confirmar }: { children: React.ReactNode; className?: string; confirmar?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} onClick={(e) => { if (confirmar && !confirm(confirmar)) e.preventDefault(); }}>
      {pending ? "Guardando…" : children}
    </button>
  );
}
