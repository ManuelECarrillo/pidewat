import React from "react";
import {
  AbsoluteFill, Audio, Composition, Freeze, Img, OffthreadVideo, Sequence,
  interpolate, spring, staticFile, useCurrentFrame,
} from "remotion";
import tiemposRaw from "../public/assets/tiempos.json";
import { P1v2, R2v2, pilotDuration } from "./PilotosV2";
import { P2v2, P3v2, R1v2, R3v2, pieceDuration } from "./PiezasV2";

const fps = 30;
const tiempos = tiemposRaw as Array<{ id: string; archivo: string; duracion_s: number; subtitulo: string; palabras_voz: Array<{ p: string; ini: number; fin: number }> }>;
type Formato = "9x16" | "4x5";
type Segmento = { id: string; inicio: number; variante?: "normal" | "gancho"; posicion?: "normal" | "pantalla" };
const duracion = (id: string) => tiempos.find((t) => t.id === id)?.duracion_s ?? 0;
const frames = (s: number) => Math.ceil(s * fps);
const cierre = (id: string) => duracion(id) + 0.8;

const medidas = (f: Formato) => ({ width: 1080, height: f === "9x16" ? 1920 : 1350 });
const seguro = (f: Formato): React.CSSProperties => f === "9x16"
  ? { left: 65, right: 65, top: 250, bottom: 340 }
  : { left: 55, right: 55, top: 58, bottom: 76 };
const fuenteTitulo = "Bricolage Grotesque";
const fuenteSubtitulo = "Inter";

function Marca({ clara = false, tamano }: { clara?: boolean; tamano?: number }) {
  return <div style={{ fontFamily: fuenteTitulo, fontWeight: 800, fontSize: tamano ?? 94, letterSpacing: -4, color: clara ? "#fff" : "#1d1b19", lineHeight: .85 }}>Pide<span style={{ color: "#49bd72" }}>wat</span></div>;
}

function EtiquetaIA({ f, lado = "izquierda" }: { f: Formato; lado?: "izquierda" | "derecha" }) {
  // Eduardo pidió que la declaración se gestione en Meta, no quemada en video.
  void f; void lado;
  return null;
}

function Fondo({ archivo, clip, oscurecer = .5 }: { archivo?: string; clip?: string; oscurecer?: number }) {
  return <AbsoluteFill style={{ overflow: "hidden", background: "#18231d" }}>
    {clip ? <OffthreadVideo src={staticFile(`assets/clips/${clip}`)} volume={0} playbackRate={.72} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.08)" }} /> : <Img src={staticFile(`assets/escenas/${archivo}`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.08)", filter: "blur(3px)" }} />}
    <AbsoluteFill style={{ background: `rgba(10, 17, 13, ${oscurecer})` }} />
  </AbsoluteFill>;
}

// Los bloques proceden exclusivamente de `subtitulo`. El corte se calcula por
// fracción de caracteres del subtítulo frente a la duración de su voz, no por
// el índice de palabras que Whisper reconoció (p. ej. "$249" / "doscientos...").
function bloquesSubtitulo(texto: string) {
  // Conserva las frases de precio y prueba como unidades de lectura. El resto
  // se corta primero en puntuación o cláusulas, antes de recurrir al límite de
  // siete palabras que mantiene cada bloque en un máximo práctico de dos líneas.
  const protegidos: string[] = [];
  const proteger = (frase: string) => `§${protegidos.push(frase) - 1}§`;
  const piezas = texto.trim()
    .replace(/Desde \$249 al mes/g, (frase) => `${proteger(frase)}|`)
    .replace(/pruébalo 14 días gratis, sin tarjeta[.!]?/gi, (frase) => `${proteger(frase)}|`)
    .split(/(?<=[.!?])\s+|(?<=[,;:])\s+|\|/)
    .filter(Boolean);
  const bloques: string[] = [];
  for (const pieza of piezas) {
    const palabras = pieza.trim().split(/\s+/);
    for (let i = 0; i < palabras.length; i += 7) {
      bloques.push(palabras.slice(i, i + 7).join(" ").replace(/§(\d+)§/g, (_, indice: string) => protegidos[Number(indice)]));
    }
  }
  return bloques;
}

