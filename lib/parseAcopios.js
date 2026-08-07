import { sheet, readNumber } from "./xlsx";

// ---------------------------------------------------------------------------
// Hoja "Acopios" — ver brief técnico sección 4.
//
// Nota sobre la celda del "Total desacopiado" monetario: el brief (sección
// 4.1) lo ubica en X7:X9, pero en el archivo real esas celdas contienen el
// % de desacopio (para los gráficos circulares de la sección 4.2), no el
// monto. El monto real está en V7:V9 (columna "Total desacopiado", separada
// de la columna % que también se llama "Total desacopiado" dos posiciones
// a la derecha). Verificado: V7/V8/V9 coinciden exactamente con "Acopio
// utilizado" de la hoja Resumen (F88/F92/F96), tal como indica el brief.
// ---------------------------------------------------------------------------
const TOTALES_ROWS = { pesos: 7, usdPlaza: 8, usdCif: 9 };

// Parsea la hoja "Acopios" de un workbook ya leído. Usada tanto por
// /api/acopios como por /api/upload (validación previa a guardar en Blob).
export function parseAcopios(workbook) {
  const ws = sheet(workbook, "Acopios");

  const totales = {};
  for (const [key, row] of Object.entries(TOTALES_ROWS)) {
    const pagado = readNumber(ws, `R${row}`);
    const desacopiado = readNumber(ws, `V${row}`);
    const saldo = readNumber(ws, `W${row}`);
    totales[key] = { pagado, desacopiado, saldo };
  }

  return { totales };
}
