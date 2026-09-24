# Contexto del proyecto

## Estado actual

Se creó un MVP llamado **Club Sellos** con Next.js App Router y Supabase.

- Registro e inicio de sesión por correo y contraseña.
- Tablero de cliente: muestra sellos acumulados, el progreso y una recompensa lista para canjear.
- Panel de negocio: un miembro autorizado puede registrar una compra ingresando el correo del cliente y canjear una recompensa.
- Esquema SQL con tablas, políticas RLS y funciones transaccionales para sumar sellos/canjear sin que el navegador pueda alterar puntos directamente.
- Archivos para despliegue directo mediante GitHub + Vercel.

## Antes del deploy

1. Ejecutar `supabase/schema.sql` en Supabase.
2. Crear `.env.local` desde `.env.example` para probar, y configurar esas variables en Vercel.
3. Configurar Auth URLs en Supabase.
4. Registrar cuentas y ejecutar el bloque de configuración inicial en el SQL, usando sus correos reales.

## Mejoras siguientes sugeridas

- Código QR o código único para canjear en caja.
- Varias recompensas y reglas de puntos por importe/producto.
- Imagen/logo, nombre y colores por negocio.
- Historial visible de compras y canjes.
- Invitación de empleados y gestión de negocios desde una interfaz.
- Confirmación de correo, recuperación de contraseña y métricas.

## Decisiones de simplicidad

Un sello se concede por compra, independientemente del importe. La recompensa es una sola por programa. La autorización sensible vive en funciones de PostgreSQL/Supabase; la app no contiene ninguna clave secreta.