function Subtitulos({ id, inicio, formato: f, variante = "normal", posicion = "normal" }: { id: string; inicio: number; formato: Formato; variante?: "normal" | "gancho"; posicion?: "normal" | "pantalla" }) {
  const frame = useCurrentFrame();
  const dato = tiempos.find((t) => t.id === id);
  if (!dato) return null;
  const segundo = frame / fps - inicio;
  if (segundo < 0 || segundo > dato.duracion_s + .18) return null;
  const bloques = bloquesSubtitulo(dato.subtitulo);
  const totalCaracteres = bloques.reduce((total, bloque) => total + bloque.length, 0);
  const progreso = Math.max(0, Math.min(.999, segundo / dato.duracion_s));
  let acumulado = 0;
  const texto = bloques.find((bloque) => {
    acumulado += bloque.length / totalCaracteres;
    return progreso < acumulado;
  }) ?? bloques[bloques.length - 1];
  const esGancho = variante === "gancho";
  const esPantalla = posicion === "pantalla";
  const top = esGancho ? (f === "9x16" ? 365 : 120) : esPantalla ? (f === "9x16" ? 1600 : 190) : seguro(f).top;
  return <div style={{ position: "absolute", ...seguro(f), top, bottom: esGancho || esPantalla ? "auto" : seguro(f).bottom, display: "flex", alignItems: esGancho || esPantalla ? "flex-start" : "flex-end", justifyContent: "center", pointerEvents: "none" }}>
    <div style={{ maxWidth: esGancho ? (f === "9x16" ? 920 : 900) : (f === "9x16" ? 910 : 860), padding: esGancho ? 0 : "12px 18px", borderRadius: esGancho ? 0 : 18, background: esGancho ? "transparent" : "rgba(13, 16, 14, .88)", color: "#fff", fontFamily: esGancho ? fuenteTitulo : fuenteSubtitulo, fontWeight: 800, fontSize: esGancho ? (f === "9x16" ? 68 : 54) : (f === "9x16" ? 58 : 48), lineHeight: esGancho ? .98 : 1.13, textAlign: "center", textShadow: esGancho ? "0 3px 16px #000" : "none", boxShadow: esGancho ? "none" : "0 6px 24px rgba(0,0,0,.35)" }}>{texto}</div>
  </div>;
}

function Voces({ segmentos, f }: { segmentos: Segmento[]; f: Formato }) {
  return <>{segmentos.map((segmento) => {
    const dato = tiempos.find((t) => t.id === segmento.id)!;
    return <React.Fragment key={segmento.id}>
      <Sequence from={frames(segmento.inicio)} durationInFrames={frames(dato.duracion_s)}><Audio src={staticFile(`assets/voz/${dato.archivo.split("/").pop()}`)} /></Sequence>
      <Subtitulos id={segmento.id} inicio={segmento.inicio} formato={f} variante={segmento.variante} posicion={segmento.posicion} />
    </React.Fragment>;
  })}</>;
}

function TituloPantalla({ primero, segundo, f }: { primero: string; segundo?: string; f: Formato }) {
  const frame = useCurrentFrame();
  const mostrarSegundo = segundo && frame > 100;
  return <div style={{ position: "absolute", ...seguro(f), top: f === "9x16" ? 260 : 74, bottom: "auto", color: "#fff", fontFamily: fuenteTitulo, fontSize: f === "9x16" ? 64 : 54, fontWeight: 800, lineHeight: .96, letterSpacing: -2, textAlign: "center", textShadow: "0 3px 14px #000" }}>{mostrarSegundo ? segundo : primero}</div>;
}

