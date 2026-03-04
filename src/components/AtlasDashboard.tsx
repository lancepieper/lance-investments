"use client";

import { useState, useEffect } from "react";
import RegimeHistoryChart from "@/components/RegimeHistoryChart";
import DivergenceChart from "@/components/DivergenceChart";
import type { AtlasData, AtlasIndicator, NarrativeData } from "@/app/atlas/page";


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

/* ── Sub-components ──────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-medium mb-4">
      {children}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-navy-800 bg-navy-900/60 p-6 ${className}`}>
      {children}
    </div>
  );
}

function TierBarCompact({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = max > 0 ? score / max : 0;
  return (
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] uppercase tracking-[0.1em] text-gray-500">{label}</span>
        <span className="font-mono text-sm font-bold text-gray-200">{score}<span className="text-gray-500 font-normal">/{max}</span></span>
      </div>
      <div className="h-[5px] rounded-full bg-navy-800">
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
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitting(true);
    try {
      await fetch("/api/atlas-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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

  return (
    <div className="mx-auto max-w-[740px] px-6 pt-12 pb-20">

      {/* ═══════ REGIME STATUS + WHAT CHANGED ═══════ */}
      <section className="mb-10">
        <SectionLabel>Atlas Regime Dashboard</SectionLabel>
        <div className={`inline-flex items-center rounded-lg border px-6 py-3.5 mb-4 ${rc.bg} ${rc.border}`}>
          <span className={`font-mono text-[22px] font-bold tracking-wide ${rc.text}`}>
            {current.regime_status.replace("—", "\u2014")}
          </span>
        </div>
        <div className="text-xs text-gray-500 font-mono mb-4">{dateStr}</div>

        {current.overrides.length > 0 && (
          <div className="mb-4 space-y-2">
            {current.overrides.map((o, i) => (
              <div key={i} className="rounded border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-400/80">
                {o}
              </div>
            ))}
          </div>
        )}

        {/* What Changed */}
        {narrative?.what_changed && narrative.what_changed.length > 0 && (
          <div className="rounded-md bg-navy-800/40 border border-navy-800 p-4">
            <div className="text-[10px] uppercase tracking-[0.15em] text-gold-400 font-medium mb-2">
              What Changed Since Last Reading
            </div>
            <div className="flex flex-col gap-1.5">
              {narrative.what_changed.map((item, i) => (
                <div key={i} className="text-[13px] text-gray-300">
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
      <div className="flex gap-5 mb-10">
        <TierBarCompact label="Primary" score={current.tier1_score} max={current.tier1_max} />
        <TierBarCompact label="Confirming" score={current.tier2_score} max={current.tier2_max} />
        <TierBarCompact label="Structural" score={current.tier3_score} max={current.tier3_max} />
      </div>

      {/* ═══════ CONTRARIAN READ ═══════ */}
      {narrative?.contrarian && narrative.contrarian.length > 0 && (
        <Card className="mb-8">
          <SectionLabel>What the Consensus Is Missing</SectionLabel>
          <div className="text-[15px] text-gray-300 leading-[1.8]">
            {narrative.contrarian.map((para, i) => (
              <p key={i} className={i < narrative.contrarian.length - 1 ? "mb-4" : ""} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </div>
        </Card>
      )}

      {/* ═══════ DIVERGENCE CHART ═══════ */}
      {narrative?.divergence && (
        <Card className="mb-8">
          <SectionLabel>Gold/Treasury Divergence — The Framework&apos;s Core Signal</SectionLabel>
          <div className="text-sm text-gray-400 leading-relaxed mb-4">
            {narrative.divergence.description}
          </div>
          <DivergenceChart
            months={narrative.divergence.months}
            gold={narrative.divergence.gold}
            yields={narrative.divergence.yields}
            goldChange={narrative.divergence.gold_change}
            yieldChange={narrative.divergence.yield_change}
          />
          <div className="mt-4 rounded-md bg-amber-500/5 border border-amber-500/10 px-4 py-3 text-[13px] text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: narrative.divergence.current_reading }}
          />
        </Card>
      )}

      {/* ═══════ FRAMEWORK VS CONSENSUS ═══════ */}
      {narrative?.consensus && narrative.consensus.length > 0 && (
        <Card className="mb-8">
          <SectionLabel>Framework vs. Consensus</SectionLabel>
          <div className="text-[13px]">
            {narrative.consensus.map((row, i) => (
              <div key={i} className={`grid grid-cols-[120px_1fr_1fr] gap-4 py-3.5 ${i < narrative.consensus.length - 1 ? "border-b border-navy-800/40" : ""}`}>
                <div className="font-semibold text-gray-200 text-[13px]">{row.topic}</div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.08em] mb-1">Wall Street</div>
                  <div className="text-gray-400 leading-snug">{row.wall_street}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gold-400 uppercase tracking-[0.08em] mb-1">Atlas Framework</div>
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
            <div className="text-lg font-semibold text-white mb-1.5">
              Full Dashboard Coming Soon
            </div>
            <div className="text-sm text-gray-400 max-w-[500px] mx-auto mb-2 leading-relaxed">
              Positioning guidance, escalation triggers, the framework&apos;s historical track record, and the full 20-indicator evidence table will be available to paid subscribers.
            </div>
            <div className="text-xs text-gray-500 max-w-[440px] mx-auto mb-6">
              Join the waitlist to be notified when subscriptions launch.
            </div>
            <form onSubmit={handleWaitlist} className="flex gap-2 justify-center max-w-[400px] mx-auto">
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
            The Atlas Framework is a proprietary analytical model reflecting one interpretation of publicly available macroeconomic data. All models are simplifications of complex systems and carry inherent limitations. Past regime classifications are retrospective analyses and are not indicative of future results. No analytical framework can reliably forecast market movements. Historical back-tests are hypothetical, were not traded in real time, and may not reflect the impact of actual market conditions, liquidity constraints, or transaction costs.
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
