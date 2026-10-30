import Link from "next/link";

export default function NoEncontrado() {
  return (
    <main className="wrap" style={{ paddingTop: 64, textAlign: "center" }}>
      <h1>No encontramos este menú</h1>
      <p className="muted">Revisa que el link esté bien escrito.</p>
      <Link href="/" className="btn">Ir a Pidewa</Link>
    </main>
  );
}
