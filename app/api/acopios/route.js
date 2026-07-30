import { loadWorkbook, sheet, readNumber, readString, excelDateDMY } from "../../../lib/xlsx";

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

function readPct(ws, addr) {
  const raw = readString(ws, addr, { required: false });
  if (!raw) return null;
  const match = raw.replace(",", ".").match(/([\d.]+)\s*%/);
  return match ? parseFloat(match[1]) / 100 : null;
}

function readAcopioBloque(ws, pesosRow, { conDetalle }) {
  const pesos = readNumber(ws, `E${pesosRow}`, { required: false }) ?? 0;
  const usdPlaza = readNumber(ws, `E${pesosRow + 1}`, { required: false }) ?? 0;
  const usdCif = readNumber(ws, `E${pesosRow + 2}`, { required: false }) ?? 0;
  const pct = readPct(ws, `B${pesosRow}`);
  const fechaRaw = ws[`G${pesosRow}`]?.v;

  const base = {
    pct,
    fecha: fechaRaw != null ? excelDateDMY(fechaRaw) : null,
    pesos,
    usdPlaza,
    usdCif,
  };

  if (!conDetalle) return base;

  return {
    ...base,
    opGp: readString(ws, `K${pesosRow}`, { required: false }),
    acumulado: readNumber(ws, `H${pesosRow}`, { required: false }),
    saldo: readNumber(ws, `I${pesosRow}`, { required: false }),
    desacopioPct: readNumber(ws, `J${pesosRow}`, { required: false }),
  };
}

export async function GET() {
  try {
    const workbook = loadWorkbook();
    const ws = sheet(workbook, "Acopios");

    const totales = {};
    for (const [key, row] of Object.entries(TOTALES_ROWS)) {
      const pagado = readNumber(ws, `R${row}`);
      const desacopiado = readNumber(ws, `V${row}`);
      const saldo = readNumber(ws, `W${row}`);
      totales[key] = { pagado, desacopiado, saldo };
    }

    const etapa1 = [7, 12, 17].map((row, i) => ({
      num: i + 1,
      ...readAcopioBloque(ws, row, { conDetalle: true }),
    }));

    const etapa2 = [58, 63, 68].map((row, i) => ({
      num: i + 1,
      ...readAcopioBloque(ws, row, { conDetalle: false }),
    }));

    return Response.json({ totales, etapa1, etapa2 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
