# Modulo Tareas

## Proposito

Tareas organiza responsabilidades, pendientes, mantenimiento y proyectos del hogar.

## Flujo Principal

1. El usuario entra a Tareas.
2. Ve un proyecto activo o grupo de responsabilidades.
3. Consulta pendientes por responsable, estado y fecha.
4. Identifica tareas urgentes o en progreso.

## Datos Clave

- `ProjectTask`: tarea con titulo, responsable, estado y vencimiento.

## Reglas De Negocio

- Las tareas pueden agruparse por estado.
- Las tareas pueden filtrarse por responsable.
- El progreso de proyectos se calcula como `completadas / total`.

## Pruebas Unitarias

Archivo: `src/lib/modules/tasks.test.ts`

Valida:

- Conteo de tareas por estado.
- Filtrado por responsable.
- Calculo de progreso de proyecto.
