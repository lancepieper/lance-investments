"use client";

import { useState, useEffect } from "react";
import RegimeHistoryChart from "@/components/RegimeHistoryChart";
import DivergenceChart from "@/components/DivergenceChart";
import type { AtlasData, AtlasIndicator, NarrativeData } from "@/app/canary/page";


/* ── Helpers ─────────────────────────────────────────── */

function regimeColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes("confirmed")) return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" };
  if (s.includes("transition")) return { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" };
  if (s.includes("elevated")) return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" };
  return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" };
}

function scoreColor(score: number | null) {
  if (score === 2) return { bg: "bg-red-500/10", text: "text-red-400" };
  if (score === 1) return { bg: "bg-amber-500/10", text: "text-amber-400" };
  return { bg: "bg-navy-800/60", text: "text-gray-500" };
}

function barFillColor(pct: number) {
  if (pct >= 0.6) return "bg-red-500/70";
  if (pct >= 0.3) return "bg-amber-500/70";
  return "bg-emerald-500/60";
}

function postureColor(color: string) {
  switch (color) {
    case "emerald": return "text-emerald-400";
    case "amber": return "text-amber-400";
    case "red": return "text-red-400";
    default: return "text-gray-500";
  }
}

const CYCLE_STAGES = [
  { num: 1, label: "Sound Money", era: "1945–1971" },
  { num: 2, label: "Credit Expansion", era: "1971–2020" },
  { num: 3, label: "Emerging Disorder", era: "2020–present" },
  { num: 4, label: "Crisis Acceleration", era: "Not yet" },
  { num: 5, label: "Resolution", era: "Not yet" },
];

function regimeDisplayInfo(status: string): { activeStage: number; sublevel: string; subtitle: string } {
  const s = status.toLowerCase();
  if (s.includes("confirmed"))
    return { activeStage: 4, sublevel: "Crisis Confirmed", subtitle: "Monetary regime transition confirmed across all tiers" };
  if (s.includes("transition"))
    return { activeStage: 3, sublevel: "Accelerating", subtitle: "Regime shift underway — signals strengthening across tiers" };
  if (s.includes("elevated"))
    return { activeStage: 3, sublevel: "Early Warning", subtitle: "Multiple indicators firing — watching for acceleration" };
  return { activeStage: 3, sublevel: "Monitoring", subtitle: "Structural conditions present — no active signals yet" };
}

