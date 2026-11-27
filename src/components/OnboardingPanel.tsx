"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  negocioId: string;
  tieneProductos: boolean;
  negocioConfigurado: boolean;
  mostrarPorBienvenida: boolean;
};

export default function OnboardingPanel({ negocioId, tieneProductos, negocioConfigurado, mostrarPorBienvenida }: Props) {
  const [visible, setVisible] = useState(false);
  const [qrCompartido, setQrCompartido] = useState(false);
  const debeMostrarse = !tieneProductos || mostrarPorBienvenida;
  const clave = `pidewat:onboarding:${negocioId}`;

  useEffect(() => {
    // Claude (QA 2026-11-27): sin esto la lista desaparecía al agregar el primer platillo, antes del paso 3 (QR).
    // Si ya se mostró una vez en este celular, sigue hasta que el dueño la cierre. Un negocio con menú armado
    // nunca la vio, así que nunca tiene la marca y no le aparece.
    let yaActivo = false;
    try { yaActivo = localStorage.getItem(`${clave}:activo`) === "1"; } catch {}
    if (!debeMostrarse && !yaActivo) return;
    try {
      localStorage.setItem(`${clave}:activo`, "1");
      setQrCompartido(localStorage.getItem(`${clave}:qr`) === "1");
      setVisible(localStorage.getItem(`${clave}:cerrado`) !== "1");
    } catch {
      // Si el navegador bloquea el almacenamiento, el checklist sigue siendo utilizable en esta visita.
      setVisible(true);
    }
  }, [clave, debeMostrarse]);

  const cerrar = () => {
    try { localStorage.setItem(`${clave}:cerrado`, "1"); } catch {}
    setVisible(false);
  };

  const marcarQr = () => {
    try { localStorage.setItem(`${clave}:qr`, "1"); } catch {}
    setQrCompartido(true);
  };

  if (!visible) return null;
  const terminados = [negocioConfigurado, tieneProductos, qrCompartido].filter(Boolean).length;

  return (
    <section className="onboarding card" aria-labelledby="onboarding-titulo">
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div>
          <p className="onboarding-eyebrow">Primeros pasos</p>
          <h2 id="onboarding-titulo">Deja listo tu menú</h2>
          <p className="small muted">{terminados} de 3 pasos terminados. Puedes volver a esto cuando quieras.</p>
        </div>
        <button className="btn btn-sm" type="button" onClick={cerrar}>Cerrar</button>
      </div>
      <ol className="onboarding-lista">
        <li className={negocioConfigurado ? "onboarding-paso hecho" : "onboarding-paso"}>
          <span className="onboarding-marca" aria-hidden="true">{negocioConfigurado ? "✓" : "1"}</span>
          <div>
            <strong>Configura tu negocio</strong>
            <p>Nombre, WhatsApp y horario para que tus clientes sepan cuándo pedir.</p>
            <Link className="btn btn-sm" href="/panel/negocio">{negocioConfigurado ? "Revisar negocio" : "Configurar negocio"}</Link>
          </div>
        </li>
        <li className={tieneProductos ? "onboarding-paso hecho" : "onboarding-paso"}>
          <span className="onboarding-marca" aria-hidden="true">{tieneProductos ? "✓" : "2"}</span>
          <div>
            <strong>Agrega tus primeros platillos</strong>
            <p>{tieneProductos ? "Tu menú ya tiene productos listos para mostrar." : "Empieza con nombre y precio; los detalles pueden esperar."}</p>
            <Link className="btn btn-sm" href="/panel/menu#agregar">{tieneProductos ? "Ver mi menú" : "Agregar platillo"}</Link>
          </div>
        </li>
        <li className={qrCompartido ? "onboarding-paso hecho" : "onboarding-paso"}>
          <span className="onboarding-marca" aria-hidden="true">{qrCompartido ? "✓" : "3"}</span>
          <div>
            <strong>Comparte tu QR</strong>
            <p>{qrCompartido ? "Marcaste este paso como compartido." : "Imprímelo o compártelo desde tu panel cuando estés listo."}</p>
            <span className="onboarding-acciones">
              {/* Claude (QA 2026-11-27): /panel/qr es la hoja para imprimir; compartir el link y el QR está en Inicio */}
              <a className="btn btn-sm" href="#compartir">Compartir link y QR</a>
              {!qrCompartido && <button className="btn btn-sm btn-p" type="button" onClick={marcarQr}>Ya lo compartí</button>}
            </span>
          </div>
        </li>
      </ol>
      {terminados === 3 && <p className="onboarding-listo" role="status">¡Listo! Tu menú ya está preparado para compartir.</p>}
    </section>
  );
}
