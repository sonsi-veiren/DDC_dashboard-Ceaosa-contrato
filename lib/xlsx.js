import * as XLSX from "xlsx";

// El buffer viene de readExcelSource.readExcelBuffer() — prioriza el Excel
// subido a Vercel Blob y cae al archivo del repo si no hay ninguno todavía.
export function loadWorkbook(buffer) {
  return XLSX.read(buffer, { type: "buffer" });
}

export function sheet(workbook, name) {
  const ws = workbook.Sheets[name];
  if (!ws) throw new Error(`Hoja "${name}" no encontrada en el Excel`);
  return ws;
}

export function readNumber(ws, addr, { required = true } = {}) {
  const cell = ws[addr];
  if (!cell || typeof cell.v !== "number") {
    if (required) throw new Error(`Celda ${addr} no encontrada o no numérica`);
    return null;
  }
  return cell.v;
}

export function readString(ws, addr, { required = true } = {}) {
  const cell = ws[addr];
  if (!cell) {
    if (required) throw new Error(`Celda ${addr} no encontrada`);
    return null;
  }
  return String(cell.v);
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Convierte un serial de fecha de Excel (o un string ya en formato "sept-26") a
// etiqueta corta tipo "dic 24". Si ya es texto no numérico, se devuelve tal cual.
export function excelDateLabel(value) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  const date = XLSX.SSF.parse_date_code(value);
  return `${MESES[date.m - 1]} ${String(date.y).slice(2)}`;
}

// Convierte un serial de fecha de Excel a "DD/MM/AAAA".
export function excelDateDMY(value) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  const date = XLSX.SSF.parse_date_code(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.d)}/${pad(date.m)}/${date.y}`;
}
