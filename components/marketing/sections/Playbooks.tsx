"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { BlurImage } from "../visuals/BlurImage";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Playbook = {
  kicker: string;
  title: string;
  body: string;
  href: string;
  image?: string;
  /** Tonal treatment for grayscale photo overlays. */
  tone?: "violet" | "acid" | "forest" | "ink";
  /** Neon hero variant — black bg + acid display title, no image. */
  neon?: boolean;
};

export type PlaybookBlogTeaser = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  readTime: string;
};

const PLAYBOOKS: Playbook[] = [
  {
    kicker: "Manifesto",
    title: "Playbooks from the operator side.",
    body: "Sharper from the next weekend onward. Short, opinionated guides written for India's clubs, festivals, comedy promoters, venues, and party crews.",
    href: "/blog",
    neon: true,
  },
  {
    kicker: "On-sale day",
    title: "The first 24 hours after going live.",
    body: "How to choreograph drops, fan-list blasts, and price-tier waves so the day-one momentum carries through to the door.",
    href: "/blog/on-sale-day-playbook-indian-event-hosts",
    image: "/images/playbooks/Backstage-atmosphere-at-a-live-event.png",
    tone: "acid",
  },
  {
    kicker: "Campaign cadence",
    title: "21 / 14 / 7 / 3 / 1.",
    body: "The reminder rhythm fans actually respond to — and what to put in each touch so opens stop dropping the closer you get to doors.",
    href: "/blog/campaign-cadence-playbook-for-event-marketing",
    image: "/images/playbooks/Backstage-tech-control-in-ambient-lighting.png",
    tone: "violet",
  },
  {
    kicker: "Door ops",
    title: "Field notes from the gate.",
    body: "Line management, comp tracking, scanner roles, and the post-midnight ops debrief — written for the door team, not the spreadsheet.",
    href: "/blog/door-ops-playbook-for-indian-club-nights",
    image: "/images/playbooks/Nightclub-entrance-with-wristband-check.png",
    tone: "ink",
  },
  {
    kicker: "Pricing",
    title: "Genre-aware ticket pricing in India.",
    body: "What Mumbai techno, Bangalore comedy, and Delhi rooftops actually charge — and how to bracket your own tiers without leaving money on the floor.",
    href: "/blog/genre-aware-ticket-pricing-playbook-india",
    image: "/images/playbooks/Nightclub-vibes-DJ-in-the-mix .png",
    tone: "forest",
  },
  {
    kicker: "Refund policy",
    title: "Clear copy, fewer disputes.",
    body: "A 5-line refund policy template that holds up at the door, keeps fans calm, and reduces chargeback rate against your payouts.",
    href: "/blog/refund-policy-playbook-for-event-hosts",
    image: "/images/playbooks/Rainy-night-at-the-club-entrance.png",
    tone: "acid",
  },
  {
    kicker: "Teardown",
    title: "What to measure after every event.",
    body: "Six numbers that matter, two that don't, and the 30-minute Monday review that compounds your next ten weekends.",
    href: "/blog/event-teardown-playbook-after-the-show",
    image: "/images/playbooks/Empty-venue-with-soft-sunlight-beams.png",
    tone: "violet",
  },
];

/** Tonal duotone for grayscale photos — maps a brand hue into shadows
 *  and a soft black wash into highlights so the image picks up the
 *  brand without losing its grain. */
// Lighter overlay set — per user feedback the prior duotones were
// fighting the imagery. Top of the card now sits at near-zero
// opacity so the photo reads cleanly; only the bottom strip carries
// enough shadow for the white title + body to stay legible.
const TONE_OVERLAY: Record<NonNullable<Playbook["tone"]>, string> = {
  acid:
    "linear-gradient(180deg, rgba(214,255,63,0.04) 0%, rgba(8,8,6,0.18) 50%, rgba(6,6,4,0.78) 100%)",
  violet:
    "linear-gradient(180deg, rgba(124,77,255,0.05) 0%, rgba(12,10,18,0.20) 50%, rgba(8,7,16,0.78) 100%)",
  forest:
    "linear-gradient(180deg, rgba(28,90,55,0.06) 0%, rgba(10,22,14,0.22) 50%, rgba(4,12,6,0.78) 100%)",
  ink:
    "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0.78) 100%)",
};

const TONE_DOT: Record<NonNullable<Playbook["tone"]>, string> = {
  acid: "bg-[var(--m-acid)]",
  violet: "bg-[#b08aff]",
  forest: "bg-[#5fd49f]",
  ink: "bg-white/80",
};

