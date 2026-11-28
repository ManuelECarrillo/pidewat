# Campaña Meta Pidewat · México · T1 (dirección creativa de Claude)

Fuente: encargo de Eduardo del 2026-11-27. Este archivo es la referencia de copys, guiones, UTM y reglas.
Codex produce y monta; Claude revisa contra este archivo antes de subir nada a Meta.

## Reglas que no se rompen
- Le hablamos al DUEÑO del negocio, no al comensal. Primera frase o primer texto: «tu negocio», «tu puesto», «tu restaurante».
- Pidewat en pantalla = grabación o captura REAL (Playwright). Nunca interfaz generada por IA.
- Las personas de las escenas son actuaciones generadas con IA: van como dramatización, nunca como cliente real ni testimonio. Etiqueta discreta «Dramatización» en la escena con persona y la casilla de «contenido generado con IA» en Meta.
- Precios exactos: Esencial $249 MXN al mes después de 14 días gratis, sin tarjeta. Restaurante: «en pruebas», solo «Solicita una demostración». Nunca $499 como contratable.
- No decir que la competencia no tiene algo ni que «todos cobran comisión». Sí: «Pidewat no cobra comisión por pedido».
- Sin promesas de dinero («vende más», «duplica»). Sí: «pedidos ordenados», «con extras y total».
- «Funciona en Android, iPhone, tablet y computadora. Sin descargar nada» solo cuando Codex confirme las pruebas de compatibilidad (ver BRIEF-CODEX-ANUNCIOS.md, parte E).
- Voz: mexicana neutral, ritmo natural. Subtítulos quemados, revisados a mano (acentos, ¿?, $249).
- Funcionan sin audio. 9:16 (1080×1920) para Reels/Stories y 4:5 (1080×1350) para Feed.
- Zonas seguras 9:16: nada importante en los 250 px de arriba, los 340 px de abajo ni a menos de 65 px de los lados.
- Sin marcas de agua. Música solo con licencia comercial (o sin música).

## UTM (una por anuncio)
Base: `https://pidewat.vercel.app/`
`?p=<publico>&utm_source=facebook&utm_medium=paid_social&utm_campaign=pidewat_mx_t1&utm_term=<publico>&utm_content=<anuncio>`

| Anuncio | publico | utm_content | Destino |
|---|---|---|---|
| P1 Video «El pedido a medias» | puestos | p1_pedido_medias | landing |
| P2 Video «Sin comisión por pedido» | puestos | p2_sin_comision | landing |
| P3 Imagen «De 6 mensajes a un pedido claro» | puestos | p3_comparativa | landing |
| R1 Video «El QR que sí sirve para pedir» | restaurantes | r1_qr_mesa | landing |
| R2 Video demo «De la mesa a cocina» | restaurantes | r2_demo_cocina | `/empezar?plan=restaurante` (solicitud de demostración) |
| R3 Imagen «Tu menú, listo para compartir» | restaurantes | r3_menu_listo | landing |

## Conjunto 1 · Puestos de comida

### P1 · Video UGC «El pedido a medias» (20-22 s)
| Tiempo | Imagen | Voz | Texto en pantalla |
|---|---|---|---|
| 0-3 s | Dueño frente a su puesto, le habla a la cámara (escena IA, lipsync). | «¿Te piden dos hamburguesas por WhatsApp y luego te cambian todo en cinco mensajes?» | «¿Te cambian el pedido en 5 mensajes?» |
| 3-7 s | Dueño mirando el celular en la plancha (escena IA) + burbujas de chat ficticias que entran una tras otra. | (sin voz, sonido de notificaciones) | Burbujas: «Una sin cebolla» · «La otra doble» · «¿Cuánto cuestan las papas?» · «Ah, y agrégale queso» |
| 7-15 s | Grabación REAL en marco de celular: hamburguesa → tamaño → queso extra → «sin cebolla» → el total cambia → «Enviar por WhatsApp» → mensaje del pedido. | «Con Pidewat, tu cliente arma su pedido desde un menú digital y te lo envía ordenado, con cantidades, extras y total.» | «Tu cliente arma su pedido» → «Te llega ordenado» |
| 15-22 s | Tarjeta final sobre el puesto desenfocado + logo. | «Sin comisión por pedido. Desde $249 al mes después de tu prueba. Pruébalo 14 días gratis, sin tarjeta.» | «$249/mes · 14 días gratis · Sin tarjeta» + «Toca el botón y crea tu menú gratis» |

Copy principal: «¿Tu puesto recibe pedidos por WhatsApp? Con Pidewat tu cliente arma el pedido en tu menú digital y te llega ordenado: cantidades, extras y total. Sin comisión por pedido. Pruébalo 14 días gratis, sin tarjeta. Después $249 al mes.»
Título: «Pedidos claros por WhatsApp» · Descripción: «14 días gratis, sin tarjeta» · Botón: Registrarte.

