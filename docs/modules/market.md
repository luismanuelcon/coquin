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
- `MarketPurchase`: compra mensual con fecha, detalle, categoria y valor.
- `MarketCategory`: categorias permitidas para clasificar el gasto.

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
