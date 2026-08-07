"use client";

import { useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ComposedChart, Bar,
} from "recharts";
import {
  DollarSign, ArrowLeftRight, TrendingUp, TrendingDown, BarChart3,
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

const CERT_LABELS = { pesos: "Pesos", usdPlaza: "USD Plaza", usdCif: "USD CIF" };

function buildCertChart(list) {
  let acum = 0;
  return list.map((c) => {
    acum += c.montoPagar;
    return { n: c.n, montoPagar: c.montoPagar, acumulado: acum };
  });
}

function StatCard({ icon: Icon, label, value, valueColor, sub }) {
  return (
    <div style={{
      background: COLOR.card, borderRadius: 14, padding: "18px 20px",
      border: `1px solid ${COLOR.border}`, boxShadow: CARD_SHADOW, flex: 1, minWidth: 200,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, fontSize: 11.5,
        color: COLOR.label, fontWeight: 700, letterSpacing: 0.4,
        textTransform: "uppercase", marginBottom: 10,
      }}>
        <Icon size={14} strokeWidth={2.25} />
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: valueColor || COLOR.text }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: COLOR.label, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ConceptCard({ icon: Icon, title, field, valueColor, totalConsolidado, monedas, customRows }) {
  const rows = customRows
    ? [
        { label: "Pesos", value: customRows.pesos },
        { label: "USD Plaza", value: customRows.usdPlaza },
        { label: "USD CIF", value: customRows.usdCif },
      ]
    : Object.values(monedas).map((m) => ({ label: m.label, value: m[field] }));
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
      {rows.map((r) => (
        <div key={r.label} style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13.5,
          padding: "7px 0", borderBottom: `1px solid ${COLOR.border}`,
        }}>
          <span style={{ color: COLOR.label }}>{r.label}</span>
          <span style={{ fontWeight: 600, color: COLOR.text, fontVariantNumeric: "tabular-nums" }}>{fmt(r.value, 2)}</span>
        </div>
      ))}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13,
        padding: "12px 0 0", marginTop: 4,
      }}>
        <span style={{ color: COLOR.label, fontWeight: 600 }}>Total</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: valueColor || COLOR.text, fontVariantNumeric: "tabular-nums" }}>
          USD {fmt(totalConsolidado, 0)}
        </span>
      </div>
    </div>
  );
}

function AvanceGauge({ label, avance, saldo, total, accent = COLOR.green, avanceLabel = "Avance", pctLabel = "Avance" }) {
  const pctAvance = (avance / total) * 100;
  const data = [
    { name: avanceLabel, value: avance, color: accent },
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
            {pctLabel}
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
              {avanceLabel}
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

function ComposicionTooltip({ active, payload, total }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: d.color, color: "#fff", borderRadius: 16, padding: "10px 16px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)", fontSize: 13, fontWeight: 600,
      border: "none",
    }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.3 }}>
        {d.name}
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>
        USD {fmt(d.value, 0)}
      </div>
      <div style={{ fontSize: 12, opacity: 0.9 }}>
        {pct(d.value, total)} del contrato
      </div>
    </div>
  );
}