export const Playbooks = ({
  blogTeasers = [],
}: {
  blogTeasers?: PlaybookBlogTeaser[];
}) => {
  const featuredBlogs = blogTeasers.slice(0, 2);

  return (
    <section id="playbooks" className="hm-section">
      <div
        className={
          featuredBlogs.length
            ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end"
            : "flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        }
      >
        <div className="max-w-[640px]">
          <div className="hm-eyebrow inline-flex items-center gap-2">
            <BookOpen size={12} strokeWidth={2.2} />
            Playbooks
          </div>
          <h2 className="hm-h2 mt-3">
            Cool, short, opinionated guides for India&rsquo;s live nights.
          </h2>
          <p className="hm-lead mt-5 max-w-[520px]">
            Field notes from operators we work with, distilled into pages you
            can read between sound-check and doors. New playbooks every couple
            of weeks.
          </p>
          {featuredBlogs.length ? (
            <Link
              href="/blog"
              className="hm-btn hm-btn-ghost mt-7 border border-[var(--m-border)]"
            >
              All playbooks
              <ArrowUpRight size={15} />
            </Link>
          ) : null}
        </div>
        {featuredBlogs.length ? (
          <div className="grid gap-3">
            {featuredBlogs.map((blog, i) => (
              <CompactBlogCard key={blog.id} blog={blog} index={i} />
            ))}
          </div>
        ) : (
          <Link
            href="/blog"
            className="hm-btn hm-btn-ghost border border-[var(--m-border)] self-start md:self-auto"
          >
            All playbooks
            <ArrowUpRight size={15} />
          </Link>
        )}
      </div>

      {/* Bento grid: neon manifesto spans two columns on desktop;
          rest fit into a tight 3-up. */}
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {PLAYBOOKS.map((p, i) =>
          p.neon ? (
            <NeonHeroCard key={p.title} playbook={p} index={i} />
          ) : (
            <PhotoCard key={p.title} playbook={p} index={i} />
          )
        )}
      </div>
    </section>
  );
};

const CompactBlogCard = ({
  blog,
  index,
}: {
  blog: PlaybookBlogTeaser;
  index: number;
}) => (
  <motion.div {...cardMotion(index + 1)}>
    <Link
      href={`/blog/${blog.id}`}
      className="group grid min-h-[128px] grid-cols-[minmax(0,1fr)_112px] overflow-hidden rounded-[18px] border border-[var(--m-border)] bg-[var(--m-surface)] shadow-[0_14px_32px_rgba(25,32,24,0.08)] transition hover:-translate-y-0.5 hover:shadow-[var(--m-shadow-pop)] sm:grid-cols-[minmax(0,1fr)_132px]"
    >
      <div className="min-w-0 p-4 sm:p-5">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--m-ink-4)]">
          {blog.category}
        </div>
        <h3
          className="mt-2 line-clamp-2 font-semibold leading-[1.12] tracking-[-0.015em] text-[var(--m-ink-1)] group-hover:text-[var(--m-forest-700)]"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(16px, 1.55vw, 19px)",
          }}
        >
          {blog.title}
        </h3>
        <div className="mt-3 flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--m-ink-4)]">
          {blog.readTime}
          <ArrowUpRight
            size={13}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </div>
      <div className="relative min-h-full overflow-hidden bg-[var(--m-canvas-2)]">
        <BlurImage
          src={blog.image}
          alt={blog.title}
          fill
          sizes="(max-width: 1100px) 30vw, 200px"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          draggable={false}
        />
      </div>
    </Link>
  </motion.div>
);

const cardMotion = (index: number) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: EASE, delay: 0.05 * (index % 6) },
});

/**
 * NeonHeroCard — the manifesto tile. Black canvas, acid display
 * title, no image. Sits as the visual anchor of the bento grid and
 * spans 2 columns on desktop.
 */
const NeonHeroCard = ({
  playbook,
  index,
}: {
  playbook: Playbook;
  index: number;
}) => (
  <motion.div {...cardMotion(index)} className="md:col-span-2">
    <Link
      href={playbook.href}
      className="group relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-[26px] bg-[#0a0a0a] p-7 md:p-9"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/marketing/hero/hero-lines-star.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--m-acid)]/30 bg-black/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--m-acid)] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--m-acid)] shadow-[0_0_10px_var(--m-acid)]" />
          {playbook.kicker}
        </span>
      </div>

      <div className="relative z-10">
        <h3
          className="font-bold leading-[1.02] tracking-[-0.025em] text-[var(--m-acid)]"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(34px, 4.4vw, 56px)",
            textShadow: "0 0 32px rgba(214,255,63,0.35)",
          }}
        >
          {playbook.title}
        </h3>
        <p className="mt-5 max-w-[520px] text-[15px] leading-relaxed text-white/76">
          {playbook.body}
        </p>
        <span className="mt-7 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--m-acid)]">
          Read the playbooks
          <ArrowUpRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  </motion.div>
);

/**
 * PhotoCard — title + body live INSIDE the grayscale image, extended
 * vertically. The grayscale photo is duotoned by a tonal gradient so
 * it picks up brand without losing its grain. No border on the image
 * itself; only the card has a rounded radius.
 */
const PhotoCard = ({
  playbook,
  index,
}: {
  playbook: Playbook;
  index: number;
}) => {
  const tone = playbook.tone ?? "ink";
  return (
    <motion.div {...cardMotion(index)}>
      <Link
        href={playbook.href}
        className="group relative flex h-full min-h-[360px] flex-col justify-between overflow-hidden rounded-[22px] p-6 text-white md:min-h-[400px] md:p-7"
      >
        {/* Background image — sized to fill, grayscale boosted, scales
            on hover. No border, rounded radius lives on the parent. */}
        {playbook.image ? (
          <BlurImage
            src={playbook.image}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 1100px) 100vw, 360px"
            className="absolute inset-0 h-full w-full object-cover brightness-105 transition-transform duration-1000 ease-out group-hover:scale-105"
            draggable={false}
          />
        ) : null}
        {/* Tonal duotone wash — adds brand hue without overwhelming. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: TONE_OVERLAY[tone] }}
        />

        {/* Top — kicker pill */}
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
            <span className={`h-1 w-1 rounded-full ${TONE_DOT[tone]}`} />
            {playbook.kicker}
          </span>
        </div>

        {/* Bottom — title + body + arrow */}
        <div className="relative">
          <h3
            className="font-bold leading-[1.06] tracking-[-0.02em] text-white"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(22px, 2.4vw, 30px)",
            }}
          >
            {playbook.title}
          </h3>
          <p className="mt-3 line-clamp-3 max-w-[420px] text-[13.5px] leading-relaxed text-white/82">
            {playbook.body}
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/90">
            Read playbook
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </Link>
    </motion.div>
  );
};
