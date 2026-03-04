import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-900/60">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white"
          >
            Lance <span className="text-gold-400">Pieper</span>
          </Link>

          <ul className="flex gap-6 text-sm text-gray-400">
            <li>
              <Link href="/blog" className="transition-colors hover:text-gold-400">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition-colors hover:text-gold-400">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-gold-400">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-navy-800 pt-6">
          <ul className="flex gap-5 text-sm text-gray-500">
            <li>
              <a href="https://x.com/lancepieper1" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold-400">
                X / Twitter
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/lance-pieper-cfp%C2%AE-92208753/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold-400">
                LinkedIn
              </a>
            </li>
            <li>
              <a href="mailto:lancepieper519@gmail.com" className="transition-colors hover:text-gold-400">
                Email
              </a>
            </li>
          </ul>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Lance Pieper. All rights reserved.
          </p>
          <div className="mt-2 max-w-2xl text-center text-[11px] leading-relaxed text-gray-600 space-y-2">
            <p>
              This site is for informational and educational purposes only and does not constitute investment advice, a recommendation or solicitation to buy or sell any security, or an offer to provide investment advisory or financial planning services. The content does not take into account your individual financial situation, investment objectives, or risk tolerance.
            </p>
            <p>
              The author and affiliated entities may hold positions in assets or asset classes discussed on this site and may trade these positions at any time without notice. Any investment decision you make based on information found on this site is made solely at your own risk. Consult with a qualified, licensed financial advisor before making any investment decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
