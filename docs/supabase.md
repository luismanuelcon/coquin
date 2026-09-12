# Supabase

## Configuracion

Las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
se configuran en .env.local (excluido de Git) y en el entorno de despliegue.
.env.example contiene los nombres necesarios. Nunca colocar claves secretas
o service_role en variables NEXT_PUBLIC.

## Clientes

- src/lib/supabase/client.ts: cliente del navegador con cookies.
- src/lib/supabase/server.ts: cliente por peticion para Server Components,
  Server Actions y Route Handlers.
- src/proxy.ts: renovacion de sesiones en las rutas actuales. No restringe
  el acceso a las pantallas de demostracion ni implementa autorizacion.

Para comprobar Auth y Data API sin escribir registros:

```sh
pnpm supabase:check
```

## Alcance actual

La conexion esta preparada, pero las pantallas todavia usan sus datos de
ejemplo y el almacenamiento local existente. No se migraron registros ni
se crearon tablas remotas. La clave publicable no permite ejecutar DDL.

Antes de conectar los formularios se necesitan migraciones versionadas para
hogares y membresias, RLS por hogar, autenticacion y operaciones financieras
atomicas e idempotentes. Los saldos deben derivarse de los movimientos y las
compras de mercado deben registrarse una sola vez en el libro de gastos.
Validar permisos con dos usuarios de hogares diferentes antes de cargar
datos reales. Usar getClaims/getUser para verificar identidad en servidor;
no confiar en getSession para autorizar operaciones.
