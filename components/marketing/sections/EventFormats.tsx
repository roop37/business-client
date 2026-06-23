import { EVENT_FORMATS } from "../data/site-copy";

export const EventFormats = () => {
  return (
    <section className="hm-section py-8 md:py-10">
      <p className="text-center text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-4)]">
        Built for the events India goes out for
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3">
        {EVENT_FORMATS.map((format) => (
          <span
            key={format}
            className="text-[14px] font-semibold text-[var(--m-ink-2)]"
          >
            {format}
          </span>
        ))}
      </div>
    </section>
  );
};
