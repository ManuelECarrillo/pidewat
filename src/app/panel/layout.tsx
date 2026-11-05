import Link from "next/link";
import AvisoClave from "@/components/AvisoClave";
import NavPanel from "@/components/NavPanel";
import { esAdmin, usuarioActual } from "@/lib/sesion";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi panel" };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await usuarioActual();
  const pedirClave = Boolean(user && !user.user_metadata?.clave_cambiada);
  const admin = user ? await esAdmin() : false;
  return (
    <>
      <header className="top">
        <div className="wrap-ancho">
          <Link href="/panel" className="marca">Pide<b>wat</b></Link>
          <div className="grow" />
          <NavPanel />
          {admin && <Link href="/admin" className="btn btn-sm" style={{ marginRight: 8 }}>Admin</Link>}
          <form action="/salir" method="post"><button className="btn btn-sm">Salir</button></form>
        </div>
      </header>
      <main className="wrap-ancho panel-main" style={{ padding: "18px 16px 48px" }}>
        {pedirClave && <AvisoClave />}
        {children}
      </main>
    </>
  );
}
