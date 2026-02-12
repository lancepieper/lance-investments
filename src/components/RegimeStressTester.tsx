"use client";

import { useState, useMemo } from "react";

const ASSET_LABELS = { stocks: "US Stocks", bonds: "US Bonds", gold: "Gold", cash: "Cash / T-Bills", intl: "Intl Stocks" };
const ASSET_COLORS = { stocks: "#5b9bd5", bonds: "#8faadc", gold: "#d4a843", cash: "#a8a8a8", intl: "#7eb8c9" };

// DATA SOURCES & METHODOLOGY (Verified Feb 2026)
// US Stocks: S&P 500 monthly prices from Robert Shiller ie_data.xls (Yale, 1871-2026)
// Gold: LBMA monthly average prices from NMA monthly_gold_prices.csv (1833-2025)
// US Bonds: 10Y Treasury return = (yield/12) - 7*delta_yield, from Shiller GS10
// Cash/T-Bills: GS10 minus 1.5% term premium, compounded monthly
// Intl Stocks: iShares EFA ETF monthly closes (Yahoo Finance) for GFC, COVID, 2022.
//   Dot-Com: actual EFA from Aug 2001 (inception), annual-rate approx before that.
//   1973-74, 1980-82: Brighthouse/Bloomberg EAFE annual returns, distributed monthly.
// CPI: BLS data via Shiller. Monthly averages smooth daily extremes.

