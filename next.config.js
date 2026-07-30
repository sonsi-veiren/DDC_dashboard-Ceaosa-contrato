/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/resumen": ["./data/detalle_pagos_CEAOSA.xlsx"],
      "/api/acopios": ["./data/detalle_pagos_CEAOSA.xlsx"],
      "/api/certificados": ["./data/detalle_pagos_CEAOSA.xlsx"],
    },
  },
};

module.exports = nextConfig;
