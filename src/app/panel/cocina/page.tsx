import Cocina from "@/components/Cocina";
import { requiereDueno } from "@/lib/sesion";

export const metadata = { title: "Cocina" };

export default async function PanelCocina() {
  const { negocio } = await requiereDueno();
  if (!negocio.cocina) {
    return (
      <div className="card" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: "1.4rem" }}>Pantalla de cocina</h1>
        <p className="muted">Es parte del plan Restaurante: tus clientes piden desde el QR de su mesa y el pedido aparece aquí, sin pasar por WhatsApp. Si te interesa probarla, escríbenos.</p>
      </div>
    );
  }
  return <Cocina />;
}
