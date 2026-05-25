"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Search, Sparkles } from "lucide-react";
import Link from "next/link";

const EASE = [0.2, 0.6, 0.2, 1] as const;

/**
 * Deep-ink AI-SEO panel. Full-bleed dark card breaks up the cream
 * canvas and frames Hoizr's AI-discovery story. Right side is a
 * stylised mock SERP — entirely synthesised UI, no third-party
 * screenshots required.
 */
export const AiSeoPanel = () => {
  return (
    <section className="hm-section">
      <div className="relative overflow-hidden rounded-[var(--m-r-2xl)] bg-[var(--m-ink-1)] text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/hero/hero-lines-star.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        <div className="relative z-10 grid md:grid-cols-2 gap-10 px-5 py-12 md:px-14 md:py-20">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-col justify-center"
          >
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold tracking-wider text-white/90 backdrop-blur">
              <Sparkles size={14} className="text-[var(--m-acid)]" />
              AI · Event SEO
            </span>
            <h2 className="hm-h2 mt-5 text-white">
              AI does the SEO. You do the show.
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-white/75 max-w-[480px]">
              Hoizr audits every show like a search engine would: venue, city,
              category, date, tickets, canonical URL, structured data, and share
              previews. Then it builds the signals that help your event climb
              across search, Maps, social cards, and discovery integrations.
            </p>

            <ul className="mt-7 space-y-3 text-[14.5px] text-white/85">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--m-acid)]" />
                Validates venue, geo, category, date, ticket, and organizer data before publish.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--m-acid)]" />
                Generates Event + Organization JSON-LD, canonical meta, link cards, and sitemap entries.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--m-acid)]" />
                Keeps search pages, Maps fields, social previews, and integrations fresh after every edit.
              </li>
            </ul>

            <div className="mt-9">
              <Link
                href="/product/event-seo"
                className="hm-btn hm-btn-acid"
              >
                See Event SEO
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Right: synthesised SERP mock */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-[500px] rounded-[32px] border border-white/10 bg-white text-[var(--m-ink-1)] shadow-[0_30px_90px_rgba(0,0,0,0.55)] overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-[var(--m-border)] bg-[var(--m-canvas-2)] px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <div className="ml-3 flex flex-1 items-center gap-2 rounded-md bg-white px-2.5 py-1 text-[11.5px] text-[var(--m-ink-3)] border border-[var(--m-border)]">
                  <span className="text-[var(--m-ink-4)]">google.com/search</span>
                </div>
              </div>

              {/* Search query */}
              <div className="px-5 pt-5">
                <div className="flex items-center gap-2 rounded-full border border-[var(--m-border)] bg-white px-4 py-2.5 shadow-sm">
                  <Search size={14} className="text-[var(--m-ink-4)]" />
                  <span className="text-[13px] text-[var(--m-ink-2)]">
                    electronic music goa this weekend
                  </span>
                </div>
              </div>

              {/* Result 1 — Hoizr-hosted event */}
              <div className="px-5 pt-5 pb-2">
                <div className="rounded-2xl border border-[var(--m-forest-300)] bg-[#F4FBEC] p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-[var(--m-forest-900)] text-[10px] font-bold text-[var(--m-acid)] flex items-center justify-center">
                      H
                    </div>
                    <span className="text-[12px] font-medium text-[var(--m-ink-3)]">
                      hoizr.com/goa/electronic
                    </span>
                  </div>
                  <div className="mt-1.5 text-[15px] font-semibold text-[var(--m-forest-700)]">
                    Sundown Festival 2026 · Vagator, Goa · Sat 13 Dec
                  </div>
                  <div className="mt-1 text-[12.5px] text-[var(--m-ink-3)]">
                    Open-air electronic festival across two stages. Headliners +
                    sunset sets. Phase 1 tickets from ₹1,499.
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px]">
                    <span className="rounded-full bg-[var(--m-forest-900)] text-[var(--m-acid)] px-2 py-0.5 font-medium">
                      Event listing
                    </span>
                    <span className="flex items-center gap-1 text-[var(--m-ink-4)]">
                      <MapPin size={11} className="shrink-0" /> 13 Dec · Vagator Beach
                    </span>
                  </div>
                </div>
              </div>

              {/* Result 2 — generic listing */}
              <div className="px-5 pb-5">
                <div className="rounded-2xl border border-[var(--m-border)] bg-white p-4 mt-3">
                  <div className="text-[12px] text-[var(--m-ink-4)]">
                    other-listing.com › goa › events
                  </div>
                  <div className="mt-1 text-[14px] font-medium text-[var(--m-ink-3)]">
                    Goa nightlife — events this weekend (list)
                  </div>
                  <div className="mt-1 text-[12px] text-[var(--m-ink-4)]">
                    Generic listings page. No schema, no rich result.
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--m-border)] bg-[var(--m-canvas-2)] px-5 py-3 flex items-center justify-between text-[11.5px]">
                <span className="text-[var(--m-ink-3)]">
                  Last tuned · 2 hours ago
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--m-forest-700)]">
                  <Sparkles size={11} /> Auto-optimised by Hoizr
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
