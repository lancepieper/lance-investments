import type { Metadata } from "next";
import FinancialSimulator from "@/components/FinancialSimulator";

export const metadata: Metadata = {
  title: "Financial Planning Simulator",
  description:
    "Model your financial future across thousands of randomized scenarios. Adjust savings rates, asset allocation, and withdrawal strategies to see the range of outcomes.",
};

export default function SimulatorPage() {
  return <FinancialSimulator />;
}
