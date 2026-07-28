"use client";

import { useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  DollarSign, ArrowLeftRight, TrendingUp, TrendingDown,
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
  violet: "#7c3aed",
};

const CARD_SHADOW = "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 6px rgba(15, 23, 42, 0.03)";

function ConceptCard({ icon: Icon, title, field, valueColor, totalConsolidado, tc, monedas }) {
  return (
    <div style={{
      background: COLOR.card, borderRadius: 14, padding: "18px 20px",
      border: `1px solid ${COLOR.border}`, boxShadow: CARD_SHADOW, flex: 1, minWidth: 250,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 7, fontSize: 12,
        color: COLOR.label, fontWeight: 700, letterSpacing: 0.3,
        textTransform: "uppercase", marginBottom: 14,
      }}>
        <Icon size={15} strokeWidth={2.25} />
        {title}
      </div>
      {Object.values(monedas).map((m) => (
        <div key={m.label} style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13.5,
          padding: "7px 0", borderBottom: `1px solid ${COLOR.border}`,
        }}>
          <span style={{ color: COLOR.label }}>{m.label}</span>
          <span style={{ fontWeight: 600, color: COLOR.text, fontVariantNumeric: "tabular-nums" }}>{fmt(m[field], 2)}</span>
        </div>
      ))}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13,
        padding: "12px 0 0", marginTop: 4,
      }}>
        <span style={{ color: COLOR.label, fontWeight: 600 }}>Total (TC {tc})</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: valueColor || COLOR.text, fontVariantNumeric: "tabular-nums" }}>
          USD {fmt(totalConsolidado, 0)}
        </span>
      </div>
    </div>
  );
}

function AvanceGauge({ label, avance, saldo, total, accent = COLOR.green }) {
  const pctAvance = (avance / total) * 100;
  const data = [
    { name: "Avance", value: avance, color: accent },
    { name: "Saldo", value: saldo, color: "#e2e5ea" },
  ];
  return (
    <div style={{
      background: COLOR.card, borderRadius: 14, padding: "20px 18px 18px", flex: 1, minWidth: 230,
      border: `1px solid ${COLOR.border}`, boxShadow: CARD_SHADOW, textAlign: "center",
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLOR.text, marginBottom: 2 }}>{label}</div>
      <div style={{ position: "relative" }}>
        <ResponsiveContainer width="100%" height={176}>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={82}
              startAngle={90} endAngle={-270} stroke="none" cornerRadius={6}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={(v) => `USD ${fmt(v, 0)}`} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1 }}>
            {pctAvance.toFixed(1)}%
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 0.5,
            textTransform: "uppercase", marginTop: 4,
          }}>
            Avance
          </div>
        </div>
      </div>
      <div style={{
        display: "flex", justifyContent: "center", gap: 24, marginTop: 6,
        paddingTop: 12, borderTop: `1px solid ${COLOR.border}`,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: accent, display: "inline-block" }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: COLOR.label, textTransform: "uppercase", letterSpacing: 0.3 }}>
              Avance
            </span>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: COLOR.text, marginTop: 2, textAlign: "center" }}>
            {fmt(avance, 0)}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "#9ca3af", display: "inline-block" }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: COLOR.label, textTransform: "uppercase", letterSpacing: 0.3 }}>
              Saldo
            </span>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: COLOR.text, marginTop: 2, textAlign: "center" }}>
            {fmt(saldo, 0)}
          </div>
        </div>
      </div>
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
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: COLOR.text, margin: 0, letterSpacing: -0.4 }}>
              Dashboard de Obra
            </h1>
            <div style={{ fontSize: 14, color: COLOR.label, marginTop: 6 }}>
              CEAOSA / LIV · Hoja &quot;Resumen&quot; · U$S / UYU
            </div>
          </div>
          <div style={{
            background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: 10,
            boxShadow: CARD_SHADOW, padding: "8px 16px", textAlign: "center",
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
          <ConceptCard icon={ArrowLeftRight} title="Pago neto efectivo" field="pagoNeto" valueColor={COLOR.violet} totalConsolidado={consolidado.pagoNeto} tc={tc} monedas={monedas} />
        </div>

        {/* 4 gráficas de avance: total consolidado + las 3 monedas */}
        <div style={{ fontSize: 17, fontWeight: 700, color: COLOR.text, margin: "6px 0 14px" }}>
          Avance de obra
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 26, flexWrap: "wrap" }}>
          {avanceObra.map((a) => (
            <AvanceGauge key={a.label} label={a.label} avance={a.avance} saldo={a.saldo} total={a.total}
              accent={a.label === "Obra total (consolidado)" ? COLOR.blue : COLOR.green} />
          ))}
        </div>

        {/* Composición del pago + tabla de unidades */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            background: COLOR.card, borderRadius: 14, padding: 22, flex: "1 1 560px",
            border: `1px solid ${COLOR.border}`, boxShadow: CARD_SHADOW,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLOR.text, marginBottom: 2 }}>
              Composición del pago y saldo
            </div>
            <div style={{ fontSize: 13, color: COLOR.label, marginBottom: 14 }}>
              Consolidado, % del contrato · TC {tc}
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie data={composicion} dataKey="value" nameKey="name" cx="42%" cy="50%"
                  innerRadius={78} outerRadius={135} paddingAngle={2}>
                  {composicion.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `USD ${fmt(v, 0)} (${pct(v, consolidado.contrato)})`} />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={14}
                  wrapperStyle={{ fontSize: 16, lineHeight: "34px", fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: COLOR.card, borderRadius: 14, padding: 22, flex: "1 1 300px",
            border: `1px solid ${COLOR.border}`, boxShadow: CARD_SHADOW,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLOR.text, marginBottom: 14 }}>
              Unidades entregadas en canje (Etapa 1 y 2)
            </div>
            {unidadesCanje.map((u) => (
              <div key={u.unidad} style={{
                display: "flex", justifyContent: "space-between", fontSize: 13,
                padding: "8px 0", borderBottom: `1px solid ${COLOR.border}`,
              }}>
                <span style={{ color: COLOR.label }}>{u.unidad}</span>
                <span style={{ fontWeight: 600, color: COLOR.text }}>USD {fmt(u.valor, 0)}</span>
              </div>
            ))}
            <div style={{
              display: "flex", justifyContent: "space-between", fontSize: 13.5,
              padding: "10px 0 0", marginTop: 4, fontWeight: 700, color: COLOR.text,
            }}>
              <span>Total</span>
              <span>USD {fmt(unidadesCanje.reduce((s, u) => s + u.valor, 0), 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
