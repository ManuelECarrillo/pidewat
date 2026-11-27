import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";

type Formato = "9x16" | "4x5";
const fps = 30;
const fr = (s: number) => Math.round(s * fps);
const is9 = (f: Formato) => f === "9x16";
const safe = (f: Formato) => is9(f) ? { left: 65, right: 65, top: 250, bottom: 340 } : { left: 55, right: 55, top: 58, bottom: 76 };
const big = (f: Formato) => is9(f) ? 94 : 78;
const title: React.CSSProperties = { fontFamily: "Bricolage Grotesque", fontWeight: 800, letterSpacing: -3, lineHeight: .9 };
const body: React.CSSProperties = { fontFamily: "Inter", fontWeight: 700 };

function Music() {
  // Se activa al entregar una pista licenciada en public/assets/musica/pista.mp3.
  const existe = true; // pista de ElevenLabs entregada el 2026-11-27 (ver anuncios/musica/LICENCIA.md)
  const frame = useCurrentFrame();
  return existe ? <Audio src={staticFile("assets/musica/pista.mp3")} volume={interpolate(frame, [0, 12 * fps], [.12, .06], { extrapolateRight: "clamp" })} /> : null;
}

function Sfx({ kind, at }: { kind: "ping" | "tap" | "whoosh" | "bell"; at: number }) {
  return <Sequence from={fr(at)} durationInFrames={fr(1.2)}><Audio src={staticFile(`assets/sfx/${kind}.wav`)} volume={.22} /></Sequence>;
}

function Large({ children, f, top }: { children: React.ReactNode; f: Formato; top?: number }) {
  return <div style={{ position: "absolute", ...safe(f), top: top ?? (is9(f) ? 295 : 75), bottom: "auto", color: "white", fontSize: big(f), textShadow: "0 3px 18px #000", ...title }}>{children}</div>;
}
function Caption({ children, f }: { children: React.ReactNode; f: Formato }) {
  return <div style={{ position: "absolute", ...safe(f), top: "auto", display: "flex", justifyContent: "center" }}><div style={{ maxWidth: is9(f) ? 910 : 880, padding: "11px 16px", borderRadius: 18, color: "#fff", background: "rgba(8,12,9,.87)", fontSize: is9(f) ? 54 : 48, lineHeight: 1.1, textAlign: "center", ...body }}>{children}</div></div>;
}
function Clip({ name, dark = .2, slow = 1 }: { name: string; dark?: number; slow?: number }) {
  return <AbsoluteFill style={{ background: "#142218", overflow: "hidden" }}><OffthreadVideo src={staticFile(`assets/clips/${name}`)} volume={0} playbackRate={slow} style={{ height: "100%", width: "100%", objectFit: "cover", transform: "scale(1.04)" }} /><AbsoluteFill style={{ background: `rgba(4,9,6,${dark})` }} /></AbsoluteFill>;
}

