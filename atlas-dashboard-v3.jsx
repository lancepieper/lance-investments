import { useState } from "react";

const C = {
  navy950: "#0a1128", navy900: "#0f1b3d", navy800: "#162552",
  navy700: "#1d3268", gold400: "#d4a84b", gold500: "#c9952e",
};

// ── Primitives ──────────────────────────────────────────

function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 10, textTransform: "uppercase", letterSpacing: 3,
      color: C.gold400, fontWeight: 500, marginBottom: 16, ...style,
    }}>{children}</div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      borderRadius: 8, border: `1px solid ${C.navy800}`,
      background: `${C.navy900}99`, padding: 24, ...style,
    }}>{children}</div>
  );
}

function TierBarCompact({ label, score, max }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const fill = pct >= 60 ? "#ef4444" : pct >= 30 ? "#f59e0b" : "#10b981";
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#6b7280" }}>{label}</span>
        <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#e5e7eb" }}>{score}<span style={{ color: "#6b7280", fontWeight: 400 }}>/{max}</span></span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: C.navy800 }}>
        <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: fill, opacity: 0.7 }} />
      </div>
    </div>
  );
}

function IndicatorRow({ num, name, score, notes }) {
  const sc = score ?? -1;
  const color = sc === 2 ? "#f87171" : sc === 1 ? "#fbbf24" : "#6b7280";
  const bg = sc === 2 ? "rgba(239,68,68,0.1)" : sc === 1 ? "rgba(245,158,11,0.1)" : "rgba(22,37,82,0.6)";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.navy800}40` }}>
      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color, background: bg, padding: "1px 8px", borderRadius: 4, minWidth: 28, textAlign: "center" }}>{score ?? "—"}</span>
      <div>
        <span style={{ fontSize: 13, color: "#d1d5db" }}><span style={{ color: "#6b7280", fontFamily: "monospace", fontSize: 11 }}>#{num} </span>{name}</span>
        <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace", marginTop: 2 }}>{notes}</div>
      </div>
    </div>
  );
}

// ── Gold/Treasury Divergence Chart ──────────────────────

function DivergenceChart() {
  const w = 620, h = 220;
  const m = { l: 48, r: 48, t: 16, b: 32 };
  const iw = w - m.l - m.r, ih = h - m.t - m.b;

  // Simulated 12-month data: gold price and 10Y yield
  const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const gold =   [2050, 2120, 2180, 2250, 2320, 2400, 2500, 2580, 2650, 2750, 2820, 2900];
  const yields = [4.28, 4.35, 4.40, 4.38, 4.32, 4.30, 4.28, 4.25, 4.22, 4.28, 4.26, 4.25];

  const goldMin = 1900, goldMax = 3100;
  const yieldMin = 3.8, yieldMax = 4.6;

  const goldToY = (v) => m.t + ih - ((v - goldMin) / (goldMax - goldMin)) * ih;
  const yieldToY = (v) => m.t + ih - ((v - yieldMin) / (yieldMax - yieldMin)) * ih;
  const toX = (i) => m.l + (i / (months.length - 1)) * iw;

  const goldPath = gold.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${goldToY(v)}`).join(" ");
  const yieldPath = yields.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${yieldToY(v)}`).join(" ");

  // Shade the divergence area
  const areaPath = gold.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${goldToY(v)}`).join(" ")
    + yields.slice().reverse().map((v, i) => `L${toX(months.length - 1 - i)},${yieldToY(v)}`).join("")
    + "Z";

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
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

        {/* Labels */}
        {months.map((label, i) => (
          i % 2 === 0 && <text key={i} x={toX(i)} y={h - 8} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="monospace">{label}</text>
        ))}

        {/* Left axis: Gold */}
        <text x={m.l - 6} y={goldToY(2900) + 4} textAnchor="end" fill="#d4a84b" fontSize={9} fontFamily="monospace">$2,900</text>
        <text x={m.l - 6} y={goldToY(2050) + 4} textAnchor="end" fill="#d4a84b" fontSize={9} fontFamily="monospace">$2,050</text>
        <text x={m.l - 6} y={m.t - 4} textAnchor="end" fill="#d4a84b" fontSize={8} fontFamily="monospace">GOLD</text>

        {/* Right axis: Yield */}
        <text x={w - m.r + 6} y={yieldToY(4.25) + 4} textAnchor="start" fill="#6b7280" fontSize={9} fontFamily="monospace">4.25%</text>
        <text x={w - m.r + 6} y={yieldToY(4.35) + 4} textAnchor="start" fill="#6b7280" fontSize={9} fontFamily="monospace">4.35%</text>
        <text x={w - m.r + 6} y={m.t - 4} textAnchor="start" fill="#6b7280" fontSize={8} fontFamily="monospace">10Y</text>

        {/* Annotation */}
        <text x={toX(8)} y={goldToY(2700) - 12} textAnchor="middle" fill="rgba(212,168,75,0.5)" fontSize={10} fontFamily="monospace">
          +41% ↑
        </text>
        <text x={toX(8)} y={yieldToY(4.30) + 18} textAnchor="middle" fill="rgba(107,114,128,0.6)" fontSize={10} fontFamily="monospace">
          −0.03% →
        </text>
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, fontSize: 11, color: "#6b7280", marginTop: 4 }}>
        <span><span style={{ color: C.gold400 }}>━</span> Gold (left)</span>
        <span><span style={{ color: "#6b7280" }}>╌╌</span> 10Y Yield (right)</span>
        <span style={{ color: "rgba(212,168,75,0.4)" }}>▓ Divergence</span>
      </div>
    </div>
  );
}

