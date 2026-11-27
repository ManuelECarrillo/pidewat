# Prueba de punta a punta del registro (vista previa)

Se corre en la vista previa de `landing-comercial`, contra la base real de Pidewat,
con cuentas y negocios ficticios que se borran al terminar. No se usa ningún negocio real.

Nombres de prueba: correo `pidewat.soporte+e2e<N>@gmail.com`, negocio `Prueba E2E <N>` (slug `prueba-e2e-<n>`).

1. Crear cuenta en /empezar (Esencial, 14 días).
2. Llega el correo de confirmación; el enlace abre /panel/menu?bienvenida=1.
3. Panel visible; agregar 3 productos.
4. Cerrar sesión y volver a entrar.
5. /recuperar: llega el correo, /nueva-clave guarda la clave, entra con la nueva.
6. Fin de prueba simulado (vence_en en el pasado, solo en el negocio ficticio): el panel pide suscripción.
7. Solicitar suscripción (transferencia; Mercado Pago no está configurado).
8. Aislamiento: la cuenta A no ve ni edita menú/pedidos de la cuenta B (RLS).
9. Antirrobot: honeypot, envío en menos de 2.5 s y límite por IP rechazan.

Limpieza: borrar negocios `prueba-e2e-*`, sus productos, solicitudes, eventos y usuarios de Auth.
