# Modulo Mercado

## Proposito

Mercado controla el presupuesto mensual destinado a compras del hogar. No busca detallar cada producto individual, sino registrar compras por fecha, categoria, detalle y valor para entender cuanto se gasto, en que se fue y cuanto queda.

## Flujo Principal

1. El usuario define o consulta el presupuesto mensual, por ejemplo `1.200.000 COP`.
2. Durante el mes registra compras.
3. Cada compra incluye:
   - Fecha.
   - Categoria, por ejemplo Aseo, Carnes, Verduras, Despensa u Otro.
   - Detalle corto.
   - Valor gastado.
4. El sistema suma el gasto acumulado.
5. El sistema resta lo gastado al presupuesto mensual.
6. El usuario ve:
   - Presupuesto total.
   - Gasto acumulado.
   - Saldo restante.
   - Porcentaje usado.
   - Distribucion por categoria.

## Datos Clave

- `MarketBudget`: mes, presupuesto y moneda.
- `MarketPurchase`: compra mensual con fecha, detalle, categoria y valor. Opcionalmente marca una deuda (`owed`, `debtorId`/`debtorName`, `buyerId`/`buyerName`).
- `MarketCategory`: categorias permitidas para clasificar el gasto.
- `MarketState.responsibleId`: integrante que carga el presupuesto de mercado como gasto fijo en sus finanzas.

## Responsable Y Deudas

- En la configuracion del mercado, cuando el hogar tiene 2 o mas integrantes, se puede elegir un `responsable`.
- El presupuesto del mercado aparece como gasto fijo de solo lectura ("Mercado") en las finanzas del responsable. Finanzas es privado por usuario, por eso el cargo se deriva unicamente al abrir las finanzas del responsable; no se escribe en las finanzas de otros.
- Al registrar una compra, cualquier integrante puede marcar "lo pague yo" y elegir quien lo debe. El comprador queda como acreedor y la persona elegida como deudor.
- `summarizeMarketDebts` agrupa las compras marcadas en totales "deudor le debe a acreedor", visibles en el modulo Mercado. Cada compra marcada muestra una etiqueta con el deudor.

## Reglas De Negocio

- El gasto mensual es la suma de todas las compras registradas.
- El restante es `presupuesto - gasto`.
- Si el restante es negativo, el modulo debe mostrar alerta de sobrepresupuesto.
- El desglose por categoria se ordena de mayor a menor gasto.
- La captura debe ser rapida: no se ingresan productos individuales, sino compras agregadas.

## Pruebas Unitarias

Archivo: `src/lib/modules/market.test.ts`

Valida:

- Calculo del presupuesto mensual: gastado, restante, porcentaje y cantidad de compras.
- Agrupacion de compras por categoria.
- Creacion de compras con identificador local deterministico.
