import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import AtlasDashboard from "@/components/AtlasDashboard";

export const metadata: Metadata = {
  title: "Atlas Regime Dashboard",
  description:
    "Real-time macro regime assessment across 20 indicators. Track monetary, fiscal, and structural signals that precede regime transitions.",
};

export interface AtlasIndicator {
  num: number;
  name: string;
  tier: number;
  score: number | null;
  raw_value: number | null;
  notes: string;
}

export interface AtlasHistory {
  date: string;
  tier1_score: number;
  tier2_score: number;
  tier3_score: number;
  regime_status: string;
}

export interface AtlasData {
  published_at: string;
  current: {
    date: string;
    regime_status: string;
    tier1_score: number;
    tier1_max: number;
    tier1_count: number;
    tier2_score: number;
    tier2_max: number;
    tier2_count: number;
    tier3_score: number;
    tier3_max: number;
    tier3_count: number;
    overrides: string[];
    indicators: AtlasIndicator[];
  };
  history: AtlasHistory[];
}

export interface NarrativeData {
  what_changed: { type: "new" | "held"; text: string }[];
  contrarian: string[];
  divergence: {
    description: string;
    months: string[];
    gold: number[];
    yields: number[];
    gold_change: string;
    yield_change: string;
    current_reading: string;
  };
  consensus: { topic: string; wall_street: string; atlas: string }[];
  positioning: {
    intro: string;
    posture: { color: string; label: string; reason: string }[];
  };
  triggers: {
    escalation: string[];
    deescalation: string[];
  };
  track_record: {
    intro: string;
    confirmed: { year: string; label: string; signal: string; lead: string; result: string; grade: string }[];
    adversarial: { year: string; label: string; result: string }[];
  };
}

function readJSON<T>(filename: string): T | null {
  try {
    const raw = readFileSync(join(process.cwd(), "public", "data", filename), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function AtlasPage() {
  const data = readJSON<AtlasData>("atlas-scores.json");
  const narrative = readJSON<NarrativeData>("atlas-narrative.json");

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">
          Atlas Regime Dashboard
        </h1>
        <p className="mt-4 text-gray-400">
          Scores have not been published yet. Check back soon.
        </p>
      </div>
    );
  }

  return <AtlasDashboard data={data} narrative={narrative} />;
}
