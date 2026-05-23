"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MagneticButton } from "../visuals/MagneticButton";
const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * Landing hero. Composition:
 *   1. Eyebrow chip + headline + body + CTAs.
 *   2. Metallic stage card behind the MacBook, with line artwork.
 *   3. MacBook mockup with the live host dashboard rendered inside
 *      the measured screen glass. No floating chips.
 *
 * Artwork in public/marketing/hero/:
 *   - metallic-bg.png
 *   - hero-lines-star.svg
 *   - laptop-frame.png (1920×1080)
 *   - /images/playbooks/Event-management-dashboard-overview.png (1586×992)
 */
export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Hero background intentionally empty — the marketing canvas
          colour underneath does all the work. PixelBlast removed per
          spec. */}
      <div className="hm-section relative pt-12 pb-14 text-center md:pt-20 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex justify-center px-4"
        >
          <span className="hm-chip max-w-full flex-wrap justify-center text-center leading-snug">
            <span className="hm-chip-dot shrink-0" />
            <span className="font-semibold text-[var(--m-ink-1)]">
              For India&apos;s live-music hosts
            </span>
            <span className="hidden text-[var(--m-ink-4)] sm:inline">
              : concerts · festivals · clubs
            </span>
          </span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
          }}
          className="hm-display mt-8"
        >
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
            }}
            className="block"
          >
            Fill the room.
          </motion.span>
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
            }}
            className="block text-[var(--m-forest-600)]"
          >
            Keep the room.
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
          className="hm-lead mx-auto mt-6 max-w-[640px]"
        >
          Hoizr is the ticketing, marketing, and ops stack built for the way
          India actually goes out. Direct sales, an owned fan CRM, and AI that
          quotes your best event-specific commission rate.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <MagneticButton href="/signup" className="hm-btn hm-btn-primary" pull={10}>
            Get my event rate
            <ArrowRight size={16} />
          </MagneticButton>
          <Link href="/pricing" className="hm-btn hm-btn-ghost border border-[var(--m-border)]">
            See how it works
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-4 text-[13px] text-[var(--m-ink-4)]"
        >
          Lowest commission in India · Event-specific AI rate · No long contracts.
        </motion.p>

        <HeroStage />
      </div>
    </section>
  );
};

const HeroStage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
      // Negative top margin pulls the laptop card up so the upper
      // edge visibly overlaps the hero CTA strip — the lid "breaks
      // out" of the hero copy instead of sitting cleanly below it.
      className="relative mx-auto -mt-6 w-full max-w-[1200px] md:-mt-12"
    >
      {/* Dark metallic stage card — restored per spec. It sits behind
          the MacBook and starts below the lid, so the laptop stays the
          primary object. Floating chips remain removed. */}
      <div
        className="absolute inset-x-0 z-0 overflow-hidden rounded-[20px] shadow-[0_30px_70px_rgba(5,5,5,0.28)] md:rounded-[24px]"
        style={{ top: "32%", bottom: "6%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/hero/metallic-bg.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/hero/hero-lines-star.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover opacity-85"
          draggable={false}
        />
      </div>

      <div className="relative z-10 mx-auto aspect-[1920/1080] w-full">
        <MonitorWithDashboard />
      </div>
    </motion.div>
  );
};

const MonitorWithDashboard = () => {
  return (
    <div className="relative h-full w-full">
      {/* Screen region — measured from the transparent cutout inside
          laptop-frame.png (1920×1080):
             x: 455..1460  => left 23.70%, right 23.91%
             y: 183..838   => top 16.94%, bottom 22.31%
          These values place the dashboard inside the glass rather
          than under the top bar or outside the laptop body. */}
      <div
        className="absolute overflow-hidden bg-black"
        style={{
          left: "23.7%",
          right: "23.9%",
          top: "16.94%",
          bottom: "22.31%",
          borderRadius: "6px",
        }}
      >
        {/* object-fill intentionally stretches the dashboard into the
            measured glass rectangle. The source and frame ratios are
            close, so this keeps the full screenshot visible without
            any spill outside the MacBook screen. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/playbooks/Event-management-dashboard-overview.png"
          alt=""
          aria-hidden
          className="h-full w-full select-none object-fill"
          draggable={false}
        />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/marketing/hero/laptop-frame.png"
        alt="Hoizr business dashboard on a MacBook"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full select-none object-contain drop-shadow-[0_24px_42px_rgba(0,0,0,0.32)]"
        draggable={false}
      />
    </div>
  );
};
