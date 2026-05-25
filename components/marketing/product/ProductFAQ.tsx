"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { ProductContent } from "../data/product-content";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * ProductFAQ — animated accordion of product-specific Q/A pairs.
 *
 * AnimatePresence handles the answer panel height + opacity transition
 * so opening/closing feels native, not snap-cut. The +/- icon swaps
 * with a 180° spring rotation. Question rows get a hover acid accent
 * on the left edge.
 */
export const ProductFAQ = ({ content }: { content: ProductContent }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="hm-section">
      <div className="grid gap-12 md:grid-cols-[280px,1fr] md:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="md:sticky md:top-32 md:self-start"
        >
          <div className="hm-eyebrow">Common questions</div>
          <h2
            className="mt-3 font-bold leading-[1.04] tracking-[-0.025em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(30px, 3.6vw, 44px)",
            }}
          >
            Things event organizers ask about {content.label.toLowerCase()}.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--m-ink-3)]">
            If we missed yours, every onboarding call covers the rest live —
            and we keep this list updated as new questions come in.
          </p>
        </motion.div>

        <div className="overflow-hidden divide-y divide-[var(--m-border)] rounded-[var(--m-r-2xl)] border border-[var(--m-border)] bg-[var(--m-surface)]">
          {content.faq.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: EASE, delay: i * 0.05 }}
                className="relative"
              >
                {/* Left-edge acid bar stays clipped inside the active row. */}
                <motion.span
                  aria-hidden
                  className="absolute bottom-5 left-0 top-5 w-[3px] origin-center rounded-full bg-[var(--m-acid)]"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition hover:bg-[var(--m-canvas-2)] md:px-8 md:py-6"
                >
                  <span
                    className="text-[16.5px] font-semibold leading-snug tracking-[-0.012em] text-[var(--m-ink-1)] md:text-[18px]"
                    style={{ fontFamily: "var(--m-font-display)" }}
                  >
                    {item.q}
                  </span>
                  <motion.span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--m-border)] bg-[var(--m-canvas-2)] text-[var(--m-ink-1)]"
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 18 }}
                  >
                    {isOpen ? (
                      <Minus size={16} strokeWidth={2.2} />
                    ) : (
                      <Plus size={16} strokeWidth={2.2} />
                    )}
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-[15px] leading-[1.65] text-[var(--m-ink-2)] md:px-8 md:pb-7">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
