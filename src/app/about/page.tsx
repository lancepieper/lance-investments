import type { Metadata } from "next";
import Image from "next/image";
import AnimateIn from "@/components/AnimateIn";

export const metadata: Metadata = {
  title: "About",
  description:
    "Lance Pieper is an investor, macro analyst, writer, and Certified Financial Planner exploring the intersection of macroeconomics, technology, and behavioral finance.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <Image
          src="/lance.jpg"
          alt="Lance Pieper"
          width={120}
          height={120}
          className="h-28 w-28 rounded-full object-cover border-2 border-navy-700 shadow-lg"
          priority
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
            About
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
            Lance Pieper
          </h1>
        </div>
      </div>

      <AnimateIn>
      <div className="mt-10 space-y-6 text-gray-300 leading-relaxed">
        <p>
          I&rsquo;m an investor, macro analyst, writer, and Certified Financial
          Planner&reg;. My work sits at the intersection of macroeconomics,
          technology, behavioral finance, and financial planning.
        </p>

        <p>
          I believe the best investment decisions come from first-principles
          thinking, intellectual honesty, and a willingness to look where others
          don&rsquo;t. I&rsquo;m drawn to ideas that compound &mdash; both in
          portfolios and in understanding.
        </p>

        <p>
          Through my writing on Substack, I share analysis on economics,
          emerging technologies, monetary history, and the mental models that
          guide my thinking. My goal is to think clearly in public and help
          others do the same.
        </p>

        <h2 className="pt-4 text-xl font-semibold text-white">
          Areas of Focus
        </h2>
        <ul className="list-inside list-disc space-y-2 text-gray-400">
          <li>Global macroeconomic trends and monetary history</li>
          <li>Technology-driven disruption</li>
          <li>Behavioral finance and decision-making under uncertainty</li>
          <li>Long-term investing and compounding frameworks</li>
        </ul>

        <h2 className="pt-4 text-xl font-semibold text-white">Philosophy</h2>
        <p>
          Markets reward patience, curiosity, and the discipline to separate
          signal from noise. I aim to invest and write with that ethos &mdash;
          focusing on what matters over the long term and ignoring the rest.
        </p>
      </div>
      </AnimateIn>

      <AnimateIn>
      <div className="mt-12 rounded-lg border border-navy-800 bg-navy-900/60 p-6">
        <p className="text-sm text-gray-400">
          Want to connect or collaborate? Head over to the{" "}
          <a href="/contact" className="text-gold-400 hover:underline">
            contact page
          </a>{" "}
          to find the best way to reach me.
        </p>
      </div>
      </AnimateIn>
    </section>
  );
}
