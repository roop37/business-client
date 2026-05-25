import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Compass, Download, Newspaper } from "lucide-react";
import { blogs } from "@/components/marketing/blog/blog-data";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Beliefs } from "@/components/marketing/sections/Beliefs";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";
import { FounderCard } from "@/components/marketing/sections/FounderCard";
import { Playbooks } from "@/components/marketing/sections/Playbooks";
import {
  BreadcrumbJsonLd,
  JsonLdScript,
} from "@/components/marketing/seo/SchemaJsonLd";

const SITE_URL = "https://business.hoizr.com";

export const metadata: Metadata = {
  title:
    "Resources — Playbooks & blogs for Indian event organizers · Hoizr",
  description:
    "Operator playbooks, migration guides, and field notes for Indian event organizers, venues, and promoters. Short, opinionated, written for India's live nights.",
  keywords: [
    "event organizer playbooks India",
    "ticketing platform migration guide India",
    "fan CRM playbook",
    "on-sale day playbook",
    "event marketing field notes India",
    "flyer stickers download",
    "Hoizr resources",
  ],
  alternates: {
    canonical: "/resources",
    languages: { "en-IN": "/resources", "x-default": "/resources" },
  },
  openGraph: {
    title: "Resources — Playbooks & blogs for Indian event organizers · Hoizr",
    description:
      "Operator playbooks, migration guides, and field notes for India's clubs, festivals, comedy promoters, and live music venues.",
    url: "/resources",
    type: "website",
    siteName: "Hoizr",
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "Hoizr resources — playbooks, blogs, and operator field notes for Indian event organizers",
      },
    ],
  },
};

const FEATURED_BLOGS = blogs.slice(0, 3);

const FLYER_STICKERS = [
  {
    title: "Get tickets · black",
    context: "For light posters, stories, and reels.",
    href: "/images/flyerstickers/get-ticets-on-black.png",
  },
  {
    title: "Get tickets · white",
    context: "For dark flyers and high-contrast artwork.",
    href: "/images/flyerstickers/get-ticets-on-white.png",
  },
  {
    title: "Guestlist · black",
    context: "For RSVP-first or limited-entry nights.",
    href: "/images/flyerstickers/guestlist-black.png",
  },
  {
    title: "Guestlist · white",
    context: "For dark venue posters and club-night reels.",
    href: "/images/flyerstickers/guestlist-on-whte.png",
  },
  {
    title: "RSVP · black",
    context: "For invite-led launches and private drops.",
    href: "/images/flyerstickers/rsvp-on-black.png",
  },
  {
    title: "RSVP · white",
    context: "For darker flyers with clean sticker contrast.",
    href: "/images/flyerstickers/rsvp-on-white.png",
  },
] as const;

const resourcesJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/resources`,
  url: `${SITE_URL}/resources`,
  name: "Hoizr Resources — Playbooks & blogs for Indian event organizers",
  description:
    "Operator playbooks, migration guides, and field notes for Indian event organizers, venues, and promoters.",
  inLanguage: "en-IN",
  isPartOf: { "@type": "WebSite", name: "Hoizr", url: SITE_URL },
  mainEntity: {
    "@type": "ItemList",
    name: "Featured Hoizr blog posts",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: FEATURED_BLOGS.length,
    itemListElement: FEATURED_BLOGS.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${b.id}`,
      name: b.title,
    })),
  },
};

export default function ResourcesPage() {
  return (
    <MarketingShell>
      <JsonLdScript id="hoizr-resources-jsonld" data={resourcesJsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: "Hoizr", href: "/" },
          { name: "Resources", href: "/resources" },
        ]}
      />
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

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <a
            href="#stickers"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--m-border)] bg-[var(--m-surface)] p-5 transition hover:border-[var(--m-forest-300)]"
          >
            <div>
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--m-ink-4)]">
                <Download size={12} />
                Stickers
              </div>
              <div className="mt-1 text-[14px] font-semibold text-[var(--m-ink-1)]">
                Download PNGs for flyers
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

      <section id="stickers" className="hm-section">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[620px]">
            <div className="hm-eyebrow inline-flex items-center gap-2">
              <Download size={12} strokeWidth={2.2} />
              Flyer stickers
            </div>
            <h2 className="hm-h2 mt-3">Hoizr stickers for event artwork.</h2>
            <p className="hm-lead mt-5 max-w-[540px]">
              Download transparent PNG stickers for posters, stories, reels,
              venue screens, and last-mile event announcements.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FLYER_STICKERS.map((sticker) => (
            <article
              key={sticker.href}
              className="overflow-hidden rounded-[var(--m-r-xl)] border border-[var(--m-border)] bg-[var(--m-surface)]"
            >
              <div className="grid aspect-square place-items-center bg-[linear-gradient(135deg,var(--m-canvas-2),var(--m-forest-900))] p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sticker.href}
                  alt={`${sticker.title} Hoizr flyer sticker`}
                  className="h-full w-full object-contain drop-shadow-[0_18px_32px_rgba(0,0,0,0.28)]"
                  draggable={false}
                />
              </div>
              <div className="p-5">
                <h3
                  className="font-semibold leading-snug text-[var(--m-ink-1)]"
                  style={{ fontFamily: "var(--m-font-display)" }}
                >
                  {sticker.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--m-ink-3)]">
                  {sticker.context}
                </p>
                <a
                  href={sticker.href}
                  download
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--m-border)] px-4 py-2 text-[12px] font-semibold text-[var(--m-ink-1)] transition hover:border-[var(--m-forest-300)] hover:text-[var(--m-forest-600)]"
                >
                  <Download size={14} />
                  Download PNG
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="blogs" className="hm-section">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[620px]">
            <div className="hm-eyebrow">From the Hoizr blog</div>
            <h2 className="hm-h2 mt-3">Latest posts.</h2>
            <p className="hm-lead mt-5 max-w-[520px]">
              Deeper reads on migration, fan CRM, AI event strategy, and the way
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
