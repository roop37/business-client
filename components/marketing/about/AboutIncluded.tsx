"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { MARKETING_PILLARS } from "../data/nav-products";

const EASE = [0.2, 0.6, 0.2, 1] as const;

export const AboutIncluded = () => {
  return (
    <section className="hm-section">
      <div className="max-w-[760px]">
        <div className="hm-eyebrow">What&apos;s included</div>
        <h2 className="hm-h2 mt-3">
          Everything you need to run a sold-out night.
        </h2>
        <p className="hm-lead mt-5 max-w-[600px]">
          Every Hoizr account gets the full platform — event pages, fan CRM,
          campaigns, AI recommendations, door tools, reporting, and settlement
          workflows. No subscription tiers, no card details, and no feature gates.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {MARKETING_PILLARS.map((pillar, idx) => (
          <motion.div
            key={pillar.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay: idx * 0.05 }}
            className="rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-surface)] p-6"
          >
            <div className="hm-eyebrow">{pillar.label}</div>
            <p className="mt-2 text-[13.5px] text-[var(--m-ink-3)] leading-relaxed">
              {pillar.tagline}
            </p>
            <ul className="mt-5 space-y-2.5">
              {pillar.products.map((p) => (
                <li key={p.slug} className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--m-forest-50)] text-[var(--m-forest-700)]">
                    <Check size={12} strokeWidth={2.4} />
                  </span>
                  <span className="text-[14px] font-medium text-[var(--m-ink-1)]">
                    {p.label}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
