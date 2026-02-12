import type { Metadata } from "next";
import Image from "next/image";
import Parser from "rss-parser";
import AnimateIn from "@/components/AnimateIn";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Essays and analysis on macroeconomics, technology, monetary history, and long-term investing by Lance Pieper.",
};

// Revalidate the RSS feed every hour
export const revalidate = 3600;

interface FeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  creator?: string;
  enclosure?: { url?: string };
}

async function getPosts(): Promise<FeedItem[]> {
  try {
    const parser = new Parser();
    const feed = await parser.parseURL("https://lancepieper.substack.com/feed");
    return feed.items ?? [];
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

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
        Blog
      </p>
      <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
        Latest Writing
      </h1>
      <p className="mt-4 max-w-xl text-gray-400 leading-relaxed">
        Essays and analysis published on Substack. Click any post to read the
        full piece.
      </p>

      {posts.length === 0 ? (
        <div className="mt-12 rounded-lg border border-navy-800 bg-navy-900/60 p-8 text-center">
          <p className="text-gray-400">
            No posts found. Check back soon or visit{" "}
            <a
              href="https://lancepieper.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:underline"
            >
              my Substack
            </a>{" "}
            directly.
          </p>
        </div>
      ) : (
        <div className="mt-12 space-y-6">
          {posts.map((post, i) => (
            <AnimateIn key={post.link} delay={i * 100}>
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-lg border border-navy-800 bg-navy-900/60 transition-colors hover:border-gold-500/40"
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
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-white group-hover:text-gold-400 transition-colors">
                    {post.title}
                  </h2>
                  <time className="shrink-0 text-sm text-gray-500">
                    {formatDate(post.pubDate)}
                  </time>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  {truncate(post.contentSnippet, 200)}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-gold-400 opacity-0 transition-opacity group-hover:opacity-100">
                  Read more &rarr;
                </span>
              </div>
            </a>
            </AnimateIn>
          ))}
        </div>
      )}
    </section>
  );
}