function MarcoDispositivo({ video, f, tablet = false, inicio = 0, velocidad = 1, focoFinalDesde, congelarEnFuente, etiqueta }: { video: string; f: Formato; tablet?: boolean; inicio?: number; velocidad?: number; focoFinalDesde?: number; congelarEnFuente?: number; etiqueta?: string }) {
  const frame = useCurrentFrame();
  const segundoFuente = inicio + frame / fps * velocidad;
  const telefono = !tablet;
  const ancho = f === "9x16" ? (tablet ? 900 : 545) : (tablet ? 820 : 600);
  const alto = f === "9x16" ? (tablet ? 710 : 1180) : (tablet ? 650 : 1035);
  const focoFinal = f === "4x5" && focoFinalDesde !== undefined && segundoFuente >= focoFinalDesde;
  const ajusteVideo: React.CSSProperties = telefono
    ? { objectFit: f === "9x16" ? "contain" : "cover", objectPosition: focoFinal ? "center bottom" : "center top" }
    : { objectFit: "contain", objectPosition: "center" };
  const videoReal = <OffthreadVideo src={staticFile(`assets/grabaciones/${video}`)} startFrom={frames(inicio)} volume={0} playbackRate={velocidad} style={{ width: "100%", height: "100%", ...ajusteVideo }} />;
  const congelar = congelarEnFuente !== undefined && segundoFuente >= congelarEnFuente;
  const marco = <div style={{ boxSizing: "border-box", width: ancho, height: alto, borderRadius: tablet ? 44 : 64, padding: tablet ? 20 : 18, background: "linear-gradient(145deg,#3b403d,#111412)", boxShadow: "0 28px 62px rgba(0,0,0,.55)", border: "3px solid rgba(255,255,255,.28)" }}>
    <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: tablet ? 29 : 49, background: "#f6f2ed", position: "relative" }}>
      {congelar && congelarEnFuente !== undefined ? <Freeze frame={frames((congelarEnFuente - inicio) / velocidad)}>{videoReal}</Freeze> : videoReal}
    </div>
    <div style={{ width: tablet ? 72 : 104, height: tablet ? 8 : 10, borderRadius: 999, background: "#090b0a", margin: tablet ? "10px auto -2px" : "10px auto -4px" }} />
  </div>;
  return <div style={{ position: "absolute", ...seguro(f), top: f === "9x16" ? (tablet ? 500 : 400) : (tablet ? 370 : 305), bottom: "auto", display: "flex", justifyContent: "center" }}>
    {marco}
    {etiqueta ? <div style={{ position: "absolute", top: -46, left: 0, padding: "8px 14px", borderRadius: 999, background: "#151916", color: "#fff", fontFamily: fuenteSubtitulo, fontSize: f === "9x16" ? 32 : 30, fontWeight: 800, whiteSpace: "nowrap" }}>{etiqueta}</div> : null}
  </div>;
}

function Cierre({ f, restaurante = false, fondo, textoAyuda }: { f: Formato; restaurante?: boolean; fondo: string; textoAyuda?: string }) {
  const frame = useCurrentFrame();
  const entrada = spring({ fps, frame, config: { damping: 18, stiffness: 110 } });
  const subir = interpolate(entrada, [0, 1], [36, 0]);
  const oferta = restaurante ? "Solicita una demostración" : "$249/mes";
  const secundaria = restaurante ? "Plan Restaurante · en pruebas" : "14 días gratis · Sin tarjeta";
  const boton = restaurante ? "Solicita una demostración" : "Crea tu menú gratis";
  return <AbsoluteFill><Fondo archivo={fondo} oscurecer={.67} />
    <div style={{ position: "absolute", left: f === "9x16" ? 65 : 55, top: f === "9x16" ? 285 : 68, transform: `translateY(${subir}px)`, opacity: entrada }}><Marca clara tamano={f === "9x16" ? 104 : 90} /></div>
    <div style={{ position: "absolute", ...seguro(f), top: f === "9x16" ? 650 : 400, bottom: "auto", display: "flex", flexDirection: "column", alignItems: "flex-start", transform: `translateY(${subir}px)`, opacity: entrada }}>
      <div style={{ color: "#fff", fontFamily: fuenteTitulo, fontSize: f === "9x16" ? (restaurante ? 78 : 96) : (restaurante ? 64 : 74), fontWeight: 800, letterSpacing: -4, lineHeight: .92 }}>{oferta}</div>
      <div style={{ marginTop: 18, color: "#d9f2df", fontFamily: fuenteSubtitulo, fontSize: f === "9x16" ? 46 : 40, fontWeight: 800, lineHeight: 1.12 }}>{secundaria}</div>
      <div style={{ marginTop: f === "9x16" ? 48 : 38 }}><div style={{ display: "inline-block", padding: f === "9x16" ? "22px 30px" : "18px 25px", borderRadius: 18, background: "#35a65d", color: "#fff", fontFamily: fuenteSubtitulo, fontSize: f === "9x16" ? 48 : 44, fontWeight: 800, boxShadow: "0 10px 30px #0007" }}>{boton}</div>{textoAyuda ? <div style={{ marginTop: 17, color: "#fff", fontFamily: fuenteSubtitulo, fontSize: f === "9x16" ? 36 : 32, fontWeight: 800 }}>{textoAyuda}</div> : null}</div>
    </div>
  </AbsoluteFill>;
}

