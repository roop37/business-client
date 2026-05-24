"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { useWaitlist } from "../waitlist/WaitlistContext";

const EASE = [0.2, 0.6, 0.2, 1] as const;

export const PricingHero = () => {
  const { open: openWaitlist } = useWaitlist();
  return (
    <section className="hm-section text-center pt-14 pb-12 md:pt-20 md:pb-16">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="hm-chip max-w-full flex-wrap justify-center text-center leading-snug"
      >
        <BadgeCheck size={14} className="shrink-0 text-[var(--m-forest-700)]" />
        <span className="font-semibold">AI-rated commission for your event</span>
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        className="hm-display mt-7"
      >
        Get the lowest commission
        <br />
        <span className="text-[var(--m-forest-600)]">anywhere in India.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
        className="hm-lead mx-auto mt-7 max-w-[640px]"
      >
        Tell us your event type, city, scale, and ticket mix. Hoizr uses that
        context to give you the best commission offer we can make for the night.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
        className="mt-9 flex items-center justify-center gap-3 flex-wrap"
      >
        {/* Pre-launch: signup + login CTAs hidden; single waitlist trigger replaces them.
        <Link href="/signup" className="hm-btn hm-btn-primary">
          Get my event rate
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/login"
          className="hm-btn hm-btn-ghost border border-[var(--m-border)]"
        >
          I already have an account
        </Link>
        */}
        <button
          type="button"
          onClick={() => openWaitlist("pricing-hero")}
          className="hm-btn hm-btn-primary"
        >
          Join the waitlist
          <ArrowRight size={16} />
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.55 }}
        className="mt-4 text-[13px] text-[var(--m-ink-4)]"
      >
        No public rate cards, no hidden tiers — just the lowest commission in
        India, tuned to your event.
      </motion.p>
    </section>
  );
};
