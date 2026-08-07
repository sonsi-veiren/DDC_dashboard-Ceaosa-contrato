import { readExcelBuffer } from "../../../lib/readExcelSource";
import { loadWorkbook } from "../../../lib/xlsx";
import { parseAcopios } from "../../../lib/parseAcopios";

export async function GET() {
  try {
    const buffer = await readExcelBuffer();
    const workbook = loadWorkbook(buffer);
    const data = parseAcopios(workbook);
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