function Notice({ text, i, f }: { text: string; i: number; f: Formato }) {
  const frame = useCurrentFrame(); const p = spring({ fps, frame: frame - fr(.08 + i * .18), config: { damping: 17, stiffness: 190 } });
  return <div style={{ position: "absolute", right: is9(f) ? 55 : 42, top: (is9(f) ? 460 : 260) + i * (is9(f) ? 128 : 94), width: is9(f) ? 710 : 610, padding: "17px 22px", borderRadius: 25, background: "rgba(247,247,244,.97)", color: "#242622", boxShadow: "0 10px 30px #0005", transform: `translateX(${interpolate(p,[0,1],[760,0])}px)`, opacity: p, ...body, fontSize: is9(f) ? 43 : 36 }}>{text}</div>;
}
function Chat({ f }: { f: Formato }) {
  const messages = ["Me das 2 hamburguesas", "una sin cebolla", "la otra doble", "ah, y queso a la doble", "¿cuánto es?", "paso por ellas"];
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#f5f1eb", padding: is9(f) ? "290px 62px 0" : "115px 55px 0" }}><div style={{ paddingBottom: 28, borderBottom: "2px solid #ddd6cc", color: "#272925", fontSize: is9(f) ? 48 : 39, ...body }}>Cliente</div><div style={{ marginTop: 35, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: is9(f) ? 23 : 16 }}>{messages.map((m, i) => { const p = spring({ fps, frame: frame - fr(i * .38), config: { damping: 16, stiffness: 200 } }); return <div key={m} style={{ alignSelf: i % 3 === 1 ? "flex-end" : "flex-start", maxWidth: "91%", padding: is9(f) ? "20px 26px" : "15px 19px", borderRadius: 25, background: i % 3 === 1 ? "#cee7d3" : "#e0e0de", color: "#252725", transform: `scale(${p})`, transformOrigin: i % 3 === 1 ? "right" : "left", fontSize: is9(f) ? 47 : 38, ...body }}>{m}</div>; })}</div><div style={{ marginTop: 38, color: "#2d302d", fontSize: is9(f) ? 65 : 51, ...title }}>¿…cuánto era?</div></AbsoluteFill>;
}

function UiShot({ video, at, sourceAt = at - 8, duration, zoom, origin }: { video: string; at: number; sourceAt?: number; duration: number; zoom: number; origin: string }) {
  return <Sequence from={fr(at)} durationInFrames={fr(duration)}><AbsoluteFill style={{ background: "#f7f2e9", overflow: "hidden" }}><OffthreadVideo src={staticFile(`assets/grabaciones/${video}`)} startFrom={fr(sourceAt)} volume={0} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, transformOrigin: origin }} /></AbsoluteFill></Sequence>;
}
function WaCard({ f }: { f: Formato }) { return <div style={{ position: "absolute", left: is9(f) ? 75 : 60, right: is9(f) ? 75 : 60, top: is9(f) ? 560 : 265, borderRadius: 28, padding: is9(f) ? 36 : 28, background: "#fff", color: "#20221f", boxShadow: "0 14px 34px #0005", fontSize: is9(f) ? 42 : 34, lineHeight: 1.28, ...body }}><div>Hola <b>El Fogón</b>, quiero hacer un pedido:</div><br/><div>• 1 x Hamburguesa de la casa — $132</div><i>Doble carne · Queso extra</i><div style={{ marginTop: 13 }}>• 1 x Hamburguesa de la casa — $85</div><i>Clásica · Sin cebolla</i><br/><b>Total: $217</b><br/><br/><b>Paso a recoger</b></div>; }

