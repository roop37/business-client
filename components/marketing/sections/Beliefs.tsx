"use client";

import { motion } from "framer-motion";

const EASE = [0.2, 0.6, 0.2, 1] as const;

type Belief = {
  n: string;
  title: string;
  body: string;
  /** When present, render as a personal-voice note instead of team-voice. */
  signoff?: { name: string; role: string };
};

const BELIEFS: Belief[] = [
  {
    n: "01",
    title: "Operational clarity beats infinite knobs.",
    body:
      "Hoizr is opinionated. We won't let you ship a checkout that bleeds conversion or a marketing flow that confuses your fans. In return, every host on the platform inherits the rigour of a stadium-grade ops team — without the headcount.",
  },
  {
    n: "02",
    title: "AI shouldn't be a feature only national chains can afford.",
    body:
      "The best technology is invisible. Hoizr puts event-specific pricing AI behind a single approve button — so a one-venue operator in Pune ships with the budget and brainpower of a national festival circuit.",
  },
  {
    n: "03",
    title: "We win when your room is full.",
    body:
      "Most platforms make pricing feel fixed before they understand the night. Hoizr starts with the event itself — format, city, scale, and ticket mix — then gives you the lowest commission offer we can stand behind in India.",
  },
  {
    n: "04",
    title: "AI belongs in every operator's daily routine.",
    body:
      "I'm building Hoizr because I genuinely believe every operator — venue owner, festival promoter, independent club host — should wake up with AI inside their day-to-day workflow. Not buried as a feature flag, but as the default way to study what worked last night, optimise this weekend's drop, and excel at the night after that. The big chains already use these tools. Hoizr puts the same leverage in your hands.",
    signoff: { name: "Sanbedan Paul", role: "Founder & CEO, Hoizr" },
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
          <div className="hm-eyebrow">From the Hoizr team</div>
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
            Four positions we hold. Three from the team, one from our founder.
            They show up in every product decision we make — for better,
            occasionally for worse.
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
                      src="https://res.cloudinary.com/duhefgqh4/image/upload/v1748974724/IMG_0652_slotkd__1_ehtwxq.jpg"
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
