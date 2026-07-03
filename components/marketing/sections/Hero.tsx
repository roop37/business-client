"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ScanLine,
  Sparkles,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { BlurImage } from "../visuals/BlurImage";
import { ShinyText } from "../visuals/ShinyText";
const EASE = [0.2, 0.6, 0.2, 1] as const;
const HERO_VERTICALS = [
  "club nights",
  "festivals",
  "comedy",
  "concerts",
  "house parties",
];

const HERO_BADGES: { icon: LucideIcon; label: string }[] = [
  { icon: BadgeCheck, label: "Free to start" },
  { icon: Ticket, label: "Online + cash tickets" },
  { icon: Users, label: "Your fan CRM" },
  { icon: ScanLine, label: "Offline door scanning" },
  { icon: Sparkles, label: "AI Event Analysis" },
  { icon: BarChart3, label: "Settlement-ready" },
];

/**
 * Landing hero. Composition:
 *   1. Eyebrow chip + headline + body + CTAs.
 *   2. Looping stage video behind the MacBook (replaces the old
 *      metallic-bg still + line SVG).
 *   3. MacBook mockup with the live host dashboard rendered inside
 *      the measured screen glass. Floating capability badges.
 *
 * Artwork:
 *   - /images/hero/herovid.webm (0.5× stage video)
 *   - public/marketing/hero/laptop-frame.png (1920×1080, decorative)
 *   - /images/playbooks/Event-management-dashboard-overview.png
 *     (1586×992, the indexed content image — carries the alt)
 */
export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Hero background intentionally empty — the marketing canvas
          colour underneath does all the work. PixelBlast removed per
          spec. */}
      <div className="hm-section relative pt-12 pb-6 text-center md:pt-20 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex justify-center px-4"
        >
          <span className="hm-chip max-w-full flex-wrap justify-center text-center leading-snug">
            <span className="hm-chip-dot shrink-0" />
            <span className="font-semibold text-[var(--m-ink-1)]">
              Built for Indian event organizers &amp; Venues
            </span>
            <span className="hidden text-[var(--m-ink-4)] sm:inline">
              : {HERO_VERTICALS.join(" · ")}
            </span>
          </span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.07, delayChildren: 0.05 },
            },
          }}
          className="hm-display mt-8"
        >
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: EASE },
              },
            }}
            className="block"
          >
            <ShinyText text="Sell out the night." />
          </motion.span>
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: EASE },
              },
            }}
            className="block"
          >
            <ShinyText text="Own every fan." />
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
          className="hm-lead mx-auto mt-6 max-w-[640px]"
        >
          Hoizr is the ticketing, marketing, and door platform for Indian nights
          — where every buyer becomes your customer, not a marketplace&apos;s.
          Sell online or in cash, fill the room, and bring the same crowd back.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.42 }}
          className="mx-auto mt-3 max-w-[560px] text-[14px] font-semibold text-[var(--m-ink-2)]"
        >
          Hoizr is invite-only right now, opening to select Venues and Event
          Organizations across India — onboard to apply and we&apos;ll check
          your eligibility.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/signup" className="hm-btn hm-btn-primary">
            Get started
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/book-a-demo"
            className="hm-btn border border-[var(--m-border-strong)] bg-[var(--m-surface)] text-[var(--m-ink-1)] transition-colors hover:border-[var(--m-forest-500)] hover:bg-[var(--m-canvas-2)]"
          >
            Book a demo
          </Link>
        </motion.div>

        <HeroStage />
      </div>
    </section>
  );
};

/**
 * Floating badges positioned on the dark metallic card around the
 * laptop. The laptop body roughly occupies the centre 18%–82% of the
 * stage horizontally, so badges are placed in the left/right strips
 * only — never on top of the laptop chrome or screen. Each badge
 * floats independently with a slow sine-wave y oscillation so the
 * cluster reads as "alive" without distracting from the dashboard.
 *
 * The desktop layout uses the absolute positions defined here. On
 * mobile (<md), the floating layer is hidden and a centered wrap-row
 * appears below the CTAs instead — cramped corners aren't worth the
 * positional gymnastics on small screens.
 */
type FloatPos = {
  top: string;
  left?: string;
  right?: string;
  delay: number;
  duration: number;
  offset: number;
};

const HERO_BADGE_POSITIONS: FloatPos[] = [
  { top: "38%", left: "1%", delay: 0.65, duration: 5.2, offset: 10 },
  { top: "56%", left: "5%", delay: 0.8, duration: 6.4, offset: 12 },
  { top: "76%", left: "2%", delay: 0.95, duration: 5.8, offset: 9 },
  { top: "40%", right: "2%", delay: 0.7, duration: 6.0, offset: 11 },
  { top: "58%", right: "0%", delay: 0.85, duration: 5.4, offset: 13 },
  { top: "78%", right: "4%", delay: 1.0, duration: 6.6, offset: 10 },
];

