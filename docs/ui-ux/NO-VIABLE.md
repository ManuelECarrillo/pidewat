# No viable o no seguro en esta fase

- **UX-012 (errores tempranos en entrar):** no fue seguro modificar `src/app/entrar/FormEntrar.tsx`, porque autenticación está fuera del alcance autorizado. El trabajo solicitado a Claude está en `PEDIDOS-A-CLAUDE.md`.
- **Capturas de panel, plan y cocina autenticados:** no se crearon usuarios, negocios, pagos ni pedidos para obtenerlas. Las mejoras se comprobaron por código y TypeScript; hace falta una sesión de prueba aislada si Claude quiere evidencia visual de esas rutas.
- **Fallo de cocina real:** no se simuló un fallo contra la API de producción ni se tocaron pedidos. El estado recuperable se implementó y revisó por código; una prueba con datos ficticios autenticados queda pendiente.
- **Build de producción local:** `npx next build` alcanza las fuentes de Google y falla con `EACCES` al obtener Bricolage Grotesque e Inter en este sandbox. No se alteraron fuentes ni la configuración de producción; las capturas posteriores se hicieron con `next dev` sobre `/demo`.
