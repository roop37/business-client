"use client";

import { motion } from "framer-motion";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const BELIEFS = [
  {
    n: "01",
    title: "Independent organisers should have serious operating tools.",
    body:
      "Modern ticketing, audience, campaign and event-night systems should not be limited to the largest event companies. Hoizr is built to put those capabilities into one practical organiser workflow.",
  },
  {
    n: "02",
    title: "Every event should make the next one stronger.",
    body:
      "A sale, campaign, guestlist entry or door scan should add useful context to the organiser's audience and event history instead of disappearing when the night ends.",
  },
  {
    n: "03",
    title: "Indian events deserve technology built around how they run.",
    body:
      "Free and RSVP events, guestlists, collaborators, offline sales, multi-day access and fast-changing event operations are not edge cases. They are part of the product model.",
  },
] as const;

export const Beliefs = () => {
  return (
    <section className="hm-section">
      <div className="grid md:grid-cols-[280px,1fr] gap-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="md:sticky md:top-32 md:self-start"
        >
          <div className="hm-eyebrow">Hoizr beliefs</div>
          <h2
            className="mt-3 font-bold leading-[1.04] tracking-[-0.025em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(34px, 4vw, 48px)",
            }}
          >
            What we believe.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--m-ink-3)]">
            Three principles behind the product. They show up in how Hoizr
            handles audience, campaigns, event history, and event-night
            operations.
          </p>
        </motion.div>

        <div className="space-y-12 md:space-y-16">
          {BELIEFS.map((b, i) => (
            <motion.article
              key={b.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }}
              className="border-t border-[var(--m-border)] pt-10"
            >
              <div className="flex items-baseline gap-5">
                <div
                  className="hoizr-mark text-[var(--m-ink-4)] text-[18px]"
                  style={{ letterSpacing: "0.1em" }}
                >
                  {b.n}
                </div>
                <h3
                  className="font-semibold leading-tight tracking-[-0.02em] text-[var(--m-ink-1)]"
                  style={{ fontSize: "clamp(24px, 2.8vw, 34px)" }}
                >
                  {b.title}
                </h3>
              </div>
              <p className="mt-5 pl-0 md:pl-[60px] text-[17px] leading-[1.6] text-[var(--m-ink-2)] max-w-[640px]">
                {b.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
