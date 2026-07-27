"use client";

import { useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label,
} from "recharts";
import {
  DollarSign, ArrowLeftRight, TrendingUp, TrendingDown, BarChart3, Layers,
} from "lucide-react";
import { computeConsolidado, fmt, pct } from "../lib/compute";

const TC_DEFAULT = 42;

const COLOR = {
  bg: "#f4f5f7",
  card: "#ffffff",
  border: "#eef0f3",
  text: "#111827",
  label: "#6b7280",
  blue: "#2563eb",
  green: "#16a34a",
  red: "#dc2626",
};

function ConceptCard({ icon: Icon, title, field, valueColor, totalConsolidado, tc, monedas }) {
  return (
    <div style={{
      background: COLOR.card, borderRadius: 12, padding: "18px 20px",
      border: `1px solid ${COLOR.border}`, flex: 1, minWidth: 250,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, fontSize: 11.5,
        color: COLOR.label, fontWeight: 700, letterSpacing: 0.4,
        textTransform: "uppercase", marginBottom: 12,
      }}>
        <Icon size={14} strokeWidth={2.25} />
        {title}
      </div>
      {Object.values(monedas).map((m) => (
        <div key={m.label} style={{
          display: "flex", justifyContent: "space-between", fontSize: 13,
          padding: "6px 0", borderBottom: `1px solid ${COLOR.border}`,
        }}>
          <span style={{ color: COLOR.label }}>{m.label}</span>
          <span style={{ fontWeight: 600, color: COLOR.text }}>{fmt(m[field], 2)}</span>
        </div>
      ))}
      <div style={{
        display: "flex", justifyContent: "space-between", fontSize: 13.5,
        padding: "9px 0 0", marginTop: 4, fontWeight: 700, color: valueColor || COLOR.text,
      }}>
        <span>Total (USD, TC {tc})</span>
        <span>u$s {fmt(totalConsolidado, 0)}</span>
      </div>
    </div>
  );
}

function AvanceGauge({ label, avance, saldo, total }) {
  const pctAvance = (avance / total) * 100;
  const data = [
    { name: "Avance", value: avance, color: COLOR.green },
    { name: "Saldo", value: saldo, color: "#e5e7eb" },
  ];
  return (
    <div style={{
      background: COLOR.card, borderRadius: 12, padding: "16px 14px", flex: 1, minWidth: 220,
      border: `1px solid ${COLOR.border}`, textAlign: "center",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: COLOR.text, marginBottom: 4 }}>{label}</div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={68}
            startAngle={90} endAngle={-270} stroke="none">
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            <Label value={`${pctAvance.toFixed(1)}%`} position="center"
              style={{ fontSize: 20, fontWeight: 700, fill: COLOR.text }} />
          </Pie>
          <Tooltip formatter={(v) => `u$s ${fmt(v, 0)}`} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 11.5, color: COLOR.label, marginTop: -8 }}>avance del contrato</div>
    </div>
  );
}

