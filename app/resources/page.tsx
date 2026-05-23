import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Compass, Newspaper } from "lucide-react";
import { blogs } from "@/components/marketing/blog/blog-data";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Beliefs } from "@/components/marketing/sections/Beliefs";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";
import { FounderCard } from "@/components/marketing/sections/FounderCard";
import { Playbooks } from "@/components/marketing/sections/Playbooks";

export const metadata: Metadata = {
  title:
    "Resources — Playbooks & blogs for Indian event organizers · Hoizr",
  description:
    "Operator playbooks, migration guides, and field notes for Indian event organizers, venues, and promoters. Short, opinionated, written for India's live nights.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Resources — Playbooks & blogs for Indian event organizers · Hoizr",
    description:
      "Operator playbooks, migration guides, and field notes for India's clubs, festivals, comedy promoters, and live music venues.",
    url: "/resources",
    type: "website",
  },
};

const FEATURED_BLOGS = blogs.slice(0, 3);

export default function ResourcesPage() {
  return (
    <MarketingShell>
      <section className="hm-section pt-12 md:pt-16">
        <div className="max-w-[820px]">
          <div className="hm-eyebrow inline-flex items-center gap-2">
            <Compass size={12} strokeWidth={2.2} />
            Resources
          </div>
          <h1
            className="mt-3 font-bold leading-[1.04] tracking-[-0.025em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(40px, 5.4vw, 64px)",
            }}
          >
            Everything we&rsquo;ve learned, in one place.
          </h1>
          <p className="mt-5 max-w-[640px] text-[17px] leading-relaxed text-[var(--m-ink-3)]">
            Short playbooks for the door, longer blogs for the migration call,
            and the four positions we hold while we build. Written for Indian
            event organizers, venues, and promoters.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href="#playbooks"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--m-border)] bg-[var(--m-surface)] p-5 transition hover:border-[var(--m-forest-300)]"
          >
            <div>
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-4)]">
                <BookOpen size={12} />
                Playbooks
              </div>
              <div className="mt-1 text-[14px] font-semibold text-[var(--m-ink-1)]">
                Short, opinionated guides
              </div>
            </div>
            <ArrowUpRight
              size={18}
              className="shrink-0 text-[var(--m-ink-3)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
          <a
            href="#blogs"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--m-border)] bg-[var(--m-surface)] p-5 transition hover:border-[var(--m-forest-300)]"
          >
            <div>
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-4)]">
                <Newspaper size={12} />
                Blog
              </div>
              <div className="mt-1 text-[14px] font-semibold text-[var(--m-ink-1)]">
                Long-form posts &amp; migration guides
              </div>
            </div>
            <ArrowUpRight
              size={18}
              className="shrink-0 text-[var(--m-ink-3)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
          <a
            href="#beliefs"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--m-border)] bg-[var(--m-surface)] p-5 transition hover:border-[var(--m-forest-300)]"
          >
            <div>
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-4)]">
                <Compass size={12} />
                What we believe
              </div>
              <div className="mt-1 text-[14px] font-semibold text-[var(--m-ink-1)]">
                Four positions, one founder note
              </div>
            </div>
            <ArrowUpRight
              size={18}
              className="shrink-0 text-[var(--m-ink-3)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </section>

      <Playbooks />

      <section id="blogs" className="hm-section">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[620px]">
            <div className="hm-eyebrow">From the Hoizr blog</div>
            <h2 className="hm-h2 mt-3">Latest posts.</h2>
            <p className="hm-lead mt-5 max-w-[520px]">
              Deeper reads on migration, fan CRM, AI pricing, and the way
              Indian live nights actually run.
            </p>
          </div>
          <Link
            href="/blog"
            className="hm-btn hm-btn-ghost border border-[var(--m-border)] self-start md:self-auto"
          >
            All posts
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {FEATURED_BLOGS.map((b) => (
            <Link
              key={b.id}
              href={`/blog/${b.id}`}
              className="group block overflow-hidden rounded-[var(--m-r-xl)] border border-[var(--m-border)] bg-[var(--m-surface)] transition hover:-translate-y-1 hover:shadow-[var(--m-shadow-pop)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--m-canvas-2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image}
                  alt={b.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  draggable={false}
                />
              </div>
              <div className="p-5">
                <span className="inline-flex items-center rounded-full bg-[var(--m-canvas-2)] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--m-ink-2)]">
                  {b.category}
                </span>
                <h3
                  className="mt-3 font-semibold leading-snug tracking-[-0.015em] text-[var(--m-ink-1)]"
                  style={{
                    fontFamily: "var(--m-font-display)",
                    fontSize: "clamp(17px, 1.6vw, 20px)",
                  }}
                >
                  {b.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--m-ink-3)]">
                  {b.excerpt}
                </p>
                <div className="mt-4 text-[11.5px] uppercase tracking-[0.1em] text-[var(--m-ink-4)]">
                  {b.date} · {b.readTime}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="beliefs">
        <Beliefs />
      </section>
      <FounderCard />

      <FinalCTA />
    </MarketingShell>
  );
}
