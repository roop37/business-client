"use client";

const VALUE_TOKENS = [
  "Direct ticketing",
  "Owned fan CRM",
  "AI pricing",
  "Conversation marketing",
  "Settlement-ready ops",
  "Door scanner ops",
  "Festival-grade scale",
  "India-native checkout",
  "Loyalty & rewards",
  "Email + SMS suite",
  "Push notifications",
  "Promoter network",
];

/**
 * Slim marquee that runs Hoizr capability tokens horizontally below the
 * hero. Replaces the proof-logo strip used on most SaaS landings —
 * Hoizr is pre-launch so we lead with what the product does, not who
 * is using it. The track is duplicated so the CSS infinite loop reads
 * continuous.
 */
export const ValueMarquee = () => {
  const tokens = [...VALUE_TOKENS, ...VALUE_TOKENS];
  return (
    <section className="w-full max-w-[100vw] overflow-hidden border-y border-[var(--m-border)] bg-[var(--m-canvas-2)] py-6">
      <div className="hm-marquee">
        <div className="hm-marquee-track">
          {tokens.map((t, i) => (
            <div
              key={`${t}-${i}`}
              className="flex items-center gap-10 shrink-0"
            >
              <span className="hoizr-mark text-[15px] tracking-[0.32em] text-[var(--m-ink-3)] whitespace-nowrap">
                {t.toUpperCase()}
              </span>
              <span
                aria-hidden
                className="block h-1.5 w-1.5 rounded-full bg-[var(--m-forest-500)]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
