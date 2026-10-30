import { createClient } from "@supabase/supabase-js";

// Cliente sin sesión: solo lee lo público (menús). Se usa en las páginas de cada negocio.
export function supabasePublico() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
}

export const supabaseConfigurado = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
