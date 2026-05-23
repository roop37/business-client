"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaqJsonLd } from "../seo/SchemaJsonLd";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const ITEMS: { q: string; a: string }[] = [
  {
    q: "Who is Hoizr built for?",
    a: "Hoizr is built for Indian event organizers, venues, and promoters — clubs, festivals, comedy promoters, live-music hosts, and nightclub operators across Mumbai, Bangalore, Delhi, Pune, Hyderabad, Chennai, and Goa. The platform is tuned to how Indian fans actually book, pay, and show up: WhatsApp-first promotion, guestlist culture, INR per-event settlement, and refund policies that account for monsoon postponements.",
  },
  {
    q: "What's included with Hoizr?",
    a: "The full platform on every account — direct ticketing, organisation page, fan CRM, campaigns, AI Offer pricing, door scanning, automations, reporting, and settlement workflows. No feature gates by tier.",
  },
  {
    q: "How do I get started?",
    a: "Book a 30-minute call with our team. We'll walk through your event format, set up your organisation page + first show, and hand the keys over. Most hosts ship their first Hoizr-hosted night within 4 business days of signing up.",
  },
  {
    q: "Can I run Hoizr alongside other ticketing platforms?",
    a: "Yes. You decide where each ticket type sells. Plenty of our hosts keep a percentage on marketplaces for top-of-funnel reach and route everything past their core fanbase through Hoizr — which keeps the email, the phone, and the loyalty progression in your CRM, not the marketplace's.",
  },
  {
    q: "Do you charge for free events?",
    a: "No. Free events stay free. Hoizr's fee only applies when a paid ticket is purchased — so RSVPs, guestlists, and complimentary entries cost you nothing.",
  },
  {
    q: "How do payouts work?",
    a: "Settlement timing is confirmed for your event before launch. Your statement stays clear: what sold, what was refunded, and what is due.",
  },
  {
    q: "Is there a contract or commitment?",
    a: "No long-term contract. Hoizr is month-to-month. If we stop being the right partner, you keep your event history, your fan CRM, and your branding — and you can take everything with you.",
  },
  {
    q: "What's the commission rate?",
    a: "The lowest in India. Your exact offer depends on event format, city, scale, and ticket mix, so Hoizr gives you an event-specific commission rate instead of publishing a generic number.",
  },
];

export const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="hm-section">
      <FaqJsonLd items={ITEMS} />
      <div className="grid md:grid-cols-[280px,1fr] gap-12">
        <div>
          <div className="hm-eyebrow">FAQ</div>
          <h2
            className="mt-3 font-bold leading-[1.05] tracking-[-0.025em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(34px, 4vw, 48px)",
            }}
          >
            Your top questions, answered.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--m-ink-3)]">
            Anything missing? Bring it to your setup call — we&apos;ll go through it
            specific to your venue, format, and city.
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
