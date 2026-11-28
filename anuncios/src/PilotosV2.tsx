import React from "react";
import { AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import tiemposRaw from "../public/assets/tiempos.json";

type Formato = "9x16" | "4x5";
type Tiempo = { id: string; subtitulo: string };
const tiempos = tiemposRaw as Tiempo[];
const fps = 30;
const fr = (s: number) => Math.round(s * fps);
const is9 = (f: Formato) => f === "9x16";
const viewportH = (f: Formato) => is9(f) ? 1920 : 1350;
const safe = (f: Formato) => is9(f) ? { left: 65, right: 65, top: 250, bottom: 340 } : { left: 55, right: 55, top: 58, bottom: 76 };
const titleFont: React.CSSProperties = { fontFamily: "Bricolage Grotesque", fontWeight: 800, letterSpacing: -3, lineHeight: .92 };
const bodyFont: React.CSSProperties = { fontFamily: "Inter", fontWeight: 700 };
const subtitle = (id: string) => tiempos.find((t) => t.id === id)?.subtitulo ?? "";

function Music() {
  // Pista licenciada entregada: no desactivar sin reemplazo autorizado.
  const existe = true;
  const frame = useCurrentFrame();
  return existe ? <Audio src={staticFile("assets/musica/pista.mp3")} volume={interpolate(frame, [0, 12 * fps], [.12, .06], { extrapolateRight: "clamp" })} /> : null;
}

function Sfx({ kind, at }: { kind: "ping" | "tap" | "whoosh" | "bell"; at: number }) {
  return <Sequence from={fr(at)} durationInFrames={fr(1.2)}><Audio src={staticFile(`assets/sfx/${kind}.wav`)} volume={.22} /></Sequence>;
}

/** A title is deliberately kept in its own solid safe-area plaque. */
function TitlePlate({ children, f, top }: { children: React.ReactNode; f: Formato; top?: number }) {
  return <div style={{ position: "absolute", left: is9(f) ? 65 : 55, right: is9(f) ? 65 : 55, top: top ?? (is9(f) ? 270 : 62), display: "flex", justifyContent: "center", pointerEvents: "none" }}>
    <div style={{ maxWidth: is9(f) ? 930 : 900, padding: is9(f) ? "18px 28px" : "14px 23px", borderRadius: 24, background: "rgba(29,27,25,.92)", color: "#fff", boxShadow: "0 9px 24px rgba(0,0,0,.34)", fontSize: is9(f) ? 84 : 68, textAlign: "center", ...titleFont }}>{children}</div>
  </div>;
}

function Caption({ id, f, bottom, text }: { id: string; f: Formato; bottom?: number; text?: string }) {
  return <div style={{ position: "absolute", ...safe(f), top: "auto", bottom: bottom ?? safe(f).bottom, display: "flex", alignItems: "flex-end", justifyContent: "center", pointerEvents: "none" }}>
    <div style={{ maxWidth: is9(f) ? 960 : 900, padding: "12px 18px", borderRadius: 18, background: "rgba(8,12,9,.89)", color: "#fff", fontSize: is9(f) ? 54 : 47, lineHeight: 1.08, textAlign: "center", ...bodyFont }}>{text ?? subtitle(id)}</div>
  </div>;
}

/** Short, word-timed subtitle blocks: never more than two readable lines. */
function TimedCaptions({ f, at, blocks }: { f: Formato; at: number; blocks: { from: number; to: number; text: string }[] }) {
  return <>{blocks.map((block) => <Sequence key={`${block.from}-${block.text}`} from={fr(at + block.from)} durationInFrames={fr(block.to - block.from)}><Caption id="" f={f} text={block.text} /></Sequence>)}</>;
}

function Clip({ name, dark = .2, slow = 1 }: { name: string; dark?: number; slow?: number }) {
  return <AbsoluteFill style={{ background: "#142218", overflow: "hidden" }}><OffthreadVideo src={staticFile(`assets/clips/${name}`)} volume={0} playbackRate={slow} style={{ height: "100%", width: "100%", objectFit: "cover", transform: "scale(1.035)" }} /><AbsoluteFill style={{ background: `rgba(4,9,6,${dark})` }} /></AbsoluteFill>;
}

/** Full-width app recording. It never zooms horizontally: only its y origin pans. */
function UiPan({ video, at, sourceAt = 0, duration, focusY, frozen = false, f }: { video: string; at: number; sourceAt?: number; duration: number; focusY: number; frozen?: boolean; f: Formato }) {
  const h = viewportH(f);
  const sourceH = 2338;
  // The capture is shorter than the delivery canvas; reserve a branded cream
  // subtitle band so the uncovered lower area can never turn black.
  const subtitleBand = is9(f) ? 360 : 230;
  const usableH = h - subtitleBand;
  // Source and composition are both 1080 px wide. Keep that scale: no UI word
  // may be amputated at either side of the ad.
  const desiredTop = Math.round(usableH * .58 - focusY);
  const top = Math.max(usableH - sourceH, Math.min(0, desiredTop));
  const recording = <OffthreadVideo src={staticFile(`assets/grabaciones/${video}`)} startFrom={fr(sourceAt)} volume={0} style={{ position: "absolute", width: 1080, height: sourceH, left: 0, top, objectFit: "fill" }} />;
  const image = frozen ? <Freeze frame={0}>{recording}</Freeze> : recording;
  return <Sequence from={fr(at)} durationInFrames={fr(duration)}><AbsoluteFill style={{ background: "#f6f3ee", overflow: "hidden" }}>{image}<div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: subtitleBand, background: "#f6f3ee" }} /></AbsoluteFill></Sequence>;
}

