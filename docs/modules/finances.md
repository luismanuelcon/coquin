# Modulo Finanzas

## Proposito

Finanzas controla obligaciones del hogar: pagos recurrentes, impuestos, servicios, presupuesto y recordatorios financieros.

## Flujo Principal

1. El usuario entra a Finanzas.
2. Ve balance mensual y estado del presupuesto.
3. Revisa pagos y obligaciones.
4. Identifica montos pendientes y programados.

## Datos Clave

- `FinanceItem`: obligacion con titulo, monto, estado y vencimiento.

## Reglas De Negocio

- Los montos visibles en COP deben poder convertirse a numero para calculos.
- El estado `Pendiente` representa dinero que requiere accion.
- El total de obligaciones combina pendientes y programadas.

## Pruebas Unitarias

Archivo: `src/lib/modules/finances.test.ts`

Valida:

- Conversion de montos COP a valores numericos.
- Deteccion de pagos pendientes.
- Calculo de obligaciones totales, pendientes y programadas.