function CycleIndicator({ activeStage, sublevel }: { activeStage: number; sublevel: string }) {
  return (
    <div className="flex items-center gap-0 w-full mb-3 overflow-x-auto pb-2">
      {CYCLE_STAGES.map((stage, i) => {
        const isActive = stage.num === activeStage;
        const isPast = stage.num < activeStage;
        const isLast = i === CYCLE_STAGES.length - 1;
        return (
          <div key={stage.num} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-[56px]">
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm sm:text-base font-bold border-2 transition-all ${
                  isActive
                    ? "bg-gold-500/20 border-gold-500 text-gold-400 ring-2 ring-gold-500/20"
                    : isPast
                    ? "bg-gray-700/50 border-gray-600 text-gray-400"
                    : "bg-navy-800/60 border-navy-700 text-gray-600"
                }`}
              >
                {stage.num}
              </div>
              <div className={`mt-2.5 text-center ${isActive ? "text-gold-400" : isPast ? "text-gray-500" : "text-gray-600"}`}>
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.05em] leading-tight">
                  {stage.label}
                </div>
                <div className={`text-[11px] mt-0.5 ${isActive ? "text-gold-400/60" : isPast ? "text-gray-600" : "text-gray-700"}`}>
                  {stage.era}
                </div>
                {isActive && (
                  <div className="text-[11px] text-gold-400/80 font-semibold mt-0.5">{sublevel}</div>
                )}
              </div>
            </div>
            {!isLast && (
              <div className={`h-px flex-shrink-0 w-6 -mt-7 ${isPast ? "bg-gray-600" : "bg-navy-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm uppercase tracking-[0.2em] text-gold-400 font-medium mb-4">
      {children}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-navy-800 bg-navy-900/60 p-7 ${className}`}>
      {children}
    </div>
  );
}

function TierBarCompact({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = max > 0 ? score / max : 0;
  return (
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs uppercase tracking-[0.1em] text-gray-500">{label}</span>
        <span className="font-mono text-base font-bold text-gray-200">{score}<span className="text-gray-500 font-normal">/{max}</span></span>
      </div>
      <div className="h-2 rounded-full bg-navy-800">
        <div className={`h-full rounded-full ${barFillColor(pct)} opacity-70`} style={{ width: `${Math.max(pct * 100, 2)}%` }} />
      </div>
    </div>
  );
}

function IndicatorRow({ indicator }: { indicator: AtlasIndicator }) {
  const sc = scoreColor(indicator.score);
  const isUnprecedented = indicator.num >= 18;
  return (
    <div className="flex items-start gap-2.5 py-[7px] border-b border-navy-800/40 last:border-0">
      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[28px] text-center ${sc.bg} ${sc.text}`}>
        {indicator.score ?? "—"}
      </span>
      <div>
        <span className="text-[13px] text-gray-300">
          <span className="text-gray-500 font-mono text-[11px]">#{indicator.num} </span>
          {indicator.name}
          {isUnprecedented && (
            <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-[0.05em] text-violet-400/70 bg-violet-500/8 border border-violet-500/15 rounded px-1.5 py-px align-middle">
              New signal
            </span>
          )}
        </span>
        {indicator.notes && (
          <div className="text-[11px] text-gray-500 font-mono mt-0.5">{indicator.notes}</div>
        )}
      </div>
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────── */

export default function AtlasDashboard({ data, narrative }: { data: AtlasData; narrative: NarrativeData | null }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes("@")) return;
    setSubmitting(true);
    try {
      await fetch("/api/canary-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email }),
      });
    } catch {
      // Still mark as waitlisted — email was sent fire-and-forget
    }
    setWaitlisted(true);
    setSubmitting(false);
  };

  const { current, history } = data;
  const rc = regimeColor(current.regime_status);

  const dateStr = new Date(current.date + "T12:00:00Z").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const tier1 = current.indicators.filter((i) => i.tier === 1);
  const tier2 = current.indicators.filter((i) => i.tier === 2);
  const tier3 = current.indicators.filter((i) => i.tier === 3);

  const info = regimeDisplayInfo(current.regime_status);

  return (
    <div className="mx-auto max-w-[1100px] px-6 pt-12 pb-20">

      {/* ═══════ REGIME STATUS + WHAT CHANGED ═══════ */}
      <section className="mb-10">
        <SectionLabel>The Canary</SectionLabel>
        <div className="text-lg text-gray-400 -mt-2 mb-6 italic">The signal before the system breaks</div>

        {/* 5-Stage Cycle Indicator */}
        <div className="rounded-lg border border-navy-800 bg-navy-900/60 p-6 mb-5">
          <CycleIndicator activeStage={info.activeStage} sublevel={info.sublevel} />
        </div>

        {/* Current Reading */}
        <div className={`inline-flex flex-col rounded-lg border px-6 py-3.5 mb-4 ${rc.bg} ${rc.border}`}>
          <span className={`font-mono text-2xl font-bold tracking-wide ${rc.text}`}>
            {info.sublevel}
          </span>
          <span className="text-sm text-gray-400 mt-1">{info.subtitle}</span>
        </div>
        <div className="text-sm text-gray-500 font-mono mb-4">{dateStr}</div>

        {/* What Changed */}
        {narrative?.what_changed && narrative.what_changed.length > 0 && (
          <div className="rounded-md bg-navy-800/40 border border-navy-800 p-5">
            <div className="text-sm uppercase tracking-[0.15em] text-gold-400 font-medium mb-3">
              Current Readings
            </div>
            <div className="flex flex-col gap-2.5">
              {narrative.what_changed.map((item, i) => (
                <div key={i} className="text-[15px] text-gray-300 leading-relaxed">
                  {item.type === "new" ? (
                    <span className="text-red-400 font-semibold">▲ NEW</span>
                  ) : (
                    <span className="text-amber-400 font-semibold">→ HELD</span>
                  )}{" "}
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══════ TIER BARS ═══════ */}
      <div className="flex flex-col sm:flex-row gap-5 mb-4">
        <TierBarCompact label="Lead Signals" score={current.tier1_score} max={current.tier1_max} />
        <TierBarCompact label="Escalation" score={current.tier2_score} max={current.tier2_max} />
        <TierBarCompact label="Structural" score={current.tier3_score} max={current.tier3_max} />
      </div>

      {/* ═══════ SCORING KEY ═══════ */}
      <div className="mb-10 rounded-md border border-navy-800 bg-navy-900/60 p-5 text-sm text-gray-400 leading-relaxed space-y-3">
        <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">How Scoring Works</h3>
          <p>
            Each of the 20 indicators scores <span className="text-gray-300 font-medium">0</span> (no signal),{" "}
            <span className="text-amber-400 font-medium">1</span> (emerging), or{" "}
            <span className="text-red-400 font-medium">2</span> (confirmed). Tier scores are the sum of their indicators.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[13px]">
            <div>
              <span className="text-gray-300 font-semibold">Lead Signals</span> — the early movers: gold momentum, gold/Treasury divergence, Fed balance sheet, auction demand, interbank stress.
            </div>
            <div>
              <span className="text-gray-300 font-semibold">Escalation</span> — what confirms crisis is spreading: foreign Treasury holdings, credit stress, copper premiums, dollar weakness, supply-chain strain.
            </div>
            <div>
              <span className="text-gray-300 font-semibold">Structural</span> — slow-moving conditions that make the system vulnerable: deficit levels, debt service costs, central bank gold buying, equity/gold ratio.
            </div>
          </div>
          <p>
            The overall status is driven primarily by the Lead Signals tier:{" "}
            <span className="text-emerald-400">Monitoring</span> →{" "}
            <span className="text-amber-400">Early Warning</span> →{" "}
            <span className="text-orange-400">Accelerating</span> →{" "}
            <span className="text-red-400">Crisis Confirmed</span>.
            Escalation indicators must also fire before the status advances beyond Early Warning.
          </p>
      </div>

      {/* ═══════ ROW A: CONTRARIAN + DIVERGENCE ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {narrative?.contrarian && narrative.contrarian.length > 0 && (
          <Card className="flex flex-col">
            <SectionLabel>What the Consensus Is Missing</SectionLabel>
            <div className="text-base text-gray-300 leading-[1.8]">
              {narrative.contrarian.map((para, i) => (
                <p key={i} className={i < narrative.contrarian.length - 1 ? "mb-4" : ""} dangerouslySetInnerHTML={{ __html: para }} />
              ))}
            </div>
          </Card>
        )}

        {narrative?.divergence && (
          <Card className="flex flex-col">
            <SectionLabel>Gold/Treasury Divergence — The Canary&apos;s Core Signal</SectionLabel>
            <div className="text-base text-gray-400 leading-relaxed mb-5">
              {narrative.divergence.description}
            </div>
            <DivergenceChart
              months={narrative.divergence.months}
              gold={narrative.divergence.gold}
              yields={narrative.divergence.yields}
              goldChange={narrative.divergence.gold_change}
              yieldChange={narrative.divergence.yield_change}
            />
            <div className="mt-5 rounded-md bg-amber-500/5 border border-amber-500/10 px-5 py-4 text-[15px] text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: narrative.divergence.current_reading }}
            />
          </Card>
        )}
      </div>

      {/* ═══════ FRAMEWORK VS CONSENSUS ═══════ */}
      {narrative?.consensus && narrative.consensus.length > 0 && (
        <Card className="mb-8">
          <SectionLabel>The Canary vs. Consensus</SectionLabel>
          <div className="text-[15px]">
            {narrative.consensus.map((row, i) => (
              <div key={i} className={`grid grid-cols-1 sm:grid-cols-[130px_1fr_1fr] gap-3 sm:gap-5 py-5 ${i < narrative.consensus.length - 1 ? "border-b border-navy-800/40" : ""}`}>
                <div className="font-semibold text-gray-200 text-[15px]">{row.topic}</div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-[0.08em] mb-1.5">Wall Street</div>
                  <div className="text-gray-400 leading-snug">{row.wall_street}</div>
                </div>
                <div>
                  <div className="text-xs text-gold-400 uppercase tracking-[0.08em] mb-1.5">The Canary</div>
                  <div className="text-gray-300 leading-snug">{row.atlas}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ═══════ WAITLIST GATE ═══════ */}
      <div className="rounded-lg border border-gold-500/25 bg-gradient-to-b from-navy-900/90 to-navy-950/90 px-8 py-10 text-center mb-8">
        {!waitlisted ? (
          <>
            <div className="text-xl font-semibold text-white mb-2">
              Full Dashboard Coming Soon
            </div>
            <div className="text-base text-gray-400 max-w-[520px] mx-auto mb-2 leading-relaxed">
              Built for investors who want signal before the consensus catches up. Positioning guidance, escalation triggers, historical track record, and the full 20-indicator evidence table will be available to paid subscribers.
            </div>
            <div className="text-sm text-gray-500 max-w-[460px] mx-auto mb-6">
              Join the waitlist to be notified when subscriptions launch. No obligation — your information is only used to send updates.
            </div>
            <form onSubmit={handleWaitlist} className="flex flex-col gap-2 max-w-[400px] mx-auto">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="rounded-md border border-navy-700 bg-navy-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              />
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-md border border-navy-700 bg-navy-800 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "..." : "Join Waitlist"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-lg font-semibold text-white mb-1.5">
              You&apos;re on the list
            </div>
            <div className="text-sm text-gray-400 max-w-[500px] mx-auto leading-relaxed">
              We&apos;ll notify you when paid subscriptions launch. The full dashboard includes positioning guidance, specific escalation and de-escalation triggers, historical track record, and the complete 20-indicator evidence table.
            </div>
          </>
        )}
      </div>

      {/* ═══════ PAID CONTENT — uncomment when subscription system is ready ═══════ */}
      {/* Paid sections: Positioning, Triggers, Track Record, History Chart, Evidence Table */}
      {/* These are rendered from narrative JSON and scores JSON — code preserved in git history */}

      {/* Disclaimer */}
      <div className="mt-10 border-t border-navy-800/60 pt-6">
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.08em] mb-2">Important Disclosures</div>
        <div className="text-[11px] text-gray-600 max-w-[640px] leading-relaxed space-y-2.5">
          <p>
            This dashboard is for informational and educational purposes only and does not constitute investment advice, a recommendation or solicitation to buy or sell any security, or an offer to provide investment advisory or financial planning services. Nothing on this site should be construed as a personal recommendation for any particular investor. The content does not take into account your individual financial situation, investment objectives, or risk tolerance.
          </p>
          <p>
            The Canary is a proprietary analytical model reflecting one interpretation of publicly available macroeconomic data. All models are simplifications of complex systems and carry inherent limitations. Past regime classifications are retrospective analyses and are not indicative of future results. No analytical framework can reliably forecast market movements. Historical back-tests are hypothetical, were not traded in real time, and may not reflect the impact of actual market conditions, liquidity constraints, or transaction costs.
          </p>
          <p>
            The author and affiliated entities may hold positions in assets or asset classes discussed on this site and may trade these positions at any time without notice. The information presented may become outdated and there is no obligation to update it.
          </p>
          <p>
            Any investment decision you make based on information found on this site is made solely at your own risk. You should conduct your own due diligence and consult with a qualified, licensed financial advisor before making any investment decisions. By accessing this dashboard, you acknowledge that you have read and understood these disclosures.
          </p>
        </div>
      </div>
    </div>
  );
}
