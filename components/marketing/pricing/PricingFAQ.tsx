"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaqJsonLd } from "../seo/SchemaJsonLd";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const ITEMS: { q: string; a: string }[] = [
  {
    q: "How much is the commission?",
    a: "The lowest in India. Your exact offer depends on the event format, city, scale, and ticket mix, so Hoizr gives you an event-specific rate instead of publishing a generic number.",
  },
  {
    q: "Is there a subscription or setup fee?",
    a: "No. Zero subscription. Zero setup. Zero monthly minimums. You pay Hoizr only when a paid ticket actually sells.",
  },
  {
    q: "What happens for free events?",
    a: "Hoizr is free for free events. Run RSVPs, guestlists, comps, and sold-out free nights through the full platform at no cost.",
  },
  {
    q: "When do I receive my payouts?",
    a: "Settlement timing is confirmed for your event before launch. You get a clear statement showing what sold, what was refunded, and what is due.",
  },
  {
    q: "Do I need to switch off other platforms to use Hoizr?",
    a: "No. You decide where each ticket type sells. Plenty of hosts keep a percentage on marketplaces for reach and route the rest through Hoizr to own the fan relationship. Hoizr only charges on the tickets it actually processes.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Hoizr is month-to-month. If you wind down, you keep your event history, your fan CRM, and your organisation page — and you can export everything.",
  },
];

export const PricingFAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="hm-section">
      <FaqJsonLd items={ITEMS} />
      <div className="grid md:grid-cols-[280px,1fr] gap-12">
        <div>
          <div className="hm-eyebrow">Pricing FAQ</div>
          <h2
            className="mt-3 font-bold leading-[1.05] tracking-[-0.025em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(34px, 4vw, 48px)",
            }}
          >
            Straight answers.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--m-ink-3)]">
            More specific questions — about your category, your city, or your
            current contracts — are best handled on the setup call.
          </p>
        </div>

        <div>
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`hm-faq-row ${isOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  className="hm-faq-q"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-left">{item.q}</span>
                  <span className="hm-faq-plus" aria-hidden>
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="answer"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="hm-faq-a">{item.a}</div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
