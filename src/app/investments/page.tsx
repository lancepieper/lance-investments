import type { Metadata } from "next";
import Image from "next/image";
import AnimateIn from "@/components/AnimateIn";
import investments from "@/data/investments.json";

export const metadata: Metadata = {
  title: "Investments",
  description:
    "Past and current investments by Lance Pieper, spanning technology, crypto, equities, and more.",
};

interface Investment {
  name: string;
  sector: string;
  logo: string;
}

const sectorColors: Record<string, string> = {
  Technology: "bg-blue-500/20 text-blue-300",
  Crypto: "bg-purple-500/20 text-purple-300",
  Equities: "bg-green-500/20 text-green-300",
  "Fixed Income": "bg-amber-500/20 text-amber-300",
  "Real Estate": "bg-rose-500/20 text-rose-300",
  Commodities: "bg-orange-500/20 text-orange-300",
  Energy: "bg-emerald-500/20 text-emerald-300",
  Aerospace: "bg-red-500/20 text-red-300",
};

function getSectorStyle(sector: string): string {
  return sectorColors[sector] ?? "bg-gold-500/20 text-gold-400";
}

export default function InvestmentsPage() {
  const items = investments as Investment[];

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
        Portfolio
      </p>
      <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
        Investments
      </h1>
      <p className="mt-4 text-gray-400">
        A non-exhaustive list of positions I&rsquo;ve held or currently hold.
        This is not financial advice &mdash; just a transparent look at where
        I&rsquo;ve put capital.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {items.map((inv, i) => (
          <AnimateIn key={inv.name} delay={i * 80}>
            <div className="flex items-center gap-4 rounded-lg border border-navy-800 bg-navy-900/60 p-5 transition-colors hover:border-gold-500/40">
              <Image
                src={inv.logo}
                alt={`${inv.name} logo`}
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-md bg-white p-1.5"
                unoptimized={inv.logo.endsWith(".svg")}
              />
              <div>
                <h2 className="text-lg font-semibold text-white">{inv.name}</h2>
                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getSectorStyle(inv.sector)}`}
                >
                  {inv.sector}
                </span>
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>

      <AnimateIn>
        <div className="mt-14 rounded-lg border border-navy-800 bg-navy-900/60 p-6">
          <p className="text-sm text-gray-400">
            This page reflects personal investment activity and is for
            informational purposes only. It does not constitute investment
            advice, a recommendation, or a solicitation to buy or sell any
            securities.
          </p>
        </div>
      </AnimateIn>
    </section>
  );
}