function Chat({ f, exit = false }: { f: Formato; exit?: boolean }) {
  const frame = useCurrentFrame();
  const messages = ["Me das 2 hamburguesas", "una sin cebolla", "la otra doble", "ah, y queso a la doble", "¿cuánto es?", "paso por ellas"];
  const exitAmount = exit ? interpolate(frame, [0, fr(.45)], [0, -1200], { extrapolateRight: "clamp" }) : 0;
  return <AbsoluteFill style={{ overflow: "hidden", background: "#e8e1d8", transform: `translateY(${exitAmount}px)` }}>
    <div style={{ height: is9(f) ? 190 : 130, padding: is9(f) ? "42px 62px" : "28px 55px", boxSizing: "border-box", background: "#1d6e45", color: "#fff", display: "flex", alignItems: "center", gap: 20, ...bodyFont, fontSize: is9(f) ? 49 : 39 }}><div style={{ width: is9(f) ? 82 : 62, height: is9(f) ? 82 : 62, borderRadius: "50%", background: "#f1bf97", display: "grid", placeItems: "center", color: "#543b2a", fontSize: is9(f) ? 42 : 32 }}>C</div><div><div>Cliente</div><div style={{ opacity: .78, fontSize: is9(f) ? 28 : 23 }}>en línea</div></div></div>
    <div style={{ height: `calc(100% - ${is9(f) ? 190 : 130}px)`, padding: is9(f) ? "115px 55px 130px" : "55px 42px 70px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between" }}>{messages.map((m, i) => {
      const p = spring({ fps, frame: frame - fr(i * .17), config: { damping: 16, stiffness: 210 } });
      const right = i === 1 || i === 4;
      return <div key={m} style={{ alignSelf: right ? "flex-end" : "flex-start", maxWidth: "82%", padding: is9(f) ? "22px 30px" : "16px 22px", borderRadius: right ? "30px 30px 8px 30px" : "30px 30px 30px 8px", background: right ? "#d5f3d8" : "#fff", color: "#202522", boxShadow: "0 4px 9px #0002", opacity: p, transform: `scale(${p})`, transformOrigin: right ? "right" : "left", fontSize: is9(f) ? 54 : 47, lineHeight: 1.08, ...bodyFont }}>{m}</div>;
    })}</div>
  </AbsoluteFill>;
}

