"use client";

import { motion } from "framer-motion";
import { EVENT_FORMATS } from "../data/site-copy";
import { CurvedLoop } from "../visuals/CurvedLoop";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * Thin strip under the hero. Event FORMATS (not fake customer logos —
 * we don't fabricate social proof) so a visitor instantly sees their
 * kind of night is covered.
 */
export const EventFormats = () => {
  return (
    <section className="hm-section pt-2 pb-6 md:pt-4 md:pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-col items-center gap-5 text-center"
      >
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--m-ink-4)]">
          Built for every kind of night
        </div>
        <CurvedLoop
          marqueeText={`${EVENT_FORMATS.join(" ✦ ")} ✦`}
          speed={1.5}
          curveAmount={140}
          interactive={true}
          className="fill-[var(--m-ink-1)] [font-size:120px] [font-weight:800] uppercase tracking-tight md:[font-size:56px]"
        />
      </motion.div>
    </section>
  );
};
