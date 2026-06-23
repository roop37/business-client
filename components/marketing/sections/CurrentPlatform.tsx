import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ALL_PRODUCTS, MARKETING_PILLARS } from "../data/nav-products";

const pillarBySlug = new Map(
  MARKETING_PILLARS.flatMap((pillar) =>
    pillar.products.map((product) => [product.slug, pillar.label] as const)
  )
);

export const CurrentPlatform = () => {
  return (
    <section className="hm-section">
      <div className="max-w-[760px]">
        <div className="hm-eyebrow">Current platform</div>
        <h2 className="hm-h2 mt-3">Eight live products, no coming-soon haze.</h2>
        <p className="hm-lead mt-5 max-w-[640px]">
          These are the products already in the organiser workspace today.
          Every card below links to the current product surface.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ALL_PRODUCTS.map((product) => (
          <article
            key={product.slug}
            className="flex h-full flex-col rounded-[24px] border border-[var(--m-border)] bg-[var(--m-surface)] p-5 shadow-[var(--m-shadow-card)]"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--m-ink-4)]">
              {pillarBySlug.get(product.slug)}
            </div>
            <h3 className="mt-3 text-[18px] font-semibold leading-snug tracking-[-0.015em] text-[var(--m-ink-1)]">
              {product.label}
            </h3>
            <p className="mt-3 text-[14px] leading-[1.6] text-[var(--m-ink-3)]">
              {product.blurb}
            </p>
            <Link
              href={`/product/${product.slug}`}
              className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-semibold text-[var(--m-forest-700)]"
            >
              View product
              <ArrowRight size={14} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};
