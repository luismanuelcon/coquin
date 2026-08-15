# Modulo Calendario

## Proposito

Calendario organiza compromisos, citas, eventos familiares, pagos y recordatorios del hogar en una vista temporal.

## Flujo Principal

1. El usuario entra a Calendario.
2. Revisa la semana y el dia activo.
3. Consulta los proximos eventos.
4. Puede filtrar por categoria o registrar un nuevo evento.

## Datos Clave

- `HouseholdEvent`: evento con titulo, hora, descripcion corta y categoria visual.
- `ModuleKey`: tono del evento, usado para distinguir calendario, finanzas, mercado o tareas.

## Reglas De Negocio

- Los eventos pueden agruparse por tono/categoria.
- Las etiquetas compactas deben incluir hora y titulo.
- Los pagos e impuestos tambien pueden aparecer como eventos.

## Pruebas Unitarias

Archivo: `src/lib/modules/calendar.test.ts`

Valida:

- Filtrado de eventos por categoria.
- Conteo de eventos por tono.
- Formato de etiquetas compactas para listas.
