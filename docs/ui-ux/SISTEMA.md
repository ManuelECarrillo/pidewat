# Sistema visual compartido

La fuente de verdad es `src/app/globals.css`. La landing solo asigna sus alias visuales a estos tokens, por lo que registro, acceso, recuperación, panel y landing parten del mismo sistema.

## Tokens

| Uso | Token | Valor |
| --- | --- | --- |
| Marca | `--brand` / `--brand-strong` | `#1f8a4c` / `#166b3a` |
| Acento editorial | `--accent` | `#e4572e` |
| Superficies | `--surface-canvas`, `--surface-raised`, `--surface-card` | `#f7f5f2`, `#efe9e1`, `#ffffff` |
| Texto | `--ink`, `--ink-muted`, `--border` | `#1d1b19`, `#6f6a64`, `#e7e2dc` |
| Tipografía | `--font-display`, `--font-body` | Aptos Display/Trebuchet/Segoe UI y Aptos/Segoe UI/system |
| Espacio | `--space-1` a `--space-5` | 4, 8, 12, 16 y 24 px |
| Radios | `--radius-sm`, `--radius-control`, `--radius-card`, `--radius-sheet` | 10, 14, 16 y 20 px |
| Elevación | `--elevation-card`, `--elevation-float` | tarjeta y elemento flotante |
| Interacción | `--control-min`, `--motion-fast` | 44 px, 160 ms |

`--c` conserva compatibilidad y equivale a `--brand` por defecto. Cada menú público recibe su propio `--c` desde el negocio, sin afectar la marca de Pidewat en panel o landing.

## Componentes base

- **Primario:** `.btn.btn-p`; fondo de marca, texto blanco, 44 px o más.
- **Secundario:** `.btn`; superficie blanca, borde de sistema.
- **Campo:** `.i`; 44 px, radio pequeño y foco visible.
- **Tarjeta:** `.card`; superficie, borde, radio de tarjeta y elevación compartidos.
- **Chip/estado:** `.pill`, `.tabs`, `.chips`; cápsulas con estados de éxito, aviso o error.
- **Hoja y aviso:** `.hoja`, `.dialogo`, `.alerta`; radio amplio, elevación y área segura inferior.

Todos los controles conservan foco visible, contraste AA y una zona táctil mínima de 44 px. Las transiciones se desactivan con `prefers-reduced-motion`.
