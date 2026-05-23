"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { MarketingProduct } from "../data/nav-products";
import { ProductVisual } from "./ProductVisual";

const EASE = [0.2, 0.6, 0.2, 1] as const;

export const ProductRelated = ({
  pillarLabel,
  related,
}: {
  pillarLabel: string;
  related: MarketingProduct[];
}) => {
  if (!related.length) return null;
  return (
    <section className="hm-section">
      <div className="hm-eyebrow">{pillarLabel} · more from this pillar</div>
      <h2 className="hm-h2 mt-3 max-w-[760px]">Keep going.</h2>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {related.map((r, i) => (
          <motion.div
            key={r.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
          >
            <Link
              href={`/product/${r.slug}`}
              className="group block h-full overflow-hidden rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-surface)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--m-shadow-pop)]"
            >
              <ProductVisual
                slug={r.slug}
                label={r.label}
                compact
                className="aspect-[9/16] min-h-0 transition-transform duration-500 group-hover:scale-[1.015]"
              />
              <div className="p-7">
                <div className="flex items-start justify-between">
                  <h3
                    className="font-semibold leading-tight tracking-[-0.02em] text-[var(--m-ink-1)] pr-4"
                    style={{ fontSize: "clamp(20px, 2vw, 24px)" }}
                  >
                    {r.label}.
                  </h3>
                  <ArrowUpRight
                    size={20}
                    className="text-[var(--m-ink-4)] transition-colors group-hover:text-[var(--m-forest-700)]"
                  />
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-[var(--m-ink-3)]">
                  {r.blurb}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
