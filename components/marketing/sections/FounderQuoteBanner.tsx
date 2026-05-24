"use client";

import { motion } from "framer-motion";
import { BlurImage } from "../visuals/BlurImage";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const QUOTE_IMAGE = "/images/pexels-maumascaro-801863_st01gd.jpg";

/**
 * End-to-end thesis banner. Replaces the ValueMarquee that used to
 * sit under the hero with a single anchored product statement.
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
      className="relative mx-auto max-w-[1040px] px-6 py-14 text-center text-white md:py-20"
    >
      <div className="relative">
        <p
          className="mx-auto max-w-[900px] text-balance font-extrabold leading-[1.08] tracking-[-0.018em] text-white"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(26px, 4.2vw, 48px)",
          }}
        >
          Focus on your event and your guest experience. We&apos;ll handle the rest.
        </p>
        <footer className="mt-7 flex flex-col items-center gap-1.5 text-white/85">
          <span className="inline-block h-px w-12 bg-[var(--m-acid)] opacity-80" />
          <div className="text-[15px] font-semibold tracking-tight">
            Sanbedan Paul
          </div>
          <div className="text-[12.5px] font-medium uppercase tracking-[0.16em] text-white/65">
            Hoizr
          </div>
        </footer>
      </div>
    </motion.div>
  </section>
);
