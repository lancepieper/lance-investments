"use client";

import { useState, type FormEvent } from "react";

export default function SubstackSubscribe() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    // Open Substack subscribe page with the email pre-filled
    window.open(
      `https://lancepieper.substack.com/subscribe?email=${encodeURIComponent(email)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md gap-3">
      <input
        type="email"
        required
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-navy-800 bg-navy-900/80 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-gold-500/60"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
      >
        Subscribe
      </button>
    </form>
  );
}
