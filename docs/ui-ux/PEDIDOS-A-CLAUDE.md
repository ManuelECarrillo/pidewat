# Pedidos a Claude

- **UX-012 · Autenticación:** La mejora de errores tempranos en `/entrar` requiere editar `src/app/entrar/FormEntrar.tsx`, zona de autenticación excluida del alcance de Codex. Revisar validación de correo y contraseña en cliente, manteniendo los mensajes de servidor como respaldo.
