"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

const EASE = [0.2, 0.6, 0.2, 1] as const;

type Tone =
  | "cream"
  | "surface"
  | "white"
  | "paper"
  | "snow"
  | "forest"
  | "green"
  | "ink"
  | "acid"
  | "blush"
  | "orange";
type Span = 4 | 5 | 6 | 7 | 8 | 12;
type RowSpan = 1 | 2 | 3;
type Layout = "bottom" | "right" | "fill" | "image-only";

type BentoCardProps = {
  eyebrow?: string;
  title: string;
  body: string;
  href?: string;
  tone?: Tone;
  /** Column span on desktop (12-col grid). Defaults to 4. */
  span?: Span;
  /**
   * Row span on desktop. Used to make a card vertically fill the
   * empty whitespace next to taller neighbouring cards. Defaults to 1.
   * Pair with the parent grid's `[grid-auto-flow:dense]` so adjacent
   * cards pack into the freed row gaps.
   */
  rowSpan?: RowSpan;
  /** Approximate min height in px (mobile + desktop). */
  minHeight?: number;
  /** Visual slot. Can be any JSX — product mock UI, image, or custom media. */
  visual?: ReactNode;
  /** Where the visual sits relative to the text.
   *  `image-only` hides all card text and lets the visual fill the card.
   */
  layout?: Layout;
  delay?: number;
  /** Extra classes on the headline — used for premium accents like `hm-cursive`. */
  titleClassName?: string;
};

const TONE_STYLES: Record<Tone, string> = {
  cream: "bg-[var(--m-canvas-2)] text-[var(--m-ink-1)] border border-[var(--m-border)]",
  surface: "bg-[var(--m-surface)] text-[var(--m-ink-1)] border border-[var(--m-border)]",
  white: "bg-[#FEFCFA] text-[var(--m-ink-1)] border border-[var(--m-border)]",
  paper: "bg-[#FAF5F3] text-[var(--m-ink-1)] border border-[var(--m-border)]",
  snow: "bg-white text-[var(--m-ink-1)] border border-[var(--m-border)]",
  forest: "bg-[var(--m-forest-700)] text-white",
  green: "bg-[var(--m-forest-600)] text-white",
  ink: "bg-[var(--m-ink-1)] text-white",
  acid: "bg-[var(--m-acid)] text-[var(--m-forest-900)]",
  blush: "bg-[var(--m-blush)] text-[var(--m-forest-900)]",
  orange: "bg-[#EF7B24] text-white",
};

const SPAN_CLASS: Record<Span, string> = {
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  12: "md:col-span-12",
};

const ROW_SPAN_CLASS: Record<RowSpan, string> = {
  1: "",
  2: "md:row-span-2",
  3: "md:row-span-3",
};

export const BentoCard = ({
  eyebrow,
  title,
  body,
  href,
  tone = "surface",
  span = 4,
  rowSpan = 1,
  minHeight = 360,
  visual,
  layout = "bottom",
  delay = 0,
  titleClassName = "",
}: BentoCardProps) => {
  const isDark =
    tone === "forest" ||
    tone === "ink" ||
    tone === "green" ||
    tone === "orange";
  const eyebrowColor = isDark
    ? "text-white/70"
    : tone === "acid" || tone === "blush"
      ? "text-[var(--m-forest-900)]/65"
      : "text-[var(--m-ink-4)]";
  const bodyColor = isDark
    ? "text-white/80"
    : tone === "acid" || tone === "blush"
      ? "text-[var(--m-forest-900)]/85"
      : "text-[var(--m-ink-3)]";

  const Container: any = href ? Link : "div";
  const containerProps = href ? { href } : {};

  const containerClass = `group relative block h-full overflow-hidden rounded-[var(--m-r-xl)] transition-all duration-300 ${TONE_STYLES[tone]} ${
    href ? "hover:-translate-y-1 hover:shadow-[var(--m-shadow-pop)]" : ""
  }`;
  const isFill = layout === "fill";

  // Image-only mode: card text disappears, the visual is the whole card.
  // A small "Learn more" chip fades in on hover so the click target is
  // still discoverable.
  if (layout === "image-only") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, ease: EASE, delay }}
        className={`col-span-12 ${SPAN_CLASS[span]} ${ROW_SPAN_CLASS[rowSpan]}`}
      >
        <Container
          {...containerProps}
          className={containerClass}
          style={{ minHeight }}
          aria-label={title}
        >
          {visual ? <div className="absolute inset-0">{visual}</div> : null}
          {href ? (
            <div
              className={`pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                isDark
                  ? "bg-[var(--m-acid)] text-[var(--m-forest-900)]"
                  : "bg-[var(--m-ink-1)] text-white"
              }`}
            >
              Learn more
              <span aria-hidden>→</span>
            </div>
          ) : null}
        </Container>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: EASE, delay }}
      className={`col-span-12 ${SPAN_CLASS[span]} ${ROW_SPAN_CLASS[rowSpan]}`}
    >
      <Container
        {...containerProps}
        className={containerClass}
        style={{ minHeight }}
      >
        {isFill && visual ? (
          <>
            <div className="absolute inset-0">{visual}</div>
            {/* Lighter overlay (was nearly opaque) — preserves image
                detail while keeping the bottom-anchored title + body
                readable. Bottom-heavy gradient so the image breathes
                at the top and only the text strip is shaded. */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.74) 100%)",
              }}
            />
          </>
        ) : null}

        <div
          className={`relative h-full flex ${
            layout === "right" ? "flex-col md:flex-row" : "flex-col"
          } ${isFill ? "justify-end" : ""}`}
          style={isFill ? { minHeight } : undefined}
        >
          <div
            className={`relative ${
              layout === "right" ? "md:w-[55%] md:shrink-0" : "w-full"
            } ${
              isFill
                ? "px-6 py-7 md:px-8 md:py-8"
                : "px-7 pt-7 md:px-9 md:pt-9"
          }`}
          >
            {eyebrow ? (
              <div
                className={`text-[11.5px] font-semibold uppercase tracking-[0.12em] ${eyebrowColor}`}
              >
                {eyebrow}
              </div>
            ) : null}
            <h3
              className={`mt-3 font-semibold leading-tight tracking-[-0.02em] text-[clamp(22px,2.4vw,28px)] ${
                isDark ? "text-white" : ""
              } ${isFill && visual ? "drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]" : ""} ${titleClassName}`}
              style={
                titleClassName.includes("hm-cursive")
                  ? undefined
                  : { fontFamily: "var(--m-font-sans)" }
              }
            >
              {title}
            </h3>
            <p
              className={`mt-3 text-[15px] leading-relaxed ${
                isFill ? "max-w-[560px] text-white/82" : `max-w-[420px] ${bodyColor}`
              } ${isFill && visual ? "drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]" : ""}`}
            >
              {body}
            </p>
            {href ? (
              <div
                className={`mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold ${
                  isDark
                    ? "text-[var(--m-acid)]"
                    : tone === "acid" || tone === "blush"
                      ? "text-[var(--m-forest-800)]"
                      : "text-[var(--m-forest-700)]"
                }`}
              >
                Learn more
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </div>
            ) : null}
          </div>

          {visual && !isFill ? (
            <div
              className={`relative ${
                layout === "right"
                  ? "md:flex-1 md:p-6"
                  : "mt-6 px-7 pb-7 md:px-9 md:pb-9"
              }`}
            >
              <div className="relative h-full overflow-hidden rounded-2xl">
                {visual}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </motion.div>
  );
};
