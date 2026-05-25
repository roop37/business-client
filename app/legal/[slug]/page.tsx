import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import {
  ALL_LEGAL_SLUGS,
  getLegalContent,
} from "@/components/marketing/legal/content";

type Params = { params: { slug: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_LEGAL_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const content = getLegalContent(params.slug);
  if (!content) return { title: "Not found" };
  const canonical = `/legal/${params.slug}`;
  return {
    title: `${content.title} — Hoizr`,
    description: content.intro,
    alternates: {
      canonical,
      languages: { "en-IN": canonical, "x-default": canonical },
    },
    openGraph: {
      title: `${content.title} — Hoizr`,
      description: content.intro,
      url: canonical,
      type: "article",
      siteName: "Hoizr",
      locale: "en_IN",
      images: [
        {
          url: "/opengraph-image.webp",
          width: 1200,
          height: 630,
          alt: `${content.title} — Hoizr`,
        },
      ],
    },
    robots: { index: true, follow: true },
  };
}

export default function LegalPage({ params }: Params) {
  const content = getLegalContent(params.slug);
  if (!content) notFound();

  return (
    <MarketingShell>
      <section className="hm-section pt-12 md:pt-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--m-ink-3)] hover:text-[var(--m-ink-1)]"
        >
          <span aria-hidden>←</span>
          Back to Hoizr
        </Link>

        <div className="mt-8 max-w-[720px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--m-forest-700)]/20 bg-[var(--m-forest-700)]/5 px-3 py-1.5 text-[12px] font-semibold text-[var(--m-forest-700)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--m-forest-700)]" />
            Hoizr legal document
          </span>
          <h1
            className="mt-6 font-bold leading-[1.05] tracking-[-0.025em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(40px, 5.5vw, 64px)",
            }}
          >
            {content.title}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-[var(--m-ink-3)]">
            {content.intro}
          </p>
          <p className="mt-3 text-[13px] text-[var(--m-ink-4)]">
            Last reviewed · {content.lastReviewed}
          </p>
        </div>

        <article className="mt-12 max-w-[720px] space-y-10">
          {content.sections.map((section, i) => (
            <section key={section.heading}>
              <div className="flex items-baseline gap-4">
                <span
                  className="hoizr-mark text-[15px] text-[var(--m-ink-4)]"
                  style={{ letterSpacing: "0.1em" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2
                  className="font-semibold leading-tight tracking-[-0.015em] text-[var(--m-ink-1)]"
                  style={{ fontSize: "clamp(20px, 2.2vw, 26px)" }}
                >
                  {section.heading}
                </h2>
              </div>
              <div className="mt-4 space-y-4 pl-0 md:pl-[44px]">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[16px] leading-[1.65] text-[var(--m-ink-2)]"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.items ? (
                  <ul className="list-disc space-y-2 pl-5 text-[15px] leading-[1.6] text-[var(--m-ink-2)]">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </article>

        <div className="mt-12 max-w-[720px] border-l-2 border-[var(--m-forest-700)]/30 pl-5 text-[13px] leading-relaxed text-[var(--m-ink-3)]">
          This page is written from Hoizr&apos;s current product and finance
          source of truth. It should still be reviewed by counsel and a CA
          before live legal publication.
        </div>

        <div className="mt-16 max-w-[720px] rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-canvas-2)] p-6">
          <div className="hm-eyebrow">Other documents</div>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {ALL_LEGAL_SLUGS.filter((s) => s !== content.slug).map((s) => {
              const other = getLegalContent(s)!;
              return (
                <li key={s}>
                  <Link
                    href={`/legal/${s}`}
                    className="text-[14px] font-medium text-[var(--m-ink-2)] hover:text-[var(--m-forest-700)]"
                  >
                    {other.title} →
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </MarketingShell>
  );
}
