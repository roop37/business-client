"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Handshake, PercentCircle } from "lucide-react";
import Link from "next/link";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const CARDS = [
  {
    eyebrow: "Lowest commission",
    title: "The lowest ticket commission in India.",
    body:
      "Hoizr quotes a single per-event commission with no convenience-fee games. Share your event context and we will give you the strongest offer we can make for that night.",
    cta: "See your event commission",
    Icon: PercentCircle,
    action: "link",
    href: "/signup",
  },
  {
    eyebrow: "Collaborators",
    title: "Pool audiences. Boost sales.",
    body:
      "Add another event organizer as a collaborator. They get the event on their dashboard and both teams can campaign against the combined customer base.",
    cta: "How collaborators work",
    Icon: Handshake,
    action: "link",
    href: "/how-it-works#collaborators",
  },
] as const;

export const PricingTeaserCards = () => {
  return (
    <section className="hm-section pt-0">
      <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="hm-eyebrow">Commission advantage</div>
          <h2 className="hm-h2 mt-3 max-w-[760px]">
            The economics should be visible before the pitch call.
          </h2>
        </div>
        <p className="max-w-[430px] text-[15.5px] leading-relaxed text-[var(--m-ink-3)]">
          No public rate cards, no hidden tiers. Hoizr studies the event and
          quotes the best commission offer we can make for that night.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {CARDS.map((card, i) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: EASE, delay: i * 0.08 }}
            className="relative min-h-[330px] overflow-hidden rounded-[var(--m-r-2xl)] bg-[#080808] p-7 text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] md:p-10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/hero/hero-lines-star.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-75"
              draggable={false}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(140deg,rgba(255,255,255,0.08),rgba(0,0,0,0.64)_55%,rgba(0,0,0,0.9))]"
            />

            <div className="relative z-10 flex min-h-[250px] flex-col">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.12] px-3 py-1.5 text-[12px] font-semibold text-white/85 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--m-acid)]" />
                  {card.eyebrow}
                </span>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur">
                  <card.Icon size={19} strokeWidth={1.8} />
                </span>
              </div>

              <h3
                className="mt-9 max-w-[560px] font-bold leading-[1.03] tracking-[-0.025em]"
                style={{
                  fontFamily: "var(--m-font-display)",
                  fontSize: "clamp(34px, 4.4vw, 54px)",
                }}
              >
                {card.title}
              </h3>
              <p className="mt-5 max-w-[580px] text-[16px] leading-relaxed text-white/72">
                {card.body}
              </p>

              <div className="mt-auto pt-8">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--m-acid)] px-5 py-3 text-[14px] font-bold text-[var(--m-forest-900)] transition hover:opacity-90"
                >
                  {card.cta}
                  <ArrowUpRight size={16} strokeWidth={2.2} />
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};
