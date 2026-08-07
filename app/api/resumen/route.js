import { readExcelBuffer } from "../../../lib/readExcelSource";
import { parseResumen } from "../../../lib/parseResumen";

export async function GET() {
  try {
    const buffer = await readExcelBuffer();
    const data = parseResumen(buffer);
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
