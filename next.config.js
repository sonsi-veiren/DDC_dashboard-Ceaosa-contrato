/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/resumen": ["./data/detalle_pagos_CEAOSA.xlsx"],
    },
  },
};

module.exports = nextConfig;
