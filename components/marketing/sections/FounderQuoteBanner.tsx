"use client";

import { motion } from "framer-motion";
import { BlurImage } from "../visuals/BlurImage";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const QUOTE_IMAGE = "/images/pexels-maumascaro-801863_st01gd.jpg";

/**
 * End-to-end founder quote banner. Replaces the ValueMarquee that
 * used to sit under the hero — a single anchored thesis from the
 * founder reads stronger than a continuously-scrolling capability
 * strip pre-launch.
 *
 * The banner deliberately bleeds full-width (no rounded card) so it
 * acts as a visual breath between the Hero and the product grid.
 */
export const FounderQuoteBanner = () => (
  <section className="relative isolate overflow-hidden">
    <BlurImage
      src={QUOTE_IMAGE}
      alt=""
      aria-hidden
      fill
      sizes="100vw"
      priority
      className="absolute inset-0 h-full w-full object-cover"
      draggable={false}
    />
    {/* Two-stop scrim — slightly stronger at the centre band where
        the quote sits, lighter at the edges so the photo still reads. */}
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(5,5,5,0.78) 0%, rgba(5,5,5,0.55) 35%, rgba(5,5,5,0.55) 65%, rgba(5,5,5,0.82) 100%)",
      }}
    />
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(60% 60% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
      }}
    />

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: EASE }}
      className="relative mx-auto max-w-[1100px] px-6 py-20 text-center text-white md:py-28"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--m-acid)]" />
        From the founder
      </span>

      <blockquote className="mt-7">
        <p
          className="mx-auto max-w-[920px] text-balance font-semibold leading-[1.18] tracking-[-0.018em] text-white"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(26px, 4.4vw, 50px)",
          }}
        >
          <span
            aria-hidden
            className="mr-2 inline-block translate-y-[0.08em] text-[var(--m-acid)]"
            style={{ fontSize: "1.1em", lineHeight: 1 }}
          >
            &ldquo;
          </span>
          Event organisers and venues should focus on their thing — Hoizr
          handles the rest.
          <span
            aria-hidden
            className="ml-2 inline-block translate-y-[0.08em] text-[var(--m-acid)]"
            style={{ fontSize: "1.1em", lineHeight: 1 }}
          >
            &rdquo;
          </span>
        </p>
        <footer className="mt-8 flex flex-col items-center gap-1.5 text-white/85">
          <span className="inline-block h-px w-12 bg-[var(--m-acid)] opacity-80" />
          <div className="text-[15px] font-semibold tracking-tight">
            Sanbedan Paul
          </div>
          <div className="text-[12.5px] font-medium uppercase tracking-[0.16em] text-white/65">
            Founder &amp; CEO · Hoizr
          </div>
        </footer>
      </blockquote>
    </motion.div>
  </section>
);