### P2 · Video «No pagues comisión por cada pedido» (16-18 s)
- 0-2 s · Gancho texto grande sobre grabación del menú real: «¿Menú digital sin comisión por pedido?» Voz: «¿Quieres un menú digital sin pagar comisión por cada pedido?»
- 2-12 s · Grabación real: menú → QR del negocio (tarjeta real de /panel/qr) → variante → extra → carrito → mensaje final. Secuencia de dispositivos (Android → iPhone → tablet/computadora con el panel). Voz: «Pidewat tiene una mensualidad fija. Tus clientes ven tus platillos, personalizan su pedido y te lo envían organizado por WhatsApp. Tú conservas el control de tu negocio.» Texto: «Android · iPhone · tablet · computadora» (solo si E aprueba).
- 12-17 s · Cierre: «$249 al mes. Primero pruébalo 14 días gratis, sin tarjeta. Entra y compruébalo.»
Copy: «Tus clientes piden desde cualquier celular, sin descargar nada. Tú manejas tu menú desde tu celular, tablet o computadora. Mensualidad fija de $249, sin comisión por pedido. Empieza con 14 días gratis, sin tarjeta.»
Título: «Menú digital sin comisión por pedido» · Botón: Registrarte.

### P3 · Imagen 4:5 (y 9:16) «De 6 mensajes a un pedido claro»
- Fondo: escena del puesto (Higgsfield), oscurecida donde va texto.
- Título grande: «DE 6 MENSAJES A UN PEDIDO CLARO».
- Izquierda: chat ficticio de 6 burbujas desordenadas (se marca «ejemplo»). Derecha: captura REAL del mensaje de pedido de Pidewat.
- Pie: «Menú digital + extras + total + WhatsApp». Oferta: «14 días gratis · Sin tarjeta». CTA visual: «Crea tu menú».
Copy: «Que tu cliente no te mande el pedido en pedacitos. Con Pidewat elige, personaliza y te lo manda completo por WhatsApp. ¿Tienes Android o iPhone? Funciona en ambos. 14 días gratis, sin tarjeta.»
Título: «Crea tu menú gratis» · Botón: Registrarte.

## Conjunto 2 · Restaurantes

### R1 · Video «El QR que sí sirve para pedir» (18-20 s)
- 0-3 s · Escena IA: clienta en una fonda acerca el celular al QR de la mesa (no se ve la pantalla). Texto/voz: «Un QR en tu mesa puede hacer más que enseñar una carta.»
- 3-14 s · Grabación REAL (marco de celular): menú con mesa → platillos y extras → enviar → mensaje del pedido. Voz: «Con Pidewat, tus clientes pueden consultar el menú, elegir sus productos y enviarte el pedido organizado. Sin instalar apps y sin comisión por pedido.»
- 14-19 s · Cierre: «Prueba Pidewat Esencial 14 días gratis» + «Sin tarjeta · $249/mes después».
Copy: «¿Tu restaurante ya tiene menú? Ponlo en un QR y que tus clientes pidan desde su celular, sin instalar nada. Te llega el pedido completo. Prueba Pidewat Esencial 14 días gratis, sin tarjeta.»
Título: «Tu menú con QR para pedir» · Botón: Registrarte.

### R2 · Video demo «De la mesa a cocina» (18-20 s) — función EN PRUEBAS
- 0-3 s · Escena IA de cocina con tablet apagada + texto: «Mesa 7 hace su pedido. ¿Y si cocina pudiera recibirlo directamente?»
- 3-15 s · Grabación REAL con negocio ficticio: QR → producto → /panel/cocina recibe → «Preparando» → «Listo». Etiqueta fija arriba: «Plan Restaurante · en pruebas».
- Voz: «Estamos probando Pidewat Restaurante: pedidos desde la mesa y seguimiento para cocina en una misma plataforma.»
- 15-19 s · Cierre: «Solicita una demostración del plan Restaurante». Prohibido: «contrátalo hoy», precio $499, «para cualquier restaurante».
Copy: «Estamos probando Pidewat Restaurante: el pedido de la mesa llega a la pantalla de cocina y se marca preparando y listo. Es una función en pruebas. Si tienes restaurante con mesas, solicita una demostración.»
Título: «Solicita una demostración» · Botón: Más información.

### R3 · Imagen 4:5 (y 9:16) «Tu menú, listo para compartir»
- Fondo: fonda con QR en blanco sobre la mesa (Higgsfield). Sobre el soporte, un QR real de demo (sin datos de clientes).
- Superposición: captura REAL del menú y de un pedido organizado.
- Título: «TU RESTAURANTE TIENE MENÚ. HAZLO MÁS FÁCIL DE PEDIR». Pie: «Menú digital · QR · Pedidos por WhatsApp». CTA: «14 días gratis».
Copy: «Tu carta en el celular de tus clientes, con QR en cada mesa. Eligen, personalizan y te mandan el pedido por WhatsApp. Tus clientes pueden pedir desde cualquier celular. 14 días gratis, sin tarjeta.»
Título: «Menú digital con QR» · Botón: Registrarte.

## Escenas generadas (Higgsfield, gpt_image_2_6 high 2k, 2 créditos c/u)
En `docs/anuncios/escenas/`. Prompts en `escenas/PROMPTS.md`.
- `p1-gancho-dueno-9x16.jpg` (P1 0-3 s; primer cuadro para lipsync). Difuminar el letrero de menú de arriba a la derecha (letras falsas).
- `p1-problema-celular-9x16.jpg` (P1 3-7 s).
- `puesto-4x5.jpg` (P3 fondo + landing imagen 1).
- `fonda-qr-4x5.jpg` (R3 fondo).
- `fonda-cliente-qr-9x16.jpg` (R1 0-3 s + landing imagen 2).
- `cocina-tablet-9x16.jpg` (R2 0-3 s; la tablet está apagada: se puede componer encima la grabación REAL de /panel/cocina con perspectiva).