export default function Dashboard({ data }) {
  const [tcInput, setTcInput] = useState(String(TC_DEFAULT));
  const tc = Math.max(0.0001, parseFloat(tcInput) || TC_DEFAULT);

  const { pesos, usdPlaza, usdCif, unidadesCanje } = data;

  const monedas = useMemo(() => ({
    pesos: { label: "Pesos", ...pesos },
    usdPlaza: { label: "USD Plaza", ...usdPlaza },
    usdCif: { label: "USD CIF", ...usdCif },
  }), [pesos, usdPlaza, usdCif]);

  const consolidado = useMemo(
    () => computeConsolidado(tc, pesos, usdPlaza, usdCif),
    [tc, pesos, usdPlaza, usdCif]
  );

  const composicion = [
    { name: "Pago neto", value: consolidado.pagoNeto, color: COLOR.green },
    { name: "Garantía retenida", value: consolidado.garantia, color: COLOR.blue },
    { name: "Canje unidades", value: consolidado.canje, color: "#7c3aed" },
    { name: "Acopio", value: consolidado.acopio, color: "#d97706" },
    { name: "Aportes patronales", value: consolidado.ap, color: "#78716c" },
    { name: "Saldo pendiente", value: consolidado.saldo, color: COLOR.red },
  ];

  const avanceObra = [
    { label: "Obra total (consolidado)", avance: consolidado.avance, saldo: consolidado.saldo, total: consolidado.contrato },
    { label: "Pesos", avance: pesos.avance, saldo: pesos.saldo, total: pesos.contrato },
    { label: "USD Plaza", avance: usdPlaza.avance, saldo: usdPlaza.saldo, total: usdPlaza.contrato },
    { label: "USD CIF", avance: usdCif.avance, saldo: usdCif.saldo, total: usdCif.contrato },
  ];

  return (
    <div style={{
      background: COLOR.bg, minHeight: "100vh", padding: "32px 28px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: COLOR.text, margin: 0, letterSpacing: -0.3 }}>
              Dashboard de Obra
            </h1>
            <div style={{ fontSize: 13.5, color: COLOR.label, marginTop: 4 }}>
              CEAOSA / LIV · Hoja &quot;Resumen&quot; · U$S / UYU
            </div>
          </div>
          <div style={{
            background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: 10,
            padding: "8px 16px", textAlign: "center",
          }}>
            <label style={{
              display: "block", fontSize: 11, color: COLOR.label, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4,
            }}>
              TC Referencia
            </label>
            <input
              type="number"
              step="0.01"
              value={tcInput}
              onChange={(e) => setTcInput(e.target.value)}
              style={{
                width: 72, fontSize: 18, fontWeight: 700, color: COLOR.blue,
                border: "none", outline: "none", background: "transparent",
                textAlign: "center", padding: 0,
              }}
            />
          </div>
        </div>

        {/* 4 conceptos, cada uno con las 3 monedas */}
        <div style={{ display: "flex", gap: 16, marginBottom: 26, flexWrap: "wrap" }}>
          <ConceptCard icon={DollarSign} title="Contrato" field="contrato" valueColor={COLOR.blue} totalConsolidado={consolidado.contrato} tc={tc} monedas={monedas} />
          <ConceptCard icon={TrendingUp} title="Avance" field="avance" valueColor={COLOR.green} totalConsolidado={consolidado.avance} tc={tc} monedas={monedas} />
          <ConceptCard icon={TrendingDown} title="Saldo" field="saldo" valueColor={COLOR.red} totalConsolidado={consolidado.saldo} tc={tc} monedas={monedas} />
          <ConceptCard icon={ArrowLeftRight} title="Pago neto efectivo" field="pagoNeto" valueColor={COLOR.green} totalConsolidado={consolidado.pagoNeto} tc={tc} monedas={monedas} />
        </div>

        {/* 4 gráficas de avance: total consolidado + las 3 monedas */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700,
          color: COLOR.text, margin: "4px 0 12px",
        }}>
          <BarChart3 size={16} strokeWidth={2.25} />
          Avance de obra
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 26, flexWrap: "wrap" }}>
          {avanceObra.map((a) => (
            <AvanceGauge key={a.label} label={a.label} avance={a.avance} saldo={a.saldo} total={a.total} />
          ))}
        </div>

        {/* Composición del pago + tabla de unidades */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            background: COLOR.card, borderRadius: 12, padding: 20, flex: "1 1 480px",
            border: `1px solid ${COLOR.border}`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700,
              color: COLOR.text, marginBottom: 12,
            }}>
              <Layers size={16} strokeWidth={2.25} />
              Composición del pago y saldo (consolidado, % del contrato · TC {tc})
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={composicion} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {composicion.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `u$s ${fmt(v, 0)} (${pct(v, consolidado.contrato)})`} />
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: COLOR.card, borderRadius: 12, padding: 20, flex: "1 1 300px",
            border: `1px solid ${COLOR.border}`,
          }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: COLOR.text, marginBottom: 12 }}>
              Unidades entregadas en canje (Etapa 1 y 2)
            </div>
            {unidadesCanje.map((u) => (
              <div key={u.unidad} style={{
                display: "flex", justifyContent: "space-between", fontSize: 13,
                padding: "8px 0", borderBottom: `1px solid ${COLOR.border}`,
              }}>
                <span style={{ color: COLOR.label }}>{u.unidad}</span>
                <span style={{ fontWeight: 600, color: COLOR.text }}>u$s {fmt(u.valor, 0)}</span>
              </div>
            ))}
            <div style={{
              display: "flex", justifyContent: "space-between", fontSize: 13.5,
              padding: "10px 0 0", marginTop: 4, fontWeight: 700, color: COLOR.text,
            }}>
              <span>Total</span>
              <span>u$s {fmt(unidadesCanje.reduce((s, u) => s + u.valor, 0), 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
