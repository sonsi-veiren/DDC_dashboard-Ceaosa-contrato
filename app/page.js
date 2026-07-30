"use client";

import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";

export default function Page() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/resumen").then((res) => res.json()),
      fetch("/api/acopios").then((res) => res.json()),
      fetch("/api/certificados").then((res) => res.json()),
    ])
      .then(([resumen, acopios, certificados]) => {
        const firstError = resumen.error || acopios.error || certificados.error;
        if (firstError) setError(firstError);
        else setData({ resumen, acopios, certificados });
      })
      .catch((err) => setError(err.message));
  }, []);

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

  return <Dashboard resumen={data.resumen} acopios={data.acopios} certificados={data.certificados} />;
}
