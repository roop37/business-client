"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, PlayCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { ProductContent } from "../data/product-content";
import { WaitlistButton } from "../waitlist/WaitlistButton";
import { ProductVisual } from "./ProductVisual";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const wordSplit = (s: string): string[] =>
  s
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");

export const ProductHero = ({ content }: { content: ProductContent }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Parallax — visual side drifts up slowly as the hero scrolls past.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const words = wordSplit(content.hero.headline);

  return (
    <section ref={sectionRef} className="hm-section pt-12 md:pt-16">
      <Link
        href="/#products"
        className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--m-ink-3)] transition-colors hover:text-[var(--m-ink-1)]"
      >
        <motion.span
          aria-hidden
          className="inline-block"
          initial={{ x: 0 }}
          whileHover={{ x: -4 }}
        >
          ←
        </motion.span>
        All products
      </Link>

      <div className="mt-8 grid items-start gap-12 md:grid-cols-[0.95fr,1.08fr] md:gap-14">
        {/* LEFT — headline + body + bullets + CTAs */}
        <motion.div style={{ y: headlineY }}>
          <motion.span
            className="hm-chip max-w-full flex-wrap leading-snug"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <span className="hm-chip-dot shrink-0" />
            <span className="font-semibold">{content.pillarLabel}</span>
            <Sparkles
              size={12}
              strokeWidth={2.2}
              className="shrink-0 text-[var(--m-acid)]"
            />
          </motion.span>

          {/* Word-stagger headline — feels much more alive than a
              single-block fade-up. */}
          <h1
            className="hm-display mt-7 flex flex-wrap gap-x-3 gap-y-2"
            style={{ fontSize: "clamp(40px, 6vw, 80px)" }}
          >
            {words.map((w, i) => (
              <motion.span
                key={`${w}-${i}`}
                className="inline-block"
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: 0.05 + i * 0.04,
                }}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="hm-lead mt-6 max-w-[560px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: EASE,
              delay: 0.1 + words.length * 0.04,
            }}
          >
            {content.hero.body}
          </motion.p>

          <ul className="mt-8 max-w-[520px] space-y-2.5">
            {content.hero.bullets.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.35 + i * 0.07 }}
                whileHover={{ x: 4 }}
                className="flex items-start gap-2.5 text-[15px] text-[var(--m-ink-2)]"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--m-forest-50)] text-[var(--m-forest-700)]">
                  <Check size={12} strokeWidth={2.4} />
                </span>
                {b}
              </motion.li>
            ))}
          </ul>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
          >
            <WaitlistButton
              source={`product-${content.slug}`}
              className="hm-btn hm-btn-primary"
            >
              <span>Join the waitlist</span>
              <ArrowRight size={16} />
            </WaitlistButton>
            <Link
              href="/about"
              className="hm-btn hm-btn-ghost border border-[var(--m-border)]"
            >
              <PlayCircle size={16} />
              Why Hoizr
            </Link>
          </motion.div>
        </motion.div>

        {/* RIGHT — animated showcase visual. Parallaxes upward as the
            page scrolls. */}
        <motion.div style={{ y: visualY }} className="md:sticky md:top-24">
          <ProductVisual
            slug={content.slug}
            label={content.label}
            className="mx-auto w-full max-w-[590px]"
          />
        </motion.div>
      </div>
    </section>
  );
};
