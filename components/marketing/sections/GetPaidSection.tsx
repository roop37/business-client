"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { GET_PAID } from "../data/site-copy";
import { BlurImage } from "../visuals/BlurImage";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * "Get paid & decide" — money clarity. Settlement + reporting, kept
 * short. The pain ("money stuck for weeks") is loud in the research, so
 * this earns its own block above the AI section.
 */
export const GetPaidSection = () => {
  return (
    <section className="hm-section">
      <div className="grid items-center gap-10 rounded-[var(--m-r-2xl)] border border-[var(--m-border)] bg-[var(--m-surface)] p-7 shadow-[var(--m-shadow-card)] lg:grid-cols-2 lg:gap-14 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="hm-eyebrow">{GET_PAID.eyebrow}</div>
          <h2 className="hm-h2 mt-3 text-[clamp(28px,3.4vw,44px)]">
            {GET_PAID.headline}
          </h2>
          <p className="hm-lead mt-5 max-w-[480px]">{GET_PAID.body}</p>
          <ul className="mt-7 space-y-3">
            {GET_PAID.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--m-forest-700)] text-[var(--m-acid)]">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-[15px] leading-snug text-[var(--m-ink-2)]">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/product/payouts-settlements"
            className="mt-8 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--m-forest-700)] hover:underline"
          >
            See payouts & reports
            <ArrowRight size={15} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative"
        >
          <BlurImage
            src="/marketing/home/get-paid.png"
            alt="Settlement and reporting in Hoizr"
            width={1600}
            height={1000}
            sizes="(max-width: 1024px) 100vw, 520px"
            className="h-auto w-full rounded-[20px] border border-[var(--m-border)] object-cover shadow-[0_18px_44px_-20px_rgba(15,15,15,0.25)]"
          />
        </motion.div>
      </div>
    </section>
  );
};
