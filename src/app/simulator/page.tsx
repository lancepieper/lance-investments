import type { Metadata } from "next";
import FinancialSimulator from "@/components/FinancialSimulator";

export const metadata: Metadata = {
  title: "Financial Planning Simulator | lance.investments",
};

export default function SimulatorPage() {
  return <FinancialSimulator />;
}
