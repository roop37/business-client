"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useWaitlist } from "../waitlist/WaitlistContext";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * Closing CTA — image-backed panel with a large sentence-case headline
 * and two CTAs. Sits directly above the footer.
 */
export const FinalCTA = () => {
  const { open: openWaitlist } = useWaitlist();
  return (
    <section className="hm-section">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative overflow-hidden rounded-[var(--m-r-2xl)] bg-[var(--m-ink-1)] px-8 py-20 text-center text-white md:px-16 md:py-28"
      >
        <img
          src="/marketing/brand/metallic-line-banner.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[12px] font-semibold tracking-wider text-white/95 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--m-acid)]" />
          Get your event rate
        </span>

        <h2
          className="mt-7 font-bold leading-[0.98] tracking-[-0.03em] text-white text-balance mx-auto max-w-[860px]"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(44px, 7vw, 88px)",
          }}
        >
          The easiest way to grow your events in India.
        </h2>

        <p className="mt-6 text-[17px] leading-relaxed text-white/75 max-w-[560px] mx-auto">
          Direct sales. Owned fan CRM. AI pricing. Built for the way India
          actually goes out. Start with the commission offer for your next night.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
          {/* Pre-launch: signup CTA hidden; waitlist trigger in its place.
          <Link href="/signup" className="hm-btn hm-btn-acid">
            Get my event rate
            <ArrowRight size={16} />
          </Link>
          */}
          <button
            type="button"
            onClick={() => openWaitlist("final-cta")}
            className="hm-btn hm-btn-acid"
          >
            Join the waitlist
            <ArrowRight size={16} />
          </button>
          <Link
            href="/pricing"
            className="hm-btn hm-btn-on-dark border border-white/15"
            style={{ background: "transparent", color: "white" }}
          >
            <PlayCircle size={16} />
            See how it works
          </Link>
        </div>
        </div>

      </motion.div>
    </section>
  );
};
