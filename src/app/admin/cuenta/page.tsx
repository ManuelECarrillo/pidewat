import Link from "next/link";
import { requiereAdmin, usuarioActual } from "@/lib/sesion";
import FormCorreo from "./FormCorreo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi cuenta de admin" };

export default async function Cuenta() {
  await requiereAdmin();
  const { user } = await usuarioActual();
  return (
    <div className="stack" style={{ maxWidth: 480 }}>
      <div className="row between"><h1 style={{ fontSize: "1.5rem", margin: 0 }}>Mi cuenta</h1><Link href="/admin" className="btn btn-sm">Volver</Link></div>
      <FormCorreo actual={user?.email || ""} />
    </div>
  );
}
