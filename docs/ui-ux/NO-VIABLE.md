# No viable o no seguro en esta fase

- **Capturas de panel, plan y cocina autenticados:** no se crearon usuarios, negocios, pagos ni pedidos para obtenerlas. Las mejoras se comprobaron por código y TypeScript; hace falta una sesión de prueba aislada si Claude quiere evidencia visual de esas rutas.
- **Fallo de cocina real:** no se simuló un fallo contra la API de producción ni se tocaron pedidos. El estado recuperable se implementó y revisó por código; una prueba con datos ficticios autenticados queda pendiente.
- **Compartir QR:** no existe un evento de servidor para saber que el dueño efectivamente compartió o imprimió el QR. El checklist permite que lo marque y lo conserva localmente, con `try/catch`; medirlo entre dispositivos requeriría una columna o acción nueva.
- **Contraseñas temporales administrativas:** retirar la generación y el envío por WhatsApp de una contraseña desde administración requiere rediseñar el flujo de autenticación. El pedido concreto se dejó en `PEDIDOS-A-CLAUDE.md`; no se cambió esa lógica.
- **Build de producción local:** `npx next build` terminó correctamente el 2026-11-27 tras retirar la dependencia de fuentes remotas exclusivas de la landing. El único diagnóstico local pendiente es la ausencia conocida de tipos de `nodemailer` al ejecutar `npx tsc --noEmit`.
