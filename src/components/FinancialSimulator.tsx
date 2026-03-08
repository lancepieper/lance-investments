"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";

function randn(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

interface SimParams {
  currentAge: number; stopContribAge: number; retirementAge: number; endAge: number;
  initialPortfolio: number; annualContribution: number;
  returnRate: number; stdDev: number; inflation: number;
  retireReturn: number; retireStdDev: number;
  taxRate: number; incomeNeedAfterTax: number; otherIncome: number;
}

interface AgeStat {
  age: number; p5: number; p10: number; p25: number; p50: number;
  p75: number; p90: number; p95: number; avg: number;
}

interface SimResult {
  stats: AgeStat[]; successRate: number; failures: number;
  numRuns: number; samplePaths: { age: number; value: number }[][]; ages: number[];
}

function runSimulation(params: SimParams, numRuns: number = 200): SimResult {
  const { currentAge, stopContribAge, retirementAge, endAge, initialPortfolio,
    annualContribution, returnRate, stdDev, inflation, retireReturn, retireStdDev,
    taxRate, incomeNeedAfterTax, otherIncome } = params;
  const realReturnAccum = returnRate - inflation;
  const realReturnRetire = retireReturn - inflation;
  const preTexIncome = incomeNeedAfterTax / (1 - taxRate);
  const portfolioIncome = preTexIncome - otherIncome;
  const ages: number[] = [];
  for (let a = currentAge; a <= endAge; a++) ages.push(a);
  const allPaths: number[][] = [];
  let failures = 0;
  for (let run = 0; run < numRuns; run++) {
    const path: number[] = [];
    let balance = initialPortfolio;
    for (let i = 0; i < ages.length; i++) {
      const age = ages[i];
      let cashFlow = 0;
      if (age < stopContribAge) cashFlow = annualContribution;
      else if (age >= retirementAge) cashFlow = -portfolioIncome;
      const isRetired = age >= retirementAge;
      const mu = isRetired ? realReturnRetire : realReturnAccum;
      const sigma = isRetired ? retireStdDev : stdDev;
      const r = mu + sigma * randn();
      balance = balance * (1 + r) + cashFlow;
      path.push(Math.max(balance, isRetired ? balance : 0));
    }
    allPaths.push(path);
    if (path[path.length - 1] <= 0) failures++;
  }
  const percentiles = [5, 10, 25, 50, 75, 90, 95] as const;
  const stats: AgeStat[] = ages.map((age, i) => {
    const values = allPaths.map((p) => p[i]).sort((a, b) => a - b);
    const obj: any = { age };
    percentiles.forEach((pct) => {
      const idx = Math.floor(values.length * pct / 100);
      obj["p" + pct] = values[Math.min(idx, values.length - 1)];
    });
    obj.avg = values.reduce((s, v) => s + v, 0) / values.length;
    return obj as AgeStat;
  });
  const samplePaths = allPaths.slice(0, Math.min(30, numRuns))
    .map((path) => path.map((val, i) => ({ age: ages[i], value: val })));
  return { stats, successRate: ((numRuns - failures) / numRuns) * 100, failures, numRuns, samplePaths, ages };
}

function SuccessGauge({ rate }: { rate: number }) {
  const r = 80, stroke = 14;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - rate / 100);
  const color = rate >= 80 ? "#22c55e" : rate >= 60 ? "#eab308" : "#ef4444";
  const label = rate >= 90 ? "Excellent" : rate >= 80 ? "Good" : rate >= 70 ? "Fair" : rate >= 60 ? "Caution" : "At Risk";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="200" height="116" viewBox="0 0 200 116">
        <path d={"M " + (100 - r) + " 100 A " + r + " " + r + " 0 0 1 " + (100 + r) + " 100"}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} strokeLinecap="round" />
        <path d={"M " + (100 - r) + " 100 A " + r + " " + r + " 0 0 1 " + (100 + r) + " 100"}
          fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.5s" }} />
        <text x="100" y="88" textAnchor="middle" fill="#f0f0f0"
          style={{ fontSize: "36px", fontFamily: "var(--font-display)", fontWeight: 400 }}>{rate.toFixed(0)}%</text>
        <text x="100" y="108" textAnchor="middle" fill="rgba(255,255,255,0.45)"
          style={{ fontSize: "11px", fontFamily: "var(--font-body)", letterSpacing: "2px", textTransform: "uppercase" }}>{label}</text>
      </svg>
    </div>
  );
}

