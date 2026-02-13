import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export interface MarketData {
  price: number;
  dailyChange: number;
  dailyChangePct: number;
  yearChange: number;
  yearChangePct: number;
}

// Map our ticker symbols to Yahoo Finance symbols
const yahooSymbol: Record<string, string> = {
  BTC: "BTC-USD",
  NVDA: "NVDA",
  TSLA: "TSLA",
  GOOGL: "GOOGL",
  AMD: "AMD",
  IREN: "IREN",
  BE: "BE",
  GEV: "GEV",
};

export async function fetchMarketData(
  tickers: string[],
): Promise<Record<string, MarketData>> {
  const result: Record<string, MarketData> = {};

  const validTickers = tickers.filter((t) => t in yahooSymbol);
  if (validTickers.length === 0) return result;

  const yahooSymbols = validTickers.map((t) => yahooSymbol[t]);

  // Fetch current quotes and 1-year-ago prices in parallel
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  try {
    const [quotes, ...charts] = await Promise.all([
      yahooFinance.quote(yahooSymbols, { return: "object" }),
      ...yahooSymbols.map((sym) =>
        yahooFinance
          .chart(sym, {
            period1: oneYearAgo,
            period2: new Date(),
            interval: "1mo",
          })
          .catch(() => null),
      ),
    ]);

    for (let i = 0; i < validTickers.length; i++) {
      const ticker = validTickers[i];
      const sym = yahooSymbols[i];
      const quote = quotes[sym];

      if (!quote?.regularMarketPrice) continue;

      const price = quote.regularMarketPrice;
      const dailyChange = quote.regularMarketChange ?? 0;
      const dailyChangePct = quote.regularMarketChangePercent ?? 0;

      // Get price from ~12 months ago from chart data
      let yearChange = 0;
      let yearChangePct = 0;
      const chart = charts[i];
      if (chart?.quotes?.length) {
        const oldPrice = chart.quotes[0].close;
        if (oldPrice) {
          yearChange = price - oldPrice;
          yearChangePct = (yearChange / oldPrice) * 100;
        }
      }

      result[ticker] = {
        price,
        dailyChange,
        dailyChangePct,
        yearChange,
        yearChangePct,
      };
    }
  } catch (e) {
    console.error("Failed to fetch market data:", e);
  }

  return result;
}
