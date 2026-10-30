import Link from "next/link";
import FormEntrar from "./FormEntrar";

export const metadata = { title: "Entrar" };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="wrap" style={{ maxWidth: 420, paddingTop: 48 }}>
      <Link href="/" className="marca" style={{ fontSize: "1.6rem" }}>Pide<b>wat</b></Link>
      <h1 style={{ fontSize: "1.4rem", marginTop: 18 }}>Entrar a tu panel</h1>
      {error === "sin-negocio" && (
        <div className="alerta" style={{ marginBottom: 12 }}>Tu cuenta todavía no tiene un negocio. Escríbenos por WhatsApp y te lo damos de alta.</div>
      )}
      <FormEntrar />
    </main>
  );
}
