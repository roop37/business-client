const AI_SUPPORT_POINTS = [
  "Event evaluation before publishing",
  "Event-specific offer context where the current evaluation returns it",
  "Event-description generation",
  "Listing-quality, spelling and SEO suggestions",
  "Safe fallback when the configured AI service is unavailable",
] as const;

export const AiSupport = () => {
  return (
    <section className="hm-section">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="max-w-[540px] lg:sticky lg:top-28">
          <div className="hm-eyebrow">AI support</div>
          <h2 className="hm-h2 mt-3">
            AI where it removes work — not where it invents promises.
          </h2>
          <p className="mt-5 text-[15px] leading-[1.7] text-[var(--m-ink-3)]">
            Hoizr uses AI only where the event already has enough context to be
            useful. The goal is to reduce busywork around publishing and
            presentation, not to hide the organiser behind generic automation.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {AI_SUPPORT_POINTS.map((point, index) => (
            <article
              key={point}
              className={`rounded-[24px] border p-5 ${
                index === 0
                  ? "sm:col-span-2 border-[var(--m-forest-700)] bg-[var(--m-forest-700)] text-white shadow-[var(--m-shadow-pop)]"
                  : "border-[var(--m-border)] bg-[var(--m-surface)] text-[var(--m-ink-1)] shadow-[var(--m-shadow-card)]"
              }`}
            >
              <div
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  index === 0 ? "text-white/60" : "text-[var(--m-ink-4)]"
                }`}
              >
                {index + 1}
              </div>
              <p
                className={`mt-3 text-[15px] leading-[1.65] ${
                  index === 0 ? "text-white/88" : "text-[var(--m-ink-2)]"
                }`}
              >
                {point}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