export default function Dashboard({ resumen, acopios, certificados, uploading, uploadStatus, onUploadFile }) {
  const [tcInput, setTcInput] = useState(String(TC_DEFAULT));
  const tc = Math.max(0.0001, parseFloat(tcInput) || TC_DEFAULT);
  const [tab, setTab] = useState("general");
  const [certMoneda, setCertMoneda] = useState("pesos");

  const { pesos, usdPlaza, usdCif, ajusteParametrico } = resumen;

  const monedas = useMemo(() => ({
    pesos: { label: "Pesos", ...pesos },
    usdPlaza: { label: "USD Plaza", ...usdPlaza },
    usdCif: { label: "USD CIF", ...usdCif },
  }), [pesos, usdPlaza, usdCif]);

  const consolidado = useMemo(
    () => computeConsolidado(tc, pesos, usdPlaza, usdCif),
    [tc, pesos, usdPlaza, usdCif]
  );

  const ajusteActual = ajusteParametrico.length
    ? ajusteParametrico[ajusteParametrico.length - 1].pct
    : null;

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

  const acopioTotales = acopios.totales;
  const desacopioPorMoneda = [
    { label: "Pesos", desacopiado: acopioTotales.pesos.desacopiado, saldo: acopioTotales.pesos.saldo, total: acopioTotales.pesos.pagado },
    { label: "USD Plaza", desacopiado: acopioTotales.usdPlaza.desacopiado, saldo: acopioTotales.usdPlaza.saldo, total: acopioTotales.usdPlaza.pagado },
    { label: "USD CIF", desacopiado: acopioTotales.usdCif.desacopiado, saldo: acopioTotales.usdCif.saldo, total: acopioTotales.usdCif.pagado },
  ];

  const certSel = certificados[certMoneda];
  const certChartData = useMemo(() => buildCertChart(certSel.list), [certSel]);

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
          <div style={{ display: "flex", gap: 10 }}>
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
            <label style={{
              background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: 10,
              boxShadow: CARD_SHADOW, padding: "8px 16px", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              minWidth: 150, cursor: uploading ? "default" : "pointer",
            }}>
              <span style={{
                display: "block", fontSize: 11, color: COLOR.label, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4,
              }}>
                {uploading ? "Subiendo…" : "Subir Excel actualizado"}
              </span>
              <input
                type="file"
                accept=".xlsx"
                onChange={onUploadFile}
                disabled={uploading}
                style={{ display: "none" }}
              />
              {uploadStatus && (
                <span style={{ fontSize: 11, fontWeight: 600, color: uploadStatus.ok ? COLOR.green : COLOR.red }}>
                  {uploadStatus.text}
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Pestañas */}
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {[["general", "General"], ["acopios", "Acopios"], ["certificados", "Certificados"]].map(([key, lbl]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              border: "none", cursor: "pointer", padding: "9px 18px", borderRadius: 9,
              fontSize: 13.5, fontWeight: 700,
              background: tab === key ? COLOR.text : COLOR.card,
              color: tab === key ? "#fff" : COLOR.label,
              boxShadow: tab === key ? CARD_SHADOW : "none",
            }}>
              {lbl}
            </button>
          ))}
        </div>

        {tab === "general" && (
        <>
        <div style={{ display: "flex", gap: 16, marginBottom: 26, flexWrap: "wrap" }}>
          <ConceptCard icon={DollarSign} title="Contrato" field="contrato" valueColor={COLOR.blue} totalConsolidado={consolidado.contrato} monedas={monedas} />
          <ConceptCard icon={TrendingUp} title="Avance" field="avance" valueColor={COLOR.green} totalConsolidado={consolidado.avance} monedas={monedas} />
          <ConceptCard icon={TrendingDown} title="Saldo" field="saldo" valueColor={COLOR.red} totalConsolidado={consolidado.saldo} monedas={monedas} />
          <ConceptCard icon={ArrowLeftRight} title="Pago neto efectivo" field="pagoNeto" valueColor={COLOR.violet} totalConsolidado={consolidado.pagoNeto} monedas={monedas} />
        </div>

        <div style={{ fontSize: 17, fontWeight: 700, color: COLOR.text, margin: "6px 0 14px" }}>
          Avance de obra
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 26, flexWrap: "wrap" }}>
          {avanceObra.map((a) => (
            <AvanceGauge key={a.label} label={a.label} avance={a.avance} saldo={a.saldo} total={a.total}
              accent={a.label === "Obra total (consolidado)" ? COLOR.blue : COLOR.green} />
          ))}
        </div>

        <div style={{
          background: COLOR.card, borderRadius: 14, padding: 22,
          border: `1px solid ${COLOR.border}`, boxShadow: CARD_SHADOW, marginBottom: 26,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLOR.text, marginBottom: 2 }}>
            Composición del pago y saldo
          </div>
          <div style={{ fontSize: 13, color: COLOR.label, marginBottom: 14 }}>
            Consolidado, % del contrato
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: "1 1 320px", minWidth: 280 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={composicion} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={78} outerRadius={135} paddingAngle={2}>
                    {composicion.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ComposicionTooltip total={consolidado.contrato} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: "1 1 220px", minWidth: 220 }}>
              {composicion.map((c) => (
                <div key={c.name} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "7px 0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: c.color, display: "inline-block" }} />
                    <span style={{ fontSize: 13.5, color: COLOR.text, fontWeight: 500 }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: COLOR.text }}>
                    {pct(c.value, consolidado.contrato)}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: `1.5px solid ${COLOR.border}`, marginTop: 6, paddingTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800 }}>
                  <span style={{ color: COLOR.text }}>Total</span>
                  <span style={{ color: COLOR.text }}>USD {fmt(consolidado.contrato, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 17, fontWeight: 700, color: COLOR.text, margin: "26px 0 14px" }}>
          Ajuste Paramétrico
        </div>
        <div style={{
          background: COLOR.card, borderRadius: 14, padding: 22,
          border: `1px solid ${COLOR.border}`, boxShadow: CARD_SHADOW,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLOR.text }}>
                Evolución del ajuste paramétrico
              </div>
              <div style={{ fontSize: 13, color: COLOR.label, marginTop: 2 }}>
                % de ajuste por certificado (hoja &quot;AP&quot;)
              </div>
            </div>
            {ajusteActual != null && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLOR.label, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Ajuste actual
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLOR.violet }}>{ajusteActual.toFixed(2)}%</div>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ajusteParametrico} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLOR.border} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: COLOR.label }} axisLine={{ stroke: COLOR.border }} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: COLOR.label }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${v.toFixed(2)}%`} />
              <Line type="monotone" dataKey="pct" stroke={COLOR.violet} strokeWidth={2.5}
                dot={{ r: 3.5, fill: COLOR.violet, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        </>
        )}

        {tab === "acopios" && (
        <>
        <div style={{ display: "flex", gap: 16, marginBottom: 26, flexWrap: "wrap" }}>
          <ConceptCard icon={DollarSign} title="Total pago acopio" field={null} valueColor={COLOR.blue}
            totalConsolidado={
              acopioTotales.pesos.pagado / tc + acopioTotales.usdPlaza.pagado + acopioTotales.usdCif.pagado
            } customRows={{ pesos: acopioTotales.pesos.pagado, usdPlaza: acopioTotales.usdPlaza.pagado, usdCif: acopioTotales.usdCif.pagado }} />
          <ConceptCard icon={TrendingUp} title="Acopio desacopiado (utilizado)" field={null} valueColor={COLOR.green}
            totalConsolidado={
              acopioTotales.pesos.desacopiado / tc + acopioTotales.usdPlaza.desacopiado + acopioTotales.usdCif.desacopiado
            } customRows={{ pesos: acopioTotales.pesos.desacopiado, usdPlaza: acopioTotales.usdPlaza.desacopiado, usdCif: acopioTotales.usdCif.desacopiado }} />
          <ConceptCard icon={TrendingDown} title="Saldo de acopio disponible" field={null} valueColor={COLOR.violet}
            totalConsolidado={
              acopioTotales.pesos.saldo / tc + acopioTotales.usdPlaza.saldo + acopioTotales.usdCif.saldo
            } customRows={{ pesos: acopioTotales.pesos.saldo, usdPlaza: acopioTotales.usdPlaza.saldo, usdCif: acopioTotales.usdCif.saldo }} />
        </div>

        <div style={{ fontSize: 17, fontWeight: 700, color: COLOR.text, margin: "6px 0 14px" }}>
          Desacopio por moneda
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 26, flexWrap: "wrap" }}>
          {desacopioPorMoneda.map((d) => (
            <AvanceGauge key={d.label} label={d.label} avance={d.desacopiado} saldo={d.saldo} total={d.total}
              accent={COLOR.blue} avanceLabel="Desacopiado" pctLabel="Desacopiado" />
          ))}
        </div>
        </>
        )}

        {tab === "certificados" && (
        <>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {Object.keys(certificados).map((key) => (
            <button key={key} onClick={() => setCertMoneda(key)} style={{
              border: `1px solid ${COLOR.border}`, cursor: "pointer", padding: "7px 16px", borderRadius: 8,
              fontSize: 13, fontWeight: 700,
              background: certMoneda === key ? COLOR.blue : COLOR.card,
              color: certMoneda === key ? "#fff" : COLOR.label,
            }}>
              {CERT_LABELS[key]}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 26, flexWrap: "wrap" }}>
          <StatCard icon={BarChart3} label="Certificados emitidos" value={certSel.totales.cantidad}
            sub={CERT_LABELS[certMoneda]} />
          <StatCard icon={DollarSign} label="Total facturado (con IVA)" value={fmt(certSel.totales.totalConIva, 0)}
            sub={CERT_LABELS[certMoneda]} valueColor={COLOR.blue} />
          <StatCard icon={DollarSign} label="Total facturado (sin IVA)" value={fmt(certSel.totales.totalSinIva, 0)}
            sub={CERT_LABELS[certMoneda]} valueColor={COLOR.blue} />
          <StatCard icon={ArrowLeftRight} label="Monto pago" value={fmt(certSel.totales.totalPagado + (monedas[certMoneda].apPatronales || 0), 0)}
            sub="Transferencia + aportes patronales" valueColor={COLOR.violet} />
        </div>

        <div style={{
          background: COLOR.card, borderRadius: 14, padding: 22,
          border: `1px solid ${COLOR.border}`, boxShadow: CARD_SHADOW, marginBottom: 26,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLOR.text, marginBottom: 2 }}>
            Evolución de certificados
          </div>
          <div style={{ fontSize: 13, color: COLOR.label, marginBottom: 14 }}>
            Monto a pagar por certificado (barras) y acumulado (línea) · {CERT_LABELS[certMoneda]}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={certChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLOR.border} vertical={false} />
              <XAxis dataKey="n" tick={{ fontSize: 10, fill: COLOR.label }} axisLine={{ stroke: COLOR.border }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: COLOR.label }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: COLOR.label }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmt(v, 0)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="montoPagar" name="Monto a pagar" fill={COLOR.blue} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="acumulado" name="Acumulado" stroke={COLOR.violet}
                strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          background: COLOR.card, borderRadius: 14, padding: 22,
          border: `1px solid ${COLOR.border}`, boxShadow: CARD_SHADOW,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLOR.text, marginBottom: 14 }}>
            Detalle por certificado · {CERT_LABELS[certMoneda]}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLOR.border}` }}>
                  {["N°", "Mes", "Subtotal", "Total"].map((h) => (
                    <th key={h} style={{
                      textAlign: h === "N°" || h === "Mes" ? "left" : "right",
                      padding: "8px 10px", color: COLOR.label, fontWeight: 700,
                      textTransform: "uppercase", fontSize: 10.5, letterSpacing: 0.3,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certSel.list.map((c) => (
                  <tr key={c.n} style={{ borderBottom: `1px solid ${COLOR.border}` }}>
                    <td style={{ padding: "8px 10px", fontWeight: 600, color: COLOR.text }}>{c.n}</td>
                    <td style={{ padding: "8px 10px", color: COLOR.label }}>{c.mes}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", color: COLOR.text }}>
                      {fmt(c.subtotal, 2)}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: COLOR.text }}>
                      {fmt(c.total, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${COLOR.border}` }}>
                  <td colSpan={2} style={{ padding: "10px 10px", fontWeight: 800, color: COLOR.text }}>Total</td>
                  <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 800, color: COLOR.text }}>
                    {fmt(certSel.list.reduce((s, c) => s + c.subtotal, 0), 2)}
                  </td>
                  <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 800, color: COLOR.text }}>
                    {fmt(certSel.list.reduce((s, c) => s + c.total, 0), 2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
