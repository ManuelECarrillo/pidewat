import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";
import FormClave from "./FormClave";

export const metadata = { title: "Contraseña nueva", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NuevaClave() {
  const { data } = await (await supabaseServidor()).auth.getUser();
  if (!data.user) redirect("/recuperar?error=enlace");
  return (
    <main className="wrap" style={{ maxWidth: 420, paddingTop: 48 }}>
      <Link href="/" className="marca" style={{ fontSize: "1.6rem" }}>Pide<b>wat</b></Link>
      <h1 style={{ fontSize: "1.4rem", marginTop: 18 }}>Pon tu contraseña nueva</h1>
      <p className="muted" style={{ marginTop: 0 }}>Para {data.user.email}</p>
      <FormClave />
    </main>
  );
}
