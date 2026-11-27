import Link from "next/link";
import QRCode from "qrcode";
import { PLANES, DIAS_PRUEBA } from "@/lib/planes";
import { dinero } from "@/lib/formato";
import { BotonProbar, BotonVerDemo, MedirVisita } from "./Medicion";
import { BurbujaWhatsapp, Captura, MenuMini, Telefono } from "./Mockups";
import CtaMovil from "./CtaMovil";
import DemoSeccion from "./DemoSeccion";
import Revelar from "./Revelar";
import s from "./Landing.module.css";

// Landing comercial de Pidewat: le habla al dueño de un negocio de comida.
// Regla: aquí solo se anuncia lo que ya funciona. El plan Restaurante sale como "Próximamente".

const ESENCIAL = "/empezar?plan=esencial";
const RESTAURANTE = "/empezar?plan=restaurante";

const INCLUYE_ESENCIAL = [
  "Menú digital con tu logo y tus colores",
  "Productos y categorías",
  "Tamaños, sabores y extras con precio",
  "Carrito con cantidades y total",
  "Pedidos ordenados a tu WhatsApp",
  "Tu QR listo para imprimir",
  "Panel para cambiar precios y agotados desde el celular",
];
const INCLUYE_RESTAURANTE = [
  "Todo lo del plan Esencial",
  "QR por mesa",
  "Pedidos directo a cocina",
  "Monitor de comandas",
  "Estados de preparación",
  "Seguimiento del pedido",
];

// Capturas tomadas del menú de demostración real (/demo), no de un diseño
const CAPTURAS = [
  { src: "/landing/captura-menu.png", alt: "Menú digital de un negocio de antojitos en Pidewat", pie: "Tu menú, con tus categorías y precios" },
  { src: "/landing/captura-extras.png", alt: "Ficha de un platillo con extras y opción para quitar ingredientes", pie: "Extras y «sin cebolla» en un toque" },
  { src: "/landing/captura-carrito.png", alt: "Carrito con el total del pedido listo para enviar por WhatsApp", pie: "El total listo antes de enviar" },
];

const PREGUNTAS = [
  { p: "¿Necesito instalar algo?", r: "No. Pidewat funciona en el navegador del celular o de la computadora. Si quieres, tu panel se instala como app desde el navegador, sin pasar por una tienda de apps." },
  { p: "¿Mis clientes tienen que descargar una aplicación?", r: "No. Abren tu menú con un link o escaneando tu QR, y piden desde ahí." },
  { p: "¿Puedo usar mi WhatsApp actual?", r: "Sí. El pedido te llega a tu WhatsApp de siempre, ya ordenado y con su total." },
  { p: "¿Pidewat cobra comisión por pedido?", r: "No. Solo pagas tu mensualidad, vendas lo que vendas." },
  { p: "¿Puedo cambiar precios y productos?", r: "Sí, desde tu panel en el celular: precios, fotos, horario y marcar productos como agotados." },
  { p: `¿Qué pasa después de los ${DIAS_PRUEBA} días?`, r: "Te avisamos antes. Si quieres seguir, activas tu mensualidad con Mercado Pago; nunca se cobra nada sin que tú lo autorices. Si no, tu menú se pausa y no pagas nada." },
  { p: "¿Cómo cancelo?", r: "Desde tu panel, cuando quieras. No hay plazos forzosos." },
  { p: "¿Necesito una computadora?", r: "No. Todo se maneja desde el celular." },
  { p: "¿Cómo se activa el plan Restaurante?", r: "Está en pruebas. Pide una demostración y te avisamos en cuanto esté listo para tu negocio." },
];