export function P1v2({ formato: f }: { formato: Formato }) {
  const frame = useCurrentFrame(); const end = 22;
  return <AbsoluteFill><Music />
    <Sequence from={0} durationInFrames={fr(4.6)}><Clip name="p1-gancho-dueno.mp4" dark={.18} /><Large f={f}>¿TE CAMBIAN<br/><span style={{ color: "#79d690" }}>EL PEDIDO?</span></Large>{["2 hamburguesas", "una sin cebolla", "la otra doble", "queso extra", "¿cuánto es?"].map((x,i)=><Notice key={x} text={x} i={i} f={f}/>)}<Caption f={f}>Tu puesto recibe el pedido en pedacitos.</Caption></Sequence>
    <Sequence from={fr(4.6)} durationInFrames={fr(.5)}><Clip name="p1-problema-celular.mp4" dark={.35} /><Large f={f}>5 MENSAJES<br/>PARA 1 PEDIDO</Large></Sequence>
    <Sequence from={fr(5.1)} durationInFrames={fr(2.9)}><Chat f={f}/><Large f={f} top={is9(f)?285:68}>5 MENSAJES<br/>PARA 1 PEDIDO</Large></Sequence>
    <UiShot video="c1-pedido-hamburguesa.mp4" at={8} duration={1.25} zoom={1.72} origin="50% 27%"/><UiShot video="c1-pedido-hamburguesa.mp4" at={9.25} duration={1.2} zoom={1.86} origin="50% 44%"/><UiShot video="c1-pedido-hamburguesa.mp4" at={10.45} duration={1.15} zoom={1.92} origin="50% 51%"/><UiShot video="c1-pedido-hamburguesa.mp4" at={11.6} duration={1.05} zoom={1.82} origin="50% 60%"/><UiShot video="c1-pedido-hamburguesa.mp4" at={12.65} duration={1.15} zoom={1.66} origin="50% 72%"/><UiShot video="c1-pedido-hamburguesa.mp4" at={13.8} duration={1.2} zoom={1.56} origin="50% 76%"/>
    <Sequence from={fr(8)} durationInFrames={fr(3.3)}><Large f={f}>TU CLIENTE<br/><span style={{ color: "#49bd72" }}>LO ARMA</span></Large></Sequence><Sequence from={fr(11.3)} durationInFrames={fr(3.7)}><Large f={f}>TE LLEGA<br/><span style={{ color: "#49bd72" }}>COMPLETO</span></Large></Sequence>
    <Sequence from={fr(15)} durationInFrames={fr(1.5)}><Chat f={f}/><div style={{ transform: `scale(${interpolate(frame-fr(15),[0,fr(1.5)],[1,.5])})`, transformOrigin:"left center" }} /><WaCard f={f}/><Large f={f}>MISMO PEDIDO.<br/>1 MENSAJE.</Large></Sequence>
    <Sequence from={fr(16.5)} durationInFrames={fr(5.5)}><Clip name="puesto.mp4" dark={.48} slow={.72}/><Large f={f}>{frame < fr(18.3) ? <>SIN COMISIÓN<br/>POR PEDIDO</> : frame < fr(20.1) ? <>14 DÍAS GRATIS<br/><span style={{ color: "#89e8a0" }}>SIN TARJETA</span></> : <>DESPUÉS<br/><span style={{ color: "#89e8a0" }}>$249/MES</span></>}</Large><div style={{ position:"absolute", ...safe(f), top:"auto", color:"#fff", fontSize:is9(f)?64:52, ...title }}>↓ Toca Registrarte<br/><span style={{ fontSize:is9(f)?80:65 }}>Pide<span style={{color:"#49bd72"}}>wat</span></span></div></Sequence>
    <Sequence from={0} durationInFrames={fr(4.62)}><Audio src={staticFile("assets/voz/P1-1.mp3")}/></Sequence><Sequence from={fr(8)} durationInFrames={fr(6.88)}><Audio src={staticFile("assets/voz/P1-3.mp3")}/></Sequence><Sequence from={fr(15)} durationInFrames={fr(7)}><Audio src={staticFile("assets/voz/P1-4.mp3")}/></Sequence>
    {[0,.18,.36,5.15,5.53,5.91,6.29,6.67,7.05].map((at,i)=><Sfx key={i} kind="ping" at={at}/>)}{[8,9.25,10.45,11.6,12.65,13.8].map((at,i)=><Sfx key={i} kind="tap" at={at}/>)}<Sfx kind="whoosh" at={8}/><Sfx kind="whoosh" at={15}/>
  </AbsoluteFill>;
}

