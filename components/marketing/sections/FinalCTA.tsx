"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * Closing CTA — image-backed panel with a large sentence-case headline
 * and two CTAs. Sits directly above the footer.
 */
export const FinalCTA = () => {
  return (
    <section className="hm-section">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative overflow-hidden rounded-[var(--m-r-2xl)] bg-[var(--m-ink-1)] px-8 py-20 text-center text-white md:px-16 md:py-28"
      >
        <Image
          src="/marketing/brand/metallic-line-banner.png"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover"
          draggable={false}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-semibold tracking-wider text-white/95 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--m-acid)]" />
            Full event operating stack
          </span>

          <h2
            className="mx-auto mt-7 max-w-[860px] text-balance font-bold leading-[0.98] tracking-[-0.03em] text-white"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(44px, 7vw, 88px)",
            }}
          >
            Build the audience for this event — and the next one.
          </h2>

          <p className="mx-auto mt-6 max-w-[560px] text-[17px] leading-relaxed text-white/75">
            Publish, sell, engage and operate from one organiser platform built
            for India.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="hm-btn hm-btn-acid">
              Get Started
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/book-a-demo"
              className="hm-btn hm-btn-on-dark border border-white/15"
              style={{ background: "transparent", color: "white" }}
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
