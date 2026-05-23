"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { ProductContent } from "../data/product-content";

const EASE = [0.2, 0.6, 0.2, 1] as const;

export const ProductHowItWorks = ({ content }: { content: ProductContent }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // The horizontal connector line "draws" itself as the section
  // scrolls into view — a small flourish that ties the three steps
  // together visually.
  const lineScale = useTransform(scrollYProgress, [0.1, 0.6], [0, 1]);

  return (
    <section ref={sectionRef} className="hm-section">
      <div className="relative overflow-hidden rounded-[var(--m-r-2xl)] border border-[var(--m-border)] bg-[var(--m-surface)] px-5 py-12 md:px-14 md:py-20">
        {/* Decorative top-right acid glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(195,255,46,0.55), transparent 60%)",
          }}
        />

        <div className="relative max-w-[680px]">
          <div className="hm-eyebrow">Quick onboarding · same-day verify</div>
          <h2 className="hm-h2 mt-3">
            From signup to your first sold-out night.
          </h2>
          <p className="hm-lead mt-5 max-w-[560px]">
            We move fast on onboarding so {content.label.toLowerCase()} is live
            for your very next event — not the one after that.
          </p>
        </div>

        <div className="relative mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Connector line across the three steps — origin-left scaleX
              tied to scroll progress. Hidden on mobile to avoid
              vertical mess. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-[6%] right-[6%] top-[42px] hidden h-px origin-left bg-gradient-to-r from-[var(--m-forest-300)] via-[var(--m-acid)] to-[var(--m-forest-300)] md:block"
            style={{ scaleX: lineScale }}
          />

          {content.howItWorks.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-canvas-2)] p-5 transition-shadow duration-500 hover:shadow-[0_20px_50px_-20px_rgba(15,15,15,0.18)] md:p-7"
            >
              <div className="flex items-center gap-3">
                <motion.span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--m-forest-700)] text-[12px] font-bold text-[var(--m-acid)] shadow-[0_8px_20px_rgba(15,15,15,0.16)]"
                  style={{ fontFamily: "var(--m-font-sans)" }}
                  initial={{ scale: 0.6, rotate: -90, opacity: 0 }}
                  whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 16,
                    delay: 0.15 + i * 0.12,
                  }}
                >
                  {i + 1}
                </motion.span>
                <span className="hm-eyebrow">Step 0{i + 1}</span>
              </div>

              <h3
                className="mt-5 font-semibold leading-tight tracking-[-0.015em] text-[var(--m-ink-1)]"
                style={{ fontSize: "clamp(18px, 1.8vw, 22px)" }}
              >
                {s.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--m-ink-3)]">
                {s.body}
              </p>

              {/* Tiny arrow between cards — appears only on the first
                  two on desktop, hidden on mobile where the stack
                  reads vertically. */}
              {i < content.howItWorks.length - 1 && (
                <span
                  aria-hidden
                  className="absolute right-[-22px] top-[34px] hidden h-7 w-7 items-center justify-center rounded-full border border-[var(--m-border)] bg-white text-[var(--m-ink-3)] shadow-[0_4px_12px_rgba(15,15,15,0.08)] transition-transform duration-500 group-hover:translate-x-1 md:inline-flex"
                >
                  <ArrowRight size={14} strokeWidth={2.2} />
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
