"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { AI_BLOCK } from "../data/site-copy";
import { BlurImage } from "../visuals/BlurImage";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * AI block. Scoped tightly to what actually ships: event evaluation,
 * description/SEO drafting, and a Boost offer (lower commission where
 * eligible). No budget-split / content-studio claims — those are
 * roadmap and live in the Coming Soon strip.
 */
export const AiSection = () => {
  return (
    <section className="hm-section">
      <div className="relative overflow-hidden rounded-[var(--m-r-2xl)] bg-[var(--m-ink-1)] px-7 py-12 text-white md:px-14 md:py-16">
        <img
          src="/marketing/brand/metallic-line-banner.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          draggable={false}
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-semibold tracking-wider text-white/95 backdrop-blur">
              <Sparkles size={13} className="text-[var(--m-acid)]" />
              {AI_BLOCK.eyebrow}
            </span>
            <h2
              className="mt-6 font-bold leading-[1.04] tracking-[-0.025em] text-white"
              style={{
                fontFamily: "var(--m-font-display)",
                fontSize: "clamp(30px, 4.2vw, 50px)",
              }}
            >
              {AI_BLOCK.headline}
            </h2>
            <p className="mt-5 max-w-[500px] text-[16px] leading-relaxed text-white/75">
              {AI_BLOCK.body}
            </p>
            <Link
              href="/product/ai-event-assistant"
              className="hm-btn hm-btn-acid mt-8 inline-flex"
            >
              See the AI Event Assistant
              <ArrowRight size={16} />
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
              src="/marketing/home/ai-evaluation.png"
              alt="Hoizr AI event evaluation"
              width={1600}
              height={1000}
              sizes="(max-width: 1024px) 100vw, 520px"
              className="h-auto w-full rounded-[20px] border border-white/10 object-cover shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