function Ticket({ f }: { f: Formato }) { const frame=useCurrentFrame(); const x=interpolate(frame,[0,fr(.45)],[-600,0],{extrapolateRight:"clamp"}); return <div style={{position:"absolute", left:is9(f)?92:75, top:is9(f)?590:330, padding:is9(f)?"34px 45px":"28px 35px", background:"#fffdf5", boxShadow:"0 16px 36px #0007", transform:`translateX(${x}px) rotate(-2deg)`, color:"#24221f", fontSize:is9(f)?72:58, ...title}}>MESA 7<br/><span style={{fontSize:is9(f)?36:30,...body}}>2 hamburguesas · Nuevo</span></div>; }
function PlanPill({ f }: { f: Formato }) { return <div style={{position:"absolute", left:"50%", top:is9(f)?270:56, transform:"translateX(-50%)", padding:"10px 20px", whiteSpace:"nowrap", borderRadius:999, background:"#173c26", color:"#fff", fontSize:is9(f)?32:28,...body}}>Plan Restaurante · en pruebas</div>; }
export function R2v2({ formato: f }: { formato: Formato }) {
  const frame=useCurrentFrame();
  return <AbsoluteFill><Music/><PlanPill f={f}/>
    <Sequence from={0} durationInFrames={fr(2)}><Clip name="cocina-tablet.mp4" dark={.23}/><Ticket f={f}/><Large f={f} top={is9(f)?375:135}>MESA 7<br/>ACABA DE PEDIR</Large></Sequence>
    <UiShot video="c4-mesa-a-cocina.mp4" at={2} sourceAt={0} duration={1.4} zoom={1.65} origin="50% 25%"/><UiShot video="c4-mesa-a-cocina.mp4" at={3.4} sourceAt={1.4} duration={1.6} zoom={1.62} origin="50% 67%"/><Sequence from={fr(2)} durationInFrames={fr(3)}><Large f={f}>PIDE DESDE<br/>SU MESA</Large></Sequence>
    <UiShot video="c4-mesa-a-cocina.mp4" at={5} sourceAt={3} duration={1.7} zoom={1.55} origin="50% 47%"/><Sequence from={fr(5)} durationInFrames={fr(1.7)}><Large f={f}>LLEGA A<br/><span style={{color:"#49bd72"}}>COCINA</span></Large></Sequence>
    <Sequence from={fr(6.7)} durationInFrames={fr(.6)}><Clip name="cocina-tablet.mp4" dark={.32}/></Sequence><UiShot video="c4-mesa-a-cocina.mp4" at={7.3} sourceAt={7.8} duration={2.4} zoom={1.52} origin="50% 54%"/><Sequence from={fr(7.3)} durationInFrames={fr(2.4)}><Large f={f}>PREPARANDO</Large></Sequence>
    <Sequence from={fr(9.7)} durationInFrames={fr(.6)}><Clip name="cocina-tablet.mp4" dark={.3}/></Sequence><UiShot video="c4-mesa-a-cocina.mp4" at={10.3} sourceAt={10.2} duration={2.2} zoom={1.52} origin="50% 60%"/><Sequence from={fr(10.3)} durationInFrames={fr(2.2)}><Large f={f}>LISTO</Large></Sequence>
    <Sequence from={fr(12.5)} durationInFrames={fr(4.5)}><Clip name="cocina-tablet.mp4" dark={.52} slow={.7}/><Large f={f} top={is9(f)?570:350}>¿TIENES RESTAURANTE<br/>CON MESAS?</Large><div style={{position:"absolute", ...safe(f), top:"auto", padding:"20px 28px", borderRadius:18, background:"#49bd72", color:"#fff", fontSize:is9(f)?52:44,...body}}>Solicita una demostración ↓</div></Sequence>
    <Sequence from={0} durationInFrames={fr(4.48)}><Audio src={staticFile("assets/voz/R2-1.mp3")}/></Sequence><Sequence from={fr(5)} durationInFrames={fr(6.59)}><Audio src={staticFile("assets/voz/R2-2.mp3")}/></Sequence><Sequence from={fr(12.5)} durationInFrames={fr(2.53)}><Audio src={staticFile("assets/voz/R2-3.mp3")}/></Sequence><Sfx kind="bell" at={.15}/>{[3.4,7.3,10.3].map((at,i)=><Sfx key={i} kind="tap" at={at}/>)}<Sfx kind="whoosh" at={5}/><Sfx kind="bell" at={10.3}/>
  </AbsoluteFill>;
}
export const pilotDuration = (id: "P1v2" | "R2v2") => fr(id === "P1v2" ? 22 : 17);
