import { put } from "@vercel/blob";
import { BLOB_PATHNAME } from "../../../lib/readExcelSource";
import { parseResumen } from "../../../lib/parseResumen";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return Response.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    parseResumen(buffer);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "No se pudo leer el Excel" },
      { status: 400 }
    );
  }

  try {
    await put(BLOB_PATHNAME, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  } catch (err) {
    return Response.json(
      { error: "No se pudo guardar el archivo (Vercel Blob no está configurado): " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
