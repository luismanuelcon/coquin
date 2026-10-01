# Períodos de Mercado

Mercado mantiene presupuesto y compras del período abierto, con un día de corte independiente de Finanzas (1 por defecto). La configuración permite cambiar el corte y recalcula el fin del período abierto desde su inicio.

Al vencer el período se muestra un aviso. Seguir registrando mantiene el período abierto, incluso después del corte. Cerrar requiere confirmación, archiva presupuesto y compras y abre el siguiente período con el mismo presupuesto y sin compras. Si pasaron varios meses, se cierra un período a la vez. Las compras se asignan al período abierto, no se trasladan automáticamente por su fecha.

El historial es consultable y no editable. Los documentos antiguos conservan todas sus compras; su primer período se infiere desde el mes de la compra más antigua. Los documentos nuevos guardan las fechas al crearse. No se eliminan compras al migrar.

Pruebas: `src/lib/modules/period-close.test.ts`.

La opción «Históricos» del menú del usuario (`/history`) reúne resúmenes de Mercado y Finanzas, con detalles expandibles, promedio por período y comparación de los dos últimos cierres. Los períodos abiertos no se incluyen.
