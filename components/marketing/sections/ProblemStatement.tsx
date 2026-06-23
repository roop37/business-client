import { ORGANISER_PROBLEMS } from "../data/site-copy";

export const ProblemStatement = () => {
  return (
    <section className="hm-section">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
        <div className="max-w-[620px]">
          <div className="hm-eyebrow">The problem</div>
          <h2 className="hm-h2 mt-3">
            The event is one business. The tools should work like one.
          </h2>
          <p className="hm-lead mt-5 max-w-[600px]">
            When ticketing, campaigns, customer records, guestlists and door
            operations live in separate systems, organisers lose context
            between the first sale and the next event.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {ORGANISER_PROBLEMS.map((problem, index) => (
            <article
              key={problem}
              className="rounded-[24px] border border-[var(--m-border)] bg-[var(--m-surface)] p-6 shadow-[var(--m-shadow-card)]"
            >
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--m-ink-4)]">
                0{index + 1}
              </div>
              <p className="mt-4 text-[15px] leading-[1.65] text-[var(--m-ink-2)]">
                {problem}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
