import Link from "next/link";
import InstalarApp from "@/components/InstalarApp";
import FormEntrar from "./FormEntrar";
import { correoActivo } from "@/lib/correo";

export const metadata = { title: "Entrar" };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ error?: string; sig?: string }> }) {
  const { error, sig } = await searchParams;
  return (
    <main className="wrap" style={{ maxWidth: 420, paddingTop: 48 }}>
      <Link href="/" className="marca" style={{ fontSize: "1.6rem" }}>Pide<b>wat</b></Link>
      <h1 style={{ fontSize: "1.4rem", marginTop: 18 }}>Entrar a tu panel</h1>
      {error === "sin-negocio" && (
        <div className="alerta" style={{ marginBottom: 12 }}>Tu cuenta todavía no tiene un negocio. <Link href="/empezar?plan=esencial">Crea tu menú gratis</Link>.</div>
      )}
      {error === "enlace" && <div className="alerta" style={{ marginBottom: 12 }}>Ese enlace ya venció o ya se usó. Entra con tu correo y contraseña.</div>}
      <FormEntrar sig={sig} correoActivo={correoActivo()} />
      <div style={{ marginTop: 14 }}><InstalarApp variante="boton" /></div>
    </main>
  );
}
