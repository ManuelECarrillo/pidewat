import Link from "next/link";
import AvisoClave from "@/components/AvisoClave";
import AvisoCorreo from "@/components/AvisoCorreo";
import AvisoNovedades from "@/components/AvisoNovedades";
import NavPanel from "@/components/NavPanel";
import { NOVEDADES } from "@/lib/novedades";
import { esAdmin, usuarioActual } from "@/lib/sesion";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi panel" };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { sb, user } = await usuarioActual();
  const pedirClave = Boolean(user && !user.user_metadata?.clave_cambiada);
  const pedirCorreo = Boolean(user?.email && user.user_metadata?.correo_pendiente);
  const verNovedades = Boolean(user && new Date(user.created_at) < new Date(NOVEDADES.desde)
    && Number(user.user_metadata?.novedades_vistas || 0) < NOVEDADES.version);
  const admin = user ? await esAdmin() : false;
  const { data: n } = user
    ? await sb.from("businesses").select("cocina").eq("owner_id", user.id).order("created_at").limit(1).maybeSingle()
    : { data: null };
  return (
    <>
      <header className="top">
        <div className="wrap-ancho">
          <Link href="/panel" className="marca">Pide<b>wat</b></Link>
          <div className="grow" />
          <NavPanel cocina={Boolean(n?.cocina)} />
          {admin && <Link href="/admin" className="btn btn-sm" style={{ marginRight: 8 }}>Admin</Link>}
          <form action="/salir" method="post"><button className="btn btn-sm">Salir</button></form>
        </div>
      </header>
      <main className="wrap-ancho panel-main" style={{ padding: "18px 16px 48px" }}>
        {pedirCorreo && <AvisoCorreo correo={user!.email!} />}
        {pedirClave && <AvisoClave />}
        {verNovedades && !pedirCorreo && <AvisoNovedades />}
        {children}
      </main>
    </>
  );
}
