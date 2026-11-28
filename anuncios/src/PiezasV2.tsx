import React from "react";
import { AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Caption, Clip, Music, OrderMessage, Sfx, TimedCaptions, TitlePlate, UiPan } from "./PilotosV2";

export type FormatoV2 = "9x16" | "4x5";
const fps = 30;
const fr = (s: number) => Math.round(s * fps);
const is9 = (f: FormatoV2) => f === "9x16";
const h = (f: FormatoV2) => is9(f) ? 1920 : 1350;
const titleFont: React.CSSProperties = { fontFamily: "Bricolage Grotesque", fontWeight: 800, letterSpacing: -3, lineHeight: .92 };
const bodyFont: React.CSSProperties = { fontFamily: "Inter", fontWeight: 700 };
const safe = (f: FormatoV2) => is9(f) ? { left: 65, right: 65 } : { left: 55, right: 55 };

function Wordmark({ f, dark = false }: { f: FormatoV2; dark?: boolean }) {
  return <div style={{ color: dark ? "#202521" : "#fff", fontSize: is9(f) ? 58 : 48, ...titleFont }}>Pide<span style={{ color: "#49bd72" }}>wat</span></div>;
}

/** The plate is placed in UiPan's dedicated blank header, never over a control. */
function ScreenHeader({ f, children, hidden = false }: { f: FormatoV2; children: React.ReactNode; hidden?: boolean }) {
  if (hidden) return null;
  const top = is9(f) ? 255 : 170;
  const headerH = is9(f) ? 180 : 135;
  return <div style={{ position: "absolute", zIndex: 4, left: 0, right: 0, top, height: headerH, display: "flex", justifyContent: "center", alignItems: "center", background: "#f6f3ee" }}>
    <div style={{ padding: is9(f) ? "17px 28px" : "12px 21px", borderRadius: 22, background: "#1d1b19", color: "#fff", fontSize: is9(f) ? 70 : 54, textAlign: "center", ...titleFont }}>{children}</div>
  </div>;
}

function P2Screen({ f, at, sourceAt, duration, focusY, title, caption }: { f: FormatoV2; at: number; sourceAt: number; duration: number; focusY: number; title: string; caption?: string }) {
  // Reserve the first 255 px of Reels plus the plate; interface only starts after it.
  const topBand = is9(f) ? 470 : 315;
  return <><UiPan video="c2-menu-qr-carrito.mp4" at={at} sourceAt={sourceAt} duration={duration} focusY={focusY} f={f} topBand={topBand} /><Sequence from={fr(at)} durationInFrames={fr(duration)}><ScreenHeader f={f}>{title}</ScreenHeader>{caption ? <Caption id="" f={f} bottom={is9(f) ? 72 : 35} text={caption} /> : null}</Sequence></>;
}

function DeviceScreen({ f }: { f: FormatoV2 }) {
  const frame = useCurrentFrame();
  const showBrowser = frame >= fr(2.5);
  const deviceTop = is9(f) ? 440 : 315;
  const deviceBottom = is9(f) ? 80 : 55;
  return <AbsoluteFill style={{ background: "#f6f3ee", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: is9(f) ? 350 : 230, left: 55, right: 55, display: "flex", justifyContent: "space-between", zIndex: 3, color: "#1d1b19", fontSize: is9(f) ? 48 : 39, ...titleFont }}><span>Android</span><span>iPhone</span></div>
    <div style={{ position: "absolute", top: deviceTop, bottom: deviceBottom, left: 32, right: 32, display: "flex", justifyContent: "space-between", gap: 24 }}>
      {["p2-android-360.png", "p2-iphone-390.png"].map((image) => <div key={image} style={{ width: "48%", height: "100%", padding: is9(f) ? 12 : 9, borderRadius: is9(f) ? 42 : 32, background: "#20221f", boxShadow: "0 17px 35px #0005", overflow: "hidden" }}><Img src={staticFile(`assets/grabaciones/${image}`)} style={{ width: "100%", height: "100%", borderRadius: is9(f) ? 31 : 23, objectFit: "fill" }} /></div>)}
    </div>
    {showBrowser ? <><div style={{ position: "absolute", zIndex: 5, top: is9(f) ? 255 : 165, left: is9(f) ? 70 : 55, right: is9(f) ? 70 : 55, height: is9(f) ? 72 : 56, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, background: "#fff", border: "3px solid #cfcac2", color: "#29332c", fontSize: is9(f) ? 39 : 31, ...bodyFont }}>pidewat.vercel.app</div><div style={{ position: "absolute", zIndex: 5, top: is9(f) ? 342 : 235, left: 0, right: 0, display: "flex", justifyContent: "center" }}><div style={{ padding: is9(f) ? "13px 25px" : "10px 20px", borderRadius: 18, background: "#1d1b19", color: "#fff", fontSize: is9(f) ? 49 : 39, ...titleFont }}>Sin descargar apps</div></div></> : null}
  </AbsoluteFill>;
}

