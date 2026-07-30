import { loadWorkbook, sheet, readNumber, excelDateLabel } from "../../../lib/xlsx";

// ---------------------------------------------------------------------------
// Celdas de origen de la hoja "Resumen" — ver brief técnico sección 3.1/3.2.
// I83 ("Aportes patronales", usado en I84/I93/I102 y en la fila "Aportes
// patronales" del bloque consolidado I141:I147) y E103 ("AP" dentro del
// bloque Garantía retenida, filas 99-107) son dos importes distintos pese al
// nombre compartido — verificado recalculando a mano D124/E124/F124/I142:I147
// con TC=39.5 y comparando contra los valores cacheados de la planilla real.
// ---------------------------------------------------------------------------
const CELLS = {
  pesos: {
    contrato: "D5",
    avance: "E79",
    acopio: "F88",
    garantia: "E100",
    canje: "E110",
    apPatronales: "I83",
    apGarantia: "E103",
    apAdicionales: "E104",
    ayd: "E105",
    apCanje: "E113",
  },
  usdPlaza: {
    contrato: "D6",
    avance: "E80",
    acopio: "F92",
    garantia: "E101",
    canje: "E111",
    ayd: "E106",
  },
  usdCif: {
    contrato: "D7",
    avance: "E81",
    acopio: "F96",
    garantia: "E102",
    canje: "E112",
    ayd: "E107",
  },
};

function readMoneda(ws, cells) {
  const raw = {};
  for (const [key, addr] of Object.entries(cells)) {
    raw[key] = readNumber(ws, addr);
  }
  const saldo = raw.contrato - raw.avance;
  const pagoNeto =
    raw.avance - raw.acopio - raw.garantia - raw.canje - (raw.apPatronales || 0);
  return { ...raw, saldo, pagoNeto };
}

export async function GET() {
  try {
    const workbook = loadWorkbook();
    const ws = sheet(workbook, "Resumen");

    const pesos = readMoneda(ws, CELLS.pesos);
    const usdPlaza = readMoneda(ws, CELLS.usdPlaza);
    const usdCif = readMoneda(ws, CELLS.usdCif);

    const tcPlanilla = readNumber(ws, "P1");

    // Ajuste Paramétrico — hoja "AP", columnas AL (Mes certificado) / AM (%
    // Ajuste), filas 3 a 19. No usar columna S (tiene huecos por una NC de
    // crédito). Verificado: Z13 ("% Ajuste paramétrico actual") = último
    // valor de la serie AL/AM.
    const apWs = workbook.Sheets["AP"];
    const ajusteParametrico = [];
    if (apWs) {
      for (let r = 3; r <= 19; r++) {
        const mesCell = apWs[`AL${r}`];
        const pctCell = apWs[`AM${r}`];
        if (!mesCell || !pctCell) continue;
        ajusteParametrico.push({
          mes: excelDateLabel(mesCell.v),
          pct: pctCell.v * 100,
        });
      }
    }

    return Response.json({ pesos, usdPlaza, usdCif, tcPlanilla, ajusteParametrico });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
