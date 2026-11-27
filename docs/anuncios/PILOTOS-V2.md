# Pilotos v2: P1 y R2 (dirección de Claude, 2026-11-27)

Eduardo detuvo la v1: se siente «diapositivas animadas de un software», no anuncios de respuesta directa.
Primero se rehacen SOLO P1 y R2. Las otras 4 piezas esperan a que Eduardo apruebe estos dos.
Todo el código, grabación, Remotion y exportación lo hace Codex. Claude/la sesión de la PC solo renderiza y revisa.

## Reglas nuevas (para todas las piezas)
- Prohibido: teléfono pequeño en medio de un fondo oscuro. La interfaz real de Pidewat va A PANTALLA COMPLETA o en acercamiento (recorte y zoom de la grabación), con texto de la app de al menos ~34 px de alto en 1080 de ancho. Si se ve el marco del celular, que ocupe ≥ 85 % del alto y sea por menos de 1 s (transición).
- Cada pieza: gancho visual y verbal en 0-2 s · un solo problema/beneficio · demostración real legible · propuesta ($249/mes, 14 días gratis, sin tarjeta) · CTA específico.
- Edición dinámica y natural: cortes cada 0,8-1,5 s, acercamientos suaves (scale 1→1,15), resaltado del toque (círculo), «pop» de textos clave. Nada de transiciones de presentación (deslizar tarjetas, fundidos lentos).
- Texto en pantalla: máximo 6 palabras por tarjeta, grande. Subtítulos de la voz aparte, abajo, en zona segura.
- Quitar la etiqueta «Dramatización» de los videos (pedido de Eduardo). La divulgación de IA se hace con la casilla de Meta «contenido generado con IA» al subir.
- Negocio de demo: renombrar «El Fogón de Durango» → «El Fogón» (solo en `/demo` / datos ficticios) y regrabar.
- Música: de fondo, alegre y discreta, con licencia comercial documentada (ElevenLabs Music si el plan da uso comercial, o pista libre de regalías con su licencia guardada en `anuncios/musica/LICENCIA.md`). Voz siempre por encima; -14 LUFS.
- Sin créditos nuevos de APIMart ni Higgsfield: se reutilizan los 5 clips y 6 escenas actuales (sí alcanzan para estos dos guiones).
- Consistencia: los productos, cantidades y extras del problema deben ser LOS MISMOS que en la demostración.

## P1 v2 · UGC «El pedido a medias» (20-22 s, 9:16 y 4:5)
| s | Imagen | Texto grande | Voz |
|---|---|---|---|
| 0-2 | `clips/p1-gancho-dueno.mp4` a pantalla completa (difuminar letrero falso). | «¿Te cambian el pedido 5 veces?» | «¿Te piden dos hamburguesas por WhatsApp y luego te cambian todo en cinco mensajes?» |
| 2-6 | Chat ficticio de WhatsApp A PANTALLA COMPLETA, mensajes que entran rápido con sonido de notificación: «Quiero 2 hamburguesas» · «Una sin cebolla» · «La otra doble» · «Ah, y con queso la doble» · «¿Cuánto es?». Corte de 1 s al dueño confundido (`clips/p1-problema-celular.mp4`) con texto «¿Cuál era sin cebolla?». | «¿Cuál era sin cebolla?» | (sonidos de notificación) |
| 6-7 | Transición: acercamiento al celular del dueño → entra la pantalla real de Pidewat (match cut). | — | — |
| 7-15 | Grabación REAL nueva a pantalla completa y con acercamientos: Hamburguesa de la casa → Doble carne + Queso extra → agregar; otra Hamburguesa → Sin cebolla → agregar; el total cambia (zoom al total); «Enviar pedido por WhatsApp» → el mensaje generado a pantalla completa con las 2 hamburguesas, extras y total (resaltar líneas). | «Tu cliente lo arma» → «Te llega completo» | «Con Pidewat, tu cliente arma su pedido desde un menú digital y te lo envía ordenado, con cantidades, extras y total.» |
| 15-21 | `clips/puesto.mp4` (dueño trabajando tranquilo) + tarjeta de oferta grande + botón «Crea tu menú gratis» con flecha hacia el botón del anuncio. | «$249/mes · 14 días gratis · Sin tarjeta» | «Sin comisión por pedido. Desde $249 al mes después de tu prueba. Pruébalo 14 días gratis, sin tarjeta.» |

## R2 v2 · Demo operativa «De la mesa a cocina» (18-20 s, 9:16 y 4:5)
| s | Imagen | Texto grande | Voz |
|---|---|---|---|
| 0-2 | `clips/cocina-tablet.mp4` con la pantalla REAL de `/panel/cocina` compuesta en la tablet (perspectiva), suena un «ding» y entra la tarjeta. | «Mesa 7 acaba de pedir» | «Mesa 7 hace su pedido. ¿Y si cocina pudiera recibirlo directamente?» |
| 2-4 | `clips/fonda-cliente-qr.mp4` + letrero «Mesa 7» en el soporte de la mesa. | «Pide desde el QR de su mesa» | — |
| 4-14 | Grabación REAL de cocina a pantalla completa: la comanda llega con «Mesa 7» enorme (zoom) y los platillos legibles → toque «Preparando» (cambia color) → toque «Listo». Pantalla dividida 2 s: a la derecha el celular del cliente en `/[slug]/pedido/[id]` cambiando a «Preparando» y luego «Listo» (si la página existe y funciona con el negocio ficticio). | «Preparando» → «Listo» | «Estamos probando Pidewat Restaurante: pedidos desde la mesa y seguimiento para cocina en una misma plataforma.» |
| 14-19 | Regreso a la cocina real (clip) + franja fija «Plan Restaurante · en pruebas» + botón «Solicita una demostración». Sin precio. | «Solicita una demostración» | «Solicita una demostración del plan Restaurante.» |

## Entrega
`anuncios/salida/v2/P1-9x16.mp4`, `P1-4x5.mp4`, `R2-9x16.mp4`, `R2-4x5.mp4` + miniaturas y una hoja de contacto (1 cuadro por segundo) por video en `anuncios/salida/v2/`.
Checklist antes de entregar: ¿se entiende en 5 s a quién va, qué problema resuelve, qué hace distinto y qué hacer después? ¿Algún texto de la app ilegible en un celular? ¿Mismos productos en problema y demo?
