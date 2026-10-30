"use client";

// En el menú público abierto desde el panel: regresa al panel sin salirse de la app instalada.
export default function BotonVolver({ a }: { a: "/panel" | "/admin" }) {
  const volver = () => {
    if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) window.history.back();
    else window.location.href = a;
  };
  return (
    <button type="button" className="volver" onClick={volver}>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {a === "/admin" ? "Volver al admin" : "Volver a mi panel"}
    </button>
  );
}
