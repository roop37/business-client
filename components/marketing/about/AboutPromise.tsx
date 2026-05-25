"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, Sparkles, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { WaitlistButton } from "../waitlist/WaitlistButton";

const EASE = [0.2, 0.6, 0.2, 1] as const;

type PromiseCard = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  Icon: LucideIcon;
};

const CARDS: PromiseCard[] = [
  {
    eyebrow: "No gatekeeping",
    title: "The full stack from day one.",
    body: "Event organizers can publish directly and use the full platform without a subscription wall, starter tier, or gated plan.",
    ctaLabel: "Join the waitlist",
    ctaHref: "/signup",
    Icon: BadgeCheck,
  },
  {
    eyebrow: "AI event evaluation",
    title: "The offer is studied event by event.",
    body: "Hoizr AI evaluates format, city, scale, ticket mix, and listing quality, then surfaces the best possible offer and lowered commission where the event qualifies.",
    ctaLabel: "See how AI helps",
    ctaHref: "/product/ai-event-assistant",
    Icon: Sparkles,
  },
  {
    eyebrow: "Collaborators",
    title: "Pool audiences. Boost sales.",
    body: "Add another event organizer as a collaborator — they get the event on their dashboard and you both run campaigns against the combined customer base.",
    ctaLabel: "How collaborators work",
    ctaHref: "/how-it-works#collaborators",
    Icon: Users,
  },
];

export const AboutPromise = () => {
  return (
    <section className="hm-section pt-6 md:pt-10">
      <div className="grid gap-5 lg:grid-cols-3 md:gap-6">
        {CARDS.map((card, i) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
            /* Don't use hm-forest-panel here — its `> *` rule forces
               position:relative on every direct child, which overrides
               the absolute-positioned background <img> and balloons
               the card height. Plain rounded panel + manual relative
               on the inner content. */
            className="relative overflow-hidden rounded-3xl bg-[var(--m-forest-700)] px-7 py-10 md:px-10 md:py-12 text-white"
          >
            <img
              src="/marketing/brand/metallic-line-banner.png"
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-black/15 via-black/40 to-black/85"
            />

            <div className="relative flex h-full min-h-[280px] flex-col">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-semibold tracking-wider text-white/90 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--m-acid)]" />
                {card.eyebrow}
              </span>

              <h3
                className="mt-6 font-bold leading-[1.05] tracking-[-0.025em] text-balance"
                style={{
                  fontFamily: "var(--m-font-display)",
                  fontSize: "clamp(28px, 3.4vw, 42px)",
                }}
              >
                {card.title}
              </h3>

              <p className="mt-4 text-[15.5px] leading-relaxed text-white/80 max-w-[460px]">
                {card.body}
              </p>

              <div className="mt-auto pt-6">
                {card.ctaHref === "/signup" ? (
                  <WaitlistButton
                    source="about-promise"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--m-acid)] px-5 py-2.5 text-[14px] font-semibold text-[var(--m-forest-900)] transition hover:opacity-90"
                  >
                    {card.ctaLabel}
                    <ArrowUpRight size={16} strokeWidth={2.2} />
                  </WaitlistButton>
                ) : (
                  <Link
                    href={card.ctaHref}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--m-acid)] px-5 py-2.5 text-[14px] font-semibold text-[var(--m-forest-900)] transition hover:opacity-90"
                  >
                    {card.ctaLabel}
                    <ArrowUpRight size={16} strokeWidth={2.2} />
                  </Link>
                )}
              </div>
            </div>

            <span
              aria-hidden
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur"
            >
              <card.Icon size={18} strokeWidth={1.8} />
            </span>
          </motion.article>
        ))}
      </div>
    </section>
  );
};