/** The same table-seven WhatsApp text produced by src/lib/whatsapp.ts, rendered
 * as formatted text (instead of displaying its Markdown control characters). */
function MesaOrderMessage({ f }: { f: FormatoV2 }) {
  const frame = useCurrentFrame();
  const emphasis = (start: number): React.CSSProperties => ({ background: frame >= fr(start) ? "#a8ebba" : "transparent", borderRadius: 8, padding: "1px 4px" });
  const p = spring({ fps, frame, config: { damping: 17, stiffness: 160 } });
  const textSize = is9(f) ? 43 : 34;
  return <AbsoluteFill style={{ background: "#e8e1d8", padding: is9(f) ? "280px 46px 0" : "150px 42px 0", boxSizing: "border-box" }}>
    <div style={{ height: is9(f) ? 115 : 88, margin: is9(f) ? "-280px -46px 42px" : "-150px -42px 28px", padding: is9(f) ? "32px 46px" : "24px 42px", boxSizing: "border-box", background: "#1d6e45", color: "#fff", ...bodyFont, fontSize: is9(f) ? 44 : 36 }}>Pidewat · mensaje de pedido</div>
    <div style={{ padding: is9(f) ? "31px 32px" : "23px 25px", borderRadius: "30px 30px 8px 30px", background: "#d7f7d8", color: "#17251b", boxShadow: "0 9px 20px #0003", transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px)`, opacity: p, fontSize: textSize, lineHeight: 1.2, ...bodyFont }}>
      <div>Hola <b>El Fogón</b>, quiero hacer un pedido:</div><br />
      <div>• 1 × <b style={emphasis(.35)}>Hamburguesa de la casa</b> — $132</div>
      <div style={{ fontStyle: "italic", ...emphasis(.7) }}>Doble carne · Queso extra</div><br />
      <div>• 1 × <b>Hamburguesa de la casa</b> — $85</div>
      <div style={{ fontStyle: "italic" }}>Clásica · Sin cebolla</div><br />
      <div><b style={emphasis(1.05)}>Total: $217</b></div>
      <div><b>Para comer aquí</b>, mesa 7</div>
      <div><b>Nombre:</b> Ana demo</div>
      <div style={{ marginTop: is9(f) ? 18 : 12, fontSize: is9(f) ? 30 : 24, fontStyle: "italic", opacity: .78 }}>Pedido hecho en pidewat.vercel.app/demo</div>
    </div>
  </AbsoluteFill>;
}

function P2Close({ f }: { f: FormatoV2 }) {
  const frame = useCurrentFrame();
  const p = spring({ fps, frame, config: { damping: 17, stiffness: 150 } });
  const main = frame < fr(1.7) ? "$249/mes · mensualidad fija" : "14 días gratis · sin tarjeta";
  return <AbsoluteFill style={{ overflow: "hidden", background: "#142218" }}><OffthreadVideo src={staticFile("assets/clips/puesto.mp4")} volume={0} playbackRate={.72} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.08)" }} /><AbsoluteFill style={{ background: "rgba(4,9,6,.55)" }} />
    <div style={{ position: "absolute", ...safe(f), top: is9(f) ? 420 : 150, color: "#fff", fontSize: is9(f) ? 82 : 63, ...titleFont }}>{main}</div>
    <div style={{ position: "absolute", ...safe(f), bottom: is9(f) ? 315 : 95, display: "flex", justifyContent: "center", transform: `scale(${interpolate(p, [0, 1], [.7, 1])})` }}><div style={{ padding: is9(f) ? "20px 29px" : "16px 23px", borderRadius: 22, background: "#49bd72", color: "#fff", fontSize: is9(f) ? 56 : 45, ...bodyFont }}>Toca Registrarte ↓</div></div>
  </AbsoluteFill>;
}

/** Fast, full-screen product demonstration—not the P1 problem/chat structure. */
export function P2v2({ formato: f }: { formato: FormatoV2 }) {
  return <AbsoluteFill><Music />
    <P2Screen f={f} at={0} sourceAt={0} duration={2} focusY={610} title="0 % DE COMISIÓN POR PEDIDO" caption="¿Quieres un menú digital sin pagar comisión?" />
    <P2Screen f={f} at={2} sourceAt={.8} duration={1} focusY={780} title="TU MENÚ CON EXTRAS" />
    <P2Screen f={f} at={3} sourceAt={2.6} duration={1} focusY={1180} title="TU MENÚ CON EXTRAS" />
    <P2Screen f={f} at={4} sourceAt={3.8} duration={1} focusY={1440} title="TU MENÚ CON EXTRAS" />
    <P2Screen f={f} at={5} sourceAt={4.8} duration={1} focusY={1910} title="TU MENÚ CON EXTRAS" />
    <Sequence from={fr(6)} durationInFrames={fr(1.5)}><DeviceScreen f={f} /></Sequence>
    <P2Screen f={f} at={7.5} sourceAt={7} duration={3} focusY={1180} title="ELIGE Y PERSONALIZA" />
    <P2Screen f={f} at={10.5} sourceAt={11.2} duration={2} focusY={1830} title="TOTAL $217" />
    <Sequence from={fr(12.5)} durationInFrames={fr(1.5)}><OrderMessage f={f} /></Sequence>
    <Sequence from={fr(14)} durationInFrames={fr(5.3)}><P2Close f={f} /></Sequence>
    <Sequence from={0} durationInFrames={fr(3.01)}><Audio src={staticFile("assets/voz/P2-1.mp3")} /></Sequence>
    <Sequence from={fr(3.01)} durationInFrames={fr(9.74)}><Audio src={staticFile("assets/voz/P2-2.mp3")} /></Sequence>
    <Sequence from={fr(12.75)} durationInFrames={fr(6.54)}><Audio src={staticFile("assets/voz/P2-3.mp3")} /></Sequence>
    <TimedCaptions f={f} at={3.01} bottom={is9(f) ? 72 : 35} blocks={[{ from: 0, to: 2.2, text: "Pidewat tiene una mensualidad fija." }, { from: 2.2, to: 4.9, text: "Tus clientes ven tus platillos," }, { from: 4.9, to: 7.45, text: "personalizan su pedido y te lo envían" }, { from: 7.45, to: 9.74, text: "organizado por WhatsApp." }]} />
    <Sfx kind="whoosh" at={0} /><Sfx kind="ping" at={.25} />{[2, 3, 4, 5, 11, 12.5].map((at) => <Sfx key={at} kind="tap" at={at} />)}
  </AbsoluteFill>;
}

function PdfProblem({ f }: { f: FormatoV2 }) {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, fr(2.6)], [1, 1.25], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#d4c9b9", overflow: "hidden" }}><div style={{ position: "absolute", left: "12%", right: "12%", top: is9(f) ? 310 : 205, bottom: is9(f) ? 330 : 185, padding: is9(f) ? 55 : 38, background: "#fffdf7", color: "#6a6259", boxShadow: "0 18px 45px #0005", transform: `scale(${zoom})`, transformOrigin: "center" }}>
    <div style={{ marginBottom: 38, fontSize: is9(f) ? 54 : 44, color: "#342d28", ...titleFont }}>MENÚ</div><div style={{ borderTop: "2px solid #b8afa6", paddingTop: 25, fontSize: is9(f) ? 38 : 34, lineHeight: 1.75, ...bodyFont }}>Hamburguesa clásica ........ $85<br />Hamburguesa doble ....... $132<br />Papas ................................... $55<br />Bebidas ............................... $32</div><div style={{ marginTop: 42, fontSize: is9(f) ? 31 : 28 }}>Acerca para leer los detalles</div>
  </div><div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: is9(f) ? 190 : 150, height: is9(f) ? 190 : 150, border: "20px solid #d63a34", borderRadius: "50%" }} /><div style={{ position: "absolute", left: "50%", top: "50%", width: is9(f) ? 220 : 175, height: 20, background: "#d63a34", transform: "translate(-50%,-50%) rotate(-45deg)" }} /><TitlePlate f={f} top={is9(f) ? 255 : 110}>VE EL MENÚ… Y YA</TitlePlate></AbsoluteFill>;
}

function R1Close({ f }: { f: FormatoV2 }) {
  return <AbsoluteFill><Clip name="fonda-cliente-qr.mp4" dark={.58} /><div style={{ position: "absolute", ...safe(f), top: is9(f) ? 440 : 210, color: "#fff" }}><Wordmark f={f} /><div style={{ marginTop: 45, fontSize: is9(f) ? 84 : 68, ...titleFont }}>Pidewat Esencial</div><div style={{ marginTop: 22, fontSize: is9(f) ? 54 : 48, lineHeight: 1.12, ...bodyFont }}>14 días gratis · sin tarjeta</div><div style={{ marginTop: 19, fontSize: is9(f) ? 48 : 48, ...bodyFont }}>Después $249/mes</div><div style={{ marginTop: 48, display: "inline-block", padding: is9(f) ? "20px 30px" : "16px 25px", borderRadius: 20, background: "#49bd72", fontSize: is9(f) ? 50 : 42, ...bodyFont }}>Toca Registrarte ↓</div></div></AbsoluteFill>;
}

/** The cart is scaled only in this R1 shot so its table mode, table number and
 * total stay visible together instead of hiding the mode under the title bar. */
function TableCartPreview({ f }: { f: FormatoV2 }) {
  const topBand = is9(f) ? 470 : 315;
  const subtitleBand = is9(f) ? 360 : 230;
  const scale = is9(f) ? .7 : .55;
  const width = 1080 * scale;
  const top = is9(f) ? -540 : -440;
  return <AbsoluteFill style={{ background: "#f6f3ee", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: topBand, bottom: subtitleBand, overflow: "hidden", background: "#f6f3ee" }}>
      <Freeze frame={0}><OffthreadVideo src={staticFile("assets/grabaciones/c3-mesa-qr.mp4")} startFrom={fr(10)} volume={0} style={{ position: "absolute", width, height: 2338 * scale, left: (1080 - width) / 2, top, objectFit: "fill" }} /></Freeze>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: topBand, background: "#f6f3ee" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: subtitleBand, background: "#f6f3ee" }} />
  </AbsoluteFill>;
}

/** Problem → real table-7 order flow. The voice starts at second 2 by direction. */
export function R1v2({ formato: f }: { formato: FormatoV2 }) {
  const topBand = is9(f) ? 470 : 315;
  return <AbsoluteFill><Music />
    <Sequence from={0} durationInFrames={fr(2)}><Clip name="fonda-cliente-qr.mp4" dark={.22} /><TitlePlate f={f} top={is9(f) ? 330 : 100}>¿Tu QR solo muestra un PDF?</TitlePlate></Sequence>
    <Sequence from={fr(2)} durationInFrames={fr(3.2)}><PdfProblem f={f} /></Sequence>
    <UiPan video="c3-mesa-qr.mp4" at={5.2} sourceAt={0} duration={1.4} focusY={660} f={f} topBand={topBand} /><Sequence from={fr(5.2)} durationInFrames={fr(1.4)}><ScreenHeader f={f}>AQUÍ TAMBIÉN PIDEN</ScreenHeader></Sequence>
    <UiPan video="c3-mesa-qr.mp4" at={6.6} sourceAt={1.1} duration={2.1} focusY={1280} f={f} topBand={topBand} /><Sequence from={fr(6.6)} durationInFrames={fr(2.1)}><ScreenHeader f={f}>ELIGE Y PERSONALIZA</ScreenHeader></Sequence>
    <Sequence from={fr(8.7)} durationInFrames={fr(2.2)}><TableCartPreview f={f} /><ScreenHeader f={f}>MESA 7 EN EL CARRITO</ScreenHeader></Sequence>
    <Sequence from={fr(10.9)} durationInFrames={fr(2.6)}><MesaOrderMessage f={f} /></Sequence>
    <Sequence from={fr(13.54)} durationInFrames={fr(6.14)}><R1Close f={f} /></Sequence>
    <Sequence from={fr(2)} durationInFrames={fr(3.28)}><Audio src={staticFile("assets/voz/R1-1.mp3")} /></Sequence><Sequence from={fr(5.28)} durationInFrames={fr(8.34)}><Audio src={staticFile("assets/voz/R1-2.mp3")} /></Sequence><Sequence from={fr(13.54)} durationInFrames={fr(6.14)}><Audio src={staticFile("assets/voz/R1-3.mp3")} /></Sequence>
    <TimedCaptions f={f} at={5.28} bottom={is9(f) ? 72 : 35} blocks={[{ from: 0, to: 2.8, text: "Con Pidewat, tus clientes consultan el menú," }, { from: 2.8, to: 5.65, text: "eligen productos y envían su pedido" }, { from: 5.65, to: 8.34, text: "organizado. Sin instalar apps." }]} />
    <Sfx kind="whoosh" at={2} />{[6.6, 8.7, 10.9].map((at) => <Sfx key={at} kind="tap" at={at} />)}
  </AbsoluteFill>;
}

function ChatBefore({ f }: { f: FormatoV2 }) {
  const messages = ["Me das 2 hamburguesas", "una sin cebolla", "la otra doble", "ah, y queso a la doble", "¿cuánto es?", "paso por ellas"];
  return <div style={{ height: "100%", boxSizing: "border-box", padding: is9(f) ? 24 : 19, borderRadius: 24, background: "#eee5da", boxShadow: "0 12px 30px #0006", color: "#202522", ...bodyFont }}><div style={{ marginBottom: 15, fontSize: is9(f) ? 37 : 34, color: "#7c4c34", ...titleFont }}>ANTES</div><div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: is9(f) ? 19 : 14 }}>{messages.map((message, i) => <div key={message} style={{ alignSelf: i === 1 || i === 4 ? "flex-end" : "flex-start", maxWidth: "94%", padding: is9(f) ? "14px 16px" : "12px 13px", borderRadius: 16, background: i === 1 || i === 4 ? "#d4f0d8" : "#fff", fontSize: is9(f) ? 38 : 34, lineHeight: 1.04 }}>{message}</div>)}</div></div>;
}

function OrderedAfter({ f }: { f: FormatoV2 }) {
  const size = is9(f) ? 36 : 34;
  return <div style={{ height: "100%", boxSizing: "border-box", padding: is9(f) ? 24 : 19, borderRadius: 24, background: "#e7dfd5", boxShadow: "0 12px 30px #0006", color: "#17251b", ...bodyFont }}><div style={{ marginBottom: 15, fontSize: is9(f) ? 37 : 34, color: "#1d6e45", ...titleFont }}>DESPUÉS</div><div style={{ padding: is9(f) ? "18px 17px" : "15px 13px", borderRadius: "19px 19px 5px 19px", background: "#d7f7d8", fontSize: size, lineHeight: 1.16 }}><div>Hola <b>El Fogón</b>, quiero pedir:</div><br /><div>• 1 × Hamburguesa — $132</div><div><i>Doble carne · Queso extra</i></div><br /><div>• 1 × Hamburguesa — $85</div><div><i>Clásica · Sin cebolla</i></div><br /><div><b>Total: $217</b></div><div>Recoger</div></div></div>;
}

export function P3v2({ formato: f }: { formato: FormatoV2 }) {
  const cardH = is9(f) ? 1030 : 715;
  return <AbsoluteFill style={{ overflow: "hidden", background: "#18231d" }}><Img src={staticFile("assets/escenas/puesto-4x5.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.08)", filter: "blur(5px)" }} /><AbsoluteFill style={{ background: "rgba(10,17,13,.68)" }} /><div style={{ position: "absolute", ...safe(f), top: is9(f) ? 145 : 60, bottom: is9(f) ? 130 : 55, display: "flex", flexDirection: "column" }}><Wordmark f={f} /><div style={{ marginTop: 24, color: "#fff", fontSize: is9(f) ? 70 : 55, ...titleFont }}>De 6 mensajes a 1 pedido</div><div style={{ display: "flex", gap: is9(f) ? 23 : 18, height: cardH, marginTop: "auto" }}><div style={{ flex: 1 }}><ChatBefore f={f} /></div><div style={{ flex: 1 }}><OrderedAfter f={f} /></div></div><div style={{ marginTop: is9(f) ? 30 : 20, color: "#d9f2df", fontSize: is9(f) ? 47 : 39, ...bodyFont }}>14 días gratis · sin tarjeta</div></div></AbsoluteFill>;
}

function QrCard({ f }: { f: FormatoV2 }) {
  // Follow the blank card inside the acrylic holder in fonda-qr-4x5.jpg,
  // including its tighter center crop in the vertical composition.
  const card = is9(f)
    ? { left: 16, top: 1370, width: 300, height: 310 }
    : { left: 143, top: 958, width: 247, height: 258 };
  return <div style={{ position: "absolute", overflow: "hidden", borderRadius: 4, background: "#fff", boxShadow: "0 2px 5px #0004", transformOrigin: "center", transform: "perspective(1100px) rotateX(1deg) rotateZ(-.4deg) skewY(-.8deg)", ...card }}><Img src={staticFile("assets/grabaciones/qr-el-fogon.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} /></div>;
}

export function R3v2({ formato: f }: { formato: FormatoV2 }) {
  const phoneW = is9(f) ? 560 : 430;
  const phoneH = is9(f) ? 890 : 710;
  return <AbsoluteFill style={{ overflow: "hidden", background: "#18231d" }}><Img src={staticFile("assets/escenas/fonda-qr-4x5.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.05)" }} /><AbsoluteFill style={{ background: "rgba(9,13,10,.34)" }} /><div style={{ position: "absolute", ...safe(f), top: is9(f) ? 120 : 55 }}><Wordmark f={f} /><div style={{ marginTop: 22, color: "#fff", fontSize: is9(f) ? 70 : 55, textShadow: "0 3px 10px #000", ...titleFont }}>Tu menú con QR para pedir</div></div><QrCard f={f} /><div style={{ position: "absolute", right: is9(f) ? 62 : 55, bottom: is9(f) ? 250 : 50, width: phoneW, height: phoneH, padding: 12, borderRadius: 43, background: "linear-gradient(145deg,#343a36,#0e100f)", boxShadow: "0 22px 44px #0009", transform: "rotate(5deg)" }}><div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 32, background: "#f6f3ee" }}><Img src={staticFile("assets/grabaciones/r3-menu-mesa-7.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} /></div></div><div style={{ position: "absolute", ...safe(f), bottom: is9(f) ? 105 : 42, color: "#fff", fontSize: is9(f) ? 48 : 39, textShadow: "0 3px 9px #000", ...bodyFont }}>14 días gratis</div></AbsoluteFill>;
}

export const pieceDuration = (id: "P2v2" | "R1v2") => fr(id === "P2v2" ? 19.3 : 19.7);
