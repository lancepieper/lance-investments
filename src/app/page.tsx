import Image from "next/image";
import Link from "next/link";
import Parser from "rss-parser";
import AnimateIn from "@/components/AnimateIn";

// Revalidate the RSS feed every hour
export const revalidate = 3600;

interface FeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  enclosure?: { url?: string };
}

async function getLatestPosts(): Promise<FeedItem[]> {
  try {
    const parser = new Parser();
    const feed = await parser.parseURL("https://lancepieper.substack.com/feed");
    return (feed.items ?? []).slice(0, 2);
  } catch {
    return [];
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function truncate(text: string | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export default async function Home() {
  const latestPosts = await getLatestPosts();
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-gold-500)_0%,_transparent_50%)] opacity-[0.07]" />

        <div className="relative mx-auto max-w-5xl px-6 py-28 md:py-40">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold-400">
            Investment Insights &amp; Analysis
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white md:text-6xl">
            Navigating markets with{" "}
            <span className="text-gold-400">clarity</span> and{" "}
            <span className="text-gold-400">conviction</span>.
          </h1>
          <AnimateIn delay={200}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
              I&rsquo;m Lance Pieper &mdash; an investor and writer exploring the
              intersection of macro trends, economics, &amp; technology. I share
              frameworks and insights to help long-term investors navigate
              complexity.
            </p>
          </AnimateIn>
          <AnimateIn delay={400}>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center rounded-md bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
            >
              Read the Blog
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-md border border-gray-600 px-6 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-gold-400 hover:text-gold-400"
            >
              Learn More
            </Link>
          </div>
          </AnimateIn>
        </div>
      </section>

      {/* Latest Writing */}
      {latestPosts.length > 0 && (
        <section className="border-t border-navy-800 bg-navy-900/40">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
              Latest Writing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-gray-400">
              Recent essays and analysis from my Substack.
            </p>

            <AnimateIn>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {latestPosts.map((post) => (
                <a
                  key={post.link}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-lg border border-navy-800 bg-navy-900/60 transition-colors hover:border-gold-500/40"
                >
                  {post.enclosure?.url && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={post.enclosure.url}
                        alt={post.title ?? ""}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-semibold text-white group-hover:text-gold-400 transition-colors">
                        {post.title}
                      </h3>
                      <time className="text-sm text-gray-500">
                        {formatDate(post.pubDate)}
                      </time>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">
                      {truncate(post.contentSnippet, 200)}
                    </p>
                    <span className="mt-4 inline-block text-sm font-medium text-gold-400/70 transition-colors group-hover:text-gold-400">
                      Read more &rarr;
                    </span>
                  </div>
                </a>
              ))}
            </div>
            </AnimateIn>

            <div className="mt-10 text-center">
              <Link
                href="/blog"
                className="text-sm font-medium text-gold-400 transition-colors hover:text-gold-300"
              >
                View all posts &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* What I Write About */}
      <section className="border-t border-navy-800 bg-navy-900/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
            What I Write About
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-400">
            Topics I explore on my Substack and across my research.
          </p>

          <AnimateIn>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Macro & Markets",
                description:
                  "Global economic trends, monetary policy, and how they shape investment opportunities.",
              },
              {
                title: "Technology & Innovation",
                description:
                  "How emerging technologies create asymmetric upside and reshape entire industries.",
              },
              {
                title: "Long-Term Thinking",
                description:
                  "Mental models, patience, and the compounding power of disciplined investing.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-lg border border-navy-800 bg-navy-900/60 p-6 transition-colors hover:border-gold-500/40"
              >
                <h3 className="text-lg font-semibold text-gold-400">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
          </AnimateIn>
        </div>
      </section>

      {/* Tools */}
      <section className="border-t border-navy-800 bg-navy-900/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
            Interactive Tools
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-400">
            Tools to help you think through portfolio construction and financial planning.
          </p>

          <AnimateIn>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <Link
              href="/simulator"
              className="group rounded-lg border border-navy-800 bg-navy-900/60 p-6 transition-colors hover:border-gold-500/40"
            >
              <h3 className="text-lg font-semibold text-gold-400">
                Financial Planning Simulator
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Model your financial future across thousands of randomized scenarios. Adjust savings rates, asset allocation, and withdrawal strategies to see the range of outcomes — not just the average.
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-gold-400/70 transition-colors group-hover:text-gold-400">
                Try it &rarr;
              </span>
            </Link>

            <Link
              href="/stress-test"
              className="group rounded-lg border border-navy-800 bg-navy-900/60 p-6 transition-colors hover:border-gold-500/40"
            >
              <h3 className="text-lg font-semibold text-gold-400">
                Portfolio Regime Stress Tester
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                See how your portfolio allocation would have performed through the worst market crises of the last 50 years — from 1970s stagflation to the 2022 rate shock. Built on verified data from Shiller, LBMA, and EFA.
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-gold-400/70 transition-colors group-hover:text-gold-400">
                Try it &rarr;
              </span>
            </Link>
          </div>
          </AnimateIn>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-navy-800">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <AnimateIn>
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Stay in the loop
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-gray-400">
              I publish new essays and analysis on Substack. Follow along for
              fresh perspectives on markets and investing.
            </p>
            <a
              href="https://lancepieper.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center rounded-md bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
            >
              Subscribe on Substack
            </a>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
