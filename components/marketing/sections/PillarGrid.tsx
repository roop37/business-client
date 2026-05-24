"use client";

import { motion } from "framer-motion";
import {
  Compass,
  HeartHandshake,
  Layers,
  TicketCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { MARKETING_PILLARS } from "../data/nav-products";

const ICONS: Record<string, LucideIcon> = {
  discovery: Compass,
  sales: TicketCheck,
  repeat: HeartHandshake,
  ops: Layers,
};

const EASE = [0.2, 0.6, 0.2, 1] as const;

export const PillarGrid = () => {
  return (
    <section id="products" className="hm-section">
      <div className="max-w-[860px]">
        <div className="hm-eyebrow">The Hoizr platform</div>
        <h2 className="hm-h2 mt-3">
          Everything you need to fill the room — and bring everyone back.
        </h2>
        <p className="hm-lead mt-5 max-w-[640px]">
          Four pillars, one platform. Wire your discovery, your sales engine,
          your fan relationship, and your night-of operations into a single
          stack built for Indian live nights.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
        {MARKETING_PILLARS.map((pillar, idx) => {
          const Icon = ICONS[pillar.id];
          const primary = pillar.products[0];

          if (idx === 0) {
            return (
              <ImagePillarCard
                key={pillar.id}
                pillar={pillar}
                primarySlug={primary.slug}
                Icon={Icon}
                idx={idx}
              />
            );
          }

          return (
            <DefaultPillarCard
              key={pillar.id}
              pillar={pillar}
              primarySlug={primary.slug}
              Icon={Icon}
              idx={idx}
            />
          );
        })}
      </div>
    </section>
  );
};

type PillarProps = {
  pillar: (typeof MARKETING_PILLARS)[number];
  primarySlug: string;
  Icon: LucideIcon;
  idx: number;
};

const cardMotion = (idx: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.65, ease: EASE, delay: idx * 0.05 },
});

const ImagePillarCard = ({ pillar, primarySlug, Icon, idx }: PillarProps) => (
  <motion.div {...cardMotion(idx)}>
    <Link
      href={`/product/${primarySlug}`}
      className="group relative block h-full min-h-[360px] overflow-hidden rounded-[var(--m-r-xl)] border border-white/10 bg-[#050504] p-7 text-white shadow-[0_24px_70px_rgba(5,5,4,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_rgba(5,5,4,0.28)] md:p-9"
    >
      <img
        src="/marketing/brand/metallic-line-banner.png"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative flex min-h-[306px] flex-col justify-between">
        <div>
          <div className="flex items-start gap-5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/70 text-[var(--m-acid)] shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
              <Icon size={22} strokeWidth={1.7} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/70">
                Pillar 0{idx + 1}
              </div>
              <h3
                className="mt-2 font-bold leading-tight text-white"
                style={{ fontSize: "clamp(24px, 2.6vw, 34px)" }}
              >
                {pillar.label}.
              </h3>
              <p className="mt-3 max-w-[420px] text-[15px] leading-relaxed text-white/84">
                {pillar.tagline}
              </p>
            </div>
          </div>

          <PillarChips pillar={pillar} />
        </div>

        <div className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--m-acid)]">
          Explore the pillar
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

const DefaultPillarCard = ({ pillar, primarySlug, Icon, idx }: PillarProps) => (
  <motion.div {...cardMotion(idx)}>
    <Link
      href={`/product/${primarySlug}`}
      className="group block h-full min-h-[360px] rounded-[var(--m-r-xl)] border border-[var(--m-border)] bg-[var(--m-surface)] p-7 text-[var(--m-ink-1)] shadow-[var(--m-shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--m-forest-500)] hover:shadow-[var(--m-shadow-pop)] md:p-9"
    >
      <div className="flex min-h-[306px] flex-col justify-between">
        <div>
          <div className="flex items-start gap-5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--m-canvas-2)] text-[var(--m-forest-700)] transition-colors group-hover:bg-[var(--m-forest-700)] group-hover:text-[var(--m-acid)]">
              <Icon size={22} strokeWidth={1.7} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="hm-eyebrow text-[var(--m-ink-3)]">
                Pillar 0{idx + 1}
              </div>
              <h3 className="hm-h3 mt-2 text-[var(--m-ink-1)]">
                {pillar.label}.
              </h3>
              <p className="mt-3 max-w-[420px] text-[15px] leading-relaxed text-[var(--m-ink-3)]">
                {pillar.tagline}
              </p>
            </div>
          </div>

          <PillarChips pillar={pillar} tone="light" />
        </div>

        <div className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--m-forest-700)]">
          Explore the pillar
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

const PillarChips = ({
  pillar,
  tone = "dark",
}: {
  pillar: PillarProps["pillar"];
  tone?: "dark" | "light";
}) => (
  <div
    className={`mt-7 border-t pt-5 ${
      tone === "light" ? "border-[var(--m-border)]" : "border-white/15"
    }`}
  >
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {pillar.products.slice(0, 4).map((p) => (
        <span
          key={p.slug}
          className={
            tone === "light"
              ? "hm-chip px-2.5 py-1 text-[12.5px]"
              : "inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[12.5px] font-medium text-white"
          }
        >
          {p.label}
        </span>
      ))}
      {pillar.products.length > 4 ? (
        <span
          className={`text-[12.5px] font-medium ${
            tone === "light" ? "text-[var(--m-ink-4)]" : "text-white/65"
          }`}
        >
          +{pillar.products.length - 4} more
        </span>
      ) : null}
    </div>
  </div>
);
