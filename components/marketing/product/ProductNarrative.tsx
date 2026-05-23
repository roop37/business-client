"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Quote } from "lucide-react";
import { useRef } from "react";
import { ProductContent } from "../data/product-content";
import { getProductStoryImageSrc } from "./product-story-images";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const wordSplit = (s: string): string[] =>
  s.replace(/\s+/g, " ").trim().split(" ");

/**
 * ProductNarrative — long-form storytelling block.
 *
 * Sits between the gallery and how-it-works sections so the visitor
 * gets a substantial, paragraph-level read between the dense feature
 * surfaces. Heavy on motion:
 *   - Section heading reveals word-by-word with blur+y stagger.
 *   - Pull quote slides in from the left with a left acid bar
 *     scaling-in below it.
 *   - Each paragraph fades up sequentially.
 *   - Embedded product image becomes sticky on desktop and
 *     parallaxes against the surrounding text.
 */
export const ProductNarrative = ({
  content,
}: {
  content: ProductContent;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const accentScale = useTransform(scrollYProgress, [0.1, 0.55], [0, 1]);

  const image = getProductStoryImageSrc(content.slug);
  const headingWords = wordSplit(`The story behind ${content.label}.`);

  return (
    <section ref={sectionRef} className="hm-section">
      <div className="grid items-start gap-12 md:grid-cols-[1fr,1.05fr] md:gap-16">
        {/* LEFT — sticky product image with parallax + acid accent bar
            scrolling underneath. */}
        <div className="md:sticky md:top-28">
          <motion.div
            className="relative overflow-hidden rounded-[var(--m-r-2xl)] border border-[var(--m-border)] bg-[var(--m-canvas-2)]"
            style={{ y: imageY }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={`${content.label} interface`}
                className="block h-auto w-full"
                draggable={false}
              />
            ) : (
              <div className="aspect-[4/5] bg-gradient-to-br from-[var(--m-canvas-2)] to-[var(--m-surface)]" />
            )}

            {/* Inner sheen for the same glass effect the hero uses. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"
            />
          </motion.div>

          {/* Acid bar that scales in as the section enters the viewport. */}
          <motion.div
            aria-hidden
            className="mt-4 h-1 origin-left rounded-full bg-gradient-to-r from-[var(--m-acid)] to-[var(--m-forest-300)]"
            style={{ scaleX: accentScale }}
          />
        </div>

        {/* RIGHT — heading + pull quote + paragraphs */}
        <div>
          <div className="hm-eyebrow">The story</div>
          <h2
            className="mt-3 flex flex-wrap gap-x-2.5 gap-y-1.5 font-bold leading-[1.04] tracking-[-0.025em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(30px, 3.6vw, 46px)",
            }}
          >
            {headingWords.map((w, i) => (
              <motion.span
                key={`${w}-${i}`}
                className="inline-block"
                initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: 0.05 + i * 0.045,
                }}
              >
                {w}
              </motion.span>
            ))}
          </h2>

          {/* Pull quote */}
          <motion.blockquote
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
            className="relative mt-9 rounded-[var(--m-r-lg)] border border-[var(--m-border-strong)] bg-[var(--m-surface-elevated)] p-7 shadow-[var(--m-shadow-card)] md:p-8"
          >
            <Quote
              size={22}
              className="absolute -top-3 left-6 rounded-full bg-[var(--m-acid)] p-1.5 text-[var(--m-forest-900)]"
              strokeWidth={2.4}
            />
            <p
              className="text-[18px] leading-[1.5] text-[var(--m-ink-1)]"
              style={{ fontFamily: "var(--m-font-display)" }}
            >
              {content.narrative.pullQuote}
            </p>
          </motion.blockquote>

          {/* Long-form paragraphs — each fades up independently. */}
          <div className="mt-8 space-y-5">
            {content.narrative.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: 0.35 + i * 0.1,
                }}
                className="text-[16px] leading-[1.7] text-[var(--m-ink-2)]"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
