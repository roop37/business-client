"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { COMING_SOON_PRODUCTS } from "../data/nav-products";

export const ComingSoonBento = () => (
  <section id="coming-soon" className="hm-section scroll-mt-24">
    <div className="max-w-[760px]">
      <div className="hm-eyebrow">Coming Soon</div>
      <h2 className="hm-h2 mt-3">The next layer of audience and event tools.</h2>
      <p className="hm-lead mt-5 max-w-[620px]">
        These capabilities are not available in the organiser workspace yet.
        Book a guided tour if you want to understand the roadmap and where they
        fit.
      </p>
    </div>

    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {COMING_SOON_PRODUCTS.map((product, index) => (
        <article
          key={product.title}
          className={`rounded-[var(--m-r-lg)] border border-[var(--m-border)] p-6 ${
            index === 0
              ? "bg-[#080808] text-white md:col-span-2"
              : "bg-[var(--m-surface)] text-[var(--m-ink-1)]"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-current/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] opacity-75">
            <Clock3 size={12} />
            Coming Soon
          </span>
          <h3 className="mt-5 text-[22px] font-semibold leading-tight">
            {product.title}
          </h3>
          <p
            className={`mt-3 text-[14px] leading-6 ${
              index === 0 ? "text-white/72" : "text-[var(--m-ink-3)]"
            }`}
          >
            {product.body}
          </p>
          <Link
            href="/book-a-demo"
            className={`mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold ${
              index === 0
                ? "text-[var(--m-acid)]"
                : "text-[var(--m-forest-700)]"
            }`}
          >
            Book a Demo <ArrowUpRight size={14} />
          </Link>
        </article>
      ))}
    </div>
  </section>
);