function BurbujasPedido({ f }: { f: Formato }) {
  const frame = useCurrentFrame();
  const mensajes = ["Una sin cebolla", "La otra doble", "¿Cuánto cuestan las papas?", "Ah, y agrégale queso"];
  return <div style={{ position: "absolute", ...seguro(f), top: f === "9x16" ? 400 : 185, bottom: "auto", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
    <div style={{ padding: "7px 13px", borderRadius: 999, color: "#fff", background: "rgba(21,25,22,.86)", fontFamily: fuenteSubtitulo, fontSize: 27, fontWeight: 800 }}>Ejemplo</div>
    {mensajes.map((mensaje, i) => {
      const entrada = spring({ fps, frame: frame - i * 21, config: { damping: 14, stiffness: 170 } });
      return <div key={mensaje} style={{ maxWidth: f === "9x16" ? 790 : 730, marginLeft: i % 2 ? 46 : 0, padding: "16px 21px", borderRadius: "25px 25px 25px 7px", background: i % 2 ? "#dff5e5" : "#fff", color: "#1b231e", fontFamily: fuenteSubtitulo, fontSize: f === "9x16" ? 48 : 44, fontWeight: 800, lineHeight: 1.08, transform: `translateX(${interpolate(entrada, [0, 1], [-80, 0])}px) scale(${interpolate(entrada, [0, 1], [.7, 1])})`, opacity: entrada }}>{mensaje}</div>;
    })}
  </div>;
}

function P1({ formato: f }: { formato: Formato }) {
  const a = 0, b = duracion("P1-1"), c = 7, d = c + duracion("P1-3") + .8;
  return <AbsoluteFill>
    <Sequence from={frames(a)} durationInFrames={frames(b)}><AbsoluteFill><OffthreadVideo src={staticFile("assets/clips/p1-gancho-dueno.mp4")} volume={0} style={{ width: "100%", height: "100%", objectFit: "cover" }} /><EtiquetaIA f={f} /><div style={{ position: "absolute", ...seguro(f), top: f === "9x16" ? 360 : 115, bottom: "auto", fontFamily: fuenteTitulo, fontSize: f === "9x16" ? 70 : 56, fontWeight: 800, lineHeight: .94, color: "#fff", textShadow: "0 3px 13px #000" }}>¿Te cambian el pedido en 5 mensajes?</div></AbsoluteFill></Sequence>
    <Sequence from={frames(3)} durationInFrames={frames(4)}><Fondo clip="p1-problema-celular.mp4" oscurecer={.48} /><EtiquetaIA f={f} /><BurbujasPedido f={f} /></Sequence>
    <Sequence from={frames(c)} durationInFrames={frames(duracion("P1-3") + .8)}><Fondo archivo="puesto-4x5.jpg" oscurecer={.69} /><TituloPantalla f={f} primero="Tu cliente arma su pedido" segundo="Te llega ordenado" /><MarcoDispositivo video="c1-pedido-hamburguesa.mp4" inicio={3.35} focoFinalDesde={8.7} f={f} /></Sequence>
    <Sequence from={frames(d)} durationInFrames={frames(cierre("P1-4"))}><Cierre f={f} fondo="puesto-4x5.jpg" textoAyuda="Toca el botón y crea tu menú gratis" /></Sequence>
    <Voces segmentos={[{ id: "P1-1", inicio: a }, { id: "P1-3", inicio: c, posicion: "pantalla" }, { id: "P1-4", inicio: d }]} f={f} />
  </AbsoluteFill>;
}

function P2({ formato: f }: { formato: Formato }) {
  const a = 0, b = duracion("P2-1"), c = b + duracion("P2-2");
  return <AbsoluteFill>
    <Sequence from={frames(a)} durationInFrames={frames(b)}><Fondo archivo="puesto-4x5.jpg" oscurecer={.7} /><TituloPantalla f={f} primero="¿Menú digital sin comisión por pedido?" /><MarcoDispositivo video="c2-menu-qr-carrito.mp4" f={f} /></Sequence>
    <Sequence from={frames(b)} durationInFrames={frames(3)}><Fondo archivo="puesto-4x5.jpg" oscurecer={.7} /><TituloPantalla f={f} primero="Tu menú, en cualquier pantalla" /><MarcoDispositivo video="c5-dispositivos.mp4" f={f} /></Sequence>
    <Sequence from={frames(b + 3)} durationInFrames={frames(duracion("P2-2") - 3)}><Fondo archivo="puesto-4x5.jpg" oscurecer={.7} /><TituloPantalla f={f} primero="Eligen, personalizan y envían" /><MarcoDispositivo video="c2-menu-qr-carrito.mp4" inicio={6.4} velocidad={.9} focoFinalDesde={10.2} f={f} /></Sequence>
    <Sequence from={frames(c)} durationInFrames={frames(cierre("P2-3"))}><Cierre f={f} fondo="puesto-4x5.jpg" /></Sequence>
    <Voces segmentos={[{ id: "P2-1", inicio: a, posicion: "pantalla" }, { id: "P2-2", inicio: b, posicion: "pantalla" }, { id: "P2-3", inicio: c }]} f={f} />
  </AbsoluteFill>;
}

function R1({ formato: f }: { formato: Formato }) {
  const a = 0, b = duracion("R1-1"), c = b + duracion("R1-2");
  return <AbsoluteFill>
    <Sequence from={frames(a)} durationInFrames={frames(b)}><AbsoluteFill><OffthreadVideo src={staticFile("assets/clips/fonda-cliente-qr.mp4")} volume={0} style={{ width: "100%", height: "100%", objectFit: "cover" }} /><EtiquetaIA f={f} /><div style={{ position: "absolute", ...seguro(f), top: f === "9x16" ? 360 : 115, bottom: "auto", fontFamily: fuenteTitulo, fontSize: f === "9x16" ? 68 : 54, fontWeight: 800, color: "#fff", lineHeight: .94, textShadow: "0 3px 13px #000" }}>Un QR en tu mesa puede hacer más que enseñar una carta.</div></AbsoluteFill></Sequence>
    <Sequence from={frames(b)} durationInFrames={frames(duracion("R1-2"))}><Fondo archivo="fonda-qr-4x5.jpg" oscurecer={.7} /><TituloPantalla f={f} primero="Tu cliente pide desde la mesa" segundo="Te llega el pedido organizado" /><MarcoDispositivo video="c3-mesa-qr.mp4" inicio={3.2} focoFinalDesde={9.5} f={f} /></Sequence>
    <Sequence from={frames(c)} durationInFrames={frames(cierre("R1-3"))}><Cierre f={f} fondo="fonda-qr-4x5.jpg" /></Sequence>
    <Voces segmentos={[{ id: "R1-1", inicio: a }, { id: "R1-2", inicio: b, posicion: "pantalla" }, { id: "R1-3", inicio: c }]} f={f} />
  </AbsoluteFill>;
}

function R2({ formato: f }: { formato: Formato }) {
  const a = 0, b = duracion("R2-1"), c = b + duracion("R2-2");
  return <AbsoluteFill>
    <Sequence from={frames(a)} durationInFrames={frames(b)}><Fondo clip="cocina-tablet.mp4" oscurecer={.42} /><EtiquetaIA f={f} /><Subtitulos id="R2-1" inicio={a} formato={f} variante="gancho" /></Sequence>
    <Sequence from={frames(b)} durationInFrames={frames(duracion("R2-2"))}><Fondo archivo="cocina-tablet-9x16.jpg" oscurecer={.72} /><MarcoDispositivo video="c4-mesa-a-cocina.mp4" inicio={7.5} velocidad={.73} congelarEnFuente={11.85} f={f} tablet etiqueta="Plan Restaurante · en pruebas" /></Sequence>
    <Sequence from={frames(c)} durationInFrames={frames(cierre("R2-3"))}><Cierre f={f} restaurante fondo="cocina-tablet-9x16.jpg" /></Sequence>
    <Voces segmentos={[{ id: "R2-2", inicio: b }, { id: "R2-3", inicio: c }]} f={f} />
  </AbsoluteFill>;
}

function ChatEjemplo({ f }: { f: Formato }) { return <div style={{ padding: f === "9x16" ? 25 : 20, borderRadius: 26, background: "#fff9f1", boxShadow: "0 12px 30px #0005", fontFamily: fuenteSubtitulo, color: "#2d2b28" }}><div style={{ fontSize: f === "9x16" ? 25 : 22, fontWeight: 800, color: "#8b4b2e", marginBottom: 12 }}>EJEMPLO · chat ficticio</div>{["Una sin cebolla", "La otra doble", "¿Papas?", "Y queso", "¿Cuánto es?", "Voy saliendo"].map((x, i) => <div key={x} style={{ margin: "9px 0", marginLeft: i % 2 ? 23 : 0, padding: "11px 13px", borderRadius: 14, background: i % 2 ? "#dbeee2" : "#eee8e1", fontSize: f === "9x16" ? 29 : 25, fontWeight: 700 }}>{x}</div>)}</div>; }

// Copiada de src/components/landing/formatoWa.tsx para que Remotion no importe la app principal.
function TextoWhatsapp({ texto }: { texto: string }) {
  return <>{texto.split("\n").map((linea, i) => <span key={i} style={{ display: "block", minHeight: "1.25em" }}>{partesWhatsapp(linea)}</span>)}</>;
}

function partesWhatsapp(linea: string): React.ReactNode[] {
  const nodos: React.ReactNode[] = [];
  const re = /\*([^*]+)\*|_([^_]+)_/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(linea))) {
    if (m.index > ultimo) nodos.push(linea.slice(ultimo, m.index));
    nodos.push(m[1] != null ? <strong key={k++}>{m[1]}</strong> : <em key={k++}>{m[2]}</em>);
    ultimo = m.index + m[0].length;
  }
  if (ultimo < linea.length) nodos.push(linea.slice(ultimo));
  return nodos;
}

