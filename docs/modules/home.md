# Modulo Inicio

## Proposito

Inicio es el centro diario de COQUIN. Resume lo que requiere atencion inmediata en la casa: citas, pagos, mercado y tareas urgentes.

## Flujo Principal

1. El usuario entra a la app y ve el resumen del dia.
2. La pantalla muestra metricas cortas: citas, pagos pendientes, mercado y tareas urgentes.
3. El usuario revisa la agenda inmediata.
4. El usuario puede saltar a Calendario, Finanzas, Mercado o Tareas desde las acciones rapidas.

## Datos Clave

- `OverviewMetric`: tarjetas de resumen.
- `HouseholdEvent`: eventos y recordatorios del dia.
- `ProjectTask`: tareas que requieren atencion.

## Reglas De Negocio

- Las tareas urgentes son las que tienen estado `Urgente`.
- El total de atencion combina eventos del dia y tareas urgentes.
- Inicio no debe detallar todo; debe orientar rapidamente.

## Pruebas Unitarias

Archivo: `src/lib/modules/home.test.ts`

Valida:

- Lectura de metricas por etiqueta.
- Conteo de eventos del dia.
- Conteo de tareas urgentes.
- Resumen total de elementos que requieren atencion.
