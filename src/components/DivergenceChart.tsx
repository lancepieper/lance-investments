"use client";

interface DivergenceChartProps {
  months: string[];
  gold: number[];
  yields: number[];
  goldChange: string;
  yieldChange: string;
}

export default function DivergenceChart({ months, gold, yields, goldChange, yieldChange }: DivergenceChartProps) {
  const w = 620, h = 220;
  const m = { l: 48, r: 48, t: 16, b: 32 };
  const iw = w - m.l - m.r;
  const ih = h - m.t - m.b;

  const goldMin = Math.min(...gold) * 0.9;
  const goldMax = Math.max(...gold) * 1.05;
  const yieldMin = Math.min(...yields) - 0.15;
  const yieldMax = Math.max(...yields) + 0.15;

  const goldToY = (v: number) => m.t + ih - ((v - goldMin) / (goldMax - goldMin)) * ih;
  const yieldToY = (v: number) => m.t + ih - ((v - yieldMin) / (yieldMax - yieldMin)) * ih;
  const toX = (i: number) => m.l + (i / (months.length - 1)) * iw;

  const goldPath = gold.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${goldToY(v).toFixed(1)}`).join(" ");
  const yieldPath = yields.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${yieldToY(v).toFixed(1)}`).join(" ");

  const areaPath = gold.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${goldToY(v).toFixed(1)}`).join(" ")
    + yields.slice().reverse().map((v, i) => `L${toX(months.length - 1 - i).toFixed(1)},${yieldToY(v).toFixed(1)}`).join("")
    + "Z";

  const firstGold = gold[0];
  const lastGold = gold[gold.length - 1];
  const firstYield = yields[0];
  const lastYield = yields[yields.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = m.t + ih * (1 - pct);
          return <line key={i} x1={m.l} x2={w - m.r} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />;
        })}

        {/* Divergence fill */}
        <path d={areaPath} fill="rgba(212,168,75,0.06)" />

        {/* Gold line */}
        <path d={goldPath} fill="none" stroke="#d4a84b" strokeWidth={2.5} />
        {/* Yield line */}
        <path d={yieldPath} fill="none" stroke="#6b7280" strokeWidth={2} strokeDasharray="6,3" />

        {/* Month labels */}
        {months.map((label, i) => (
          i % 2 === 0 && (
            <text key={i} x={toX(i)} y={h - 8} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="var(--font-geist-mono, monospace)">{label}</text>
          )
        ))}

        {/* Left axis: Gold */}
        <text x={m.l - 6} y={goldToY(lastGold) + 4} textAnchor="end" fill="#d4a84b" fontSize={9} fontFamily="var(--font-geist-mono, monospace)">${lastGold.toLocaleString()}</text>
        <text x={m.l - 6} y={goldToY(firstGold) + 4} textAnchor="end" fill="#d4a84b" fontSize={9} fontFamily="var(--font-geist-mono, monospace)">${firstGold.toLocaleString()}</text>
        <text x={m.l - 6} y={m.t - 4} textAnchor="end" fill="#d4a84b" fontSize={8} fontFamily="var(--font-geist-mono, monospace)">GOLD</text>

        {/* Right axis: Yield */}
        <text x={w - m.r + 6} y={yieldToY(lastYield) + 4} textAnchor="start" fill="#6b7280" fontSize={9} fontFamily="var(--font-geist-mono, monospace)">{lastYield.toFixed(2)}%</text>
        <text x={w - m.r + 6} y={yieldToY(firstYield) + 4} textAnchor="start" fill="#6b7280" fontSize={9} fontFamily="var(--font-geist-mono, monospace)">{firstYield.toFixed(2)}%</text>
        <text x={w - m.r + 6} y={m.t - 4} textAnchor="start" fill="#6b7280" fontSize={8} fontFamily="var(--font-geist-mono, monospace)">10Y</text>

        {/* Annotations */}
        <text x={toX(8)} y={goldToY(gold[8]) - 12} textAnchor="middle" fill="rgba(212,168,75,0.5)" fontSize={10} fontFamily="var(--font-geist-mono, monospace)">
          {goldChange} ↑
        </text>
        <text x={toX(8)} y={yieldToY(yields[8]) + 18} textAnchor="middle" fill="rgba(107,114,128,0.6)" fontSize={10} fontFamily="var(--font-geist-mono, monospace)">
          {yieldChange} →
        </text>
      </svg>
      <div className="flex justify-center gap-5 text-[11px] text-gray-500 mt-1">
        <span><span className="text-gold-400">━</span> Gold (left)</span>
        <span><span className="text-gray-500">╌╌</span> 10Y Yield (right)</span>
        <span className="text-gold-400/40">▓ Divergence</span>
      </div>
    </div>
  );
}
