"use client";

export default function Imprimir() {
  return <button className="btn btn-p" onClick={() => window.print()}>Imprimir</button>;
}