function FanChart({ stats, retirementAge, samplePaths }: { stats: AgeStat[]; retirementAge: number; samplePaths: { age: number; value: number }[][] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 700, h: 360 });
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 100) setDims({ w: width, h: Math.min(380, Math.max(280, width * 0.42)) });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!stats.length || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const margin = { top: 20, right: 20, bottom: 38, left: 65 };
    const w = dims.w - margin.left - margin.right;
    const h = dims.h - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    const x = d3.scaleLinear().domain(d3.extent(stats, (d) => d.age) as [number, number]).range([0, w]);
    const allVals = stats.flatMap((d) => [d.p5, d.p95]);
    const yMax = (d3.max(allVals.filter((v) => v > 0)) ?? 1) * 1.05;
    const yMin = Math.min(0, (d3.min(allVals) ?? 0) * 1.1);
    const y = d3.scaleLinear().domain([yMin, yMax]).range([h, 0]);
    y.ticks(6).forEach((t) => {
      g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(t)).attr("y2", y(t))
        .attr("stroke", "rgba(255,255,255,0.04)").attr("stroke-dasharray", "2,4");
    });
    const bands = [
      { lo: "p5" as const, hi: "p95" as const, opacity: 0.06 },
      { lo: "p10" as const, hi: "p90" as const, opacity: 0.09 },
      { lo: "p25" as const, hi: "p75" as const, opacity: 0.14 },
    ];
    bands.forEach(({ lo, hi, opacity }) => {
      const area = d3.area<AgeStat>().x((d) => x(d.age))
        .y0((d) => y(Math.max(d[lo], yMin))).y1((d) => y(Math.min(d[hi], yMax)))
        .curve(d3.curveMonotoneX);
      g.append("path").datum(stats).attr("d", area).attr("fill", "rgba(99, 200, 170, " + opacity + ")");
    });
    if (samplePaths) {
      const line = d3.line<{ age: number; value: number }>()
        .x((d) => x(d.age)).y((d) => y(Math.max(Math.min(d.value, yMax), yMin))).curve(d3.curveMonotoneX);
      samplePaths.forEach((path) => {
        const endVal = path[path.length - 1].value;
        const col = endVal <= 0 ? "rgba(239,68,68,0.18)" : "rgba(99,200,170,0.1)";
        g.append("path").datum(path).attr("d", line).attr("fill", "none").attr("stroke", col).attr("stroke-width", 0.8);
      });
    }
    const medianLine = d3.line<AgeStat>().x((d) => x(d.age)).y((d) => y(d.p50)).curve(d3.curveMonotoneX);
    const medianPath = g.append("path").datum(stats).attr("d", medianLine)
      .attr("fill", "none").attr("stroke", "#63c8aa").attr("stroke-width", 2.5);
    const totalLen = (medianPath.node() as SVGPathElement)?.getTotalLength() ?? 0;
    medianPath.attr("stroke-dasharray", totalLen).attr("stroke-dashoffset", totalLen)
      .transition().duration(1200).attr("stroke-dashoffset", 0);
    if (yMin < 0) {
      g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", "rgba(239,68,68,0.4)").attr("stroke-width", 1).attr("stroke-dasharray", "6,4");
    }
    if (retirementAge >= stats[0].age && retirementAge <= stats[stats.length - 1].age) {
      g.append("line").attr("x1", x(retirementAge)).attr("x2", x(retirementAge)).attr("y1", 0).attr("y2", h)
        .attr("stroke", "rgba(255,200,100,0.35)").attr("stroke-width", 1).attr("stroke-dasharray", "4,4");
      g.append("text").attr("x", x(retirementAge) + 6).attr("y", 14).text("Retirement")
        .attr("fill", "rgba(255,200,100,0.6)").style("font-size", "10px").style("font-family", "var(--font-body)");
    }
    const xAxis = d3.axisBottom(x).ticks(Math.min(12, stats.length / 3)).tickFormat((d) => String(d));
    g.append("g").attr("transform", "translate(0," + h + ")").call(xAxis)
      .call((g) => g.select(".domain").attr("stroke", "rgba(255,255,255,0.1)"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.06)"))
      .call((g) => g.selectAll(".tick text").attr("fill", "rgba(255,255,255,0.4)")
        .style("font-size", "10px").style("font-family", "var(--font-body)"));
    const fmtY = (d: d3.NumberValue) => {
      const n = +d;
      if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
      if (Math.abs(n) >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
      return "$" + n;
    };
    const yAxis = d3.axisLeft(y).ticks(6).tickFormat(fmtY);
    g.append("g").call(yAxis)
      .call((g) => g.select(".domain").attr("stroke", "rgba(255,255,255,0.1)"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.06)"))
      .call((g) => g.selectAll(".tick text").attr("fill", "rgba(255,255,255,0.4)")
        .style("font-size", "10px").style("font-family", "var(--font-body)"));
    g.append("text").attr("x", w / 2).attr("y", h + 34).attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "10px").style("font-family", "var(--font-body)")
      .style("letter-spacing", "1.5px").style("text-transform", "uppercase").text("Age");
  }, [stats, dims, retirementAge, samplePaths]);
  return (<div ref={containerRef} style={{ width: "100%" }}><svg ref={svgRef} width={dims.w} height={dims.h} /></div>);
}

