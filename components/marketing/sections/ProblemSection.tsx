"use client";

import { motion } from "framer-motion";
import { ORGANISER_PROBLEMS } from "../data/site-copy";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * The problem section. Written in the organizer's own words, naming the
 * three pains the research surfaced loudest: rented audience, money
 * stuck, door chaos.
 */
export const ProblemSection = () => {
  return (
    <section className="hm-section">
      <div className="max-w-[760px]">
        <div className="hm-eyebrow">The problem</div>
        <h2 className="hm-h2 mt-3">
          You do the work. The marketplace keeps the customer.
        </h2>
        <p className="hm-lead mt-5 max-w-[620px]">
          You fill the room. Then a platform walks away with your buyers, sits
          on your money, and hands you a payout — not a relationship.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {ORGANISER_PROBLEMS.map((problem, index) => (
          <motion.article
            key={problem.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: index * 0.06 }}
            className="flex h-full flex-col rounded-[24px] border border-[var(--m-border)] bg-[var(--m-surface)] p-7 shadow-[var(--m-shadow-card)]"
          >
            <div className="text-[13px] font-semibold tabular-nums text-[var(--m-ink-4)]">
              0{index + 1}
            </div>
            <h3 className="mt-4 text-[20px] font-semibold leading-snug tracking-[-0.015em] text-[var(--m-ink-1)]">
              {problem.title}
            </h3>
            <p className="mt-3 text-[15px] leading-[1.6] text-[var(--m-ink-3)]">
              {problem.body}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
};
