// Recalcula el consolidado en USD para un TC dado, replicando exactamente las
// fórmulas de la hoja Resumen (D121:D124, E121:E124, F121:F124, I141:I147).
//
// Nota sobre "AP": la planilla tiene dos importes de Aportes Patronales
// distintos que comparten nombre. `apGarantia` (celda E103) es un componente
// más dentro del total de "Garantía retenida" (I143 = E150 = SUM(E142:E149)).
// `apPatronales` (celda I83) es una línea separada, propia, que se resta de
// nuevo en el Pago Neto consolidado (I146 = I141-I142-I143-I144-I145). Verificado
// recalculando a mano contra D124/E124/F124/I142:I147 con TC=39.5.
export function computeConsolidado(tc, pesos, usdPlaza, usdCif) {
  const contratoPesosUsd = pesos.contrato / tc;
  const avancePesosUsd = pesos.avance / tc;

  const contrato = contratoPesosUsd + usdPlaza.contrato + usdCif.contrato;
  const avance = avancePesosUsd + usdPlaza.avance + usdCif.avance;
  const saldo = contrato - avance;

  const acopio = pesos.acopio / tc + usdPlaza.acopio + usdCif.acopio;

  const garantia =
    pesos.garantia / tc + usdPlaza.garantia + usdCif.garantia +
    pesos.apGarantia / tc + pesos.apAdicionales / tc + pesos.ayd / tc +
    usdPlaza.ayd + usdCif.ayd;

  const canje = pesos.canje / tc + usdPlaza.canje + usdCif.canje + pesos.apCanje / tc;

  const ap = pesos.apPatronales / tc;

  const pagoNeto = avance - acopio - garantia - canje - ap;

  return { contrato, avance, saldo, acopio, garantia, canje, ap, pagoNeto };
}

export const fmt = (n, decimals = 0) =>
  n.toLocaleString("es-UY", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const pct = (part, total) => ((part / total) * 100).toFixed(2) + "%";
