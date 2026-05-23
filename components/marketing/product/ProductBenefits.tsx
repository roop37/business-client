"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ProductContent } from "../data/product-content";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const TONES = [
  "bg-[var(--m-surface-elevated)] border border-[var(--m-border)] text-[var(--m-ink-1)]",
  "bg-[var(--m-ink-1)] text-white",
  "bg-[var(--m-surface-elevated)] border border-[var(--m-border)] text-[var(--m-ink-1)]",
];

// Dark middle "02" card photo background — rotates across the three
// approved party photos by slug-hash so different product pages get
// different backdrops while staying inside the approved set.
const PHOTO_OPTIONS = [
  "/images/pexels-osvaldo-coelho-jr-388501-1117256_oi210m.jpg",
  "/images/pexels-maumascaro-801863_st01gd.jpg",
  "/images/pexels-wendywei-1190297_jwisnp.jpg",
];

const hashSlug = (slug: string): number => {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

export const ProductBenefits = ({ content }: { content: ProductContent }) => {
  const featureBackground =
    PHOTO_OPTIONS[hashSlug(content.slug) % PHOTO_OPTIONS.length];
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Header text drifts up slightly as user scrolls past — adds depth
  // without distracting from the cards.
  const headerY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section ref={sectionRef} className="hm-section">
      <motion.div style={{ y: headerY }}>
        <div className="hm-eyebrow">Why hosts pick this</div>
        <h2 className="hm-h2 mt-3 max-w-[760px]">
          Three things {content.label} actually changes for your business.
        </h2>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {content.benefits.map((b, i) => {
          const isDark = i === 1;
          const useImageBackground = i === 1;
          return (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className={`group relative min-h-[280px] overflow-hidden rounded-[var(--m-r-xl)] p-8 transition-shadow duration-500 hover:shadow-[0_28px_60px_-20px_rgba(15,15,15,0.22)] md:p-10 ${TONES[i]}`}
            >
              {useImageBackground ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featureBackground}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover grayscale brightness-110 contrast-110"
                  />
                  {/* Acid-tinted duotone — pulls grain forward,
                      shadows go to anchored black so the white
                      display title reads cleanly. */}
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(160deg, rgba(214,255,63,0.16) 0%, rgba(12,12,10,0.55) 55%, rgba(6,6,4,0.92) 100%)",
                    }}
                  />
                </>
              ) : null}

              {/* Decorative number — Bodoni display for the dark
                  middle card so it reads premium; sans for the
                  light cards so it stays neutral. */}
              <motion.div
                className={`relative font-bold leading-none tracking-[-0.04em] ${
                  isDark
                    ? "text-[64px] text-[var(--m-acid)] md:text-[72px]"
                    : "text-[60px] text-[var(--m-ink-4)]"
                }`}
                style={{
                  fontFamily: "var(--m-font-display)",
                  textShadow: isDark ? "0 0 24px rgba(214,255,63,0.25)" : undefined,
                }}
                initial={{ opacity: 0, scale: 0.7, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.8,
                  ease: EASE,
                  delay: 0.15 + i * 0.08,
                }}
              >
                0{i + 1}
              </motion.div>

              <motion.h3
                className="relative mt-6 font-semibold leading-tight tracking-[-0.02em]"
                style={{
                  fontFamily: isDark ? "var(--m-font-display)" : undefined,
                  fontSize: isDark
                    ? "clamp(24px, 2.6vw, 32px)"
                    : "clamp(20px, 2.2vw, 26px)",
                }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  ease: EASE,
                  delay: 0.2 + i * 0.08,
                }}
              >
                {b.title}
              </motion.h3>

              <motion.p
                className={`relative mt-3 text-[15px] leading-relaxed ${
                  isDark ? "text-white/84" : "text-[var(--m-ink-2)]"
                }`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  ease: EASE,
                  delay: 0.28 + i * 0.08,
                }}
              >
                {b.body}
              </motion.p>

              {/* Hover-only acid sweep at the bottom of the card. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-[var(--m-acid)] to-transparent transition-transform duration-700 ease-out group-hover:scale-x-100"
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
