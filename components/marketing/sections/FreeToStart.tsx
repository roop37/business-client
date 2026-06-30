"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { FREE_ACCESS, FREE_ACCESS_POINTS } from "../data/site-copy";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * Pricing stance, framed as a benefit. Free to start, pay when you sell.
 * Never states a commission % (event-specific via the AI Boost).
 */
export const FreeToStart = () => {
  return (
    <section className="hm-section">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto max-w-[760px] text-center"
      >
        <div className="hm-eyebrow">{FREE_ACCESS.eyebrow}</div>
        <h2 className="hm-h2 mt-3">{FREE_ACCESS.headline}</h2>
        <p className="hm-lead mx-auto mt-5 max-w-[560px]">{FREE_ACCESS.body}</p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
          {FREE_ACCESS_POINTS.map((point) => (
            <span
              key={point}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--m-border)] bg-[var(--m-surface)] px-3.5 py-2 text-[13.5px] font-semibold text-[var(--m-ink-1)]"
            >
              <Check size={14} className="text-[var(--m-forest-700)]" />
              {point}
            </span>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className="hm-btn hm-btn-primary">
            Get started
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/book-a-demo"
            className="hm-btn border border-[var(--m-border-strong)] bg-[var(--m-surface)] text-[var(--m-ink-1)] transition-colors hover:border-[var(--m-forest-500)] hover:bg-[var(--m-canvas-2)]"
          >
            Book a demo
          </Link>
        </div>
      </motion.div>
    </section>
  );
};
