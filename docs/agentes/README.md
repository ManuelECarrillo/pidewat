# Equipo de agentes de las microapps

Siete skills de Claude Code que revisan, arreglan y hacen crecer cada microapp (la primera es Pidewat). Viven en `.claude/skills/` de este repo, así que funcionan en cualquier sesión de Claude Code abierta aquí, y tienen copia en el cerebro (`08 Agentes/_skills/`).

| Comando | Qué hace | Cambia código |
|---|---|---|
| `/seguridad-supremo` | Busca huecos de seguridad y fugas de datos (teléfonos, contraseñas, pagos, permisos de Supabase) | No |
| `/probador-supremo` | Usa la app como un cliente y un dueño con celular Android barato y anota lo que se ve mal, confunde o va lento | No |
| `/qa-supremo` | Prueba que todo funcione: el pedido llega bien a WhatsApp, el panel guarda, un dueño no ve otro negocio, el cobro suma | No |
| `/disenador-supremo` | Diseña pantallas nuevas o rediseña las que fallan, siguiendo el sistema de diseño de la app | Solo maquetas |
| `/programador-supremo` | Toma los hallazgos abiertos, los arregla en una rama, prueba y abre un PR | Sí |
| `/mejora-supremo` | Recomienda qué agregar o cambiar para vender más y que no se vayan los clientes | No |
| `/taller-supremo` | Corre el ciclo completo: revisar → arreglar → volver a probar, y da un resumen | Vía programador |

El ciclo normal: `/taller-supremo` una vez por semana, o antes de enseñarle la app a un prospecto nuevo.

## Dónde queda cada cosa

- `docs/hallazgos/AAAA-MM-DD-<agente>.md`: un archivo por revisión (seguridad, probador, qa).
- `docs/hallazgos/ABIERTOS.md`: la lista viva de lo que falta arreglar. Todos los agentes la leen y la actualizan; es lo que lee `/programador-supremo`.
- `docs/diseno/sistema.md`: el sistema de diseño (colores, botones, reglas). Lo mantiene `/disenador-supremo`.
- `docs/diseno/<pantalla>.md` y `docs/diseno/maquetas/*.html`: propuestas de diseño.
- `docs/ideas.md`: el tablero de mejoras de `/mejora-supremo`.
- En el cerebro (Obsidian), cada agente deja una nota corta con el veredicto y el enlace en `01 Modelo de negocio/Microapps/<App>/Revisiones/` y una línea en la bitácora del día.

## Formato de un hallazgo

Todos los agentes escriben igual, para que el programador no tenga que adivinar.

```markdown
### SEG-003 · 🔴 Alta · El registro de pedidos se puede inflar sin límite
- **Dónde:** `src/app/api/pedido/route.ts:5`
- **Qué pasa:** cualquiera puede mandar miles de pedidos falsos a cualquier negocio y las estadísticas del dueño se vuelven basura.
- **Cómo se comprueba:** `curl -X POST https://<app>/api/pedido -d '{"business_id":"<id>","total":999}'` repetido 100 veces → 100 filas.
- **Arreglo propuesto:** límite por IP y por negocio (p. ej. 20 por minuto) y que el total se recalcule con los precios de la base.
- **Estado:** abierto
```

- **Prefijos:** `SEG` seguridad, `UX` probador, `QA` pruebas funcionales, `DIS` diseño. Los números no se reusan.
- **Gravedad:** 🔴 Alta (pierde datos o dinero, expone datos personales, o un cliente no puede pedir) · 🟡 Media (molesta, confunde o se ve poco profesional) · ⚪ Baja (detalle).
- **Estado:** `abierto` → `en arreglo (rama o PR)` → `arreglado (commit)` → `verificado (fecha)`; o `descartado (motivo)` / `necesita a Eduardo (qué decidir)`.
- Un hallazgo se marca `verificado` solo cuando el agente que lo encontró (o `/qa-supremo`) lo vuelve a probar en la app publicada.

## Reglas que valen para todos

- **Interfaz de Eduardo** (sus clientes usan Android barato): nada de controles grises del sistema (`<select>`, `confirm()`, `alert()`, `prompt()`, `type="color"`, casillas nativas); menús siempre visibles, sin barras que haya que deslizar; botón "Instalar app" (PWA) en la entrada de los paneles, con instrucciones de Safari en iPhone. Romper esto es un hallazgo 🟡 como mínimo.
- **Producción es de verdad.** Las pruebas en la app publicada usan solo el negocio de prueba (`/el-fogon` en Pidewat) y `/demo`. Nunca se crean, borran ni modifican negocios, cuentas o pagos reales, y nunca se manda un WhatsApp de verdad.
- **Ningún secreto en archivos ni en reportes.** Si un agente ve una llave, la nombra (`SUPABASE_SERVICE_ROLE_KEY en …`) pero no la copia.
- **Ataques solo de prueba y contra lo nuestro.** Nada de pruebas de carga que tumben la app ni de tocar servicios ajenos.
- **Coordinación:** antes de cambiar código, revisar ramas y PRs abiertos para no pisar trabajo de otro hilo o sesión.
- Todo en español, sencillo, como se lo explicarías a Eduardo.