function OrderMessage({ f }: { f: Formato }) {
  const frame = useCurrentFrame();
  const emphasis = (start: number) => ({ background: frame >= fr(start) ? "#a8ebba" : "transparent", borderRadius: 8, padding: "1px 4px" });
  const p = spring({ fps, frame, config: { damping: 17, stiffness: 160 } });
  return <AbsoluteFill style={{ background: "#e8e1d8", padding: is9(f) ? "280px 46px 0" : "150px 42px 0", boxSizing: "border-box" }}>
    <div style={{ height: is9(f) ? 115 : 88, margin: is9(f) ? "-280px -46px 42px" : "-150px -42px 28px", padding: is9(f) ? "32px 46px" : "24px 42px", boxSizing: "border-box", background: "#1d6e45", color: "#fff", ...bodyFont, fontSize: is9(f) ? 44 : 36 }}>Pidewat · mensaje de pedido</div>
    <div style={{ padding: is9(f) ? "31px 32px" : "23px 25px", borderRadius: "30px 30px 8px 30px", background: "#d7f7d8", color: "#17251b", boxShadow: "0 9px 20px #0003", transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px)`, opacity: p, fontSize: is9(f) ? 43 : 38, lineHeight: 1.28, ...bodyFont }}>
      <div>Hola <b>El Fogón</b>, quiero hacer un pedido:</div><br />
      <div>• 1 × <b style={emphasis(.35)}>Hamburguesa de la casa</b> — $132</div>
      <div style={{ fontStyle: "italic", ...emphasis(.7) }}>Doble carne · Queso extra</div><br />
      <div>• 1 × <b style={emphasis(.35)}>Hamburguesa de la casa</b> — $85</div>
      <div style={{ fontStyle: "italic" }}>Clásica · Sin cebolla</div><br />
      <div><b style={emphasis(1.05)}>Total: $217</b></div><br /><div><b>Paso a recoger</b></div>
    </div>
  </AbsoluteFill>;
}

function StickerCta({ f }: { f: Formato }) {
  return <div style={{ position: "absolute", left: is9(f) ? 65 : 55, right: is9(f) ? 65 : 55, bottom: is9(f) ? 300 : 70, display: "flex", justifyContent: "center" }}><div style={{ padding: is9(f) ? "21px 32px" : "17px 27px", borderRadius: 24, background: "#49bd72", color: "#fff", boxShadow: "0 10px 26px #0008", fontSize: is9(f) ? 62 : 54, textAlign: "center", ...bodyFont }}>Toca Registrarte ↓</div></div>;
}

export function P1v2({ formato: f }: { formato: Formato }) {
  const frame = useCurrentFrame();
  return <AbsoluteFill><Music />
    <Sequence from={0} durationInFrames={fr(4.6)}><Clip name="p1-gancho-dueno.mp4" dark={.22} /><TitlePlate f={f}>¿TE CAMBIAN EL PEDIDO?</TitlePlate><Caption id="P1-1" f={f} /></Sequence>
    <Sequence from={fr(4.6)} durationInFrames={fr(2.4)}><Chat f={f} /></Sequence>
    <Sequence from={fr(7)} durationInFrames={fr(1)}><Clip name="p1-problema-celular.mp4" dark={.38} /><TitlePlate f={f}>¿CUÁL ERA SIN CEBOLLA?</TitlePlate></Sequence>

    <UiPan video="c1-pedido-hamburguesa.mp4" at={8} sourceAt={0} duration={1.2} focusY={1812} f={f} />
    <UiPan video="c1-pedido-hamburguesa.mp4" at={9.2} sourceAt={1.2} duration={1.25} focusY={1050} f={f} />
    <UiPan video="c1-pedido-hamburguesa.mp4" at={10.45} sourceAt={2.45} duration={1.15} focusY={1321} f={f} />
    <UiPan video="c1-pedido-hamburguesa.mp4" at={11.6} sourceAt={3.6} duration={1.15} focusY={2181} f={f} />
    <UiPan video="c1-pedido-hamburguesa.mp4" at={12.75} sourceAt={4.75} duration={1.1} focusY={1836} f={f} />
    <UiPan video="c1-pedido-hamburguesa.mp4" at={13.85} sourceAt={5.85} duration={1.15} focusY={2333} f={f} />
    <TimedCaptions f={f} at={8} blocks={[
      { from: 0, to: 1.84, text: "Con Pidewat, tu cliente arma su pedido" },
      { from: 1.84, to: 3.24, text: "desde un menú digital" },
      { from: 3.24, to: 4.81, text: "y te lo envía ordenado," },
      { from: 4.81, to: 6.88, text: "con cantidades, extras y total." },
    ]} />
    <Sequence from={fr(15)} durationInFrames={fr(.55)}><Chat f={f} exit /></Sequence>
    <Sequence from={fr(15)} durationInFrames={fr(1.5)}><OrderMessage f={f} /></Sequence>
    <Sequence from={fr(16.5)} durationInFrames={fr(5.5)}><Clip name="puesto.mp4" dark={.52} slow={.72} /><TitlePlate f={f}>{frame < fr(18.3) ? "SIN COMISIÓN POR PEDIDO" : frame < fr(20.1) ? "14 DÍAS GRATIS" : "$249 AL MES"}</TitlePlate><Caption id="P1-4" f={f} bottom={is9(f) ? 520 : 220} /><StickerCta f={f} /></Sequence>
    <Sequence from={0} durationInFrames={fr(4.62)}><Audio src={staticFile("assets/voz/P1-1.mp3")} /></Sequence><Sequence from={fr(8)} durationInFrames={fr(6.88)}><Audio src={staticFile("assets/voz/P1-3.mp3")} /></Sequence><Sequence from={fr(15)} durationInFrames={fr(7)}><Audio src={staticFile("assets/voz/P1-4.mp3")} /></Sequence>
    {[4.65, 4.96, 5.27, 5.58, 5.89, 6.2].map((at, i) => <Sfx key={i} kind="ping" at={at} />)}{[8, 9.2, 10.45, 11.6, 12.75, 13.85].map((at, i) => <Sfx key={i} kind="tap" at={at} />)}<Sfx kind="whoosh" at={8} /><Sfx kind="whoosh" at={15} />
  </AbsoluteFill>;
}

function StatusPill({ f, text, color, attached = false }: { f: Formato; text: string; color: string; attached?: boolean }) {
  // C4's native badge is at y=870 in the 1080 × 2338 capture. Keep the
  // explanatory badge directly over it after the same vertical pan as UiPan.
  const usableH = viewportH(f) - (is9(f) ? 360 : 230);
  const uiTop = Math.max(usableH - 2338, Math.min(0, Math.round(usableH * .58 - 1351)));
  return <div style={attached ? { position: "absolute", right: is9(f) ? 76 : 62, top: uiTop + 870, whiteSpace: "nowrap", padding: is9(f) ? "15px 26px" : "12px 21px", borderRadius: 999, background: color, color: "#fff", boxShadow: "0 8px 20px #0006", fontSize: is9(f) ? 47 : 43, ...bodyFont } : { position: "absolute", left: "50%", top: is9(f) ? 1260 : 830, transform: "translateX(-50%)", whiteSpace: "nowrap", padding: is9(f) ? "17px 30px" : "13px 24px", borderRadius: 999, background: color, color: "#fff", boxShadow: "0 8px 20px #0006", fontSize: is9(f) ? 51 : 43, ...bodyFont }}>{text}</div>;
}
function KitchenStatusPill({ f }: { f: Formato }) {
  const frame = useCurrentFrame();
  // LEEME.md: C4 reaches kitchen at 8.8 s, Preparando at 10.2 s and
  // Listos (1) at 11.6 s. The two controls are documented in C4's positions JSON.
  const status = frame < fr(10.2 - 8.8)
    ? { text: "NUEVO", color: "#1e80cf" }
    : frame < fr(11.6 - 8.8)
      ? { text: "PREPARANDO", color: "#db8b27" }
      : { text: "LISTO", color: "#249c58" };
  return <StatusPill f={f} attached {...status} />;
}
function Ticket({ f }: { f: Formato }) { const frame = useCurrentFrame(); const p = spring({ fps, frame, config: { damping: 17, stiffness: 180 } }); return <div style={{ position: "absolute", left: is9(f) ? 70 : 55, right: is9(f) ? 70 : 55, top: is9(f) ? 720 : 390, padding: is9(f) ? "34px 36px" : "27px 30px", borderRadius: 24, background: "#fffdf5", boxShadow: "0 16px 36px #0008", transform: `scale(1.1) translateY(${interpolate(p, [0, 1], [120, 0])}px)`, color: "#24221f" }}><div style={{ fontSize: is9(f) ? 39 : 35, whiteSpace: "nowrap", textAlign: "center", ...bodyFont }}>{"MESA 7 · 1 Hamburguesa de la casa · NUEVO"}</div></div>; }
function PlanPill({ f }: { f: Formato }) {
  // This remains above every shot, but lives in the dedicated header band rather
  // than over a card or input. 4:5 uses the proportional equivalent of y=255.
  return <div style={{ position: "absolute", zIndex: 30, left: "50%", top: is9(f) ? 255 : 180, transform: "translateX(-50%)", padding: is9(f) ? "12px 24px" : "9px 19px", whiteSpace: "nowrap", borderRadius: 999, background: "#173c26", color: "#fff", boxShadow: "0 6px 16px #0005", fontSize: is9(f) ? 32 : 25, lineHeight: 1, ...bodyFont }}>Plan Restaurante · en pruebas</div>;
}

function R2TimedCaptions({ f, at, blocks, bottom }: { f: Formato; at: number; blocks: { from: number; to: number; text: string }[]; bottom: number }) {
  return <>{blocks.map((block) => <Sequence key={`${block.from}-${block.text}`} from={fr(at + block.from)} durationInFrames={fr(block.to - block.from)}><Caption id="" f={f} bottom={bottom} text={block.text} /></Sequence>)}</>;
}

function TabletTicket({ f, listo = false }: { f: Formato; listo?: boolean }) {
  // These are crops from C4 at 8.9 s and 12.2 s, respectively. They cover the
  // physical tablet screen, with a modest perspective cue rather than a redrawn UI.
  const screen = is9(f)
    ? { left: "5.5%", top: "44.4%", width: "33.8%", height: "18.5%" }
    : { left: "5.5%", top: "41.5%", width: "33.8%", height: "26.0%" };
  return <img src={staticFile(`assets/escenas/r2-ticket-${listo ? "listo" : "nuevo"}.png`)} style={{ position: "absolute", zIndex: 4, ...screen, objectFit: "fill", transform: "rotate(-1.5deg) skewY(-1deg)", transformOrigin: "center", boxShadow: "0 2px 7px #0008" }} />;
}

/** App footage is physically constrained below the 340 px header and above the subtitle band. */
function R2AppPanel({ f, at, sourceAt, duration, focusY }: { f: Formato; at: number; sourceAt: number; duration: number; focusY: number }) {
  const h = viewportH(f);
  const top = is9(f) ? 340 : 240;
  const subtitleBand = is9(f) ? 260 : 180;
  const panelH = h - top - subtitleBand;
  const recordingTop = Math.max(panelH - 2338, Math.min(0, Math.round(panelH * .56 - focusY)));
  return <Sequence from={fr(at)} durationInFrames={fr(duration)}><AbsoluteFill style={{ background: "#f6f3ee" }}>
    <div style={{ position: "absolute", top, left: 0, right: 0, height: panelH, overflow: "hidden", background: "#f6f3ee" }}>
      <OffthreadVideo src={staticFile("assets/grabaciones/c4-mesa-a-cocina.mp4")} startFrom={fr(sourceAt)} volume={0} style={{ position: "absolute", width: 1080, height: 2338, left: 0, top: recordingTop, objectFit: "fill" }} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: subtitleBand, background: "#f6f3ee" }} />
  </AbsoluteFill></Sequence>;
}

/** Kitchen and customer are separated by a real, dedicated header—not an overlay on an input. */
function KitchenSplit({ f }: { f: Formato }) {
  const frame = useCurrentFrame();
  const contentTop = is9(f) ? 340 : 240;
  const contentBottom = is9(f) ? 260 : 180;
  const usableH = viewportH(f) - contentTop - contentBottom;
  const upper = Math.round(usableH * .48);
  const labelH = is9(f) ? 78 : 58;
  // Leave a cream gutter after the lower-half header so its first app pixels
  // never touch the words in that header.
  const lowerTop = contentTop + upper + labelH + 28;
  const kitchenRecording = <OffthreadVideo src={staticFile("assets/grabaciones/c4-mesa-a-cocina.mp4")} startFrom={fr(8.8)} volume={0} style={{ position: "absolute", width: 1080, height: 2338, left: 0, top: -600, objectFit: "fill" }} />;
  const kitchen = frame < fr(4.3) ? kitchenRecording : <Freeze frame={fr(4.3)}>{kitchenRecording}</Freeze>;
  return <AbsoluteFill style={{ background: "#f6f3ee", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: contentTop, height: upper, overflow: "hidden", background: "#f6f3ee" }}>{kitchen}</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: contentTop + upper, height: labelH + 8, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", borderTop: "8px solid #173c26", background: "#173c26", color: "#fff", fontSize: is9(f) ? 35 : 27, ...bodyFont }}>Pedido desde Mesa 7</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: lowerTop, bottom: contentBottom, overflow: "hidden", background: "#f6f3ee" }}>
      <Freeze frame={0}><OffthreadVideo src={staticFile("assets/grabaciones/c4-mesa-a-cocina.mp4")} startFrom={fr(7)} volume={0} style={{ position: "absolute", width: 1080, height: 2338, left: 0, top: -1050, objectFit: "fill" }} /></Freeze>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: contentBottom, background: "#f6f3ee" }} />
  </AbsoluteFill>;
}

function DemoButton({ f }: { f: Formato }) {
  return <div style={{ position: "absolute", zIndex: 8, left: "50%", bottom: is9(f) ? 250 : 58, transform: "translateX(-50%)", whiteSpace: "nowrap", padding: is9(f) ? "23px 34px" : "17px 26px", borderRadius: 999, background: "#49bd72", color: "#fff", boxShadow: "0 10px 26px #0008", fontSize: is9(f) ? 52 : 39, ...bodyFont }}>Solicita una demostración ↓</div>;
}

export function R2v2({ formato: f }: { formato: Formato }) {
  return <AbsoluteFill><Music />
    <Sequence from={0} durationInFrames={fr(2)}><Clip name="cocina-tablet.mp4" dark={.12} /><TitlePlate f={f} top={is9(f) ? 350 : 250}>MESA 7 ACABA DE PEDIR</TitlePlate><TabletTicket f={f} /></Sequence>
    <Sequence from={fr(2)} durationInFrames={fr(2)}><Clip name="fonda-cliente-qr.mp4" dark={.22} /><TitlePlate f={f} top={is9(f) ? 350 : 250}>PIDE DESDE EL QR DE SU MESA</TitlePlate><div style={{ position: "absolute", left: 0, right: 0, bottom: is9(f) ? 480 : 190, textAlign: "center", color: "#fff", fontSize: is9(f) ? 75 : 58, ...titleFont, textShadow: "0 4px 12px #000" }}>MESA 7</div></Sequence>
    <R2AppPanel f={f} at={4} sourceAt={0} duration={1.4} focusY={1742} />
    <R2AppPanel f={f} at={5.4} sourceAt={1.4} duration={1.6} focusY={1351} />
    <R2AppPanel f={f} at={7} sourceAt={8.8} duration={.6} focusY={1200} />
    {/* One monotonically advancing pass through C4: Nuevo → Preparando → Listo → Listos (1). */}
    <Sequence from={fr(7.6)} durationInFrames={fr(6.4)}><KitchenSplit f={f} /></Sequence>
    <R2TimedCaptions f={f} at={5} blocks={[
      { from: 0, to: 1.54, text: "Estamos probando Pidewat Restaurante:" },
      { from: 1.54, to: 3.75, text: "pedidos desde la mesa" },
      { from: 3.75, to: 5.11, text: "y seguimiento para cocina" },
      { from: 5.11, to: 6.59, text: "en una misma plataforma." },
    ]} bottom={is9(f) ? 52 : 30} />
    <Sequence from={fr(14)} durationInFrames={fr(3)}><Clip name="cocina-tablet.mp4" dark={.12} /><TitlePlate f={f} top={is9(f) ? 350 : 250}>¿TIENES RESTAURANTE CON MESAS?</TitlePlate><TabletTicket f={f} listo /><DemoButton f={f} /></Sequence>
    <Sequence from={0} durationInFrames={fr(4.48)}><Audio src={staticFile("assets/voz/R2-1.mp3")} /></Sequence><Sequence from={fr(5)} durationInFrames={fr(6.59)}><Audio src={staticFile("assets/voz/R2-2.mp3")} /></Sequence><Sequence from={fr(14)} durationInFrames={fr(2.53)}><Audio src={staticFile("assets/voz/R2-3.mp3")} /></Sequence><Sfx kind="bell" at={.15} />{[6, 9, 10.4].map((at, i) => <Sfx key={i} kind="tap" at={at} />)}<Sfx kind="whoosh" at={4} /><Sfx kind="bell" at={10.4} /><PlanPill f={f} />
  </AbsoluteFill>;
}

export const pilotDuration = (id: "P1v2" | "R2v2") => fr(id === "P1v2" ? 22 : 17);