export default async function Landing() {
  // QR real que abre el menú de demostración de Pidewat
  const qr = await QRCode.toString("https://pidewat.vercel.app/demo", { type: "svg", margin: 0, color: { dark: "#1d1b19", light: "#ffffff" } });

  return (
    <div className={s.lp}>
      <MedirVisita />

      <header className={s.barra}>
        <div className={s.contenedor}>
          <Link href="/" className={s.marca} aria-label="Pidewat, inicio">Pide<span>wat</span></Link>
          <nav className={s.navLinks} aria-label="Secciones">
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#demo">Demo</a>
            <a href="#precios">Precios</a>
            <a href="#preguntas">Preguntas</a>
          </nav>
          <div className={s.barraAcciones}>
            <Link href="/entrar" className={s.entrar}>Entrar</Link>
            <BotonProbar href={ESENCIAL} origen="barra" className={s.botonChico}>Probar gratis</BotonProbar>
          </div>
        </div>
      </header>

      <main>
        {/* 1 · Hero */}
        <section id="inicio" className={s.hero}>
          <div className={`${s.contenedor} ${s.heroGrid}`}>
            <div className={s.heroTexto}>
              <p className={s.etiqueta}>Para taquerías, hamburgueserías, puestos y fondas</p>
              <h1 className={s.heroTitulo}>Deja de tomar pedidos <em>a medias</em> por WhatsApp</h1>
              <p className={s.heroSub}>
                Tus clientes eligen productos, tamaños y extras desde un menú digital. Tú recibes el pedido completo, con su total y listo para atender.
              </p>
              <div className={s.heroCtas}>
                <BotonProbar href={ESENCIAL} origen="hero" className={s.botonPrincipal}>Probar {DIAS_PRUEBA} días gratis</BotonProbar>
                <BotonVerDemo className={s.botonSecundario}>Ver cómo funciona</BotonVerDemo>
              </div>
              <ul className={s.heroGarantias}>
                <li>{DIAS_PRUEBA} días gratis</li>
                <li>Sin tarjeta</li>
                <li>Sin comisión por pedido</li>
              </ul>
            </div>
            <div className={s.heroVisual}>
              <Telefono className={s.telefonoHero} etiqueta="Menú digital de una hamburguesería en Pidewat">
                <MenuMini />
              </Telefono>
              <div className={s.heroBurbuja}>
                <span className={s.heroBurbujaEtiqueta}>Así te llega</span>
                <BurbujaWhatsapp />
              </div>
            </div>
          </div>
        </section>

        {/* Demo interactiva: la evidencia aparece antes que la explicación. */}
        <section id="demo" className={`${s.seccion} ${s.seccionTinta}`} aria-labelledby="t-demo">
          <div className={s.contenedor}>
            <Revelar>
              <p className={`${s.numero} ${s.numeroClaro}`}>01 · Pruébalo tú</p>
              <h2 id="t-demo" className={s.titulo}>Haz un pedido como lo haría tu cliente</h2>
              <p className={s.bajada}>Elige una hamburguesa, agrégale extras y toca «Pedir». Al final ves el mensaje exacto que le llega al negocio.</p>
            </Revelar>
            <DemoSeccion />
          </div>
        </section>

        {/* Capturas reales del menú de demostración de Pidewat (/demo) */}
        <section className={`${s.seccion} ${s.seccionCorta}`} aria-labelledby="t-real">
          <div className={s.contenedor}>
            <Revelar>
              <p className={s.numero}>Capturas reales</p>
              <h2 id="t-real" className={s.tituloChico}>Así se ve en el celular de tu cliente</h2>
            </Revelar>
            <div className={s.galeria}>
              {CAPTURAS.map((c, i) => (
                <Revelar key={c.src} retraso={i * 90} className={s.galeriaItem}>
                  <Telefono className={s.telefonoMini} etiqueta={c.alt}>
                    <Captura src={c.src} alt={c.alt} ancho={780} alto={1688} />
                  </Telefono>
                  <p>{c.pie}</p>
                </Revelar>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className={s.seccion} aria-labelledby="t-como">
          <div className={s.contenedor}>
            <Revelar>
              <p className={s.numero}>02 · Cómo funciona</p>
              <h2 id="t-como" className={s.titulo}>Empiezas en tres pasos</h2>
            </Revelar>
            <ol className={s.pasos}>
              <Revelar como="li" className={s.paso}>
                  <div className={s.pasoVisual} aria-hidden="true">
                    <div className={s.papel}>
                      <span>MENÚ</span><i /><i /><i /><i />
                    </div>
                    <span className={s.pasoFlecha}>→</span>
                    <div className={s.mini}><MenuMini conCarrito={false} /></div>
                  </div>
                  <span className={s.pasoNum}>1</span>
                  <h3>Armas tu menú en minutos</h3>
                  <p>Creas tu cuenta y agregas tus productos, precios, tamaños y extras desde el celular. Sin esperar a nadie.</p>
                </Revelar>
              <Revelar como="li" className={s.paso} retraso={100}>
                  <div className={s.pasoVisual} aria-hidden="true">
                    <div className={s.qrTarjeta}>
                      <div className={s.qr} dangerouslySetInnerHTML={{ __html: qr }} />
                      <span>Escanea y pide</span>
                    </div>
                  </div>
                  <span className={s.pasoNum}>2</span>
                  <h3>Compartes tu link o tu QR</h3>
                  <p>En el mostrador, en tus mesas, en tu estado de WhatsApp y en tus redes. Este QR abre un menú de ejemplo.</p>
                </Revelar>
              <Revelar como="li" className={s.paso} retraso={200}>
                  <div className={s.pasoVisual} aria-hidden="true">
                    <BurbujaWhatsapp className={s.burbujaChica} />
                  </div>
                  <span className={s.pasoNum}>3</span>
                  <h3>Recibes pedidos ordenados</h3>
                  <p>Te llegan a tu WhatsApp con productos, cantidades, extras y total. Solo confirmas y preparas.</p>
                </Revelar>
            </ol>
          </div>
        </section>

        {/* Precios */}
        <section id="precios" className={`${s.seccion} ${s.seccionCrema}`} aria-labelledby="t-precios">
          <div className={s.contenedor}>
            <Revelar>
              <p className={s.numero}>03 · Precios</p>
              <h2 id="t-precios" className={s.titulo}>Un precio claro al mes. Sin comisiones.</h2>
            </Revelar>
            <div className={s.planes}>
              <Revelar className={`${s.plan} ${s.planDestacado}`}>
                <div className={s.planCabeza}>
                  <h3>Pidewat Esencial</h3>
                  <span className={s.planInsignia}>{DIAS_PRUEBA} días gratis</span>
                </div>
                <p className={s.planPara}>Para puestos y negocios pequeños.</p>
                <p className={s.precio}><strong>{dinero(PLANES.base.mensual)}</strong> <span>MXN al mes</span></p>
                <ul className={s.planLista}>
                  {INCLUYE_ESENCIAL.map((x) => <li key={x}>{x}</li>)}
                </ul>
                <BotonProbar href={ESENCIAL} origen="planes" className={`${s.botonPrincipal} ${s.botonAncho}`}>Probar {DIAS_PRUEBA} días gratis</BotonProbar>
              </Revelar>
              <Revelar className={`${s.plan} ${s.planProximo}`} retraso={120}>
                <div className={s.planCabeza}>
                  <h3>Pidewat Restaurante</h3>
                  <span className={s.planProximamente}>Próximamente</span>
                </div>
                <p className={s.planPara}>Para establecimientos con mesas y cocina.</p>
                <p className={s.precio}><strong>{dinero(PLANES.plus.mensual)}</strong> <span>MXN al mes</span></p>
                <ul className={s.planLista}>
                  {INCLUYE_RESTAURANTE.map((x) => <li key={x}>{x}</li>)}
                </ul>
                <p className={s.planAviso}>Todavía no se puede contratar: lo estamos probando. Pide una demostración y te avisamos.</p>
                <Link href={RESTAURANTE} className={`${s.botonSecundario} ${s.botonAncho}`}>Solicitar demostración</Link>
              </Revelar>
            </div>
            <p className={s.condiciones}>
              {DIAS_PRUEBA} días gratis, sin tarjeta. Al terminar, tú decides si activas tu mensualidad. Sin plazos forzosos: cancelas desde tu panel.
            </p>
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section id="preguntas" className={`${s.seccion} ${s.seccionCrema}`} aria-labelledby="t-preguntas">
          <div className={`${s.contenedor} ${s.contenedorAngosto}`}>
            <Revelar>
              <p className={s.numero}>04 · Preguntas</p>
              <h2 id="t-preguntas" className={s.titulo}>Lo que nos preguntan antes de empezar</h2>
            </Revelar>
            <div className={s.faq}>
              {PREGUNTAS.map((q) => (
                <details key={q.p}>
                  <summary>{q.p}</summary>
                  <p>{q.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="cta-final" className={s.final} aria-labelledby="t-final">
          <div className={`${s.contenedor} ${s.finalInterior}`}>
            <h2 id="t-final" className={s.finalTitulo}>Tu menú puede empezar a trabajar por ti</h2>
            <BotonProbar href={ESENCIAL} origen="final" className={s.botonBlanco}>Empezar prueba gratis</BotonProbar>
            <p className={s.finalCondiciones}>{DIAS_PRUEBA} días gratis · Sin tarjeta · Sin comisión por pedido · Cancelas cuando quieras</p>
          </div>
        </section>
      </main>

      <footer className={s.pie}>
        <div className={s.contenedor}>
          <span className={s.marca}>Pide<span>wat</span></span>
          <span>Hecho en Durango, México</span>
          <Link href="/entrar">Entrar</Link>
        </div>
      </footer>
      <CtaMovil href={ESENCIAL}>Probar {DIAS_PRUEBA} días gratis</CtaMovil>
    </div>
  );
}
