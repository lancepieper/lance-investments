"use client";

import { useState, type FormEvent } from "react";

const SUBSTACK_URL = "https://lancepieper.substack.com";

export default function SubstackSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch(`${SUBSTACK_URL}/api/v1/free`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          first_url: window.location.href,
          first_referrer: document.referrer || "",
          current_url: window.location.href,
          current_referrer: document.referrer || "",
          referral_code: "",
          source: "embed",
        }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="mt-6 text-sm font-medium text-gold-400">
        ✓ You&rsquo;re subscribed! Check your inbox to confirm.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md gap-3">
      <input
        type="email"
        required
        placeholder="Your email address"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        className="min-w-0 flex-1 rounded-md border border-navy-800 bg-navy-900/80 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-gold-500/60"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-md bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="absolute mt-14 text-xs text-red-400">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
