import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MARKETING_PILLARS } from "../data/nav-products";

export const OutcomePillars = () => {
  return (
    <section className="hm-section">
      <div className="max-w-[760px]">
        <div className="hm-eyebrow">Outcome pillars</div>
        <h2 className="hm-h2 mt-3">Four outcomes. One organiser platform.</h2>
        <p className="hm-lead mt-5 max-w-[640px]">
          Hoizr is organised around the work organisers actually have to do:
          help people find the event, sell the right ticket, bring audiences
          back, and keep the night running cleanly.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {MARKETING_PILLARS.map((pillar) => {
          const primaryProduct = pillar.products[0];

          return (
            <article
              key={pillar.id}
              className="rounded-[28px] border border-[var(--m-border)] bg-[var(--m-surface)] p-6 shadow-[var(--m-shadow-card)] md:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="hm-eyebrow">{pillar.label}</div>
                <Link
                  href={`/product/${primaryProduct.slug}`}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--m-forest-700)]"
                >
                  Explore pillar
                  <ArrowRight size={14} />
                </Link>
              </div>
              <h3 className="mt-4 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[var(--m-ink-1)]">
                {pillar.tagline}
              </h3>
              <div className="mt-5 grid gap-3">
                {pillar.products.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/product/${product.slug}`}
                    className="group rounded-[18px] border border-[var(--m-border)] bg-[var(--m-canvas-2)] px-4 py-3 transition hover:border-[var(--m-forest-500)] hover:bg-white"
                  >
                    <div className="text-[15px] font-semibold text-[var(--m-ink-1)]">
                      {product.label}
                    </div>
                    <div className="mt-1 text-[13px] leading-relaxed text-[var(--m-ink-3)]">
                      {product.blurb}
                    </div>
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
