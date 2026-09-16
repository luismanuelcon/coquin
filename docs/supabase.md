# Supabase

## Configuración

`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` están en
`.env.local` (excluido de Git) y deben existir también en el despliegue.
Nunca usar una clave administrativa en variables `NEXT_PUBLIC_*`.

Migraciones, en orden:

1. `supabase/migrations/202609150001_household_data.sql`
2. `supabase/migrations/202609160001_validate_documents.sql`

Ambas se aplicaron al proyecto `vyeecoajzdeuxuuczjmf` el 16 de septiembre de 2026.
La segunda función de validación se corrigió y volvió a aplicar durante la prueba.

## Login básico de prueba

La pantalla pide celular y contraseña. El celular se normaliza a formato
internacional; los números colombianos de 10 dígitos reciben el indicativo +57.
Internamente se usa `<numero-sin-signo-mas>@phone.coquin.invalid` con Supabase Auth
email/password. Este identificador no es un correo real ni verifica la propiedad
del número. Las cuentas de prueba se crean confirmadas desde Authentication > Users
o mediante la API administrativa, sin enviar correo.

El proveedor Phone permanece deshabilitado: el panel exige credenciales de un
servicio SMS para habilitarlo. Este flujo de prueba no envía SMS y no sirve para
recuperar contraseñas por correo. Antes de abrir registros públicos hay que adoptar
teléfono verificado u otro mecanismo recuperable. Supabase conserva los hashes y
gestiona las sesiones; la aplicación no almacena contraseñas.

## Persistencia y permisos

- `src/proxy.ts` comprueba los claims, renueva cookies y redirige a `/login`.
- `DataProvider` obtiene el usuario y sus documentos; el primer acceso crea un hogar.
- Agenda, tareas y mercado pertenecen al hogar; finanzas pertenece al usuario.
- Las tablas tienen RLS. Los clientes no pueden escribir directamente.
- `create_household` y `save_module` derivan usuario y hogar de `auth.uid()`.
- Cada módulo es un documento JSON versionado. Cada guardado es una transacción
  atómica; las versiones evitan sobrescribir cambios de otra sesión y el ID de
  operación admite reintentos idempotentes de la misma petición.
- El servidor comprueba estructura, IDs duplicados, fechas, estados e importes.
- El formulario se conserva ante un error. Un conflicto solicita recargar antes de
  reintentar. No hay suscripción en tiempo real: se leen cambios ajenos al recargar.
- Mercado y finanzas se guardan por separado; no se contabiliza automáticamente
  una compra compartida dentro de las finanzas privadas.
- Los datos antiguos de `localStorage` no se importan automáticamente.

## Verificación

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm supabase:check
```

`supabase:check` verifica conectividad y bloqueo anónimo, no escrituras.
Ejecutar `supabase/tests/transactional_crud.sql` como postgres en el SQL Editor para
probar CRUD, versiones, reintentos, validación y RLS con dos usuarios temporales.
La prueba completa finaliza con `ROLLBACK`: no deja usuarios, hogares ni documentos.
El resultado remoto fue PASS el 16 de septiembre de 2026.
