"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Megaphone,
  Mic2,
  ScanLine,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { MARKETING_PILLARS, PillarId } from "../data/nav-products";

const ICONS: Record<PillarId, LucideIcon> = {
  sell: Ticket,
  own: Users,
  grow: Megaphone,
  ops: ScanLine,
  decide: BarChart3,
  artists: Mic2,
};

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * "What you can do" — the live platform at a glance, one card per pillar.
 * Each card links to its first product and lists the rest, so the grid
 * doubles as a map of everything that ships today.
 */
export const PillarsOverview = () => {
  return (
    <section id="platform" className="hm-section">
      <div className="max-w-[820px]">
        <div className="hm-eyebrow">The platform</div>
        <h2 className="hm-h2 mt-3">
          Everything to sell out the night — and own the crowd.
        </h2>
        <p className="hm-lead mt-5 max-w-[620px]">
          One platform for the whole loop: sell every kind of ticket, keep every
          fan, bring them back, run the door, and get paid. Plus a home for the
          artists who fill your lineups.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MARKETING_PILLARS.map((pillar, idx) => {
          const Icon = ICONS[pillar.id];
          const primary = pillar.products[0];
          return (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.55, ease: EASE, delay: (idx % 3) * 0.05 }}
            >
              <Link
                href={`/product/${primary.slug}`}
                className="group flex h-full flex-col rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-surface)] p-6 shadow-[var(--m-shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--m-forest-500)] hover:shadow-[var(--m-shadow-pop)]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--m-canvas-2)] text-[var(--m-forest-700)] transition-colors group-hover:bg-[var(--m-forest-700)] group-hover:text-[var(--m-acid)]">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <h3 className="text-[19px] font-semibold tracking-[-0.015em] text-[var(--m-ink-1)]">
                    {pillar.label}
                  </h3>
                </div>
                <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--m-ink-3)]">
                  {pillar.tagline}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {pillar.products.map((p) => (
                    <span
                      key={p.slug}
                      className="rounded-full bg-[var(--m-canvas-2)] px-2.5 py-1 text-[12px] font-medium text-[var(--m-ink-2)]"
                    >
                      {p.label}
                    </span>
                  ))}
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[13px] font-semibold text-[var(--m-forest-700)]">
                  Explore
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
