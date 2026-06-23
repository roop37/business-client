import { ORGANISER_JOURNEY } from "../data/site-copy";

const AI_STEP_COPY =
  "Before a paid event is published, Hoizr can evaluate the event context and surface the available event-specific options.";

const JOURNEY_STEPS = ORGANISER_JOURNEY.map((step, index) =>
  index === 2 ? { ...step, body: AI_STEP_COPY } : step
);

export const HowHoizrWorks = () => {
  return (
    <section className="hm-section">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-start">
        <div className="max-w-[620px] lg:sticky lg:top-28">
          <div className="hm-eyebrow">How Hoizr works</div>
          <h2 className="hm-h2 mt-3">
            The platform follows the real event lifecycle.
          </h2>
          <p className="hm-lead mt-5 max-w-[600px]">
            Each step feeds the next one. The listing creates the checkout. The
            checkout builds the CRM. The CRM powers campaigns. The door creates
            attendance data. Reporting tells you what to change before the next
            show.
          </p>
        </div>

        <div className="space-y-4">
          {JOURNEY_STEPS.map((step, index) => (
            <article
              key={step.title}
              className={`rounded-[26px] border p-6 md:p-7 ${
                index === 2
                  ? "border-[var(--m-forest-700)] bg-[var(--m-forest-700)] text-white shadow-[var(--m-shadow-pop)]"
                  : "border-[var(--m-border)] bg-[var(--m-surface)] text-[var(--m-ink-1)] shadow-[var(--m-shadow-card)]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`hoizr-mark text-[38px] leading-none ${
                    index === 2
                      ? "text-[var(--m-acid)]"
                      : "text-[var(--m-ink-4)]"
                  }`}
                >
                  0{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                      index === 2 ? "text-white/60" : "text-[var(--m-ink-4)]"
                    }`}
                  >
                    {step.title}
                  </div>
                  <p
                    className={`mt-3 text-[15px] leading-[1.65] ${
                      index === 2 ? "text-white/84" : "text-[var(--m-ink-2)]"
                    }`}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
