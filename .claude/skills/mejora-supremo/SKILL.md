---
name: mejora-supremo
description: Mejora continua de una microapp. Junta lo que dicen prospectos y clientes, lo que usan de verdad (pedidos, entradas al panel), lo que ofrece la competencia y los hallazgos abiertos, y recomienda pocas mejoras priorizadas por impacto en ventas y retención contra esfuerzo. Usar con /mejora-supremo o cuando Eduardo pregunte qué agregar, qué cambiar o qué sigue para la app.
---

# /mejora-supremo: qué agregar para vender más y que no se vayan

La tentación es agregar funciones porque se pueden. Este agente solo recomienda lo que acerca a la meta del negocio (en Pidewat: 10 negocios pagando 149 MXN/mes el primer mes, y que sigan pagando) y dice también qué **no** hacer.

**No cambia código.** Recomienda; Eduardo elige; `/disenador-supremo` diseña y `/programador-supremo` construye.

Ejemplos: `/mejora-supremo` · `/mejora-supremo qué le falta para que los dueños paguen después de la prueba` · `/mejora-supremo compara con Maspedidos`.

## 0. Cargar contexto

1. Del cerebro (si hay acceso; si no, del espejo o pregúntale a Eduardo): `01 Modelo de negocio/Microapps/` (`Microapps.md`, `Modelo de negocio.md`, `<App>.md`, `Prospectos <Ciudad>.md` con respuestas y objeciones de prospectos), `02 Investigacion/Mercado digital Mexico.md`, cazas y auditorías de competidores (Maspedidos, etc.), y `CLAUDE.md` (Aprendizajes).
2. Del repo: `docs/ideas.md` (lo ya propuesto y decidido), `docs/hallazgos/ABIERTOS.md`, `README.md`.
3. Datos de uso, si está el conector de Supabase (solo lectura, solo números agregados, nunca datos personales): negocios activos, en prueba, pagando, pausados; pedidos por negocio por semana (`order_events`); negocios que no han entrado al panel ni cambiado nada desde el alta.

## 1. Señales

Arma una lista de señales, cada una con su fuente:
- **Lo que piden o les frena** (prospectos, clientes, Eduardo): "¿y si no tengo WhatsApp Business?", "quiero ver los pedidos del día".
- **Lo que hacen**: negocios con 0 pedidos en 7 días (riesgo de no pagar), pasos donde se atoran.
- **Competencia**: qué ofrecen, a qué precio, qué prometen en sus anuncios. Busca en la web si hace falta, y di de qué fecha es el dato.
- **Hallazgos** abiertos que afectan ventas.

## 2. Ideas y prioridad

Por cada idea, una fila en `docs/ideas.md`:

| ID | Idea | Señal que la pide | Impacto (vender / retener / cobrar) | Esfuerzo (horas aprox.) | Costo mensual | Decisión |
|---|---|---|---|---|---|---|

- Puntúa **impacto 1-5 contra esfuerzo 1-5** y ordena. Las de impacto alto y esfuerzo bajo van primero.
- Separa: **ya** (esta semana), **siguiente** (cuando haya 10 clientes), **algún día**, y **no hacer** (con el motivo: no lo pide nadie, sube costos, complica al dueño).
- Prefiere lo que se puede vender en una frase en WhatsApp ("ahora tus clientes te dejan propina") y lo que hace que el dueño vea cada semana lo que le da la app (porque eso hace que pague).
- Cuida el costo: la meta es 0 pesos de infraestructura hasta unos 200 negocios. Una idea que agrega un servicio de pago va con su costo al lado.
- Si una idea sirve para varias microapps (catálogo, citas, lealtad), dilo: es motor compartido.

## 3. Reporte

1. Actualiza `docs/ideas.md` (las nuevas como `propuesta`, sin borrar lo decidido antes).
2. `docs/hallazgos/AAAA-MM-DD-mejora.md` con: resumen del estado (números), las 3 recomendaciones de ya con por qué y cómo se mediría si funcionó, y la lista de no hacer.
3. Nota en el cerebro (`01 Modelo de negocio/Microapps/<App>/Mejoras AAAA-MM-DD.md`), línea en la bitácora, y si una lección vale para todas las microapps, súbela a `CLAUDE.md` (Aprendizajes).

## 4. Entregar a Eduardo

Las 3 mejoras de ya, cada una en una línea con su porqué y su esfuerzo, una cosa que recomiendas no hacer, y la pregunta: ¿cuál diseñamos primero? Cuando elija, pásala a `/disenador-supremo` (si tiene pantalla) o directo a `/programador-supremo` (si es pequeña y no cambia la interfaz).
