"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import * as d3 from "d3";

/* ---------- types ---------- */
interface SimParams {
  initialPortfolio: number;
  annualContribution: number;
  annualWithdrawal: number;
  yearsAccumulation: number;
  yearsDistribution: number;
  meanReturn: number;
  volatility: number;
  inflationRate: number;
  simulations: number;
}

interface SimResult {
  paths: number[][];
  percentiles: { p10: number[]; p25: number[]; p50: number[]; p75: number[]; p90: number[] };
  successRate: number;
  totalYears: number;
}

/* ---------- defaults ---------- */
const DEFAULT_PARAMS: SimParams = {
  initialPortfolio: 500_000,
  annualContribution: 25_000,
  annualWithdrawal: 60_000,
  yearsAccumulation: 15,
  yearsDistribution: 30,
  meanReturn: 0.07,
  volatility: 0.15,
  inflationRate: 0.03,
  simulations: 1_000,
};

/* ---------- simulation engine ---------- */
function runSimulation(params: SimParams): SimResult {
  const {
    initialPortfolio,
    annualContribution,
    annualWithdrawal,
    yearsAccumulation,
    yearsDistribution,
    meanReturn,
    volatility,
    inflationRate,
    simulations,
  } = params;

  const totalYears = yearsAccumulation + yearsDistribution;
  const paths: number[][] = [];

  for (let s = 0; s < simulations; s++) {
    const path: number[] = [initialPortfolio];
    let balance = initialPortfolio;

    for (let y = 1; y <= totalYears; y++) {
      const z = d3.randomNormal(0, 1)();
      const annualReturn = meanReturn + volatility * z;
      const inflationAdj = Math.pow(1 + inflationRate, y);

      if (y <= yearsAccumulation) {
        balance = balance * (1 + annualReturn) + annualContribution * inflationAdj;
      } else {
        balance = balance * (1 + annualReturn) - annualWithdrawal * inflationAdj;
      }

      path.push(Math.max(balance, 0));
    }

    paths.push(path);
  }

  // Compute percentiles at each year
  const percentiles = {
    p10: [] as number[],
    p25: [] as number[],
    p50: [] as number[],
    p75: [] as number[],
    p90: [] as number[],
  };

  for (let y = 0; y <= totalYears; y++) {
    const values = paths.map((p) => p[y]).sort((a, b) => a - b);
    percentiles.p10.push(d3.quantile(values, 0.1) ?? 0);
    percentiles.p25.push(d3.quantile(values, 0.25) ?? 0);
    percentiles.p50.push(d3.quantile(values, 0.5) ?? 0);
    percentiles.p75.push(d3.quantile(values, 0.75) ?? 0);
    percentiles.p90.push(d3.quantile(values, 0.9) ?? 0);
  }

  const successRate =
    paths.filter((p) => p[totalYears] > 0).length / simulations;

  return { paths, percentiles, successRate, totalYears };
}

