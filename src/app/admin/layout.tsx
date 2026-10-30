import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="top">
        <div className="wrap-ancho">
          <Link href="/admin" className="marca">Pide<b>wa</b> <span className="pill">admin</span></Link>
          <div className="grow" />
          <form action="/salir" method="post"><button className="btn btn-sm">Salir</button></form>
        </div>
      </header>
      <main className="wrap-ancho" style={{ padding: "18px 16px 48px" }}>{children}</main>
    </>
  );
}
