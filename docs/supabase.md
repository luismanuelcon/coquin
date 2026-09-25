# Supabase

## Configuración

`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` están en
`.env.local` (excluido de Git) y deben existir también en el despliegue.
Nunca usar una clave administrativa en variables `NEXT_PUBLIC_*`.

Migraciones, en orden:

1. `supabase/migrations/202609150001_household_data.sql`
2. `supabase/migrations/202609160001_validate_documents.sql`
3. `supabase/migrations/202609210001_family_join_code.sql`
4. `supabase/migrations/202609250001_member_names.sql`

Las dos primeras se aplicaron al proyecto `vyeecoajzdeuxuuczjmf` el 16 de septiembre de 2026.
La segunda función de validación se corrigió y volvió a aplicar durante la prueba.
La tercera añade el código de familia (`join_code`) y las funciones para unirse y rotar.

## Login básico de prueba

La pantalla pide celular y contraseña. El celular se normaliza a formato
internacional; los números colombianos de 10 dígitos reciben el indicativo +57.
Internamente se usa `<numero-sin-signo-mas>@phone.coquin.invalid` con Supabase Auth
email/password. Este identificador no es un correo real ni verifica la propiedad
del número. Las cuentas de prueba se crean confirmadas desde Authentication > Users
o mediante la API administrativa, sin enviar correo.

El registro desde la app requiere que Email esté habilitado, los registros estén
permitidos y **Confirm email** esté desactivado: el identificador interno no puede
recibir correos. La app solo considera el registro activo si Supabase devuelve una
sesión. No se intenta un segundo login después de crear la cuenta.

El formulario permite marcar «Quiero unirme a mi familia con un código». Después
de crear la cuenta, llama a `join_household` con la sesión recién creada. Si falla
el código, permite corregirlo sin crear otra cuenta, o continuar sin código hacia
la configuración del hogar. Sin código se conserva la configuración posterior.

El proveedor Phone permanece deshabilitado: el panel exige credenciales de un
servicio SMS para habilitarlo. Este flujo de prueba no envía SMS y no sirve para
recuperar contraseñas por correo. Antes de abrir registros públicos hay que adoptar
teléfono verificado u otro mecanismo recuperable. Supabase conserva los hashes y
gestiona las sesiones; la aplicación no almacena contraseñas.

## Persistencia y permisos

- `src/proxy.ts` comprueba los claims, renueva cookies y redirige a `/login`.
- `DataProvider` obtiene el usuario y sus documentos; si no tiene hogar, ofrece
  crear uno o unirse con un código de familia.
- `create_household` genera un `join_code` único; `join_household` asocia por
  código como `member`; `rotate_join_code` (solo `admin`) lo renueva sin expulsar
  a los miembros actuales. Ver `docs/registro-familia.md`.
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

## Nombres y responsables de tareas

- El registro guarda `display_name` en los metadatos del usuario de Supabase Auth.
  Las cuentas existentes sin un nombre válido deben completarlo tras autenticarse,
  antes de acceder al hogar. Este dato es de presentación, nunca de autorización.
- `get_household_members()` devuelve únicamente IDs y nombres del hogar del usuario
  autenticado. No expone teléfonos ni correos, ni acepta un hogar arbitrario.
- Tareas selecciona responsables del listado y guarda `ownerId` junto con `owner`
  como nombre histórico. Las tareas antiguas conservan su texto y pueden reasignarse.
  Los nombres duplicados se distinguen con parte del ID; la propia cuenta indica «tú».
- La lista se actualiza al abrir el formulario y con «Actualizar integrantes».
  Los integrantes antiguos sin nombre aparecen cuando lo completen al ingresar.
- La migración 4 rechaza asignaciones nuevas a cuentas de otros hogares y permite
  conservar asignaciones históricas. Debe aplicarse antes de publicar esta versión.
- `supabase/tests/member_names.sql` verifica nombres, aislamiento entre hogares,
  permisos anónimos, asignaciones y compatibilidad. Usa datos sintéticos y `ROLLBACK`.
  La migración 4 y esta prueba SQL están pendientes de ejecución remota.
