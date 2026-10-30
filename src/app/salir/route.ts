import { NextResponse } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

export async function POST(req: Request) {
  const sb = await supabaseServidor();
  await sb.auth.signOut();
  return NextResponse.redirect(new URL("/entrar", req.url), { status: 303 });
}
