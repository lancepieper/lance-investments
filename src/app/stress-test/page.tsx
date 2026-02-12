import type { Metadata } from "next";
import RegimeStressTester from "@/components/RegimeStressTester";

export const metadata: Metadata = {
  title: "Portfolio Regime Stress Tester | lance.investments",
  description:
    "Test your portfolio allocation against the worst market crises of the last 50 years. See drawdowns, recovery times, and asset performance across stagflation, the GFC, COVID, and more.",
};

export default function StressTesterPage() {
  return <RegimeStressTester />;
}
