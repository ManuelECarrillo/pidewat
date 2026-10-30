import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi panel" };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="top">
        <div className="wrap-ancho">
          <Link href="/panel" className="marca">Pide<b>wat</b></Link>
          <nav className="nav grow">
            <Link href="/panel">Inicio</Link>
            <Link href="/panel/menu">Menú</Link>
            <Link href="/panel/negocio">Mi negocio</Link>
            <Link href="/panel/plan">Plan</Link>
          </nav>
          <form action="/salir" method="post"><button className="btn btn-sm">Salir</button></form>
        </div>
      </header>
      <main className="wrap-ancho" style={{ padding: "18px 16px 48px" }}>{children}</main>
    </>
  );
}
