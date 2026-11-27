# Escenas: prompts y animación

## Imágenes (Higgsfield, gpt_image_2_6, calidad high, 2k) · 7 generadas × 2 créditos = 14 créditos (2026-11-27)
Una rechazada (salió con botones de cámara de celular encima) y repetida.

- p1-gancho-dueno-9x16 (job 232a706f): «Ultra-realistic candid smartphone-style vertical photo, UGC selfie framing: an ordinary Mexican man in his early 30s, owner of a small hamburger and hot dog street stand, simple dark apron and cap, in front of his stand at dusk, looking into the camera mid-sentence… phone screen facing away… no readable text, no logos.»
- p1-problema-celular-9x16 (job 07e69670): dueño en la plancha mirando el celular, algo confundido, sin comedia; pantalla no visible.
- puesto-4x5 (job ab981bff): puesto de hamburguesas y hot dogs al atardecer, dueño con mandil rojo, un cliente esperando, espacio libre a la derecha.
- fonda-qr-4x5 (job 2437b156): fonda modesta, mesa con enchiladas, agua de jamaica y soporte de acrílico en blanco para el QR.
- fonda-cliente-qr-9x16 (job 350a73f1): clienta de espaldas acercando el celular al soporte en blanco de la mesa.
- cocina-tablet-9x16 (job 041a2fae): cocinera en cocina abierta de fonda, tablet apagada en su soporte.

## Animación con APIMart (la hace la sesión de Claude en la PC; tope 1,50 USD en total)
Imagen → video, 9:16, 4-5 s, sin audio salvo P1-gancho. Movimiento de cámara mínimo (cámara en mano leve). Sin texto, sin pantallas, sin logos.
1. `p1-gancho-dueno` → lipsync con la voz de P1 0-3 s: «¿Te piden dos hamburguesas por WhatsApp y luego te cambian todo en cinco mensajes?». Gestos naturales, sin exagerar. (Alternativa si falla: Higgsfield Seedance 2.5 omni_reference con la voz como audio_reference, 35 créditos por 5 s.)
2. `p1-problema-celular` → «he scrolls his phone, frowns slightly, glances at the grill and back to the phone; burgers sizzling, steam; subtle handheld camera».
3. `puesto-4x5` (recortar a 9:16 si hace falta) → «owner flips a burger, customer waits, warm evening street life; slow push-in».
4. `fonda-cliente-qr-9x16` → «she raises the phone toward the table stand and holds it still for a second, then looks at the screen; diners move softly in background; static camera».
5. `cocina-tablet-9x16` → «cook plates food, steam from the pot, she glances at the tablet; static camera». La tablet debe seguir apagada (encima va la grabación real).
Guardar los clips en `docs/anuncios/escenas/clips/` y anotar aquí modelo, costo y saldo antes/después.
