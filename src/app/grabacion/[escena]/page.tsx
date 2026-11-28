import { notFound } from "next/navigation";
import Grabacion from "./Grabacion";

const ESCENAS = new Set(["pedido", "qr", "mesa", "orden", "cocina", "dispositivos"]);

// No es una ruta de producto: existe exclusivamente para capturar evidencia local con datos ficticios.
export default async function PaginaGrabacion({ params }: { params: Promise<{ escena: string }> }) {
  const { escena } = await params;
  if (process.env.PIDEWAT_GRABACION !== "1" || !ESCENAS.has(escena)) notFound();
  return <Grabacion escena={escena as "pedido" | "qr" | "mesa" | "orden" | "cocina" | "dispositivos"} />;
}