const REGIMES = [
  {
    id: "stagflation73", name: "1973\u201374 Stagflation", shortName: "'73 Stagflation",
    period: "Jan 1973 \u2013 Dec 1974", description: "Oil embargo, wage-price spiral, and a deep recession. The worst equity bear market since the Depression.",
    color: "#e07850", context: "CPI surged to 12%. Nixon closed the gold window 2 years prior. OPEC embargo quadrupled oil prices.",
    annualizedInflation: 0.109,
    months: Array.from({length: 24}, (_, i) => i),
    assets: {
      stocks: [100.0,96.45,94.93,93.16,90.54,88.51,89.36,87.67,89.19,92.74,86.15,80.05,81.17,78.93,82.3,78.09,75.73,75.84,66.98,64.21,57.53,58.65,60.59,56.65],
      bonds: [100.0,99.28,99.34,100.17,99.46,99.68,98.65,97.37,100.08,102.77,103.78,104.29,103.05,103.87,102.65,101.11,101.25,102.17,100.88,99.91,100.58,102.24,104.49,106.99],
      gold: [100.0,113.91,129.52,138.93,156.52,184.4,184.48,163.89,158.07,153.64,145.72,163.83,198.33,230.47,258.55,264.42,250.64,236.57,219.5,237.4,232.96,243.75,278.88,282.13],
      cash: [100.0,100.41,100.84,101.28,101.72,102.17,102.63,103.11,103.62,104.1,104.56,105.02,105.48,105.96,106.44,106.95,107.49,108.03,108.57,109.14,109.73,110.33,110.92,111.49],
      intl: [100.0,98.48,96.98,95.5,94.05,92.62,91.21,89.82,88.45,87.1,85.77,84.46,82.4,80.39,78.43,76.52,74.66,72.84,71.07,69.34,67.65,66.0,64.39,62.82],
    },
  },
  {
    id: "volcker80", name: "1980\u201382 Volcker Shock", shortName: "'80 Volcker",
    period: "Jan 1980 \u2013 Jul 1982", description: "Volcker hiked the Fed Funds rate to 20%. Intentional recession to crush inflation.",
    color: "#c0504d", context: "Fed Funds hit 20%. Unemployment peaked at 10.8%. Gold crashed from its $850 peak. Bonds eventually rallied hard.",
    annualizedInflation: 0.094,
    months: Array.from({length: 31}, (_, i) => i),
    assets: {
      stocks: [100.0,103.97,94.41,92.88,97.11,103.34,108.03,111.36,114.07,117.4,122.36,120.38,119.93,115.78,120.11,121.19,118.76,119.3,116.41,116.86,106.67,108.03,110.82,111.63,105.77,103.25,99.91,104.87,104.96,98.92,98.65],
      bonds: [100.0,89.63,88.42,97.28,106.99,110.89,108.15,102.64,100.64,99.91,94.38,94.32,97.11,93.91,95.4,92.7,91.03,96.11,91.74,88.59,87.34,89.49,101.64,100.43,95.46,97.69,102.76,103.87,106.89,103.02,106.77],
      gold: [100.0,98.52,81.97,76.62,76.08,88.95,95.26,92.87,99.75,97.9,92.52,79.71,82.54,74.0,73.91,73.42,71.03,68.28,60.58,60.74,65.71,64.82,61.21,60.73,56.88,55.4,48.9,51.87,49.42,46.64,50.19],
      cash: [100.0,100.78,101.7,102.65,103.5,104.25,104.97,105.74,106.59,107.48,108.4,109.41,110.44,111.46,112.55,113.64,114.79,116.0,117.16,118.41,119.74,121.12,122.5,123.71,124.97,126.33,127.69,129.01,130.34,131.66,133.06],
      intl: [100.0,101.46,102.94,104.44,105.97,107.52,109.09,110.68,112.3,113.94,115.6,117.29,116.81,116.33,115.85,115.37,114.89,114.41,113.94,113.47,113.0,112.53,112.06,111.6,111.16,110.72,110.28,109.85,109.42,108.99,108.56],
    },
  },
  {
    id: "dotcom00", name: "2000\u201302 Dot-Com Bust", shortName: "'00 Dot-Com",
    period: "Mar 2000 \u2013 Oct 2002", description: "The internet bubble burst. Tech-heavy portfolios were decimated over 2.5 years of grinding losses.",
    color: "#9b59b6", context: "Nasdaq fell 78%. S&P P/E had hit 44x. Enron and WorldCom collapsed. The Fed cut from 6.5% to 1%.",
    annualizedInflation: 0.022,
    months: Array.from({length: 32}, (_, i) => i),
    assets: {
      stocks: [100.0,101.33,98.35,101.37,102.13,103.0,101.79,96.39,95.55,92.28,92.61,90.54,82.22,82.5,88.08,85.89,83.51,81.71,72.43,74.65,78.33,79.39,79.06,76.32,80.0,77.1,74.83,70.31,62.65,63.27,60.17,59.26],
      bonds: [100.0,102.41,99.7,102.61,103.49,105.61,106.34,107.3,107.96,112.1,113.22,114.18,116.34,114.78,113.26,114.64,115.47,118.16,120.63,122.46,122.24,118.95,119.87,121.46,118.81,119.91,120.85,123.32,126.24,130.18,134.2,133.98],
      gold: [100.0,97.66,96.09,99.77,98.32,95.84,95.56,94.28,92.88,94.78,92.7,91.44,91.84,90.95,95.1,94.36,93.41,95.11,98.96,98.84,96.43,96.32,98.3,103.18,102.68,105.69,109.81,112.15,109.39,108.33,111.44,110.53],
      cash: [100.0,100.4,100.78,101.19,101.58,101.97,102.34,102.71,103.07,103.43,103.75,104.07,104.38,104.67,104.99,105.33,105.66,105.99,106.3,106.59,106.86,107.14,107.46,107.78,108.09,108.43,108.77,109.1,109.41,109.7,109.95,110.17],
      intl: [100.0,98.63,97.28,95.95,94.64,93.35,92.08,90.82,89.58,88.36,86.49,84.66,82.87,81.12,79.41,77.73,76.09,74.48,67.31,68.43,70.73,71.12,67.0,67.81,71.58,72.68,73.06,70.67,63.93,63.3,56.74,58.92],
    },
  },
  {
    id: "gfc08", name: "2007\u201309 Global Financial Crisis", shortName: "'08 GFC",
    period: "Oct 2007 \u2013 Mar 2009", description: "Housing collapse, bank failures, and a near-total seizure of global credit markets.",
    color: "#e74c3c", context: "Lehman Brothers collapsed. AIG bailout. TARP. Fed cut to zero and began QE. Housing prices fell 33%.",
    annualizedInflation: 0.013,
    months: Array.from({length: 18}, (_, i) => i),
    assets: {
      stocks: [100.0,95.05,96.07,89.55,88.0,85.53,89.01,91.14,87.11,81.66,83.23,79.04,62.92,57.35,57.0,56.22,52.3,49.18],
      bonds: [100.0,103.04,103.76,106.73,107.06,109.12,108.14,106.96,105.66,106.69,107.94,109.8,109.22,111.71,120.72,120.12,117.43,118.12],
      gold: [100.0,106.84,106.44,117.89,122.22,128.34,120.55,117.77,117.87,124.54,111.19,109.98,106.89,100.83,108.15,113.79,124.97,122.48],
      cash: [100.0,100.25,100.47,100.69,100.88,101.07,101.24,101.42,101.62,101.84,102.05,102.25,102.44,102.64,102.81,102.89,102.98,103.1],
      intl: [100.0,96.38,91.17,84.02,83.16,83.51,88.05,89.09,79.76,77.11,73.83,65.39,51.77,48.47,52.1,44.95,40.28,43.66],
    },
  },
  {
    id: "covid20", name: "2020 COVID Crash", shortName: "'20 COVID",
    period: "Jan 2020 \u2013 Sep 2020", description: "The fastest 30%+ crash in history. Global shutdown followed by unprecedented monetary stimulus.",
    color: "#27ae60", context: "Global lockdowns. Fed cut to zero and launched unlimited QE. Congress passed $2.2T CARES Act. V-shaped recovery.",
    annualizedInflation: 0.012,
    months: Array.from({length: 9}, (_, i) => i),
    assets: {
      stocks: [100.0,99.97,80.91,84.25,89.06,94.71,97.85,103.46,102.66],
      bonds: [100.0,101.97,106.59,108.23,108.21,107.82,108.72,108.55,108.38],
      gold: [100.0,102.33,102.0,107.85,109.95,110.99,118.32,126.14,123.15],
      cash: [100.0,100.02,100.03,100.04,100.05,100.06,100.07,100.08,100.09],
      intl: [100.0,92.23,79.22,83.83,88.38,90.2,91.95,96.3,94.32],
    },
  },
  {
    id: "rateshock22", name: "2022 Rate Shock", shortName: "'22 Rates",
    period: "Jan 2022 \u2013 Dec 2022", description: "The Fed's fastest tightening cycle in 40 years. Stocks and bonds fell together \u2014 the 60/40 portfolio's worst year.",
    color: "#f39c12", context: "CPI hit 9.1%. Fed hiked from 0% to 4.5%. The 60/40 portfolio fell ~17%. Crypto imploded (FTX, Terra/Luna).",
    annualizedInflation: 0.081,
    months: Array.from({length: 12}, (_, i) => i),
    assets: {
      stocks: [100.0,96.99,96.01,96.01,88.34,85.24,85.52,90.92,84.19,81.46,85.65,85.54],
      bonds: [100.0,98.96,97.73,93.66,92.89,91.55,93.33,93.56,89.73,87.1,87.94,89.89],
      gold: [100.0,102.22,107.26,106.65,101.79,101.13,95.41,97.17,92.55,91.65,94.99,98.98],
      cash: [100.0,100.02,100.06,100.11,100.21,100.33,100.47,100.59,100.71,100.88,101.09,101.29],
      intl: [100.0,96.57,97.07,90.53,92.34,82.42,86.68,81.38,73.87,78.22,88.53,86.57],
    },
  },
];

