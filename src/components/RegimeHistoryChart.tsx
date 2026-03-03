"use client";

import { useRef, useState, useEffect } from "react";
import * as d3 from "d3";

interface HistoryPoint {
  date: string;
  tier1_score: number;
  tier2_score: number;
  tier3_score: number;
  regime_status: string;
}

const TIERS = [
  { key: "tier1_score" as const, color: "#ef4444", label: "Tier 1 — Primary" },
  { key: "tier2_score" as const, color: "#d4a84b", label: "Tier 2 — Confirming" },
  { key: "tier3_score" as const, color: "#8faadc", label: "Tier 3 — Structural" },
];

export default function RegimeHistoryChart({ history }: { history: HistoryPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 700, h: 320 });

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 100) setDims({ w: width, h: Math.min(360, Math.max(240, width * 0.4)) });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!history.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 16, right: 20, bottom: 36, left: 40 };
    const w = dims.w - margin.left - margin.right;
    const h = dims.h - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");
    const data = history.map((d) => ({ ...d, parsedDate: parseDate(d.date)! }));

    const x = d3.scaleTime()
      .domain(d3.extent(data, (d) => d.parsedDate) as [Date, Date])
      .range([0, w]);

    const yMax = Math.max(
      d3.max(data, (d) => d.tier1_score) ?? 10,
      d3.max(data, (d) => d.tier2_score) ?? 14,
      d3.max(data, (d) => d.tier3_score) ?? 10,
      6
    ) * 1.15;

    const y = d3.scaleLinear().domain([0, yMax]).range([h, 0]);

    // Grid lines
    y.ticks(5).forEach((t) => {
      g.append("line")
        .attr("x1", 0).attr("x2", w)
        .attr("y1", y(t)).attr("y2", y(t))
        .attr("stroke", "rgba(255,255,255,0.04)")
        .attr("stroke-dasharray", "2,4");
    });

    // Draw lines for each tier
    TIERS.forEach(({ key, color }) => {
      const line = d3.line<(typeof data)[0]>()
        .x((d) => x(d.parsedDate))
        .y((d) => y(d[key]))
        .curve(d3.curveMonotoneX);

      // Area fill (subtle)
      const area = d3.area<(typeof data)[0]>()
        .x((d) => x(d.parsedDate))
        .y0(h)
        .y1((d) => y(d[key]))
        .curve(d3.curveMonotoneX);
      g.append("path").datum(data).attr("d", area)
        .attr("fill", color).attr("opacity", 0.04);

      // Line
      const path = g.append("path").datum(data).attr("d", line)
        .attr("fill", "none").attr("stroke", color)
        .attr("stroke-width", 2).attr("opacity", 0.85);

      // Animate line drawing
      const totalLen = (path.node() as SVGPathElement)?.getTotalLength() ?? 0;
      if (totalLen > 0) {
        path.attr("stroke-dasharray", totalLen).attr("stroke-dashoffset", totalLen)
          .transition().duration(1000).attr("stroke-dashoffset", 0);
      }

      // Dots for each data point (if few enough)
      if (data.length <= 60) {
        g.selectAll(`.dot-${key}`).data(data).enter()
          .append("circle")
          .attr("cx", (d) => x(d.parsedDate))
          .attr("cy", (d) => y(d[key]))
          .attr("r", data.length <= 10 ? 3.5 : 2)
          .attr("fill", color)
          .attr("opacity", 0.7);
      }
    });

    // X axis
    const xAxis = d3.axisBottom(x)
      .ticks(Math.min(8, data.length))
      .tickFormat((d) => d3.timeFormat("%b %d")(d as Date));
    g.append("g").attr("transform", `translate(0,${h})`).call(xAxis)
      .call((g) => g.select(".domain").attr("stroke", "rgba(255,255,255,0.1)"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.06)"))
      .call((g) => g.selectAll(".tick text").attr("fill", "rgba(255,255,255,0.4)")
        .style("font-size", "10px").style("font-family", "var(--font-body)"));

    // Y axis
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat((d) => String(d));
    g.append("g").call(yAxis)
      .call((g) => g.select(".domain").attr("stroke", "rgba(255,255,255,0.1)"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.06)"))
      .call((g) => g.selectAll(".tick text").attr("fill", "rgba(255,255,255,0.4)")
        .style("font-size", "10px").style("font-family", "var(--font-body)"));

    // Tooltip overlay
    const tooltip = g.append("g").style("display", "none");
    tooltip.append("line")
      .attr("y1", 0).attr("y2", h)
      .attr("stroke", "rgba(255,255,255,0.15)").attr("stroke-width", 1);
    const tooltipBg = tooltip.append("rect")
      .attr("fill", "rgba(15,27,61,0.95)").attr("stroke", "rgba(22,37,82,1)")
      .attr("rx", 4).attr("ry", 4);
    const tooltipText = tooltip.append("text")
      .attr("fill", "rgba(255,255,255,0.8)").style("font-size", "10px")
      .style("font-family", "var(--font-mono, monospace)");

    svg.on("mousemove", (event) => {
      const [mx] = d3.pointer(event, g.node());
      if (mx < 0 || mx > w) { tooltip.style("display", "none"); return; }
      const x0 = x.invert(mx);
      const bisect = d3.bisector((d: (typeof data)[0]) => d.parsedDate).left;
      const idx = Math.min(bisect(data, x0, 1), data.length - 1);
      const d = data[idx];
      if (!d) return;
      tooltip.style("display", null);
      tooltip.select("line").attr("x1", x(d.parsedDate)).attr("x2", x(d.parsedDate));
      const lines = [
        d.date,
        `T1: ${d.tier1_score}  T2: ${d.tier2_score}  T3: ${d.tier3_score}`,
      ];
      tooltipText.selectAll("tspan").remove();
      lines.forEach((line, i) => {
        tooltipText.append("tspan")
          .attr("x", x(d.parsedDate) + 8).attr("dy", i === 0 ? 0 : 14)
          .text(line);
      });
      const bbox = (tooltipText.node() as SVGTextElement)?.getBBox();
      if (bbox) {
        const tx = x(d.parsedDate) + 4;
        const flip = tx + bbox.width + 16 > w;
        const ttx = flip ? x(d.parsedDate) - bbox.width - 16 : tx;
        tooltipBg.attr("x", ttx).attr("y", 4)
          .attr("width", bbox.width + 16).attr("height", bbox.height + 10);
        tooltipText.selectAll("tspan").attr("x", ttx + 8);
        tooltipText.attr("y", 16);
      }
    }).on("mouseleave", () => tooltip.style("display", "none"));

  }, [history, dims]);

  return (
    <div>
      <div ref={containerRef} style={{ width: "100%" }}>
        <svg ref={svgRef} width={dims.w} height={dims.h} />
      </div>
      <div className="mt-3 flex justify-center gap-6">
        {TIERS.map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
