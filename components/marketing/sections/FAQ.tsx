"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { HOME_FAQ } from "../data/site-copy";
import { FaqJsonLd } from "../seo/SchemaJsonLd";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const ITEMS: { q: string; a: string }[] = [...HOME_FAQ];

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
            Anything missing? Bring it to a demo — we&apos;ll go through it for
            your venue, format, and city.
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