const FloatingHeroBadges = () => (
  <>
    {/* Desktop: absolute floating layer pinned to the HeroStage bounds. */}
    <div
      aria-label="What Hoizr ships with"
      className="pointer-events-none absolute inset-0 z-20 hidden md:block"
    >
      {HERO_BADGES.map((b, i) => {
        const pos = HERO_BADGE_POSITIONS[i] ?? HERO_BADGE_POSITIONS[0];
        return (
          <motion.span
            key={b.label}
            initial={{ opacity: 0, y: pos.offset + 6, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [pos.offset * -0.5, pos.offset * 0.5, pos.offset * -0.5],
            }}
            transition={{
              opacity: { duration: 0.55, ease: EASE, delay: pos.delay },
              scale: { duration: 0.55, ease: EASE, delay: pos.delay },
              y: {
                duration: pos.duration,
                ease: "easeInOut",
                repeat: Infinity,
                delay: pos.delay,
              },
            }}
            className="hm-hero-badge hm-hero-badge--floating pointer-events-auto"
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              right: pos.right,
            }}
          >
            <span className="hm-hero-badge__icon" aria-hidden>
              <b.icon size={13} strokeWidth={2.1} />
            </span>
            {b.label}
          </motion.span>
        );
      })}
    </div>

    {/* Mobile: compact wrap-row below the laptop. */}
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.6 } },
      }}
      className="mt-6 flex flex-wrap items-center justify-center gap-2 md:hidden"
      aria-hidden
    >
      {HERO_BADGES.map((b) => (
        <motion.span
          key={b.label}
          variants={{
            hidden: { opacity: 0, y: 6 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, ease: EASE },
            },
          }}
          className="hm-hero-badge"
        >
          <span className="hm-hero-badge__icon" aria-hidden>
            <b.icon size={12} strokeWidth={2.1} />
          </span>
          {b.label}
        </motion.span>
      ))}
    </motion.div>
  </>
);

const HeroStage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
      // Desktop: negative top margin pulls the laptop card up so the
      // upper edge overlaps the hero CTA strip — the lid "breaks out"
      // of the hero copy. Mobile: a positive gap instead so the laptop
      // doesn't collide with the CTA buttons.
      className="relative mx-auto mt-4 w-full max-w-[1200px] md:-mt-12"
    >
      {/* Dark metallic stage card — restored per spec. It sits behind
          the MacBook and starts below the lid, so the laptop stays the
          primary object. Floating chips remain removed. */}
      <div
        className="absolute inset-x-0 z-0 overflow-hidden rounded-[20px] shadow-[0_30px_70px_rgba(5,5,5,0.28)] md:rounded-[24px]"
        style={{ top: "32%", bottom: "6%" }}
      >
        {/* Desktop (md+): looping stage video. Muted + autoPlay +
            playsInline so it loops everywhere; pointer-events-none makes
            it non-interactive. Slowed to 0.75x via ref on mount.
            preload="none" so the hidden element doesn't fetch on mobile. */}
        <video
          ref={(el) => {
            if (el) el.playbackRate = 0.7;
          }}
          src="/images/hero/herovid.webm"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover md:block"
        />

        {/* Mobile (<md): original metallic-bg still + line SVG overlay. */}
        <div className="absolute inset-0 md:hidden">
          <BlurImage
            src="/marketing/hero/metallic-bg.png"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/marketing/hero/hero-lines-star.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-85"
            draggable={false}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto aspect-[1920/1080] w-full">
        <MonitorWithDashboard />
        {/* Floating badges live inside the aspect-ratio box so their
            percentage positions track the laptop frame exactly. */}
        <FloatingHeroBadges />
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
        {/* Real content image (not aria-hidden) with a descriptive alt +
            priority so crawlers index THIS as the page's representative
            image — the old metallic-bg still was what Google surfaced in
            the listing; the video that replaced it isn't image-indexable. */}
        <BlurImage
          src="/images/playbooks/Event-management-dashboard-overview.png"
          alt="Hoizr event dashboard — ticket sales, revenue, and campaign performance for an Indian event organizer"
          fill
          sizes="(max-width: 1100px) 80vw, 900px"
          priority
          className="h-full w-full select-none object-fill"
          draggable={false}
        />
      </div>

      {/* Decorative bezel only — the dashboard screenshot above carries
          the alt so it, not this transparent frame, is the indexed image. */}
      <BlurImage
        src="/marketing/hero/laptop-frame.png"
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 1100px) 100vw, 1200px"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full select-none object-contain drop-shadow-[0_24px_42px_rgba(0,0,0,0.32)]"
        draggable={false}
      />
    </div>
  );
};