const mensajePedidoP3 = [
  "Hola *El Fogón de Durango*, quiero hacer un pedido:",
  "",
  "• 1 x Hamburguesa de la casa — $132",
  "   _Doble carne · Queso extra · Sin cebolla_",
  "",
  "*Total: $132*",
  "",
  "*Paso a recoger*",
  "*Nombre:* Ana demo",
  "",
  "_Pedido hecho en https://pidewat.vercel.app/demo_",
].join("\n");

function PedidoWhatsapp({ f }: { f: Formato }) {
  return <div style={{ height: "100%", boxSizing: "border-box", padding: f === "9x16" ? 23 : 18, borderRadius: 25, background: "#e8dfd3", boxShadow: "0 14px 32px #0006", fontFamily: fuenteSubtitulo }}>
    <div style={{ marginBottom: 12, color: "#53645a", fontSize: f === "9x16" ? 23 : 20, fontWeight: 800 }}>Mensaje de pedido</div>
    <div style={{ padding: f === "9x16" ? "17px 19px" : "14px 16px", borderRadius: "18px 18px 5px 18px", background: "#d9fdd3", color: "#17251b", fontSize: f === "9x16" ? 28 : 24, lineHeight: 1.28, boxShadow: "0 2px 4px #0002" }}><TextoWhatsapp texto={mensajePedidoP3} /></div>
  </div>;
}

