import { PLATFORM_COMPARISON } from "../data/site-copy";

const COLUMN_LABELS = [
  "Listing-only or ticketing-only tools",
  "Hoizr",
] as const;

export const PlatformComparison = () => {
  return (
    <section className="hm-section">
      <div className="max-w-[760px]">
        <div className="hm-eyebrow">Platform comparison</div>
        <h2 className="hm-h2 mt-3">One flow instead of a stack of hand-offs.</h2>
        <p className="hm-lead mt-5 max-w-[620px]">
          Hoizr keeps publishing, sales, audience and operations in the same
          workspace, so the event does not need to be reassembled in every
          other tool.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-[28px] border border-[var(--m-border)] bg-[var(--m-surface)] shadow-[var(--m-shadow-card)]">
        <div className="hidden grid-cols-[1fr,1fr] border-b border-[var(--m-border)] px-6 py-4 md:grid">
          {COLUMN_LABELS.map((label) => (
            <div
              key={label}
              className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--m-ink-4)]"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="divide-y divide-[var(--m-border)]">
          {PLATFORM_COMPARISON.map((row) => (
            <div
              key={row.alternative}
              className="grid gap-5 px-6 py-6 md:grid-cols-[1fr,1fr] md:gap-8 md:px-6"
            >
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-4)] md:hidden">
                  {COLUMN_LABELS[0]}
                </div>
                <p className="mt-2 text-[15px] leading-[1.65] text-[var(--m-ink-2)] md:mt-0">
                  {row.alternative}
                </p>
              </div>
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-4)] md:hidden">
                  {COLUMN_LABELS[1]}
                </div>
                <p className="mt-2 text-[15px] leading-[1.65] text-[var(--m-ink-1)] md:mt-0">
                  {row.hoizr}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
