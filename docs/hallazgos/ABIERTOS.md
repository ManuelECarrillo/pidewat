# Hallazgos abiertos

Lista viva que leen todos los agentes (ver `docs/agentes/README.md`). Orden: gravedad, luego número.

| ID | Gravedad | Qué | Estado | Reporte |
|---|---|---|---|---|
| SEG-001 | 🟡 | Cualquiera puede inflar los pedidos de un negocio (`/api/pedido`) | arreglado (main 1e23c2e) · precios y total ya salen de la base; queda el límite solo por negocio, ver SEG-010 | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-002 | 🟡 | Apagar registro libre y prender protección de contraseñas filtradas en Supabase | verificado (2026-10-30: `/auth/v1/settings` da `disable_signup: true` y el registro responde `signup_disabled`). Lo de contraseñas filtradas no se ve desde fuera | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-003 | 🟡 | El público ve plan, prueba y pagado hasta de todos los negocios | verificado (2026-10-30: con la llave pública, pedir `plan`, `paid_until` u `owner_email` da "permission denied"; migración corrida 15:43 UTC) | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-004 | 🟡 | Contraseña por WhatsApp sin poder cambiarla | arreglado (main 1e23c2e) | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| UX-001 | 🟡 | Barra de categorías se desliza de lado | verificado (2026-10-30: a 360 px los chips se acomodan en filas, `scrollWidth = clientWidth`) | [2026-10-30-probador](2026-10-30-probador.md) |
| UX-002 | 🟡 | Botón "Pedir por WhatsApp" escondido en la hoja del pedido | verificado (2026-10-30: total y botón fijos al pie de la hoja a 360×740) | [2026-10-30-probador](2026-10-30-probador.md) |
| UX-006 | 🟡 | El negocio de prueba el-fogon tiene portada y logo que no son de comida | necesita a Eduardo (cambiar fotos desde su panel) | [2026-10-30-taller](2026-10-30-taller.md) |
| SEG-005 | ⚪ | Sin encabezados de seguridad | arreglado (main f4b15db) | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-006 | ⚪ | Permisos de tabla de más (solo los frena RLS) | verificado (2026-10-30: `anon` no puede leer `payments`, `order_events`, `admins` ni insertar productos ni llamar `is_admin`) | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-007 | ⚪ | Webhook acepta todo si falta la clave secreta | arreglado (main f4b15db) | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-008 | ⚪ | Categoría ajena y fotos de cualquier sitio en platillos | arreglado (main f4b15db) | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-009 | ⚪ | Avisos de dependencias (postcss vía Next) | abierto (sigue igual el 2026-10-30: 1 moderado, 1 alto; el arreglo pide Next 16) | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| UX-003 | ⚪ | Botones "+" y chips de menos de 44 px | arreglado (main f4b15db) | [2026-10-30-probador](2026-10-30-probador.md) |
| UX-004 | ⚪ | "Agotado" se lee poco | verificado (2026-10-30: 13 px, texto oscuro, sin botón "+") | [2026-10-30-probador](2026-10-30-probador.md) |
| SEG-010 | ⚪ | El límite de `/api/pedido` es solo por negocio, no por persona | en arreglo (PR; antes de fusionar correr `supabase/migraciones/2026-10-30-origen-pedidos.sql`) | [2026-10-30-taller](2026-10-30-taller.md) |
| UX-005 | ⚪ | "¿Olvidaste tu contraseña?" no se puede tocar | arreglado (main f4b15db) | [2026-10-30-taller](2026-10-30-taller.md) |
| QA-001 | ⚪ | Se cuenta envío aunque el negocio no tenga envío | arreglado (main f4b15db) | [2026-10-30-taller](2026-10-30-taller.md) |

Siguiente número libre: SEG-011 · UX-007 · QA-002 · DIS-001
