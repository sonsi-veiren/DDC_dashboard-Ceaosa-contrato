import { sheet, readNumber, excelDateLabel } from "./xlsx";

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
    cols: { n: "B", mes: "C", total: "H", iva: "G", montoPagar: "P", pago: "Q" },
  },
  usdPlaza: {
    name: "Básico USD Plaza",
    rows: [4, 8],
    totalsRow: 10,
    cols: { n: "B", mes: "C", total: "H", iva: "G", montoPagar: "N", pago: "O" },
  },
  usdCif: {
    name: "Básico USD CIF",
    rows: [4, 7],
    totalsRow: 9,
    cols: { n: "B", mes: "C", total: "H", iva: "G", montoPagar: "N", pago: "O" },
  },
};

// Certificado 11 (Pesos) está partido en 2 filas en la hoja: la fila del
// certificado y una fila de ajuste inmediatamente debajo (misma fecha, sin
// "Total con IVA" propio) por la corrección "Desacopio 2 no correspondía en
// certificado anterior" — se pagaron juntos por transferencia. Se fusionan
// en un solo certificado sumando el monto a pagar del ajuste.
function mergeAjustes(list) {
  const merged = [];
  for (const item of list) {
    const prev = merged[merged.length - 1];
    const esAjuste = item.total == null && prev && String(prev.n) === String(item.n);
    if (esAjuste) {
      prev.montoPagar += item.montoPagar;
    } else {
      merged.push(item);
    }
  }
  return merged;
}

function readCertificados(ws, cfg) {
  const [start, end] = cfg.rows;
  const list = [];
  for (let r = start; r <= end; r++) {
    const nCell = ws[`${cfg.cols.n}${r}`];
    if (!nCell) continue;
    const total = readNumber(ws, `${cfg.cols.total}${r}`, { required: false });
    const iva = readNumber(ws, `${cfg.cols.iva}${r}`, { required: false }) ?? 0;
    const rawN = nCell.v;
    const n = typeof rawN === "string" ? rawN : String(rawN);
    list.push({
      n,
      mes: excelDateLabel(ws[`${cfg.cols.mes}${r}`]?.v),
      total,
      subtotal: total != null ? total - iva : null,
      montoPagar: readNumber(ws, `${cfg.cols.montoPagar}${r}`, { required: false }) ?? 0,
    });
  }
  return mergeAjustes(list);
}

function readTotales(ws, cfg, cantidad) {
  const r = cfg.totalsRow;
  const totalConIva = readNumber(ws, `${cfg.cols.total}${r}`);
  const totalIva = readNumber(ws, `${cfg.cols.iva}${r}`);
  return {
    cantidad,
    totalConIva,
    totalSinIva: totalConIva - totalIva,
    totalMontoPagar: readNumber(ws, `${cfg.cols.montoPagar}${r}`),
    totalPagado: readNumber(ws, `${cfg.cols.pago}${r}`),
  };
}

// Parsea las 3 hojas de certificados básicos de un workbook ya leído. Usada
// tanto por /api/certificados como por /api/upload (validación previa a
// guardar en Blob).
export function parseCertificados(workbook) {
  const result = {};

  for (const [key, cfg] of Object.entries(SHEETS)) {
    const ws = sheet(workbook, cfg.name);
    const list = readCertificados(ws, cfg);
    const totales = readTotales(ws, cfg, list.length);
    result[key] = { list, totales };
  }

  return result;
}