function InputField({ label, value, onChange, min, max, step = 1, suffix = "", format }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number;
  step?: number; suffix?: string; format?: (v: number) => string;
}) {
  const display = format ? format(value) : (typeof value === "number" ? value.toLocaleString() : value) + suffix;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="sim-label">{label}</span>
        <span className="sim-value">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} className="sim-slider" />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="sim-stat-card">
      <div className="sim-label mb-1.5">{label}</div>
      <div className="sim-value text-[22px]">{value}</div>
      {sub && <div className="text-[11px] text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

export default function FinancialSimulator() {
  const [params, setParams] = useState<SimParams>({
    currentAge: 30, stopContribAge: 50, retirementAge: 60, endAge: 95,
    initialPortfolio: 250000, annualContribution: 41000,
    returnRate: 0.11, stdDev: 0.18, inflation: 0.03,
    retireReturn: 0.08, retireStdDev: 0.06,
    taxRate: 0.15, incomeNeedAfterTax: 150000, otherIncome: 24000,
  });
  const numSims = 1000;
  const [runKey, setRunKey] = useState(0);
  const update = (key: keyof SimParams, val: number) => setParams((p) => ({ ...p, [key]: val }));
  const result = useMemo(() => runSimulation(params, numSims), [params, numSims, runKey]);
  const preTexIncome = params.incomeNeedAfterTax / (1 - params.taxRate);
  const portfolioIncome = preTexIncome - params.otherIncome;
  const medianEnd = result.stats[result.stats.length - 1]?.p50 ?? 0;
  const fmt = (v: number) => {
    if (Math.abs(v) >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
    if (Math.abs(v) >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
    return "$" + Math.round(v).toLocaleString();
  };
  const retireMedian = result.stats.find((s) => s.age === params.retirementAge)?.p50 ?? 1;
  const withdrawalRate = ((portfolioIncome / retireMedian) * 100).toFixed(1);

  return (
    <>
      <style jsx global>{":root{--font-display:var(--font-dm-serif-display),'DM Serif Display',serif;--font-body:var(--font-dm-sans),'DM Sans',sans-serif;--sim-accent:#63c8aa;--sim-bg:#0d1117}.sim-page{min-height:100vh;background:linear-gradient(160deg,#0d1117 0%,#111820 40%,#0f1923 100%);color:#f0f0f0;font-family:var(--font-body)}.sim-label{font-size:11px;color:rgba(255,255,255,0.45);font-family:var(--font-body);letter-spacing:0.5px;text-transform:uppercase}.sim-value{font-size:14px;color:#f0f0f0;font-family:var(--font-display);font-weight:400}.sim-slider{width:100%;height:4px;appearance:none;-webkit-appearance:none;background:rgba(255,255,255,0.08);border-radius:2px;outline:none;cursor:pointer}.sim-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:var(--sim-accent);cursor:pointer;border:2px solid var(--sim-bg);box-shadow:0 0 8px rgba(99,200,170,0.3)}.sim-slider::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:var(--sim-accent);cursor:pointer;border:2px solid var(--sim-bg)}.sim-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:16px;padding:24px}.sim-stat-card{background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 20px;border:1px solid rgba(255,255,255,0.05);flex:1;min-width:140px}.sim-section-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--sim-accent);margin-bottom:16px;font-weight:500}@keyframes simFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.sim-fade-in{animation:simFadeIn 0.5s ease-out forwards}"}</style>
      <div className="sim-page">
        <div className="px-6 md:px-8 pt-7 flex justify-between items-start flex-wrap gap-3">
          <div>
            <div className="text-[10px] tracking-[3px] uppercase text-white/30 mb-1.5">Monte Carlo</div>
            <h1 className="text-[28px] leading-tight m-0 text-[#f0f0f0]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>Financial Planning Simulator</h1>
          </div>
          <button onClick={() => setRunKey((k) => k + 1)}
            className="text-[13px] font-medium tracking-wide border-none rounded-[10px] px-6 py-2.5 cursor-pointer transition-all duration-150"
            style={{ background: "linear-gradient(135deg, #63c8aa, #4aa88a)", color: "#0d1117",
              fontFamily: "var(--font-body)", boxShadow: "0 2px 12px rgba(99,200,170,0.25)" }}>
            ↻ Re-run Simulation</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 px-6 md:px-8 py-6 pb-10 items-start">
          <div className="flex flex-col gap-5 sim-fade-in">
            <div className="sim-card">
              <div className="sim-section-title">Client Profile</div>
              <InputField label="Current Age" value={params.currentAge} min={18} max={75} onChange={(v) => update("currentAge", v)} suffix=" yrs" />
              <InputField label="Retirement Age" value={params.retirementAge} min={params.currentAge + 1} max={85} onChange={(v) => update("retirementAge", v)} suffix=" yrs" />
              <InputField label="Plan End Age" value={params.endAge} min={params.retirementAge + 1} max={110} onChange={(v) => update("endAge", v)} suffix=" yrs" />
            </div>
            <div className="sim-card">
              <div className="sim-section-title">Portfolio &amp; Contributions</div>
              <InputField label="Initial Portfolio" value={params.initialPortfolio} min={0} max={5000000} step={25000} onChange={(v) => update("initialPortfolio", v)} format={(v) => "$" + (v / 1000).toFixed(0) + "K"} />
              <InputField label="Annual Contribution" value={params.annualContribution} min={0} max={200000} step={1000} onChange={(v) => update("annualContribution", v)} format={(v) => "$" + v.toLocaleString()} />
              <InputField label="Stop Contributing At" value={params.stopContribAge} min={params.currentAge} max={params.retirementAge} onChange={(v) => update("stopContribAge", v)} suffix=" yrs" />
            </div>
            <div className="sim-card">
              <div className="sim-section-title">Market Assumptions</div>
              <InputField label="Expected Return (Accum.)" value={params.returnRate} min={0.02} max={0.20} step={0.005} onChange={(v) => update("returnRate", v)} format={(v) => (v * 100).toFixed(1) + "%"} />
              <InputField label="Volatility (Accum.)" value={params.stdDev} min={0.02} max={0.35} step={0.005} onChange={(v) => update("stdDev", v)} format={(v) => (v * 100).toFixed(1) + "%"} />
              <InputField label="Expected Return (Retire)" value={params.retireReturn} min={0.02} max={0.15} step={0.005} onChange={(v) => update("retireReturn", v)} format={(v) => (v * 100).toFixed(1) + "%"} />
              <InputField label="Volatility (Retire)" value={params.retireStdDev} min={0.02} max={0.20} step={0.005} onChange={(v) => update("retireStdDev", v)} format={(v) => (v * 100).toFixed(1) + "%"} />
              <InputField label="Inflation" value={params.inflation} min={0.01} max={0.08} step={0.005} onChange={(v) => update("inflation", v)} format={(v) => (v * 100).toFixed(1) + "%"} />
            </div>
            <div className="sim-card">
              <div className="sim-section-title">Retirement Income</div>
              <InputField label="After-Tax Income Need" value={params.incomeNeedAfterTax} min={20000} max={500000} step={5000} onChange={(v) => update("incomeNeedAfterTax", v)} format={(v) => "$" + v.toLocaleString()} />
              <InputField label="Other Income (SS, etc.)" value={params.otherIncome} min={0} max={200000} step={2000} onChange={(v) => update("otherIncome", v)} format={(v) => "$" + v.toLocaleString()} />
              <InputField label="Effective Tax Rate" value={params.taxRate} min={0} max={0.40} step={0.01} onChange={(v) => update("taxRate", v)} format={(v) => (v * 100).toFixed(0) + "%"} />
              <div className="mt-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] text-white/35">Pre-tax income need</span>
                  <span className="text-[13px] text-white/70" style={{ fontFamily: "var(--font-display)" }}>{"$" + Math.round(preTexIncome).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-white/35">Portfolio withdrawal</span>
                  <span className="text-[13px]" style={{ fontFamily: "var(--font-display)", color: "var(--sim-accent)" }}>{"$" + Math.round(portfolioIncome).toLocaleString() + "/yr"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5 sim-fade-in">
            <div className="flex gap-5 flex-wrap items-stretch">
              <div className="sim-card flex flex-col items-center justify-center min-w-[220px]">
                <div className="sim-section-title mb-2">Success Probability</div>
                <SuccessGauge rate={result.successRate} />
                <div className="text-[11px] text-white/30 mt-1">{result.numRuns - result.failures} of {result.numRuns} scenarios survive</div>
              </div>
              <div className="flex flex-col gap-3 flex-1 min-w-[300px]">
                <div className="flex gap-3 flex-wrap">
                  <StatCard label="Median Ending" value={fmt(medianEnd)} sub={"at age " + params.endAge} />
                  <StatCard label="10th Pct" value={fmt(result.stats[result.stats.length - 1]?.p10 ?? 0)} sub="Bear case" />
                  <StatCard label="90th Pct" value={fmt(result.stats[result.stats.length - 1]?.p90 ?? 0)} sub="Bull case" />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <StatCard label="Portfolio @ Retire" value={fmt(retireMedian)} sub={"age " + params.retirementAge + " median"} />
                  <StatCard label="Annual Withdrawal" value={"$" + Math.round(portfolioIncome).toLocaleString()} sub={withdrawalRate + "% withdrawal rate"} />
                  <StatCard label="Real Return" value={((params.returnRate - params.inflation) * 100).toFixed(1) + "%"} sub="After inflation (accum)" />
                </div>
              </div>
            </div>
            <div className="sim-card" style={{ padding: "20px 16px 12px" }}>
              <div className="flex justify-between items-baseline mb-3 px-2">
                <div className="sim-section-title" style={{ marginBottom: 0 }}>Portfolio Projection</div>
                <div className="flex gap-4 text-[10px] text-white/30">
                  <span><span className="inline-block w-5 h-0.5 bg-[#63c8aa] mr-1 align-middle" /> Median</span>
                  <span><span className="inline-block w-3 h-3 bg-[rgba(99,200,170,0.15)] mr-1 align-middle rounded-sm" /> 25-75th</span>
                  <span><span className="inline-block w-3 h-3 bg-[rgba(99,200,170,0.06)] mr-1 align-middle rounded-sm" /> 5-95th</span>
                </div>
              </div>
              <FanChart stats={result.stats} retirementAge={params.retirementAge} samplePaths={result.samplePaths} />
            </div>
            <div className="sim-card">
              <div className="sim-section-title">Portfolio by Age (Percentiles)</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[12px]" style={{ fontFamily: "var(--font-body)" }}>
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {["Age", "5th", "25th", "Median", "75th", "95th"].map((h) => (
                        <th key={h} className="py-2 px-3 font-normal text-[10px] tracking-wider uppercase text-white/35"
                          style={{ textAlign: h === "Age" ? "left" : "right" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.stats.filter((s) => s.age % 5 === 0 || s.age === params.retirementAge || s.age === params.endAge).map((s) => (
                      <tr key={s.age} className="border-b border-white/[0.03]"
                        style={{ background: s.age === params.retirementAge ? "rgba(255,200,100,0.03)" : "transparent" }}>
                        <td className="py-2 px-3" style={{ color: s.age === params.retirementAge ? "#ffc864" : "rgba(255,255,255,0.6)" }}>
                          {s.age}{s.age === params.retirementAge ? " \u2605" : ""}</td>
                        {(["p5", "p25", "p50", "p75", "p95"] as const).map((k) => (
                          <td key={k} className="py-2 px-3 text-right" style={{
                            color: s[k] < 0 ? "#ef4444" : k === "p50" ? "#f0f0f0" : "rgba(255,255,255,0.45)",
                            fontFamily: k === "p50" ? "var(--font-display)" : "var(--font-body)" }}>{fmt(s[k])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="text-[13px] text-white/40 leading-relaxed px-1">
              This simulator uses Monte Carlo analysis with normally distributed returns. This tool is for educational purposes only and does not constitute financial advice. Errors or omissions may occur. Any forward-looking statements involve risks and uncertainties that may cause actual results to differ materially. Past performance is not indicative of future results. Do your own research and consult a qualified, licensed adviser who understands your circumstances before acting on this content.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
