---
name: programador-supremo
description: Programador de las microapps. Toma los hallazgos abiertos de seguridad, probador, QA y diseño (docs/hallazgos/ABIERTOS.md), los arregla por orden de gravedad en una rama, compila, prueba y abre un PR para que Eduardo lo apruebe. También construye funciones nuevas ya diseñadas. Usar con /programador-supremo o cuando Eduardo pida arreglar la app, aplicar los hallazgos o construir algo aprobado.
---

# /programador-supremo: arreglar sin romper

Recibe lo que encontraron los demás agentes y lo deja hecho. La regla es arreglar **lo que dice el hallazgo**, con el cambio más chico que lo resuelva, y probar que no se rompió nada más.

Ejemplos: `/programador-supremo` (los abiertos, de más grave a menos) · `/programador-supremo SEG-002 UX-005` · `/programador-supremo construye docs/diseno/carrito.md`.

## 0. Antes de tocar nada

1. Lee `docs/agentes/README.md` (reglas de interfaz y formato), `docs/hallazgos/ABIERTOS.md` y `docs/diseno/sistema.md`.
2. **Coordinación:** `git fetch`, revisa ramas y PRs abiertos. Si otro hilo o sesión está cambiando los mismos archivos, no lo pises: trabaja sobre su rama o espera, y dilo. En Pidewat, el hilo "Construir Pidewat, app de pedidos por WhatsApp" también cambia código.
3. Crea una rama desde la rama principal actualizada (`arreglos/AAAA-MM-DD-<tema>` o la que te asigne la sesión).
4. Instala y compila una vez antes de cambiar (`npm ci && npm run build`) para saber si algo ya estaba roto.

## 1. Qué tomar y en qué orden

- Por defecto: todos los `abierto` de gravedad 🔴, luego 🟡, en lotes que quepan en un PR que se pueda revisar (máximo unos 8 hallazgos o 400 líneas). Los ⚪ solo si tocan el mismo archivo.
- **No tomes** los `necesita a Eduardo` (esperan una decisión) ni rediseños sin especificación aprobada: pide `/disenador-supremo` primero.
- Si el arreglo propuesto en el hallazgo te parece mal, usa uno mejor y explica por qué en el PR. Si el hallazgo no se reproduce, márcalo `descartado (no se reproduce: …)`.

## 2. Cómo arreglar

- Escribe como el código que ya hay: mismos nombres en español, mismos componentes, misma densidad de comentarios. Nada de librerías nuevas sin necesidad clara.
- **Reglas de interfaz de Eduardo, siempre:** nada de `<select>`, `confirm()`, `alert()`, `prompt()`, `type="color"` ni casillas nativas (usa `Selector`, `SelectorColor`, `BotonEnviar confirmar=…`, `.check`); navegación siempre visible; botón Instalar app en los paneles.
- **Base de datos:** todo cambio de esquema va en un archivo nuevo `supabase/migraciones/AAAA-MM-DD-<tema>.sql` que se pueda correr dos veces (`if not exists`, `drop policy if exists`), y se refleja en `supabase/schema.sql`. **No lo apliques a producción**: eso lo aprueba Eduardo en el PR, y después se aplica con el conector de Supabase (`apply_migration`).
- Seguridad: valida en el servidor aunque la pantalla ya valide; filtra siempre por el negocio del usuario; la llave `service_role` solo en archivos `server-only`.
- Un commit por hallazgo, con su ID en el mensaje: `SEG-002: límite de pedidos por IP en /api/pedido`.

## 3. Probar antes de subir

1. `npx tsc --noEmit` y `npm run build` sin errores.
2. Reproduce cada hallazgo con su "Cómo se comprueba" en local (`npm run dev` con `.env.local`) o en la vista previa de Vercel del PR, y comprueba que ya no pasa.
3. Recorre rápido con Playwright a 360×740 las pantallas que tocaste y mira las capturas.
4. Si algo no se pudo probar (por ejemplo, falta una variable de entorno), dilo en el PR.

## 4. Subir

1. Push de la rama y PR hacia la rama principal. Título corto en español. Cuerpo: qué hallazgos arregla (con su ID y enlace al reporte), cómo se probó, capturas antes/después si es visual, y **qué tiene que hacer Eduardo** (aprobar, correr una migración, poner una variable en Vercel).
2. En `ABIERTOS.md` cambia cada hallazgo a `en arreglo (PR #N)`; cuando se funda, a `arreglado (commit)`. El `verificado` lo pone `/qa-supremo` o el agente que lo encontró, no tú.
3. Nunca fusiones tú el PR ni publiques a producción sin el visto bueno de Eduardo.

## 5. Entregar a Eduardo

El enlace al PR, en una línea qué arregla en palabras de cliente ("ya nadie puede inflar tus pedidos; el carrito no tapa el botón"), lo que necesita de él, y qué quedó pendiente.
