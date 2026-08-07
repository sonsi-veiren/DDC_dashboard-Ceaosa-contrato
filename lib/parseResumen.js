import * as XLSX from "xlsx";

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

const UNIDADES_CANJE_CELLS = [
  { unidadCell: "C165", valorCell: "D165" },
  { unidadCell: "C166", valorCell: "D166" },
  { unidadCell: "C167", valorCell: "D167" },
  { unidadCell: "C168", valorCell: "D168" },
];

function readNumber(ws, addr) {
  const cell = ws[addr];
  if (!cell || typeof cell.v !== "number") {
    throw new Error(`Celda ${addr} no encontrada o no numérica en hoja "Resumen"`);
  }
  return cell.v;
}

function readString(ws, addr) {
  const cell = ws[addr];
  if (!cell) throw new Error(`Celda ${addr} no encontrada en hoja "Resumen"`);
  return String(cell.v);
}

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

// Parsea el buffer de un .xlsx con la hoja "Resumen" al shape que consume el
// dashboard. Usada tanto por /api/resumen (para servir los datos) como por
// /api/upload (para validar un Excel nuevo antes de guardarlo en Blob).
export function parseResumen(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheetName = workbook.SheetNames.includes("Resumen")
    ? "Resumen"
    : workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];

  const pesos = readMoneda(ws, CELLS.pesos);
  const usdPlaza = readMoneda(ws, CELLS.usdPlaza);
  const usdCif = readMoneda(ws, CELLS.usdCif);

  const unidadesCanje = UNIDADES_CANJE_CELLS.map(({ unidadCell, valorCell }) => ({
    unidad: readString(ws, unidadCell),
    valor: readNumber(ws, valorCell),
  }));

  const tcPlanilla = readNumber(ws, "P1");

  return { pesos, usdPlaza, usdCif, unidadesCanje, tcPlanilla };
}
