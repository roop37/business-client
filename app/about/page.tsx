import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Beliefs } from "@/components/marketing/sections/Beliefs";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";

export const metadata: Metadata = {
  title: "About Hoizr — operating system for Indian event organizers & venues",
  description:
    "Hoizr Technologies Pvt. Ltd. is the operating system for India's live-event ecosystem — built for event organizers, venues, festival hosts, comedy promoters, and nightclub operators across Mumbai, Bangalore, Delhi, Pune, Hyderabad, Chennai, and Goa.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Hoizr — built for Indian event organizers & venues",
    description:
      "Founded by people who've actually run live nights in India. Hoizr puts the ticketing, marketing, and ops stack that national chains use into a single-venue operator's hands.",
    url: "/about",
    type: "website",
  },
};

const VALUES_STRIP = [
  { value: "India-first", note: "Built for the way Indian fans book, pay, and show up — not retrofitted from abroad." },
  { value: "Organiser-owned", note: "Your fan list, your data, your brand. We're a platform, not a marketplace that hoards." },
  { value: "AI as leverage", note: "The same tooling that scaled national festival circuits — handed to a one-venue operator." },
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
            Hoizr was built by people who&apos;ve spent more weekends on the
            door than the dance floor — running clubs, festivals, and live
            music nights across India. We got tired of cobbling together
            spreadsheets, marketplace dashboards, and group chats. So we built
            the platform we wished existed.
          </p>
        </div>
      </section>

      <section className="hm-section pt-0">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
                often the same person. The tools they&apos;re handed treat them
                like a row in a database.
              </p>
              <p>
                Marketplaces capture their fans. Generic ticketing platforms
                charge enterprise rates for last-decade software. Spreadsheets
                eat their Sundays. Promoters take cuts off discount codes that
                were never authorised.
              </p>
              <p>
                Hoizr is the alternative: one workspace for everything from
                onboarding to settlement, an owned fan CRM (not a marketplace
                rental), AI that quotes the lowest commission for your specific
                event, and the operational rigour of a stadium-grade team
                without the headcount.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Beliefs />

      <section className="hm-section pt-0">
        <div className="rounded-[var(--m-r-2xl)] border border-[var(--m-border)] bg-[var(--m-surface)] p-7 md:p-12">
          <div className="grid gap-10 md:grid-cols-[1fr,1.4fr] md:gap-16">
            <div>
              <div className="hm-eyebrow">Founder</div>
              <h2 className="hm-h2 mt-3">
                Built by someone who&apos;s done the door shift.
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
                Hoizr started inside the kind of rooms it now ticks ticket
                stubs for — clubs, festivals, open-air nights across India,
                where running the night was equal parts logistics and luck.
              </p>
              <p>
                The platform is opinionated because we&apos;ve been on the
                wrong side of every problem it solves: spreadsheets that
                broke at midnight, promoter codes nobody could attribute,
                marketplace fees that ate the headliner&apos;s margin, and AI
                tooling that only the national chains could afford. We&apos;re
                building Hoizr to put those same advantages in every Indian
                operator&apos;s hands.
              </p>
              <p>
                The team behind it is small, India-based, AI-first in its
                daily workflow, and not running public hiring right now.
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
