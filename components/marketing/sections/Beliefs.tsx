"use client";

import { motion } from "framer-motion";

const EASE = [0.2, 0.6, 0.2, 1] as const;

type Belief = {
  n: string;
  title: string;
  body: string;
  /** When present, render as a personal-voice note. */
  signoff?: { name: string; role: string };
};

const BELIEFS: Belief[] = [
  {
    n: "01",
    title: "AI should not be a feature only national chains can afford.",
    body:
      "The best technology is invisible. Hoizr puts event-specific AI evaluation behind a simple event workflow, so a one-venue operator in Pune can study the night with the discipline of a national festival circuit.",
  },
  {
    n: "02",
    title: "We win when your room is full.",
    body:
      "Most platforms ask organizers to accept generic terms before they understand the night. Hoizr starts with the event itself — format, city, scale, and ticket mix — then gives you the best possible offer and lowered commission where eligible.",
  },
  {
    n: "03",
    title: "India can become the live-night market everyone watches.",
    body:
      "The ambition is bigger than software. Hoizr should help Indian venues, festivals, comedy rooms, party crews, and promoters operate with the discipline of the best global circuits — while keeping the local chaos, taste, and energy that make Indian nights different.",
    signoff: { name: "Sanbedan", role: "Founder, Hoizr" },
  },
];

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
            Three positions behind the product. They show up in how Hoizr
            handles pricing, discovery, fan data, and event-night operations.
          </p>
        </motion.div>

        <div className="space-y-12 md:space-y-16">
          {BELIEFS.map((b, i) => {
            const isFounder = Boolean(b.signoff);
            return (
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
                    className={`leading-tight tracking-[-0.02em] text-[var(--m-ink-1)] ${
                      isFounder ? "hm-cursive" : "font-semibold"
                    }`}
                    style={{ fontSize: "clamp(24px, 2.8vw, 34px)" }}
                  >
                    {b.title}
                  </h3>
                </div>
                <p className="mt-5 pl-0 md:pl-[60px] text-[17px] leading-[1.6] text-[var(--m-ink-2)] max-w-[640px]">
                  {b.body}
                </p>
                {b.signoff ? (
                  <div className="mt-6 pl-0 md:pl-[60px] flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/demo/img/IMG_0652_slotkd__1_ehtwxq.jpg"
                      alt={b.signoff.name}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                      draggable={false}
                    />
                    <div className="text-[13.5px]">
                      <div className="font-semibold text-[var(--m-ink-1)]">
                        {b.signoff.name}
                      </div>
                      <div className="text-[var(--m-ink-3)]">
                        {b.signoff.role}
                      </div>
                    </div>
                  </div>
                ) : null}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
