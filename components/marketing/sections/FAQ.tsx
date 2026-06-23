"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { FaqJsonLd } from "../seo/SchemaJsonLd";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const ITEMS: { q: string; a: string }[] = [
  {
    q: "Who is Hoizr built for?",
    a: "Hoizr is built for Indian event organisers running parties, club nights, concerts, festivals, comedy, free and RSVP events, and exclusive or non-exclusive experiences.",
  },
  {
    q: "What can I use today?",
    a: "Current capabilities include event publishing, ticketing, add-ons, promo codes, offline issuing, payment links, customer records, email and WhatsApp campaigns, guestlists, collaborators, teams, scanners, reports, payouts, settlements, selected automations and event evaluation.",
  },
  {
    q: "What does Coming Soon mean?",
    a: "Coming Soon capabilities are part of the product roadmap but are not currently available as complete organiser workflows. They are always labelled separately on this site.",
  },
  {
    q: "Does it cost anything to create an account?",
    a: "Signup is free. Hoizr does not require a setup fee, subscription or card details to create the organisation and begin building events.",
  },
  {
    q: "How do paid-event payouts work?",
    a: "Paid events require an active verified payout profile before publishing. The organiser workspace shows payout-account status, settlement history and available settlement statements.",
  },
  {
    q: "Can collaborators and team members use the workspace?",
    a: "Yes. Organisers can invite team members with roles and permissions, and event collaborators can receive event-specific access such as metrics, campaigns, customers or offline ticket issuing.",
  },
  {
    q: "Can I run free or RSVP events?",
    a: "Yes. Hoizr supports free and RSVP events alongside exclusive and non-exclusive paid event formats.",
  },
  {
    q: "Can I see the platform before signing up?",
    a: "Yes. Book a guided tour and the Hoizr team will walk through the current platform around your event format and operating needs.",
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
            Want a guided tour?{" "}
            <Link
              href="/book-a-demo"
              className="font-medium text-[var(--m-ink-1)] underline decoration-[var(--m-border)] underline-offset-4"
            >
              Book a demo
            </Link>{" "}
            and the Hoizr team will walk through the current platform around
            your event format and operating needs.
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
