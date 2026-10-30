import Link from "next/link";
import NavPanel from "@/components/NavPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi panel" };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="top">
        <div className="wrap-ancho">
          <Link href="/panel" className="marca">Pide<b>wat</b></Link>
          <div className="grow" />
          <NavPanel />
          <form action="/salir" method="post"><button className="btn btn-sm">Salir</button></form>
        </div>
      </header>
      <main className="wrap-ancho panel-main" style={{ padding: "18px 16px 48px" }}>{children}</main>
    </>
  );
}
