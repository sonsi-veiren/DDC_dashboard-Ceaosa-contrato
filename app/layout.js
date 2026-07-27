import "./globals.css";

export const metadata = {
  title: "Dashboard de Obra — CEAOSA / LIV",
  description: "Avance y pago del contrato de construcción CEAOSA / LIV",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
