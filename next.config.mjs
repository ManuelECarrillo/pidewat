// SEG-005: encabezados de seguridad básicos. Sin Content-Security-Policy por ahora:
// las fotos vienen de Supabase y hay estilos en línea; se agrega con calma y probando.
const encabezados = [
  { key: "X-Frame-Options", value: "DENY" }, // nadie puede meter el panel en un iframe para engañar al dueño
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  async headers() {
    return [{ source: "/:path*", headers: encabezados }];
  },
};
export default nextConfig;
