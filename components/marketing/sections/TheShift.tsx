"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import { SHIFT_ROWS } from "../data/site-copy";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * The pivot. The honesty guardrail lives here: we never claim more reach
 * than the marketplaces. We concede they own the crowd and win on
 * ownership + tooling. Dark graphite panel, acid checks for the Hoizr
 * column.
 */
export const TheShift = () => {
  return (
    <section className="hm-section">
      <div className="hm-forest-panel px-7 py-12 md:px-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--m-acid)]">
              The shift
            </div>
            <h2
              className="mt-4 font-bold leading-[1.04] tracking-[-0.025em] text-white"
              style={{
                fontFamily: "var(--m-font-display)",
                fontSize: "clamp(32px, 4.4vw, 52px)",
              }}
            >
              Stop renting your fans. Start owning them.
            </h2>
            <p className="mt-5 max-w-[460px] text-[16px] leading-relaxed text-white/72">
              Marketplaces own the crowd. We won&apos;t pretend otherwise. But
              the fans who already follow you? They should be yours — your list,
              your channel, your relationship. That&apos;s the whole point of
              Hoizr.
            </p>
            <Link
              href="/signup"
              className="hm-btn hm-btn-acid mt-8 inline-flex"
            >
              Own your audience
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-2.5">
            <div className="grid grid-cols-2 gap-2.5 pb-1 text-[12px] font-semibold uppercase tracking-[0.1em]">
              <div className="text-white/45">A marketplace</div>
              <div className="text-[var(--m-acid)]">Hoizr</div>
            </div>
            {SHIFT_ROWS.map((row, i) => (
              <motion.div
                key={row.hoizr}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
                className="grid grid-cols-2 gap-2.5"
              >
                <div className="flex items-start gap-2 rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3.5">
                  <X size={16} className="mt-0.5 shrink-0 text-white/40" />
                  <span className="text-[13.5px] leading-snug text-white/60">
                    {row.marketplace}
                  </span>
                </div>
                <div className="flex items-start gap-2 rounded-[16px] border border-[var(--m-acid)]/25 bg-[var(--m-acid)]/[0.06] px-4 py-3.5">
                  <Check size={16} className="mt-0.5 shrink-0 text-[var(--m-acid)]" />
                  <span className="text-[13.5px] font-medium leading-snug text-white">
                    {row.hoizr}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
