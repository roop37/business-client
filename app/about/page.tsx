import type { Metadata } from "next";
import Link from "next/link";
import { AboutIncluded } from "@/components/marketing/about/AboutIncluded";
import { AboutPromise } from "@/components/marketing/about/AboutPromise";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AiOfferSpotlight } from "@/components/marketing/sections/AiOfferSpotlight";
import { Beliefs } from "@/components/marketing/sections/Beliefs";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";

export const metadata: Metadata = {
  title: "About Hoizr — operating system for Indian event organizers & venues",
  description:
    "Hoizr Technologies Pvt. Ltd. is the operating system for India's live-event ecosystem — built for event organizers, venues, festival organizers, comedy promoters, and nightclub operators across Mumbai, Bangalore, Delhi, Pune, Hyderabad, Chennai, and Goa.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Hoizr — built for Indian event organizers & venues",
    description:
      "Hoizr is building an India-first operating stack for organizers and venues: direct publishing, owned fan CRM, AI event evaluation, and event-night operations.",
    url: "/about",
    type: "website",
  },
};

const VALUES_STRIP = [
  { value: "India-first", note: "Built for the way Indian fans book, pay, and show up — not retrofitted from abroad." },
  { value: "No gatekeeping", note: "The full operating stack is available from day one — no subscription wall, no stripped-down starter tier." },
  { value: "Organiser-owned", note: "Your fan list, your data, your brand. We're a platform, not a marketplace that hoards." },
  { value: "AI as leverage", note: "AI studies the event and helps surface the best possible offer and operating guidance." },
];

const OPERATING_LAYERS = [
  {
    title: "Publish with less guesswork",
    body:
      "One listing becomes your event page, SEO source, ticket setup, collaborator access, campaign base, and door setup. You are not rebuilding the same event in five tools.",
  },
  {
    title: "Turn buyers into owned leverage",
    body:
      "Ticket buyers, saves, scans, reviews, and campaign responses feed the fan profile you own. Every event leaves a warmer audience for the next one.",
  },
  {
    title: "Run the room from one truth",
    body:
      "Door staff see clean scan and guestlist states, marketing sees source attribution, and finance sees settlement-ready totals from the same operating record.",
  },
  {
    title: "Get sharper after every night",
    body:
      "AI offer evaluation and reporting help you understand which formats, channels, ticket ladders, and launch timings are actually moving sales.",
  },
];

export default function AboutPage() {
  return (
    <MarketingShell>
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
            The operating system
            <br />
            <span className="text-[var(--m-forest-600)]">for India&apos;s live nights.</span>
          </h1>
          <p className="hm-lead mt-7 max-w-[600px]">
            Hoizr exists to make Indian event operations direct, owned, and
            compounding. Create the event once, launch it everywhere it needs
            to live, run the room with clean data, and leave with an audience
            you can actually bring back.
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
              <h2 className="hm-h2 mt-3">A platform organisers actually own.</h2>
            </div>
            <div className="space-y-5 text-[17px] leading-[1.65] text-[var(--m-ink-2)]">
              <p>
                India&apos;s nightlife and live-event economy runs on operators who book the
                lineup, manage the door, run promo, and balance the books —
                often the same person. They need one operating system, not a
                chain of tabs and follow-up calls.
              </p>
              <p>
                Marketplaces can capture the fan relationship. Generic tools
                make organizers stitch ticketing, CRM, guestlist, campaigns,
                and scanner operations together by hand. Spreadsheets eat the
                weekend before the event even starts.
              </p>
              <p>
                Hoizr is the alternative: one workspace for everything from
                onboarding to settlement, an owned fan CRM, direct publishing,
                AI that studies the event and surfaces the best possible offer,
                and the operational rigour of a larger event team without the
                headcount.
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
              The event stops being a one-night transaction.
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-[var(--m-ink-3)]">
              Hoizr is built so every show strengthens the next one: better
              discovery, cleaner door operations, owned fan data, clearer
              attribution, and decisions backed by what actually happened.
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
              <div className="hm-eyebrow">Founder</div>
              <h2 className="hm-h2 mt-3">
                Founder-led, India-first, product-heavy.
              </h2>
              <div className="mt-7 flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 rounded-full bg-[var(--m-forest-700)] text-[var(--m-acid)] text-[18px] font-bold flex items-center justify-center">
                  SP
                </div>
                <div>
                  <div className="text-[16px] font-semibold text-[var(--m-ink-1)]">
                    Sanbedan Paul
                  </div>
                  <div className="text-[13.5px] text-[var(--m-ink-3)]">
                    Founder &amp; CEO, Hoizr
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-5 text-[17px] leading-[1.65] text-[var(--m-ink-2)]">
              <p>
                Hoizr is led by Sanbedan Paul and built around a simple
                operating belief: Indian organizers should not need a subscription
                or card details before they can publish a serious event.
              </p>
              <p>
                The product is opinionated because event work is operational:
                promoter links need attribution, guestlists need caps, door
                staff need clean scan states, finance needs settlement-ready
                numbers, and the next campaign should learn from the last
                night.
              </p>
              <p>
                The team behind it is small, India-based, AI-first in its
                daily workflow, and focused on making the organizer workspace
                direct, powerful, and practical for PAN-India events.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link href="/contact" className="hm-btn hm-btn-primary">
                  Talk to the team
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
