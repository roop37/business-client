"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { COMING_SOON_PRODUCTS } from "../data/nav-products";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * Roadmap strip. Clearly labelled "Coming soon" so nothing here reads as
 * available today — this is the honesty layer the whole rebuild is built
 * around. Each item maps to an Upcoming/In-Progress feature.
 */
export const ComingSoon = () => {
  return (
    <section id="coming-soon" className="hm-section scroll-mt-24">
      <div className="max-w-[760px]">
        <div className="hm-eyebrow">Coming soon</div>
        <h2 className="hm-h2 mt-3">On the way, not oversold.</h2>
        <p className="hm-lead mt-5 max-w-[600px]">
          Here&apos;s what we&apos;re building next. It isn&apos;t live yet, and
          we won&apos;t pretend it is. Book a demo if you want to see where
          it&apos;s headed.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {COMING_SOON_PRODUCTS.map((product, index) => (
          <motion.article
            key={product.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.5, ease: EASE, delay: (index % 3) * 0.05 }}
            className="flex h-full flex-col rounded-[var(--m-r-lg)] border border-dashed border-[var(--m-border-strong)] bg-[var(--m-canvas-2)] p-6"
          >
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--m-border-strong)] bg-[var(--m-surface)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--m-ink-4)]">
              <Clock3 size={12} />
              Coming soon
            </span>
            <h3 className="mt-5 text-[20px] font-semibold leading-snug tracking-[-0.015em] text-[var(--m-ink-1)]">
              {product.title}
            </h3>
            <p className="mt-3 text-[14px] leading-[1.6] text-[var(--m-ink-3)]">
              {product.body}
            </p>
          </motion.article>
        ))}
      </div>

      <div className="mt-10">
        <Link
          href="/book-a-demo"
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--m-forest-700)] hover:underline"
        >
          See the roadmap on a demo
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </section>
  );
};
