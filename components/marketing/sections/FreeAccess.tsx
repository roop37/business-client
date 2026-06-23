import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { FREE_ACCESS_POINTS } from "../data/site-copy";

export const FreeAccess = () => {
  return (
    <section className="hm-section">
      <div className="rounded-[30px] border border-[var(--m-border)] bg-[var(--m-surface)] p-6 shadow-[var(--m-shadow-card)] md:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
          <div className="max-w-[560px]">
            <div className="hm-eyebrow">Free access</div>
            <h2 className="hm-h2 mt-3">Start building the event before a sales call.</h2>
            <p className="hm-lead mt-5 max-w-[560px]">
              Create your Hoizr account, set up the organisation and begin
              drafting events without a setup fee, subscription or card
              details.
            </p>
            <Link
              href="/signup"
              className="hm-btn hm-btn-primary mt-8 inline-flex"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {FREE_ACCESS_POINTS.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-[20px] border border-[var(--m-border)] bg-[var(--m-canvas-2)] px-4 py-3"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--m-forest-700)] text-[var(--m-acid)]">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-[14px] font-medium leading-[1.55] text-[var(--m-ink-2)]">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