/* ---------- chart ---------- */
function Chart({ result, accYears }: { result: SimResult; accYears: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    const width = container?.clientWidth ?? 700;
    const height = 420;
    const margin = { top: 20, right: 30, bottom: 50, left: 80 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3
      .scaleLinear()
      .domain([0, result.totalYears])
      .range([margin.left, width - margin.right]);

    const yMax = d3.max(result.percentiles.p90) ?? 1;
    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .range([height - margin.bottom, margin.top]);

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(Math.min(result.totalYears, 15)).tickFormat((d) => `Yr ${d}`))
      .call((g) => g.select(".domain").attr("stroke", "#334155"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "#334155"))
      .call((g) => g.selectAll(".tick text").attr("fill", "#94a3b8").attr("font-size", "11px"));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickFormat((d) => {
            const v = d as number;
            if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
            if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
            return `$${v}`;
          })
      )
      .call((g) => g.select(".domain").attr("stroke", "#334155"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "#334155"))
      .call((g) => g.selectAll(".tick text").attr("fill", "#94a3b8").attr("font-size", "11px"));

    // Phase divider line
    if (accYears > 0 && accYears < result.totalYears) {
      svg
        .append("line")
        .attr("x1", x(accYears))
        .attr("x2", x(accYears))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#d4a84b")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "6,4")
        .attr("opacity", 0.6);

      svg
        .append("text")
        .attr("x", x(accYears))
        .attr("y", margin.top - 6)
        .attr("text-anchor", "middle")
        .attr("fill", "#d4a84b")
        .attr("font-size", "10px")
        .text("Retirement");
    }

    // Helper for area / line
    const area = (
      upper: number[],
      lower: number[]
    ) =>
      d3
        .area<number>()
        .x((_, i) => x(i))
        .y0((_, i) => y(lower[i]))
        .y1((_, i) => y(upper[i]))
        .curve(d3.curveMonotoneX);

    const line = (data: number[]) =>
      d3
        .line<number>()
        .x((_, i) => x(i))
        .y((d) => y(d))
        .curve(d3.curveMonotoneX);

    // Confidence bands
    svg
      .append("path")
      .datum(d3.range(result.totalYears + 1))
      .attr("d", area(result.percentiles.p90, result.percentiles.p10)(d3.range(result.totalYears + 1)))
      .attr("fill", "#d4a84b")
      .attr("opacity", 0.08);

    svg
      .append("path")
      .datum(d3.range(result.totalYears + 1))
      .attr("d", area(result.percentiles.p75, result.percentiles.p25)(d3.range(result.totalYears + 1)))
      .attr("fill", "#d4a84b")
      .attr("opacity", 0.15);

    // Percentile lines
    const drawLine = (data: number[], color: string, opacity: number, dash?: string) => {
      const path = svg
        .append("path")
        .datum(data)
        .attr("d", line(data)(data))
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("opacity", opacity);
      if (dash) path.attr("stroke-dasharray", dash);
    };

    drawLine(result.percentiles.p10, "#94a3b8", 0.5, "4,3");
    drawLine(result.percentiles.p25, "#cbd5e1", 0.6);
    drawLine(result.percentiles.p50, "#d4a84b", 1);
    drawLine(result.percentiles.p75, "#cbd5e1", 0.6);
    drawLine(result.percentiles.p90, "#94a3b8", 0.5, "4,3");

    // Sample paths (first 30, very faint)
    const samplePaths = result.paths.slice(0, 30);
    samplePaths.forEach((path) => {
      svg
        .append("path")
        .datum(path)
        .attr("d", line(path)(path))
        .attr("fill", "none")
        .attr("stroke", "#60a5fa")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.08);
    });

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 10},${margin.top + 10})`);

    const items = [
      { label: "Median (P50)", color: "#d4a84b", dash: "" },
      { label: "P25 / P75", color: "#cbd5e1", dash: "" },
      { label: "P10 / P90", color: "#94a3b8", dash: "4,3" },
    ];

    items.forEach((item, i) => {
      const g = legend.append("g").attr("transform", `translate(0,${i * 18})`);
      const l = g
        .append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", item.color)
        .attr("stroke-width", 2);
      if (item.dash) l.attr("stroke-dasharray", item.dash);
      g.append("text")
        .attr("x", 26)
        .attr("y", 4)
        .attr("fill", "#94a3b8")
        .attr("font-size", "11px")
        .text(item.label);
    });
  }, [result, accYears]);

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="w-full" style={{ minWidth: 500 }} />
    </div>
  );
}

/* ---------- helpers ---------- */
function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

/* ---------- input field ---------- */
function Field({
  label,
  value,
  onChange,
  type = "number",
  step,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  type?: string;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-1">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          max={max}
          className="w-full rounded border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
        />
        {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
      </div>
    </label>
  );
}

/* ---------- main component ---------- */
export default function FinancialSimulator() {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [result, setResult] = useState<SimResult | null>(null);
  const [running, setRunning] = useState(false);

  const update = useCallback(
    (key: keyof SimParams, value: number) =>
      setParams((prev) => ({ ...prev, [key]: value })),
    []
  );

  const run = useCallback(() => {
    setRunning(true);
    // Give the UI a tick to show loading state
    requestAnimationFrame(() => {
      const r = runSimulation(params);
      setResult(r);
      setRunning(false);
    });
  }, [params]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
          Monte Carlo Financial Simulator
        </h1>
        <p className="mt-3 max-w-2xl text-gray-400 leading-relaxed">
          Model thousands of potential market outcomes using Monte Carlo
          simulation. Set your portfolio parameters below, then run the
          simulation to visualize the range of possible outcomes across
          accumulation and distribution phases.
        </p>
      </div>

      {/* Input grid */}
      <div className="grid gap-6 rounded-lg border border-navy-800 bg-navy-900/60 p-6 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label="Initial Portfolio"
          value={params.initialPortfolio}
          onChange={(v) => update("initialPortfolio", v)}
          step={10000}
          min={0}
        />
        <Field
          label="Annual Contribution"
          value={params.annualContribution}
          onChange={(v) => update("annualContribution", v)}
          step={1000}
          min={0}
        />
        <Field
          label="Annual Withdrawal"
          value={params.annualWithdrawal}
          onChange={(v) => update("annualWithdrawal", v)}
          step={1000}
          min={0}
        />
        <Field
          label="Accumulation Years"
          value={params.yearsAccumulation}
          onChange={(v) => update("yearsAccumulation", v)}
          step={1}
          min={0}
          max={60}
        />
        <Field
          label="Distribution Years"
          value={params.yearsDistribution}
          onChange={(v) => update("yearsDistribution", v)}
          step={1}
          min={1}
          max={60}
        />
        <Field
          label="Expected Return"
          value={params.meanReturn}
          onChange={(v) => update("meanReturn", v)}
          step={0.01}
          min={-0.2}
          max={0.3}
          suffix="(decimal)"
        />
        <Field
          label="Volatility (Std Dev)"
          value={params.volatility}
          onChange={(v) => update("volatility", v)}
          step={0.01}
          min={0}
          max={0.5}
          suffix="(decimal)"
        />
        <Field
          label="Inflation Rate"
          value={params.inflationRate}
          onChange={(v) => update("inflationRate", v)}
          step={0.005}
          min={0}
          max={0.15}
          suffix="(decimal)"
        />
        <Field
          label="Simulations"
          value={params.simulations}
          onChange={(v) => update("simulations", Math.min(v, 10_000))}
          step={100}
          min={100}
          max={10000}
        />
      </div>

      {/* Run button */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={run}
          disabled={running}
          className="rounded-lg bg-gold-500 px-8 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
        >
          {running ? "Running\u2026" : "Run Simulation"}
        </button>
        {result && (
          <span className="text-sm text-gray-500">
            {params.simulations.toLocaleString()} simulations &middot;{" "}
            {result.totalYears} years
          </span>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="mt-10 space-y-8">
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Success Rate"
              value={pct(result.successRate)}
              sub="portfolio survives distribution"
              highlight={result.successRate >= 0.9}
            />
            <StatCard
              label="Median Final Balance"
              value={fmt(result.percentiles.p50[result.totalYears])}
              sub="50th percentile"
            />
            <StatCard
              label="Worst-Case (P10)"
              value={fmt(result.percentiles.p10[result.totalYears])}
              sub="10th percentile"
            />
            <StatCard
              label="Best-Case (P90)"
              value={fmt(result.percentiles.p90[result.totalYears])}
              sub="90th percentile"
            />
          </div>

          {/* Chart */}
          <div className="rounded-lg border border-navy-800 bg-navy-900/40 p-4">
            <Chart result={result} accYears={params.yearsAccumulation} />
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            This simulator uses geometric Brownian motion with normally
            distributed annual returns. Results are hypothetical and do not
            represent actual investment performance. Past performance does not
            guarantee future results. Consult a financial professional before
            making investment decisions.
          </p>
        </div>
      )}
    </section>
  );
}

/* ---------- stat card ---------- */
function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-navy-800 bg-navy-900/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold ${
          highlight ? "text-green-400" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-gray-600">{sub}</p>
    </div>
  );
}
