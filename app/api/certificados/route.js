import { readExcelBuffer } from "../../../lib/readExcelSource";
import { loadWorkbook } from "../../../lib/xlsx";
import { parseCertificados } from "../../../lib/parseCertificados";

export async function GET() {
  try {
    const buffer = await readExcelBuffer();
    const workbook = loadWorkbook(buffer);
    const data = parseCertificados(workbook);
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
