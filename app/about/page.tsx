import type { Metadata } from "next";
import Link from "next/link";
import { AboutIncluded } from "@/components/marketing/about/AboutIncluded";
import { AboutPromise } from "@/components/marketing/about/AboutPromise";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AiOfferSpotlight } from "@/components/marketing/sections/AiOfferSpotlight";
import { Beliefs } from "@/components/marketing/sections/Beliefs";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";
import {
  BreadcrumbJsonLd,
  JsonLdScript,
} from "@/components/marketing/seo/SchemaJsonLd";

const SITE_URL = "https://business.hoizr.com";
const FOUNDER_IMAGE =
  "https://res.cloudinary.com/duhefgqh4/image/upload/v1748974724/IMG_0652_slotkd__1_ehtwxq.jpg";

export const metadata: Metadata = {
  title: "About Hoizr — building India's live-night operating system",
  description:
    "Hoizr Technologies Pvt. Ltd. is building the operating system for India's live-event industry — powering clubs, venues, festivals, comedy promoters, and live music nights with ticketing, marketing, and operations in one stack.",
  keywords: [
    "About Hoizr",
    "Hoizr Technologies",
    "Sanbedan Paul",
    "Indian live event company",
    "live-night operating system India",
    "event ticketing platform India",
    "event marketing platform India",
    "Hoizr founder",
  ],
  alternates: {
    canonical: "/about",
    languages: { "en-IN": "/about", "x-default": "/about" },
  },
  openGraph: {
    title: "About Hoizr — built for India's live-night industry",
    description:
      "Hoizr is building the infrastructure for a stronger Indian live-event industry: direct publishing, owned fan CRM, AI event evaluation, marketing, and event-night operations.",
    url: "/about",
    type: "website",
    siteName: "Hoizr",
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "About Hoizr — India's live-night operating system",
      },
    ],
  },
};

const VALUES_STRIP = [
  { value: "Competition", note: "A better market needs real benchmarks, sharper operators, and cleaner incentives." },
  { value: "India-first", note: "Built for how Indian fans discover, pay, coordinate, and show up — not retrofitted from abroad." },
  { value: "Operator-owned", note: "Your fan list, your data, your brand. Hoizr should compound your leverage, not rent it back to you." },
  { value: "AI as leverage", note: "AI studies the event and turns platform signal into practical decisions before and after publish." },
];

const OPERATING_LAYERS = [
  {
    title: "Make every event measurable",
    body:
      "One listing becomes the public page, ticket setup, campaign source, collaborator map, door plan, and reporting base. The night stops being scattered across five tools.",
  },
  {
    title: "Turn fans into owned momentum",
    body:
      "Ticket buyers, saves, scans, reviews, and campaign responses feed the fan profile you own. Every event leaves a warmer audience for the next one.",
  },
  {
    title: "Give operators a real mirror",
    body:
      "Hoizr's reporting shows operators exactly how each event performed — sources, sell-through, and settlement. Honest peer benchmarks, so you can see how you stack up against similar rooms, are what we're building toward.",
  },
  {
    title: "Push India higher",
    body:
      "The long game is a more professional, more ambitious live-night ecosystem — the kind of market that makes India impossible to ignore.",
  },
];

