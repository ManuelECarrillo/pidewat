import type { ReactNode } from "react";

// Muestra el texto como lo pinta WhatsApp: *negritas* y _cursivas_, respetando los saltos de línea.
// Se arma con nodos de React (nunca con HTML crudo) para que no se pueda inyectar nada.
export function textoWhatsapp(texto: string): ReactNode {
  return texto.split("\n").map((linea, i) => (
    <span key={i} style={{ display: "block", minHeight: "1.25em" }}>
      {partes(linea)}
    </span>
  ));
}

function partes(linea: string): ReactNode[] {
  const nodos: ReactNode[] = [];
  const re = /\*([^*]+)\*|_([^_]+)_/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(linea))) {
    if (m.index > ultimo) nodos.push(linea.slice(ultimo, m.index));
    nodos.push(m[1] != null ? <strong key={k++}>{m[1]}</strong> : <em key={k++}>{m[2]}</em>);
    ultimo = m.index + m[0].length;
  }
  if (ultimo < linea.length) nodos.push(linea.slice(ultimo));
  return nodos;
}