const PRESETS = [
  { name: "60/40 Classic", desc: "Traditional balanced", alloc: { stocks: 60, bonds: 40, gold: 0, cash: 0, intl: 0 } },
  { name: "All-Weather", desc: "Dalio-inspired", alloc: { stocks: 30, bonds: 40, gold: 15, cash: 0, intl: 15 } },
  { name: "Permanent Port.", desc: "Browne's 4x25", alloc: { stocks: 25, bonds: 25, gold: 25, cash: 25, intl: 0 } },
  { name: "100% Equities", desc: "Maximum growth", alloc: { stocks: 80, bonds: 0, gold: 0, cash: 0, intl: 20 } },
  { name: "Hard Assets", desc: "Inflation hedge", alloc: { stocks: 30, bonds: 10, gold: 35, cash: 5, intl: 20 } },
  { name: "Conservative", desc: "Capital preservation", alloc: { stocks: 20, bonds: 50, gold: 10, cash: 20, intl: 0 } },
];

function computeResult(regime: any, allocation: any, useRealReturns: boolean) {
  const w = { stocks: allocation.stocks / 100, bonds: allocation.bonds / 100, gold: allocation.gold / 100, cash: allocation.cash / 100, intl: allocation.intl / 100 };
  const monthlyInflation = Math.pow(1 + regime.annualizedInflation, 1 / 12) - 1;
  const cpiPath = regime.months.map((_: any, i: number) => useRealReturns ? Math.pow(1 + monthlyInflation, i) : 1);
  const adjustedAssets: Record<string, number[]> = {};
  for (const [a, path] of Object.entries(regime.assets) as [string, number[]][]) { adjustedAssets[a] = path.map((v: number, i: number) => v / cpiPath[i]); }
  const path = regime.months.map((_: any, i: number) => {
    let val = 0;
    for (const [a, wt] of Object.entries(w) as [string, number][]) { if (wt > 0 && adjustedAssets[a]) val += wt * adjustedAssets[a][i]; }
    return val;
  });
  let peak = path[0], maxDD = 0, troughMonth = 0;
  path.forEach((v: number, i: number) => { if (v > peak) peak = v; const dd = (peak - v) / peak; if (dd > maxDD) { maxDD = dd; troughMonth = i; } });
  let recoveryMonths = null;
  for (let i = troughMonth; i < path.length; i++) { if (path[i] >= 100) { recoveryMonths = i - troughMonth; break; } }
  const assetReturns: Record<string, number> = {};
  for (const [a, p] of Object.entries(adjustedAssets) as [string, number[]][]) { assetReturns[a] = (p[p.length - 1] / p[0] - 1) * 100; }
  return { regime, path, maxDD: maxDD * 100, troughMonth, recoveryMonths, totalReturn: (path[path.length - 1] / 100 - 1) * 100, assetReturns };
}

