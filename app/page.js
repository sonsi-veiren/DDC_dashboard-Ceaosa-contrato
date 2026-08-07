"use client";

import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";

export default function Page() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const cargarTodo = () =>
    Promise.all([
      fetch("/api/resumen").then((res) => res.json()),
      fetch("/api/acopios").then((res) => res.json()),
      fetch("/api/certificados").then((res) => res.json()),
    ]).then(([resumen, acopios, certificados]) => {
      const firstError = resumen.error || acopios.error || certificados.error;
      if (firstError) throw new Error(firstError);
      const json = { resumen, acopios, certificados };
      setData(json);
      return json;
    });

  useEffect(() => {
    cargarTodo().catch((err) => setError(err.message));
  }, []);

  async function handleUploadFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Error subiendo el archivo");

      await cargarTodo();
      setUploadStatus({ ok: true, text: "Datos actualizados ✓" });
    } catch (err) {
      setUploadStatus({ ok: false, text: err.message || "Error subiendo el archivo" });
    } finally {
      setUploading(false);
    }
  }

  if (error) {
    return (
      <div style={{ padding: 32, fontFamily: "sans-serif", color: "#dc2626" }}>
        Error al leer el archivo Excel: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 32, fontFamily: "sans-serif", color: "#6b7280" }}>
        Cargando...
      </div>
    );
  }

  return (
    <Dashboard
      resumen={data.resumen}
      acopios={data.acopios}
      certificados={data.certificados}
      uploading={uploading}
      uploadStatus={uploadStatus}
      onUploadFile={handleUploadFile}
    />
  );
}
