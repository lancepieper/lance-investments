import type { Metadata } from "next";
import AnimateIn from "@/components/AnimateIn";
import investments from "@/data/investments.json";

export const metadata: Metadata = {
  title: "Investments",
  description:
    "A timeline of past and current investments by Lance Pieper, spanning technology, crypto, equities, and more.",
};

interface Investment {
  name: string;
  sector: string;
  date: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

const sectorColors: Record<string, string> = {
  Technology: "bg-blue-500/20 text-blue-300",
  Crypto: "bg-purple-500/20 text-purple-300",
  Equities: "bg-green-500/20 text-green-300",
  "Fixed Income": "bg-amber-500/20 text-amber-300",
  "Real Estate": "bg-rose-500/20 text-rose-300",
  Commodities: "bg-orange-500/20 text-orange-300",
};

function getSectorStyle(sector: string): string {
  return sectorColors[sector] ?? "bg-gold-500/20 text-gold-400";
}

export default function InvestmentsPage() {
  const sorted = [...(investments as Investment[])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
        Portfolio
      </p>
      <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
        Investments
      </h1>
      <p className="mt-4 text-gray-400">
        A timeline of positions I&rsquo;ve held. This is not financial advice
        &mdash; just a transparent look at where I&rsquo;ve put capital.
      </p>

      <div className="relative mt-14">
        {/* Vertical timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-navy-700" />

        <div className="space-y-10">
          {sorted.map((inv, i) => (
            <AnimateIn key={`${inv.name}-${inv.date}`} delay={i * 80}>
              <div className="relative pl-10">
                {/* Timeline dot */}
                <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-gold-400 bg-navy-950" />

                <div className="rounded-lg border border-navy-800 bg-navy-900/60 p-5 transition-colors hover:border-gold-500/40">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">
                      {inv.name}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getSectorStyle(inv.sector)}`}
                    >
                      {inv.sector}
                    </span>
                  </div>
                  <time className="mt-2 block text-sm text-gray-500">
                    {formatDate(inv.date)}
                  </time>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
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