function Imagen({ tipo, formato: f }: { tipo: "P3" | "R3"; formato: Formato }) {
  const p3 = tipo === "P3";
  const fondo = p3 ? "puesto-4x5.jpg" : "fonda-qr-4x5.jpg";
  const captura = "r3-menu-pedido-mesa.png";
  const altoCapturas = f === "9x16" ? 655 : 475;
  const tarjeta = { flex: 1, overflow: "hidden", borderRadius: 25, border: "4px solid #fff", background: "#fff", boxShadow: "0 14px 32px #0006" } as const;
  return <AbsoluteFill><Fondo archivo={fondo} oscurecer={.6} /><div style={{ position: "absolute", ...seguro(f), display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
    <div><Marca clara tamano={f === "9x16" ? 94 : 78} /><div style={{ marginTop: 22, color: "#fff", fontFamily: fuenteTitulo, fontSize: f === "9x16" ? 64 : 57, fontWeight: 800, letterSpacing: -2.5, lineHeight: .94 }}>{p3 ? "DE 6 MENSAJES A UN PEDIDO CLARO" : "TU RESTAURANTE TIENE MENÚ. HAZLO MÁS FÁCIL DE PEDIR"}</div></div>
    {p3 ? <div style={{ display: "flex", gap: 20, alignItems: "stretch", height: altoCapturas }}><div style={{ flex: 1 }}><ChatEjemplo f={f} /></div><div style={{ flex: 1 }}><PedidoWhatsapp f={f} /></div></div> : <div style={{ display: "flex", gap: 20, alignItems: "stretch", height: altoCapturas }}><div style={tarjeta}><OffthreadVideo src={staticFile("assets/grabaciones/c3-mesa-qr.mp4")} volume={0} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} /></div><div style={tarjeta}><Img src={staticFile(`assets/grabaciones/${captura}`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 72%" }} /></div></div>}
    <div><div style={{ color: "#fff", fontFamily: fuenteSubtitulo, fontSize: f === "9x16" ? 42 : 36, fontWeight: 800, lineHeight: 1.08 }}>{p3 ? "Menú digital + extras + total + WhatsApp" : "Menú digital · QR · Pedidos por WhatsApp"}</div>{p3 ? <div style={{ marginTop: 15, color: "#d9f2df", fontFamily: fuenteSubtitulo, fontSize: f === "9x16" ? 44 : 40, fontWeight: 800, lineHeight: 1.08 }}>14 días gratis · Sin tarjeta</div> : null}<div style={{ display: "inline-block", marginTop: 18, padding: "15px 21px", borderRadius: 15, background: "#35a65d", color: "#fff", fontFamily: fuenteSubtitulo, fontSize: f === "9x16" ? 45 : 40, fontWeight: 800 }}>{p3 ? "Crea tu menú" : "14 días gratis"}</div></div>
  </div></AbsoluteFill>;
}

const specs = [
  ["P1v2", P1v2, pilotDuration("P1v2")],
  ["R2v2", R2v2, pilotDuration("R2v2")],
  ["P2v2", P2v2, pieceDuration("P2v2")],
  ["R1v2", R1v2, pieceDuration("R1v2")],
  ["P1", P1, frames(7 + duracion("P1-3") + .8 + cierre("P1-4"))],
  ["P2", P2, frames(duracion("P2-1") + duracion("P2-2") + cierre("P2-3"))],
  ["R1", R1, frames(duracion("R1-1") + duracion("R1-2") + cierre("R1-3"))],
  ["R2", R2, frames(duracion("R2-1") + duracion("R2-2") + cierre("R2-3"))],
] as const;

export function Root() { return <>{specs.flatMap(([id, Componente, durationInFrames]) => (["9x16", "4x5"] as Formato[]).map((f) => { const size = medidas(f); return <Composition key={`${id}-${f}`} id={`${id}-${f}`} component={Componente} durationInFrames={durationInFrames} fps={fps} width={size.width} height={size.height} defaultProps={{ formato: f }} />; }))}<Composition id="P3v2-4x5" component={P3v2} durationInFrames={1} fps={fps} width={1080} height={1350} defaultProps={{ formato: "4x5" }} /><Composition id="P3v2-9x16" component={P3v2} durationInFrames={1} fps={fps} width={1080} height={1920} defaultProps={{ formato: "9x16" }} /><Composition id="R3v2-4x5" component={R3v2} durationInFrames={1} fps={fps} width={1080} height={1350} defaultProps={{ formato: "4x5" }} /><Composition id="R3v2-9x16" component={R3v2} durationInFrames={1} fps={fps} width={1080} height={1920} defaultProps={{ formato: "9x16" }} /></>; }
