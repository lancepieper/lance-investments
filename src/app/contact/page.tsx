import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

const links = [
  {
    label: "Substack",
    href: "https://lancepieper.substack.com",
    description: "Read my latest essays and subscribe for updates.",
  },
  {
    label: "X / Twitter",
    href: "https://x.com/lancepieper1",
    description: "Follow me for shorter-form takes and commentary.",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/lance-pieper-cfp%C2%AE-92208753/",
    description: "Connect with me professionally.",
  },
  {
    label: "Email",
    href: "mailto:lancepieper519@gmail.com",
    description: "For inquiries, partnerships, or just to say hello.",
  },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
        Contact
      </p>
      <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
        Get in Touch
      </h1>
      <p className="mt-4 max-w-xl text-gray-400 leading-relaxed">
        Whether you want to discuss markets, explore a collaboration, or just
        say hello &mdash; I&rsquo;d love to hear from you.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {links.map(({ label, href, description }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className="group rounded-lg border border-navy-800 bg-navy-900/60 p-6 transition-colors hover:border-gold-500/40"
          >
            <h2 className="text-lg font-semibold text-white group-hover:text-gold-400 transition-colors">
              {label}
              <span className="ml-2 inline-block text-gray-500 transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </h2>
            <p className="mt-2 text-sm text-gray-400">{description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
