import Image from "next/image";
import type { ReactNode } from "react";
import { mensajePedido } from "@/lib/whatsapp";
import { dinero } from "@/lib/formato";
import { textoWhatsapp } from "./formatoWa";
import s from "./Landing.module.css";

// Marco de celular para las composiciones. Por dentro va HTML real con el estilo de Pidewat
// (fondo crema, tarjetas blancas, botón verde), o una captura real cuando la tengamos.
// Si adentro hay botones (la demo), va como grupo; si es solo ilustración, como imagen.
export function Telefono({ children, className = "", etiqueta, interactivo = false }: { children: ReactNode; className?: string; etiqueta?: string; interactivo?: boolean }) {
  return (
    <div className={`${s.telefono} ${className}`} role={interactivo ? "group" : "img"} aria-label={etiqueta}>
      <div className={s.telefonoBisel}>
        <div className={s.telefonoNotch} aria-hidden="true" />
        <div className={s.telefonoPantalla}>{children}</div>
      </div>
    </div>
  );
}

// Capturas reales de public/landing/ (solo archivos que existen de verdad)
export function Captura({ src, alt, ancho, alto }: { src: string; alt: string; ancho: number; alto: number }) {
  return <Image src={src} alt={alt} width={ancho} height={alto} className={s.captura} sizes="(max-width: 768px) 33vw, 250px" />;
}

// Así se ve el menú que abre el cliente (mismo estilo que el menú real de Pidewat)
const PLATOS = [
  { nombre: "Hamburguesa clásica", detalle: "Sencilla o doble · extras", precio: 95, tono: "#e4572e" },
  { nombre: "Hamburguesa BBQ", detalle: "Salsa BBQ y aros de cebolla", precio: 115, tono: "#b45309" },
  { nombre: "Hot dog jumbo", detalle: "Quita lo que no quieras", precio: 45, tono: "#c2410c" },
  { nombre: "Papas a la francesa", detalle: "Chicas o grandes", precio: 40, tono: "#ca8a04" },
];

export function MenuMini({ conCarrito = true }: { conCarrito?: boolean }) {
  return (
    <div className={s.app}>
      <div className={s.appPortada}>
        <div className={s.appLogo} aria-hidden="true">BN</div>
        <div>
          <div className={s.appNegocio}>Burger Norte</div>
          <div className={s.appSub}>Abierto · Para comer aquí o recoger</div>
        </div>
      </div>
      <div className={s.appChips} aria-hidden="true">
        <span className={s.appChipActivo}>Hamburguesas</span><span>Hot dogs</span><span>Papas</span>
      </div>
      <ul className={s.appLista}>
        {PLATOS.map((p) => (
          <li key={p.nombre} className={s.appPlato}>
            <span className={s.appFoto} style={{ background: `radial-gradient(circle at 35% 35%, #fde68a, ${p.tono})` }} aria-hidden="true" />
            <span className={s.appPlatoTexto}>
              <strong>{p.nombre}</strong>
              <small>{p.detalle}</small>
              <b>{dinero(p.precio)}</b>
            </span>
            <span className={s.appMas} aria-hidden="true">+</span>
          </li>
        ))}
      </ul>
      {conCarrito && (
        <div className={s.appBarra}>
          <span>{PIEZAS_EJEMPLO} productos · {dinero(TOTAL_EJEMPLO)}</span>
          <span className={s.appBarraBoton}>Pedir por WhatsApp</span>
        </div>
      )}
    </div>
  );
}

// El pedido de ejemplo sale de la misma función que arma el mensaje real que recibe el negocio
// La barra del celular y la burbuja salen de las mismas líneas, para que el total siempre cuadre
const LINEAS_EJEMPLO = [
  // 95 + doble 35 + queso 10, igual que en la demo
  { nombre: "Hamburguesa clásica", cantidad: 2, precio: 140, nota: "Doble · Queso · Sin cebolla" },
  { nombre: "Papas a la francesa", cantidad: 1, precio: 60, nota: "Grandes" },
  { nombre: "Refresco 600 ml", cantidad: 2, precio: 25, nota: "Cola" },
];
const PIEZAS_EJEMPLO = LINEAS_EJEMPLO.reduce((s, l) => s + l.cantidad, 0);
const TOTAL_EJEMPLO = LINEAS_EJEMPLO.reduce((s, l) => s + l.cantidad * l.precio, 0);

export const PEDIDO_EJEMPLO = mensajePedido({
  negocio: "Burger Norte",
  modo: "menu",
  lineas: LINEAS_EJEMPLO,
  tipo: "recoger",
  nombreCliente: "Mariana",
  link: "pidewat.vercel.app/demo",
});

export function BurbujaWhatsapp({ texto = PEDIDO_EJEMPLO, hora = "1:24 p. m.", className = "" }: { texto?: string; hora?: string; className?: string }) {
  return (
    <div className={`${s.burbuja} ${className}`}>
      <div className={s.burbujaTexto}>{textoWhatsapp(texto)}</div>
      <div className={s.burbujaHora}>{hora} <span aria-hidden="true">✓✓</span></div>
    </div>
  );
}

// El "antes": mensajes sueltos que hay que ir juntando a mano
const SUELTOS = [
  { t: "2 hamburguesas", h: "1:02" },
  { t: "Una sin cebolla", h: "1:02" },
  { t: "¿Cuánto cuesta con papas?", h: "1:05" },
  { t: "¿Todavía tienes hot dogs?", h: "1:09" },
  { t: "Ah, y un refresco", h: "1:11" },
];

export function ChatSuelto() {
  return (
    <div className={s.chat}>
      <div className={s.chatCabeza}>
        <span className={s.chatAvatar} aria-hidden="true">C</span>
        <span><strong>Cliente</strong><small>en línea</small></span>
      </div>
      <div className={s.chatCuerpo}>
        {SUELTOS.map((m, i) => (
          <div key={i} className={s.chatMsj}>
            {m.t}<span>{m.h}</span>
          </div>
        ))}
        <div className={s.chatPendiente}>Tú: ¿de qué tamaño? ¿para llevar?…</div>
      </div>
    </div>
  );
}
