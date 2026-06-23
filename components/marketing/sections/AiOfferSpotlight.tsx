"use client";

import { motion } from "framer-motion";
import { ArrowRight, Brain, FileSearch, Gauge, Sparkles } from "lucide-react";
import Link from "next/link";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const STEPS = [
  {
    icon: FileSearch,
    label: "01 · Tell us about the event",
    body: "Format, city, capacity, ticket mix, venue context, and listing quality. That's what Hoizr starts from.",
  },
  {
    icon: Brain,
    label: "02 · AI studies the event",
    body: "Hoizr evaluates comparable nights, demand signals, ticket structure, event completeness, and operational readiness.",
  },
  {
    icon: Gauge,
    label: "03 · You get event-specific guidance",
    body: "The result is an event-specific recommendation that explains what Hoizr can support for the night.",
  },
  {
    icon: Sparkles,
    label: "04 · Publish with clearer context",
    body: "You can publish directly with the full operating stack: ticketing, CRM, campaigns, guestlist, door scanning, and reporting.",
  },
];

/**
 * AI spotlight. Positions Hoizr's AI as event evaluation: it
 * studies the night and explains the event-specific guidance.
 */
export const AiOfferSpotlight = () => {
  return (
    <section className="hm-section">
      <div className="relative overflow-hidden rounded-[var(--m-r-2xl)] border border-[var(--m-border)] bg-[var(--m-surface)]">
        <div className="relative grid gap-10 p-7 md:grid-cols-2 md:p-14">
          {/* Left — story */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-col"
          >
            <span className="hm-chip max-w-full flex-wrap self-start leading-snug">
              <Sparkles size={13} className="shrink-0 text-[var(--m-forest-700)]" />
              <span className="font-semibold">AI event evaluation</span>
            </span>
            <h2 className="hm-h2 mt-5">
              AI studies your event and returns event-specific guidance.
            </h2>
            <p className="hm-lead mt-5 max-w-[520px]">
              Hoizr puts the full operating stack in your workspace from day
              one. For event evaluation, the AI evaluates your format, city,
              scale, ticket mix, demand signals, and listing quality, then
              provides event-specific guidance where the event qualifies.
            </p>

            <ol className="mt-10 space-y-6">
              {STEPS.map((step, i) => (
                <motion.li
                  key={step.label}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--m-forest-700)] text-[var(--m-acid)]">
                    <step.icon size={20} strokeWidth={1.7} />
                  </span>
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-4)]">
                      {step.label}
                    </div>
                    <div className="mt-1 text-[15px] leading-relaxed text-[var(--m-ink-2)]">
                      {step.body}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ol>

            <div className="mt-10">
              <Link href="/signup" className="hm-btn hm-btn-primary">
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Right — studio-feel event mock on metallic black */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
            className="flex items-center justify-center"
          >
            <EventStudioMock />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const EventStudioMock = () => {
  return (
    <div className="relative w-full max-w-[460px]">
      <div className="relative overflow-hidden rounded-[32px] bg-[#050504] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/hero/hero-lines-star.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                Hoizr · AI event evaluation
              </div>
              <div
                className="hoizr-mark on-dark mt-3 text-white"
                style={{ fontSize: "20px", letterSpacing: "0.18em" }}
              >
                HOIZR AI
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--m-acid)] px-3 py-1.5 shadow-[0_8px_24px_rgba(200,233,75,0.32)]">
              <Sparkles size={12} className="text-[var(--m-forest-900)]" />
              <span className="text-[11px] font-bold text-[var(--m-forest-900)]">
                Live
              </span>
            </div>
          </div>

          {/* Event summary read out by the AI */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
              Event analysed
            </div>
            <div className="mt-1 text-[16px] font-bold tracking-tight text-white">
              Sundown Festival · Goa
            </div>
            <div className="mt-0.5 text-[12px] text-white/65">
              Sat 13 Dec · Open-air · 3,200 cap · 3 ticket phases
            </div>
          </div>

          {/* Reasoning ribbon — mirrors the inputs the AI model uses */}
          <div className="mt-3 space-y-1.5">
            {[
              { label: "Event type", value: "Exclusive" },
              { label: "Format", value: "Festival · multi-stage" },
              { label: "City demand", value: "High · Goa · electronic" },
              { label: "Window", value: "12 weeks to door" },
            ].map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-[11.5px] text-white/85"
              >
                <span className="font-semibold uppercase tracking-[0.08em] text-white/55">
                  {r.label}
                </span>
                <span className="font-medium">{r.value}</span>
              </div>
            ))}
          </div>

          {/* The result card shows the event-specific guidance without extra
              promotional language. */}
          <div className="mt-5 rounded-2xl border border-[var(--m-acid)]/40 bg-[#143821] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--m-acid)]">
              Event-specific guidance
            </div>
            <div className="mt-1.5 text-[16px] font-bold leading-tight text-white">
              What Hoizr can support for this night.
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/70">
              <div className="rounded-lg bg-white/[0.04] px-2.5 py-2">
                <div className="font-semibold uppercase tracking-[0.08em] text-white/45">
                  Platform access
                </div>
                <div className="mt-0.5 font-medium text-white">
                  Open by default
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.04] px-2.5 py-2">
                <div className="font-semibold uppercase tracking-[0.08em] text-white/45">
                  Event context
                </div>
                <div className="mt-0.5 font-medium text-white">
                  Reviewed by AI
                </div>
              </div>
            </div>
            <div className="mt-3 text-[11.5px] text-white/65">
              No card details required to create your account or publish your
              event.
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-[11.5px] text-white/55">
            <span>Event context shown before publish</span>
            <span className="font-semibold text-[var(--m-acid)]">View →</span>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
        className="absolute -left-3 top-24 z-10 hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--m-ink-1)] shadow-lg md:flex"
        >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--m-forest-500)]" />
        Reads your event
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.8 }}
        className="absolute -right-3 bottom-32 z-10 hidden items-center gap-2 rounded-full bg-[var(--m-forest-800)] px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg md:flex"
      >
        Publish directly
      </motion.div>
    </div>
  );
};