// ── Track Record Timeline ───────────────────────────────

function TrackRecord() {
  const events = [
    { year: "1971–73", label: "Nixon Shock", signal: "Elevated → Transition", lead: "6 months early", result: "Gold +375% over next 3 years", grade: "B+" },
    { year: "2008–09", label: "Global Financial Crisis", signal: "Elevated → Transition", lead: "3 months before QE1", result: "Gold +170% from crisis to peak", grade: "A−" },
    { year: "2020", label: "COVID Monetary Flood", signal: "Elevated at onset", lead: "Real-time detection", result: "Gold +30%, BTC +1,692% from lows", grade: "A" },
  ];
  const falsePos = [
    { year: "2015–16", label: "Gold rally", result: "Framework stayed silent ✓" },
    { year: "2013–15", label: "Gold bear market", result: "No false Elevated ✓" },
    { year: "2018", label: "Fed tightening", result: "No false signal ✓" },
    { year: "1998", label: "LTCM crisis", result: "Correctly filtered ✓" },
    { year: "2022–23", label: "SVB banking stress", result: "Brief signal, self-corrected ✓" },
    { year: "Japan", label: "30-year expansion", result: "Right on direction, open on timing" },
  ];

  return (
    <div>
      <div style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.7, marginBottom: 20 }}>
        Applied retroactively across nine historical periods, the framework identified every major regime transition 3–6 months early with near-zero false positives.
      </div>

      {/* Confirmed signals */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Confirmed Transitions
        </div>
        {events.map((e, i) => (
          <div key={i} style={{
            display: "flex", gap: 16, alignItems: "flex-start",
            padding: "12px 16px", marginBottom: 8, borderRadius: 6,
            background: `${C.navy800}40`, borderLeft: "3px solid #10b981",
          }}>
            <div style={{ minWidth: 70 }}>
              <div style={{ fontFamily: "monospace", fontSize: 13, color: C.gold400, fontWeight: 600 }}>{e.year}</div>
              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{e.lead}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>{e.label}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{e.signal} → {e.result}</div>
            </div>
            <div style={{
              fontFamily: "monospace", fontSize: 14, fontWeight: 700,
              color: C.gold400, minWidth: 28, textAlign: "right",
            }}>{e.grade}</div>
          </div>
        ))}
      </div>

      {/* False positive tests */}
      <div>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Adversarial Tests — Periods Where the Framework Should Not Fire
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {falsePos.map((e, i) => (
            <div key={i} style={{
              padding: "10px 12px", borderRadius: 6,
              background: `${C.navy800}30`, border: `1px solid ${C.navy800}60`,
            }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#9ca3af" }}>{e.year}</div>
              <div style={{ fontSize: 12, color: "#d1d5db", marginTop: 2 }}>{e.label}</div>
              <div style={{ fontSize: 11, color: "#10b981", marginTop: 4 }}>{e.result}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Regime History Chart ────────────────────────────────

function RegimeChart() {
  const w = 620, h = 160;
  const m = { l: 36, r: 12, t: 8, b: 24 };
  const iw = w - m.l - m.r, ih = h - m.t - m.b;
  const days = 30;
  const t1 = Array.from({ length: days }, (_, i) => 4 + Math.sin(i / 5) * 1.5 + (i / days) * 1.2);
  const t2 = Array.from({ length: days }, (_, i) => 2 + Math.cos(i / 7) * 1 + (i / days) * 0.8);
  const t3 = Array.from({ length: days }, (_, i) => 3 + Math.sin(i / 4 + 1) * 0.8 + (i / days) * 0.5);
  const yMax = 12;
  const toPath = (data) => data.map((v, i) => {
    const x = m.l + (i / (days - 1)) * iw;
    const y = m.t + ih - (v / yMax) * ih;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      {[0, 4, 8, 12].map((v, i) => {
        const y = m.t + ih - (v / yMax) * ih;
        return <g key={i}><line x1={m.l} x2={w - m.r} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" /><text x={m.l - 6} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize={9} fontFamily="monospace">{v}</text></g>;
      })}
      <path d={toPath(t1)} fill="none" stroke="#ef4444" strokeWidth={1.5} opacity={0.8} />
      <path d={toPath(t2)} fill="none" stroke="#d4a84b" strokeWidth={1.5} opacity={0.8} />
      <path d={toPath(t3)} fill="none" stroke="#8faadc" strokeWidth={1.5} opacity={0.8} />
    </svg>
  );
}

// ── Main Dashboard ──────────────────────────────────────

export default function AtlasDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div style={{ background: C.navy950, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#f0f0f0" }}>
      {/* Header */}
      <div style={{
        padding: "14px 24px", borderBottom: `1px solid ${C.navy800}`,
        background: `${C.navy900}cc`, backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", gap: 32,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>lance<span style={{ color: C.gold400 }}>.investments</span></div>
        <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#9ca3af" }}>
          <span>Home</span><span>Blog</span><span>Investments</span>
          <span style={{ color: C.gold400, fontWeight: 500 }}>Atlas</span>
          <span>About</span>
        </div>
      </div>

      <div style={{ maxWidth: 740, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ═══════ REGIME STATUS + WHAT CHANGED ═══════ */}
        <div style={{ marginBottom: 40 }}>
          <SectionLabel>Atlas Regime Dashboard</SectionLabel>
          <div style={{
            display: "inline-block", padding: "14px 24px", borderRadius: 8,
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
            marginBottom: 16,
          }}>
            <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: "#fbbf24", letterSpacing: 1 }}>
              Regime 3 — Elevated
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", fontFamily: "monospace", marginBottom: 16 }}>March 2, 2026</div>

          {/* WHAT CHANGED */}
          <div style={{
            background: `${C.navy800}40`, borderRadius: 6, padding: "14px 18px",
            border: `1px solid ${C.navy800}`,
          }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: C.gold400, fontWeight: 500, marginBottom: 8 }}>
              What Changed Since Last Reading
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 13, color: "#d1d5db" }}>
                <span style={{ color: "#f87171", fontWeight: 600 }}>▲ NEW</span>{" "}
                DXY broke below 100 for the first time since mid-2024. Dollar weakness score escalated 0 → 1.
              </div>
              <div style={{ fontSize: 13, color: "#d1d5db" }}>
                <span style={{ color: "#f87171", fontWeight: 600 }}>▲ NEW</span>{" "}
                Commodity/Gold ratio collapsed 39% YoY — now scoring at maximum. This is a monetary signal, not inflation.
              </div>
              <div style={{ fontSize: 13, color: "#d1d5db" }}>
                <span style={{ color: "#fbbf24", fontWeight: 600 }}>→ HELD</span>{" "}
                Gold momentum and Gold/Treasury Divergence both remain at maximum intensity. No signs of weakening.
              </div>
            </div>
          </div>
        </div>

        {/* Tier bars */}
        <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
          <TierBarCompact label="Primary" score={5} max={10} />
          <TierBarCompact label="Confirming" score={3} max={14} />
          <TierBarCompact label="Structural" score={4} max={10} />
        </div>

        {/* ═══════ THE CONTRARIAN READ ═══════ */}
        <Card style={{ marginBottom: 32 }}>
          <SectionLabel>What the Consensus Is Missing</SectionLabel>
          <div style={{ fontSize: 15, color: "#d1d5db", lineHeight: 1.8 }}>
            <p style={{ marginBottom: 16 }}>
              Wall Street is framing gold's run as an inflation trade. <strong style={{ color: "#f0f0f0" }}>The framework says otherwise.</strong> If this were inflation, commodities would be running with gold — copper, oil, and the GSCI would be surging. Instead, the commodity/gold ratio has collapsed 39%. Gold is repricing against <em>everything</em>: stocks, bonds, and commodities alike.
            </p>
            <p style={{ marginBottom: 16 }}>
              This is a monetary confidence signal. Gold is telling you something about the monetary system itself, not about CPI prints. The last time gold posted 40%+ YoY gains while Treasury yields stayed flat was the early 1970s — after Nixon closed the gold window but before the market fully processed the implications.
            </p>
            <p>
              Meanwhile, the Fed is quietly expanding its balance sheet through $40B/month in short-duration purchases while publicly maintaining a tightening stance. The framework sees through the narrative to the mechanism: the balance sheet is growing, and the purchases are only "short duration" for now.
            </p>
          </div>
        </Card>

        {/* ═══════ GOLD/TREASURY DIVERGENCE — THE IP ═══════ */}
        <Card style={{ marginBottom: 32 }}>
          <SectionLabel>Gold/Treasury Divergence — The Framework's Core Signal</SectionLabel>
          <div style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, marginBottom: 16 }}>
            The single most predictive indicator in the framework. When gold surges and yields don't follow, the bond market is being artificially suppressed — either through direct purchases or implicit policy. This divergence preceded every major regime transition in the last 50 years.
          </div>
          <DivergenceChart />
          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 6,
            background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)",
            fontSize: 13, color: "#d1d5db", lineHeight: 1.6,
          }}>
            <strong style={{ color: "#fbbf24" }}>Current reading:</strong> Gold +41% YoY while 10Y yields are flat (−0.03%). The gold-colored area shows the divergence widening — gold is screaming while the bond market stays quiet. Historically, this gap closes violently: either yields spike to catch up (bad for bonds), or gold is proven right about debasement (bad for the monetary system).
          </div>
        </Card>

        {/* ═══════ FRAMEWORK VS. WALL STREET ═══════ */}
        <Card style={{ marginBottom: 32 }}>
          <SectionLabel>Framework vs. Consensus</SectionLabel>
          <div style={{ fontSize: 13 }}>
            {[
              { topic: "Gold's rally", wall: "Inflation hedge / geopolitical risk premium", atlas: "Monetary confidence erosion — confirmed by commodity/gold ratio collapse" },
              { topic: "Fed policy", wall: "Tightening cycle complete, cuts coming", atlas: "Stealth expansion: $40B/mo purchases, QT over. Direction matters more than rate level" },
              { topic: "Treasury market", wall: "Yields stable = market functioning", atlas: "Yields suppressed by Fed purchases. Auction demand masked. Real demand deteriorating" },
              { topic: "Dollar outlook", wall: "Structurally strong, reserve currency status intact", atlas: "DXY broke 100. Foreign official holders reducing. Early stage of reserve diversification" },
            ].map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "120px 1fr 1fr",
                gap: 16, padding: "14px 0",
                borderBottom: i < 3 ? `1px solid ${C.navy800}40` : "none",
              }}>
                <div style={{ fontWeight: 600, color: "#e5e7eb", fontSize: 13 }}>{row.topic}</div>
                <div>
                  <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Wall Street</div>
                  <div style={{ color: "#9ca3af", lineHeight: 1.5 }}>{row.wall}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.gold400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Atlas Framework</div>
                  <div style={{ color: "#d1d5db", lineHeight: 1.5 }}>{row.atlas}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ═══════ EMAIL GATE ═══════ */}
        {!unlocked && (
          <div style={{
            borderRadius: 8, border: `1px solid rgba(201,149,46,0.25)`,
            background: `linear-gradient(180deg, ${C.navy900}dd 0%, ${C.navy950}dd 100%)`,
            padding: "40px 32px", textAlign: "center", marginBottom: 32,
          }}>
            <div style={{ fontSize: 18, color: "#f0f0f0", fontWeight: 600, marginBottom: 6 }}>
              Positioning, Triggers, and Track Record
            </div>
            <div style={{ fontSize: 14, color: "#9ca3af", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.6 }}>
              What to do about this reading, the specific triggers that would escalate or de-escalate the regime, the framework's historical track record across nine back-tested periods, and the full 17-indicator evidence table.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", maxWidth: 400, margin: "0 auto" }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ flex: 1, padding: "10px 14px", borderRadius: 6, background: C.navy800, border: `1px solid ${C.navy700}`, color: "#f0f0f0", fontSize: 14, outline: "none" }}
              />
              <button onClick={() => setUnlocked(true)}
                style={{ padding: "10px 20px", borderRadius: 6, background: C.gold500, color: C.navy950, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
                Unlock →
              </button>
            </div>
          </div>
        )}

        {/* ═══════ GATED CONTENT ═══════ */}
        {unlocked && (
          <>
            {/* POSITIONING — with reasoning */}
            <Card style={{ marginBottom: 24 }}>
              <SectionLabel>What to Do About It</SectionLabel>
              <div style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.8 }}>
                <p style={{ marginBottom: 16 }}>
                  <strong style={{ color: "#f0f0f0" }}>Elevated is the building phase, not the panic phase.</strong> Historically, the transition from Elevated to Crisis takes 6–18 months, and the largest gains in gold, Bitcoin, and hard assets occur <em>during</em> the transition — not after crisis is confirmed. The investors who outperformed in 2009–2011 and 1972–1974 were positioned before the transition, not after.
                </p>
              </div>

              <div style={{ background: `${C.navy800}50`, borderRadius: 6, padding: "18px 20px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.gold400, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                  Framework Posture — Elevated
                </div>
                {[
                  { color: "#10b981", label: "Gold — overweight, core", reason: "Gold Momentum + Divergence both at 2 simultaneously. Historically, 12-month forward returns from this signal cluster averaged 35–60%." },
                  { color: "#10b981", label: "Bitcoin — overweight, debasement call option", reason: "Functions as high-beta gold in monetary regime transitions. Dropped 57% in 2020 acute crisis, then 18x'd. Position size for volatility." },
                  { color: "#fbbf24", label: "Critical materials — hold exposure", reason: "Copper physical premium at 4% — below the 5% trigger but elevated. If China escalates export controls (score moves 0→1+), this becomes an overweight." },
                  { color: "#fbbf24", label: "Duration — begin reducing", reason: "The Gold/Treasury Divergence says yields are artificially suppressed. When the divergence closes, long bonds are the most exposed asset class." },
                  { color: "#f87171", label: "Long Treasuries — underweight", reason: "If the framework is right about stealth suppression, long-duration bonds carry asymmetric downside. Reduce before the divergence forces a repricing." },
                  { color: "#6b7280", label: "Equities — selective only", reason: "Favor companies with monopoly pricing power and real asset backing. Avoid rate-sensitive growth. S&P/Gold ratio at 2.03 and falling — equities losing purchasing power." },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: i < 5 ? `1px solid ${C.navy800}40` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: item.color, fontSize: 14 }}>■</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginLeft: 22, lineHeight: 1.6 }}>{item.reason}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* WHAT WOULD CHANGE */}
            <Card style={{ marginBottom: 24 }}>
              <SectionLabel>What Would Change This Reading</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ borderRadius: 6, padding: "16px 20px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)" }}>
                  <div style={{ fontSize: 11, color: "#f87171", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>▲ Escalation Triggers</div>
                  <div style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.7 }}>
                    <div style={{ marginBottom: 8 }}>Fed shifts to <strong style={{ color: "#f0f0f0" }}>long-duration purchases</strong> → immediate Transition (Override Rule #4). This is the bright red line.</div>
                    <div style={{ marginBottom: 8 }}>Treasury auction B/C drops below <strong style={{ color: "#f0f0f0" }}>2.0</strong> → demand crisis signal. Currently masked by Fed purchases — watch what happens if they pause.</div>
                    <div>Gold breaks <strong style={{ color: "#f0f0f0" }}>+60% YoY</strong> with 8-week acceleration &gt;15% → Gold Momentum maxes. Currently +41% — still room.</div>
                  </div>
                </div>
                <div style={{ borderRadius: 6, padding: "16px 20px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
                  <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>▼ De-escalation Signals</div>
                  <div style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.7 }}>
                    <div style={{ marginBottom: 8 }}>Gold YoY drops below <strong style={{ color: "#f0f0f0" }}>+30%</strong> while yields rise → genuine tightening. Divergence closes from the gold side.</div>
                    <div style={{ marginBottom: 8 }}>Fed <strong style={{ color: "#f0f0f0" }}>resumes QT</strong> at full pace → balance sheet contracting. Not just slowing purchases — actively shrinking.</div>
                    <div>Deficit/GDP falls below <strong style={{ color: "#f0f0f0" }}>5%</strong> → structural fiscal pressure easing. Currently at 6.5% and rising.</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* TRACK RECORD */}
            <Card style={{ marginBottom: 24 }}>
              <SectionLabel>Framework Track Record</SectionLabel>
              <TrackRecord />
            </Card>

            {/* REGIME HISTORY CHART */}
            <Card style={{ marginBottom: 24 }}>
              <SectionLabel>Regime Score History</SectionLabel>
              <RegimeChart />
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 10, fontSize: 11, color: "#6b7280" }}>
                <span><span style={{ color: "#ef4444" }}>━</span> Primary</span>
                <span><span style={{ color: C.gold400 }}>━</span> Confirming</span>
                <span><span style={{ color: "#8faadc" }}>━</span> Structural</span>
              </div>
            </Card>

            {/* EVIDENCE — collapsible */}
            <div style={{ marginBottom: 32 }}>
              <div onClick={() => setShowEvidence(!showEvidence)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "12px 0", borderBottom: `1px solid ${C.navy800}` }}>
                <SectionLabel style={{ marginBottom: 0 }}>Full 17-Indicator Evidence</SectionLabel>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{showEvidence ? "Hide ▲" : "Show ▼"}</span>
              </div>
              {showEvidence && (
                <div style={{ marginTop: 12 }}>
                  {[
                    { tier: 1, label: "Tier 1 — Primary" },
                    { tier: 2, label: "Tier 2 — Confirming" },
                    { tier: 3, label: "Tier 3 — Structural" },
                  ].map(({ tier, label }) => (
                    <div key={tier} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                      {[
                        { num: 1, name: "Gold Momentum", tier: 1, score: 2, notes: "Gold=$2,900, YoY=+41.5%, 8wk=+7.4%" },
                        { num: 2, name: "Gold/Treasury Divergence", tier: 1, score: 2, notes: "Gold YoY=+41.5%, 10Y chg=−0.03%. TENSION" },
                        { num: 3, name: "Fed Balance Sheet", tier: 1, score: 1, notes: "Assets=$6.75T. 3mo +1.0%. $40B/mo purchases" },
                        { num: 4, name: "Treasury Auction Demand", tier: 1, score: 0, notes: "10Y B/C=2.45. 30Y B/C=2.35" },
                        { num: 5, name: "IORB-SOFR Spread", tier: 1, score: 0, notes: "Spread=10.0bps" },
                        { num: 6, name: "Foreign Treasury Holdings", tier: 2, score: 2, notes: "$7.8T, declining" },
                        { num: 7, name: "Fed Deferred Asset", tier: 2, score: 1, notes: "$245B cumulative" },
                        { num: 8, name: "Private Credit Stress", tier: 2, score: 0, notes: "Baa spread=1.45%" },
                        { num: 9, name: "Copper Physical Premium", tier: 2, score: 0, notes: "4.0% premium" },
                        { num: 10, name: "China Export Controls", tier: 2, score: 0, notes: "Stable scope" },
                        { num: 11, name: "DXY", tier: 2, score: 1, notes: "98.6, broke 100" },
                        { num: 12, name: "Gold/Fed BS Ratio", tier: 2, score: 0, notes: "Coverage=11.2%" },
                        { num: 13, name: "Deficit/GDP", tier: 3, score: 1, notes: "6.5% of GDP" },
                        { num: 14, name: "Debt Service/Revenue", tier: 3, score: 0, notes: "20.0% of revenue" },
                        { num: 15, name: "CB Gold Purchases", tier: 3, score: 0, notes: "~1,050t annualized" },
                        { num: 16, name: "S&P/Gold Ratio", tier: 3, score: 0, notes: "2.03" },
                        { num: 17, name: "Commodity/Gold Ratio", tier: 3, score: 2, notes: "GSCI/Gold −39.3% YoY" },
                      ].filter(i => i.tier === tier).map((ind, j) => (
                        <IndicatorRow key={j} {...ind} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div style={{ fontSize: 11, color: "#4b5563", textAlign: "center", maxWidth: 600, margin: "16px auto 0", lineHeight: 1.6 }}>
              This dashboard is for informational and educational purposes only and does not constitute financial advice. The Atlas Framework is a proprietary analytical tool. Historical back-test results are retrospective and not predictive of future performance.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
