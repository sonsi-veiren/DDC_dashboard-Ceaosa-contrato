import fs from "fs";
import path from "path";
import { head } from "@vercel/blob";

export const BLOB_PATHNAME = "detalle-pagos-ceaosa-actual.xlsx";
const LOCAL_PATH = path.join(process.cwd(), "data", "detalle_pagos_CEAOSA.xlsx");

/**
 * Devuelve el buffer del Excel a usar: prioriza el archivo subido a Vercel
 * Blob (si existe); si no hay ninguno todavía (o Blob no está configurado,
 * ej. en desarrollo local), cae al archivo del repo como fallback.
 */
export async function readExcelBuffer() {
  try {
    const blob = await head(BLOB_PATHNAME);
    const res = await fetch(blob.url);
    if (!res.ok) throw new Error("No se pudo descargar el Excel subido");
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return fs.readFileSync(LOCAL_PATH);
  }
}
