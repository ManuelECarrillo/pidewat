import Link from "next/link";
import FormRecuperar from "./FormRecuperar";

export const metadata = { title: "Recuperar contraseña", robots: { index: false } };

export default async function Recuperar({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="wrap" style={{ maxWidth: 420, paddingTop: 48 }}>
      <Link href="/" className="marca" style={{ fontSize: "1.6rem" }}>Pide<b>wat</b></Link>
      <h1 style={{ fontSize: "1.4rem", marginTop: 18 }}>¿Olvidaste tu contraseña?</h1>
      <p className="muted" style={{ marginTop: 0 }}>Escribe el correo con el que entras y te mandamos un enlace para poner una nueva.</p>
      {error === "enlace" && <div className="alerta" style={{ marginBottom: 12 }}>Ese enlace ya venció o ya se usó. Pide uno nuevo.</div>}
      <FormRecuperar />
      <p className="small" style={{ marginTop: 14 }}><Link href="/entrar">Volver a entrar</Link></p>
    </main>
  );
}
