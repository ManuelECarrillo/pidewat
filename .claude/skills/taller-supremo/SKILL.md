---
name: taller-supremo
description: Jefe del equipo de agentes de las microapps. Corre el ciclo completo sobre una app (seguridad, probador y QA en paralelo, luego programador, luego verificación) y le da a Eduardo un solo resumen con lo que se arregló y lo que necesita de él. Usar con /taller-supremo, una vez por semana, antes de enseñarle la app a un prospecto o cuando Eduardo pida revisar y arreglar todo.
---

# /taller-supremo: el ciclo completo con un solo comando

Junta a los demás agentes para que Eduardo no tenga que acordarse del orden. Revisa, arregla, vuelve a probar y entrega un resumen corto.

Ejemplos: `/taller-supremo` · `/taller-supremo solo revisar, no arregles` · `/taller-supremo antes de la demo del viernes`.

## Ciclo

1. **Contexto**: lee `docs/agentes/README.md` y `docs/hallazgos/ABIERTOS.md`. Di en una línea qué se va a revisar (toda la app o lo que cambió desde la última corrida: `git log --since`).
2. **Revisión en paralelo** (subagentes, uno por skill, cada uno con su SKILL.md completo como instrucción y las reglas comunes):
   - `/seguridad-supremo`
   - `/probador-supremo`
   - `/qa-supremo`
   Cada uno deja su reporte y actualiza `ABIERTOS.md`. Para evitar choques al escribir `ABIERTOS.md`, que cada uno devuelva sus hallazgos y tú los juntes en un solo cambio.
3. **Triage**: junta los hallazgos, quita duplicados (el mismo problema visto por dos agentes queda en uno, con los dos IDs), y sepáralos en:
   - arreglos claros → al programador;
   - rediseños → `/disenador-supremo` (solo la propuesta; se construye cuando Eduardo apruebe);
   - decisiones o acciones de Eduardo (rotar llaves, apagar el registro, elegir diseño) → lista para él.
4. **Arreglo**: `/programador-supremo` con los arreglos claros, en uno o dos PRs. Si Eduardo dijo "solo revisar", sáltate este paso.
5. **Verificación**: `/qa-supremo` verifica en la vista previa del PR los hallazgos arreglados.
6. **Mejora** (opcional, una vez al mes o si Eduardo lo pide): `/mejora-supremo` con los hallazgos frescos como señal.

## Reglas

- Nada se fusiona ni se publica sin Eduardo. Nada se aplica a la base de producción sin Eduardo.
- Las pruebas en vivo, solo con el negocio de prueba y `/demo`.
- Si un 🔴 de seguridad expone datos reales hoy, para el ciclo y avísale a Eduardo enseguida, antes de seguir.

## Resumen para Eduardo

Guárdalo en `docs/hallazgos/AAAA-MM-DD-taller.md` y en el cerebro (`01 Modelo de negocio/Microapps/<App>/Revisiones/AAAA-MM-DD Taller.md`, más la bitácora). A Eduardo, máximo 8 líneas:
- Veredicto en una línea ("Lista para enseñar; 2 arreglos en el PR").
- Qué se arregló (en palabras de cliente) y el enlace al PR.
- Qué necesita de él, en orden.
- Cuántos hallazgos quedan abiertos y el más importante.