const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE_URL}/about`,
  url: `${SITE_URL}/about`,
  inLanguage: "en-IN",
  name: "About Hoizr — building India's live-night operating system",
  description:
    "Hoizr Technologies Pvt. Ltd. is building the operating system for India's live-event industry: direct ticketing, owned fan CRM, AI event evaluation, marketing, and event-night operations.",
  isPartOf: { "@type": "WebSite", name: "Hoizr", url: SITE_URL },
  mainEntity: {
    "@type": "Organization",
    name: "Hoizr Business",
    legalName: "Hoizr Technologies Pvt. Ltd.",
    url: SITE_URL,
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      "@id": `${SITE_URL}/about#sanbedan-paul`,
      name: "Sanbedan Paul",
      jobTitle: "Founder & CEO",
      image: FOUNDER_IMAGE,
      worksFor: {
        "@type": "Organization",
        name: "Hoizr Technologies Pvt. Ltd.",
        url: SITE_URL,
      },
      description:
        "Founder of Hoizr and a full-stack engineer by training, Sanbedan Paul is building the operating system for India's live-event industry — smart ticketing, AI event evaluation, owned fan CRM, marketing, and event-night operations for venues, festivals, and clubs.",
    },
    areaServed: { "@type": "Country", name: "India" },
  },
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <JsonLdScript id="hoizr-about-jsonld" data={aboutPageJsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: "Hoizr", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />
      <section className="hm-section pt-12 md:pt-16">
        <div className="max-w-[720px]">
          <div className="hm-eyebrow">About Hoizr</div>
          <h1
            className="mt-3 font-bold leading-[1.02] tracking-[-0.03em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(44px, 6.4vw, 88px)",
            }}
          >
            A sharper market
            <br />
            <span className="text-[var(--m-forest-600)]">for India&apos;s live nights.</span>
          </h1>
          <p className="hm-lead mt-7 max-w-[600px]">
            Hoizr exists to raise the floor and the ceiling of Indian live
            events. Better tools, better data, better competition, and a market
            where every serious room can learn, improve, and grow.
          </p>
        </div>
      </section>

      <section className="hm-section pt-0">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {VALUES_STRIP.map((v) => (
            <div
              key={v.value}
              className="rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-surface)] p-7"
            >
              <div className="hoizr-mark text-[20px] tracking-[0.16em] text-[var(--m-ink-1)]">
                {v.value.toUpperCase()}
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--m-ink-3)]">
                {v.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="hm-section pt-0">
        <div className="rounded-[var(--m-r-2xl)] border border-[var(--m-border)] bg-[var(--m-canvas-2)] p-7 md:p-14">
          <div className="grid gap-10 md:grid-cols-[1fr,1.4fr] md:gap-16">
            <div>
              <div className="hm-eyebrow">Why we exist</div>
              <h2 className="hm-h2 mt-3">India should compete like a global live-night capital.</h2>
            </div>
            <div className="space-y-5 text-[17px] leading-[1.65] text-[var(--m-ink-2)]">
              <p>
                India already has the energy: clubs, comedy rooms, college
                crowds, festivals, live music, party crews, micro-scenes, and
                cities that move differently after dark. What the market has
                lacked is shared operating infrastructure.
              </p>
              <p>
                Hoizr is built on one belief: when operators can see cleaner
                data, keep their fan relationships, compare against anonymous
                peer benchmarks, and run the night from one system, the whole
                ecosystem gets sharper. Venues improve. Promoters improve.
                Fans get better nights.
              </p>
              <p>
                Selling tickets is table stakes. The goal is a
                stronger, more ambitious Indian live-event industry — one where
                small rooms can operate with discipline, large festivals can
                scale with clarity, and India becomes one of the places the
                world watches for what happens next at night.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="hm-section pt-0">
        <div className="grid gap-8 lg:grid-cols-[0.9fr,1.6fr] lg:gap-16">
          <div>
            <div className="hm-eyebrow">What changes</div>
            <h2 className="hm-h2 mt-3">
              The event stops being isolated.
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-[var(--m-ink-3)]">
              Every show should make the next show smarter: sharper discovery,
              cleaner door operations, owned fan data, honest reporting, and
              decisions backed by what actually happened.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {OPERATING_LAYERS.map((layer, index) => (
              <div
                key={layer.title}
                className="rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-surface)] p-6"
              >
                <div className="hoizr-mark text-[18px] text-[var(--m-forest-700)]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3
                  className="mt-4 text-[20px] font-bold leading-tight text-[var(--m-ink-1)]"
                  style={{ fontFamily: "var(--m-font-display)" }}
                >
                  {layer.title}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--m-ink-3)]">
                  {layer.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AboutPromise />

      <AboutIncluded />

      <AiOfferSpotlight />

      <Beliefs />

      <section className="hm-section pt-0">
        <div className="rounded-[var(--m-r-2xl)] border border-[var(--m-border)] bg-[var(--m-surface)] p-7 md:p-12">
          <div className="grid gap-10 md:grid-cols-[1fr,1.4fr] md:gap-16">
            <div>
              <div className="hm-eyebrow">Builder note</div>
              <h2 className="hm-h2 mt-3">
                Product-first, market-first.
              </h2>
              <div className="mt-7 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://res.cloudinary.com/duhefgqh4/image/upload/v1748974724/IMG_0652_slotkd__1_ehtwxq.jpg"
                  alt="Sanbedan"
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                  draggable={false}
                />
                <div>
                  <div className="text-[16px] font-semibold text-[var(--m-ink-1)]">
                    Sanbedan
                  </div>
                  <div className="text-[13.5px] text-[var(--m-ink-3)]">
                    Founder, Hoizr
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-5 text-[17px] leading-[1.65] text-[var(--m-ink-2)]">
              <p>
                Hoizr is built around a simple operating belief: Indian
                organizers should not need a subscription wall, a generic rate
                card, or a maze of disconnected tools before they can publish a
                serious event.
              </p>
              <p>
                The product is opinionated because event work is operational.
                Promoter links need attribution. Guestlists need caps. Door
                staff need clean scan states. Finance needs settlement-ready
                numbers. Every campaign should learn from the last night.
              </p>
              <p>
                The direction is clear: build the infrastructure that lets
                Indian operators compete better, benchmark honestly, and turn
                every night into momentum for the next one.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link href="/contact" className="hm-btn hm-btn-primary">
                  Talk to Hoizr
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden">
            <span />
          </div>
        </div>
      </section>

      <FinalCTA />
    </MarketingShell>
  );
}
