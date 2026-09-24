# Club Sellos

MVP de un programa de lealtad: cada compra agrega un sello y al llegar a la meta el cliente puede canjear una recompensa.

## Inicio rápido

1. Crea un proyecto en Supabase.
2. En el editor SQL de Supabase ejecuta [`supabase/schema.sql`](./supabase/schema.sql).
3. Copia `.env.example` a `.env.local` y completa las dos variables.
4. En Supabase Auth configura la URL del sitio y las URLs de redirección de Vercel.
5. Ejecuta `npm install` y `npm run dev`.

## Despliegue en Vercel

Sube esta carpeta a un repositorio de GitHub e impórtalo en Vercel. Añade las mismas variables de `.env.local` en **Settings → Environment Variables**. Vercel detectará Next.js automáticamente.

## Primer negocio

Después de registrar la primera cuenta, usa el bloque `CONFIGURACION INICIAL` al final de `schema.sql`, sustituyendo los correos. El miembro con rol `staff` puede registrar compras desde `/negocio`; cualquier cliente ve su tarjeta en `/cliente`.

No expongas nunca una `service_role` key: este proyecto solo necesita la clave pública (anon) en Vercel.