function MiniChart({ path, color, height = 60 }: { path: number[], color: string, height?: number }) {
  const min = Math.min(...path, 95), max = Math.max(...path, 105), range = max - min || 1;
  const h = height, w = 400;
  const points = path.map((v, i) => `${(i / (path.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const baseline = h - ((100 - min) / range) * h;
  const fillPoints = path.map((v, i) => { const y = v < 100 ? h - ((v - min) / range) * h : baseline; return `${(i / (path.length - 1)) * w},${y}`; }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height, display: "block" }} preserveAspectRatio="none">
      <line x1="0" y1={baseline} x2={w} y2={baseline} stroke="rgba(255,255,255,0.15)" strokeDasharray="4,3" />
      <polygon points={`0,${baseline} ${fillPoints} ${w},${baseline}`} fill={color} fillOpacity="0.08" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function ComparisonBars({ results }: { results: any[] }) {
  const maxDD = Math.max(...results.map(r => r.maxDD));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, padding: "0 4px" }}>
      {results.map(r => (
        <div key={r.regime.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: r.regime.color }}>{"-" + r.maxDD.toFixed(0) + "%"}</span>
          <div style={{ width: "100%", maxWidth: 48, height: (r.maxDD / (maxDD * 1.15)) * 100 + "%", minHeight: 4, background: r.regime.color, opacity: 0.7, borderRadius: "4px 4px 0 0" }} />
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", textAlign: "center", lineHeight: 1.2 }}>{r.regime.shortName}</span>
        </div>
      ))}
    </div>
  );
}

export default function RegimeStressTester() {
  const [allocation, setAllocation] = useState<Record<string, number>>({ stocks: 60, bonds: 40, gold: 0, cash: 0, intl: 0 });
  const [selectedRegime, setSelectedRegime] = useState("gfc08");
  const [initialValue, setInitialValue] = useState(500000);
  const [useRealReturns, setUseRealReturns] = useState(false);
  const total = Object.values(allocation).reduce((s, v) => s + v, 0);
  const results = useMemo(() => REGIMES.map(r => computeResult(r, allocation, useRealReturns)), [allocation, useRealReturns]);
  const worstDD = Math.max(...results.map(r => r.maxDD));
  const avgDD = results.reduce((s, r) => s + r.maxDD, 0) / results.length;
  const survivedAll = results.every(r => r.recoveryMonths !== null);
  const fmt = (v: number) => Math.abs(v) >= 1e6 ? "$" + (v / 1e6).toFixed(1) + "M" : Math.abs(v) >= 1e3 ? "$" + (v / 1e3).toFixed(0) + "K" : "$" + Math.round(v).toLocaleString();
  const toggleBtn = (active: boolean) => ({ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500 as const, letterSpacing: 0.3, cursor: "pointer" as const, border: "none", background: active ? "rgba(99,200,170,0.12)" : "transparent", color: active ? "#63c8aa" : "rgba(255,255,255,0.35)", fontFamily: "'DM Sans',system-ui,sans-serif", transition: "all 0.15s ease" });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0d1117 0%,#111820 40%,#0f1923 100%)", color: "#f0f0f0", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <style>{`input[type=range]{width:100%;height:4px;appearance:none;-webkit-appearance:none;background:rgba(255,255,255,0.08);border-radius:2px;outline:none;cursor:pointer}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#63c8aa;cursor:pointer;border:2px solid #0d1117;box-shadow:0 0 6px rgba(99,200,170,0.3)}`}</style>

      <div style={{ padding: "24px 28px 8px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Historical Stress Test</div>
          <h1 style={{ fontSize: 28, fontFamily: "'DM Serif Display',serif", fontWeight: 400, margin: 0 }}>Portfolio Regime Tester</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6, maxWidth: 520 }}>Pick your allocation. See how it would have performed through the worst market crises of the last 50 years.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 1, marginTop: 4, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 3 }}>
          <button onClick={() => setUseRealReturns(false)} style={toggleBtn(!useRealReturns)}>Nominal</button>
          <button onClick={() => setUseRealReturns(true)} style={toggleBtn(useRealReturns)}>Real (inflation-adj.)</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, padding: "16px 28px 40px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#63c8aa", fontWeight: 500, marginBottom: 12 }}>Preset Portfolios</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {PRESETS.map(p => {
                const active = JSON.stringify(allocation) === JSON.stringify(p.alloc);
                return (<button key={p.name} onClick={() => setAllocation({...p.alloc})} style={{ background: active ? "rgba(99,200,170,0.08)" : "rgba(255,255,255,0.02)", border: active ? "1px solid rgba(99,200,170,0.2)" : "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 10px", cursor: "pointer", textAlign: "left", color: "#f0f0f0" }}>
                  <div style={{ fontSize: 12, fontFamily: "'DM Serif Display',serif" }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{p.desc}</div>
                </button>);
              })}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#63c8aa", fontWeight: 500 }}>Allocation</div>
              <div style={{ fontSize: 13, fontFamily: "'DM Serif Display',serif", color: total === 100 ? "#63c8aa" : "#ef4444" }}>{total}%{total !== 100 && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>({total < 100 ? "under" : "over"})</span>}</div>
            </div>
            {Object.entries(ASSET_LABELS).map(([key, label]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: ASSET_COLORS[key], display: "inline-block" }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
                  </span>
                  <span style={{ fontSize: 14, fontFamily: "'DM Serif Display',serif", color: "rgba(255,255,255,0.9)" }}>{allocation[key]}%</span>
                </div>
                <input type="range" min={0} max={100} step={5} value={allocation[key]} onChange={e => setAllocation(prev => ({ ...prev, [key]: parseInt(e.target.value) }))} />
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#63c8aa", fontWeight: 500, marginBottom: 10 }}>Starting Value</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Portfolio Value</span>
              <span style={{ fontSize: 14, fontFamily: "'DM Serif Display',serif" }}>{fmt(initialValue)}</span>
            </div>
            <input type="range" min={50000} max={5000000} step={50000} value={initialValue} onChange={e => setInitialValue(parseInt(e.target.value))} />
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#63c8aa", fontWeight: 500, marginBottom: 10 }}>Summary {useRealReturns && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>(real)</span>}</div>
            {[["Worst drawdown", "-" + worstDD.toFixed(1) + "%", "#ef4444"], ["Avg drawdown", "-" + avgDD.toFixed(1) + "%", "#eab308"], ["Recovered all?", survivedAll ? "Yes" : "No", survivedAll ? "#22c55e" : "#ef4444"]].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{l}</span>
                <span style={{ fontSize: 14, fontFamily: "'DM Serif Display',serif", color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: "16px 16px 8px" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#63c8aa", fontWeight: 500, marginBottom: 8 }}>Max Drawdown Comparison {useRealReturns && <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>(real)</span>}</div>
            <ComparisonBars results={results} />
          </div>

          {results.map(r => {
            const isOpen = selectedRegime === r.regime.id;
            const endVal = initialValue * (1 + r.totalReturn / 100);
            return (
              <div key={r.regime.id} onClick={() => setSelectedRegime(isOpen ? "" : r.regime.id)} style={{ background: isOpen ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)", border: isOpen ? "1px solid " + r.regime.color + "40" : "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: isOpen ? 12 : 8 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: r.regime.color, marginBottom: 4 }}>{r.regime.period}</div>
                    <div style={{ fontSize: 16, fontFamily: "'DM Serif Display',serif", color: "rgba(255,255,255,0.9)" }}>{r.regime.name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontFamily: "'DM Serif Display',serif", color: r.maxDD > 20 ? "#ef4444" : r.maxDD > 10 ? "#eab308" : "#22c55e" }}>-{r.maxDD.toFixed(1)}%</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>Max Drawdown{useRealReturns ? " (real)" : ""}</div>
                  </div>
                </div>
                {isOpen && <div style={{ marginBottom: 12, borderRadius: 8, overflow: "hidden", background: "rgba(0,0,0,0.15)", padding: "8px 4px 4px" }}><MiniChart path={r.path} color={r.regime.color} height={80} /></div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>Trough</div><div style={{ fontSize: 13, fontFamily: "'DM Serif Display',serif", color: "rgba(255,255,255,0.7)" }}>{r.troughMonth} mo</div></div>
                  <div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>Recovery</div><div style={{ fontSize: 13, fontFamily: "'DM Serif Display',serif", color: "rgba(255,255,255,0.7)" }}>{r.recoveryMonths !== null ? r.recoveryMonths + " mo" : "None"}</div></div>
                  <div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>{fmt(initialValue) + " became"}</div><div style={{ fontSize: 13, fontFamily: "'DM Serif Display',serif", color: endVal >= initialValue ? "#63c8aa" : "#ef4444" }}>{fmt(endVal)}</div></div>
                </div>
                {isOpen && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 6 }}>{r.regime.description}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", lineHeight: 1.5, fontStyle: "italic", marginBottom: 10 }}>{r.regime.context}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                      {Object.entries(r.assetReturns).filter(([a]) => allocation[a] > 0).sort(([, a], [, b]) => b - a).map(([a, ret]) => (
                        <div key={a} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: ASSET_COLORS[a], display: "inline-block" }} />
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{ASSET_LABELS[a]}</span>
                          </span>
                          <span style={{ fontSize: 12, fontFamily: "'DM Serif Display',serif", color: ret >= 0 ? "#63c8aa" : "#ef4444" }}>{ret >= 0 ? "+" : ""}{ret.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, padding: "0 4px" }}>
            <strong style={{ color: "rgba(255,255,255,0.4)" }}>Data sources:</strong> S&P 500 monthly prices and 10-year Treasury yields from Robert Shiller's ie_data.xls (Yale). Gold from LBMA monthly averages (NMA). International stocks from iShares EFA ETF monthly closes (Yahoo Finance) for 2001-2022 regimes; pre-2001 from MSCI EAFE annual returns (Brighthouse/Bloomberg). Cash from short-rate proxies. Bond returns from GS10 yield changes (modified duration 7). Real returns deflated by CPI. Monthly averages smooth daily extremes. Past performance is not indicative of future results. This tool is for educational purposes only and does not constitute financial advice. Errors or omissions may occur. Do your own research and consult a qualified, licensed adviser who understands your circumstances before acting on this content.
          </div>
        </div>
      </div>
    </div>
  );
}
