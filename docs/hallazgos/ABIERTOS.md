# Hallazgos abiertos

Lista viva que leen todos los agentes (ver `docs/agentes/README.md`). Orden: gravedad, luego número.

| ID | Gravedad | Qué | Estado | Reporte |
|---|---|---|---|---|
| SEG-001 | 🟡 | Cualquiera puede inflar los pedidos de un negocio (`/api/pedido`) | abierto | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-002 | 🟡 | Apagar registro libre y prender protección de contraseñas filtradas en Supabase | arreglado (Eduardo lo apagó el 2026-10-30; falta verificar con `/auth/v1/settings`) | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-003 | 🟡 | El público ve plan, prueba y pagado hasta de todos los negocios | abierto | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-004 | 🟡 | Contraseña por WhatsApp sin poder cambiarla | abierto | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| UX-001 | 🟡 | Barra de categorías se desliza de lado | abierto | [2026-10-30-probador](2026-10-30-probador.md) |
| UX-002 | 🟡 | Botón "Pedir por WhatsApp" escondido en la hoja del pedido | abierto | [2026-10-30-probador](2026-10-30-probador.md) |
| SEG-005 | ⚪ | Sin encabezados de seguridad | abierto | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-006 | ⚪ | Permisos de tabla de más (solo los frena RLS) | abierto | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-007 | ⚪ | Webhook acepta todo si falta la clave secreta | abierto | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-008 | ⚪ | Categoría ajena y fotos de cualquier sitio en platillos | abierto | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| SEG-009 | ⚪ | Avisos de dependencias (postcss vía Next) | abierto | [2026-10-30-seguridad](2026-10-30-seguridad.md) |
| UX-003 | ⚪ | Botones "+" y chips de menos de 44 px | abierto | [2026-10-30-probador](2026-10-30-probador.md) |
| UX-004 | ⚪ | "Agotado" se lee poco | abierto | [2026-10-30-probador](2026-10-30-probador.md) |

Siguiente número libre: SEG-010 · UX-005 · QA-001 · DIS-001
