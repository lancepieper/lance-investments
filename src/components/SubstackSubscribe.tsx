"use client";

export default function SubstackSubscribe() {
  return (
    <iframe
      src="https://lancepieper.substack.com/embed"
      width="480"
      height="150"
      className="mx-auto mt-8 border-0"
      style={{
        background: "transparent",
        borderRadius: "8px",
        maxWidth: "100%",
      }}
      title="Subscribe to The Atlas Letter"
    />
  );
}
