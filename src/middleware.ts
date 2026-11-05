import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresca la sesión en /panel y /admin. Los menús públicos no pasan por aquí.
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return res;
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        lista.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await sb.auth.getUser();
  // Sin sesión en /panel o /admin: a entrar, recordando a dónde iba para regresarlo después
  const ruta = req.nextUrl.pathname;
  if (!data.user && ruta !== "/entrar") {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = `?sig=${encodeURIComponent(ruta + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = { matcher: ["/panel/:path*", "/admin/:path*", "/entrar"] };
