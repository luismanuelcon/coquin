# Proxima etapa: cuentas, hogares y pagos

## Estado actual

Implementado: rediseno mobile-first con degradado salvia/rosado, imagen de
marca e iconos originales, navegacion e integracion base de Supabase.
Las pantallas aun usan datos de ejemplo y almacenamiento local; no hay
login, tablas remotas ni persistencia compartida implementados.

## Direccion acordada

- Una cuenta por persona y un hogar activo por persona inicialmente.
- Login sencillo propuesto: correo y codigo de verificacion, sin password.
- Crear un hogar o unirse mediante enlace de invitacion tras autenticarse.
- Invitaciones con vencimiento y revocacion; confirmar antes de unirse.
- Roles iniciales: administrador e integrante. El administrador gestiona
  miembros, pero no puede ver finanzas personales ajenas.
- Inicio, agenda, mercado y tareas compartidos por todos los miembros.
- Mis finanzas es privado por usuario, protegido por RLS en PostgreSQL.
- Pagos del hogar es una seccion familiar separada de Mis finanzas.
- Salir de un hogar conserva las finanzas personales; el historial
  compartido permanece en el hogar.

## Pagos del hogar

Concepto, monto previsto, moneda, vencimiento, responsable, recordatorio
y estado pendiente/pagado. Registrar quien pago y cuando, aunque sea una
persona distinta del responsable. Es registro de pagos, no transferencia
ni cobro automatico.

Frecuencias: unico, mensual, anual y personalizada (cada 2, 3 o 6 meses).
Ejemplos: arriendo, administracion, servicios, suscripciones, seguro del
carro y SOAT. Admitir montos fijos o variables.

Separar la regla de recurrencia de cada vencimiento generado: cada periodo
es independiente. Un cambio de monto afecta los futuros, no el historial.
Permitir pausar/finalizar una recurrencia sin borrar sus pagos anteriores.
Definir antes de implementar la politica para dias 29/30/31 y 29 de febrero.
Generar vencimientos de forma idempotente y registrar pagos atomicamente.

No dividir deudas ni cargar compras familiares automaticamente a finanzas
personales en la primera version. Evitar duplicar los gastos de mercado.

## Navegacion propuesta

Cinco accesos inferiores: Inicio, Agenda, Mercado, Tareas y Hogar.
Pagos del hogar accesible desde Inicio/Hogar; Mis finanzas desde perfil.
Inicio muestra vencimientos familiares, nunca montos o conceptos privados.

## Orden de implementacion

1. Migraciones versionadas: hogares, miembros e invitaciones; RLS y login.
2. Crear/unirse al hogar y gestion de integrantes.
3. Separar finanzas personales y pagos familiares; recurrencias e historial.
4. Persistir mercado, agenda y tareas con permisos y autoria de cambios.
5. Probar aislamiento entre usuarios/hogares, reintentos y concurrencia.

Pendiente validar: edicion compartida de todos los registros, proveedor de
correo y limites de envio, recordatorios y reglas exactas de recurrencia.
No migrar datos locales existentes sin identificar propietario y hogar.
