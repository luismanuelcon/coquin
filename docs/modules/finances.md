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

## Ingresos del período

- Cada período admite varios ingresos, con concepto libre, valor en COP y nota opcional.
- La sección «Ingresos del período» permite agregar, editar y eliminar cada registro.
- La base se calcula sumando todos los ingresos; el disponible resta los compromisos y gastos varios.
- Los ingresos nuevos o editados requieren concepto y un valor entero positivo y seguro.
- Configurar fechas o corte conserva los ingresos existentes, incluidos registros antiguos llamados «Base».
- Sin ingresos, la base es cero. Los ingresos no se copian automáticamente al siguiente período.
- Se conserva el formato de datos existente; no requiere migración de base de datos.

## Corte y cierre confirmado

- El día de corte es el primer día del siguiente período; el período termina el día anterior.
- Finanzas e Inicio mantienen el período guardado hasta que el usuario confirme su cierre.
- Después del vencimiento, se puede seguir registrando o cerrar y comenzar el siguiente período.
- Los períodos anteriores se conservan y se pueden consultar en el historial.
- El siguiente período reutiliza únicamente obligaciones fijas, como pendientes, sin ingresos ni gastos varios.
- Los cortes 29–31 se ajustan al último día en meses cortos, sin desplazar el corte de los meses siguientes.

## Gastos del período y consumos

Los gastos se identifican como recurrentes u ocasionales. Cada gasto admite consumos con fecha, valor y detalle opcional; pueden editarse o eliminarse desde el desglose. El presupuesto completo está comprometido: consumirlo aumenta lo pagado y reduce la reserva, sin descontarlo dos veces. Si los consumos exceden el presupuesto, el exceso incrementa el compromiso y reduce el disponible.

Los registros sin desglose conservan el estado pagado/pendiente anterior. Al agregar consumos, el estado se calcula a partir del detalle; un gasto que figuraba pagado pide confirmar esta conversión. Los consumos se conservan en Históricos pero se vacían al abrir el siguiente período. Editar el presupuesto conserva los consumos existentes.
