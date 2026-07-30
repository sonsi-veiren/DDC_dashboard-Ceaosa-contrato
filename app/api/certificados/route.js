import { loadWorkbook, sheet, readNumber, readString, excelDateLabel, excelDateDMY } from "../../../lib/xlsx";

// ---------------------------------------------------------------------------
// Hojas "Básico $", "Básico USD Plaza", "Básico USD CIF" — ver brief técnico
// sección 5. Cada hoja tiene un layout de columnas ligeramente distinto (la
// hoja en Pesos tiene una columna extra "Aportes patronales por partidas
// exentas" que las otras dos no tienen), verificado celda por celda contra
// el archivo real.
// ---------------------------------------------------------------------------
const SHEETS = {
  pesos: {
    name: "Básico $",
    rows: [4, 23],
    totalsRow: 25,
    cols: { n: "B", mes: "C", total: "H", iva: "G", montoPagar: "P", pago: "Q", fechaPago: "S", nota: "T" },
  },
  usdPlaza: {
    name: "Básico USD Plaza",
    rows: [4, 8],
    totalsRow: 10,
    cols: { n: "B", mes: "C", total: "H", iva: "G", montoPagar: "N", pago: "O", fechaPago: "Q", nota: null },
  },
  usdCif: {
    name: "Básico USD CIF",
    rows: [4, 7],
    totalsRow: 9,
    cols: { n: "B", mes: "C", total: "H", iva: "G", montoPagar: "N", pago: "O", fechaPago: "Q", nota: "S" },
  },
};

function readCertificados(ws, cfg) {
  const [start, end] = cfg.rows;
  const list = [];
  for (let r = start; r <= end; r++) {
    const nCell = ws[`${cfg.cols.n}${r}`];
    if (!nCell) continue;
    const total = readNumber(ws, `${cfg.cols.total}${r}`, { required: false });
    const rawN = nCell.v;
    const n = typeof rawN === "string" ? rawN : total == null ? `${rawN} (ajuste)` : String(rawN);
    list.push({
      n,
      mes: excelDateLabel(ws[`${cfg.cols.mes}${r}`]?.v),
      total,
      montoPagar: readNumber(ws, `${cfg.cols.montoPagar}${r}`, { required: false }),
      pago: readNumber(ws, `${cfg.cols.pago}${r}`, { required: false }),
      fechaPago: cfg.cols.fechaPago ? excelDateDMY(ws[`${cfg.cols.fechaPago}${r}`]?.v) : null,
      nota: cfg.cols.nota ? readString(ws, `${cfg.cols.nota}${r}`, { required: false }) : null,
    });
  }
  return list;
}

function readTotales(ws, cfg) {
  const r = cfg.totalsRow;
  return {
    cantidad: cfg.rows[1] - cfg.rows[0] + 1,
    totalConIva: readNumber(ws, `${cfg.cols.total}${r}`),
    totalMontoPagar: readNumber(ws, `${cfg.cols.montoPagar}${r}`),
    totalPagado: readNumber(ws, `${cfg.cols.pago}${r}`),
    totalIva: readNumber(ws, `${cfg.cols.iva}${r}`),
  };
}

// IVA del contrato = Monto contratado × 22% (fórmula real verificada, ej.
// Básico $: AH3 = AC3*0.22). USD CIF no factura IVA — todos los certificados
// de esa hoja traen IVA = 0, no se calcula IVA de contrato para esa moneda.
function readIva(ws, montoContratado, totalIva, hasIva) {
  if (!hasIva) return null;
  const contrato = montoContratado * 0.22;
  const facturado = totalIva;
  return { contrato, facturado, pendiente: contrato - facturado };
}

export async function GET() {
  try {
    const workbook = loadWorkbook();
    const result = {};

    for (const [key, cfg] of Object.entries(SHEETS)) {
      const ws = sheet(workbook, cfg.name);
      const list = readCertificados(ws, cfg);
      const totales = readTotales(ws, cfg);
      const montoContratado = readNumber(ws, "C1");
      const iva = readIva(ws, montoContratado, totales.totalIva, key !== "usdCif");
      result[key] = { list, totales, iva };
    }

    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
