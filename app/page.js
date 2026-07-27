"use client";

import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";

export default function Page() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/resumen")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
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

  return <Dashboard data={data} />;
}
