import type { Metadata } from "next";
import Image from "next/image";
import AnimateIn from "@/components/AnimateIn";
import investments from "@/data/investments.json";
import { fetchMarketData, type MarketData } from "@/lib/market-data";

export const revalidate = 300; // refresh prices every 5 minutes

export const metadata: Metadata = {
  title: "Investments",
  description:
    "Past and current investments by Lance Pieper, spanning technology, crypto, equities, and more.",
};

interface Investment {
  name: string;
  sector: string;
  logo: string;
  url: string;
  ticker: string | null;
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

function formatPrice(price: number): string {
  if (price >= 10000)
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatChange(
  value: number,
  pct: number,
): { text: string; color: string } {
  const sign = value >= 0 ? "+" : "";
  const color = value >= 0 ? "text-green-400" : "text-red-400";
  const text = `${sign}${pct.toFixed(1)}%`;
  return { text, color };
}

export default async function InvestmentsPage() {
  const items = investments as Investment[];
  const tickers = items
    .map((inv) => inv.ticker)
    .filter(Boolean) as string[];
  const marketData = await fetchMarketData(tickers);

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

      <AnimateIn>
        <div className="mt-8 rounded-lg border border-gold-500/30 bg-gold-500/5 p-4 text-center">
          <p className="text-sm font-medium text-gold-400">
            Details coming soon.
          </p>
        </div>
      </AnimateIn>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((inv, i) => {
          const data: MarketData | undefined = inv.ticker
            ? marketData[inv.ticker]
            : undefined;
          const daily = data
            ? formatChange(data.dailyChange, data.dailyChangePct)
            : null;
          const yearly = data
            ? formatChange(data.yearChange, data.yearChangePct)
            : null;

          return (
            <AnimateIn key={inv.name} delay={i * 80}>
              <div className="select-none rounded-lg border border-navy-800 bg-navy-900/60 p-5">
                <div className="flex items-start gap-4 blur-md">
                  <Image
                    src={inv.logo}
                    alt=""
                    width={40}
                    height={40}
                    className="mt-0.5 h-10 w-10 shrink-0 rounded-md bg-white p-1.5"
                    unoptimized={inv.logo.endsWith(".svg")}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-semibold text-white">
                        {inv.name}
                      </h2>
                      {data && (
                        <span className="shrink-0 text-right text-sm font-semibold text-white">
                          {formatPrice(data.price)}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getSectorStyle(inv.sector)}`}
                      >
                        {inv.sector}
                      </span>
                      {data && daily && yearly ? (
                        <span className="shrink-0 text-right text-xs">
                          <span className={daily.color}>
                            {daily.text} today
                          </span>
                          <span className="text-gray-600"> · </span>
                          <span className={yearly.color}>
                            {yearly.text} 12mo
                          </span>
                        </span>
                      ) : (
                        !inv.ticker && (
                          <span className="text-xs text-gray-500">
                            Private
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimateIn>
          );
        })}
      </div>

      <AnimateIn>
        <div className="mt-14 rounded-lg border border-navy-800 bg-navy-900/60 p-6">
          <p className="text-sm text-gray-400">
            This page reflects personal investment activity and is for
            informational purposes only. It does not constitute investment
            advice, a recommendation, or a solicitation to buy or sell any
            securities. Prices are delayed and provided by Yahoo Finance.
          </p>
        </div>
      </AnimateIn>
    </section>
  );
}
