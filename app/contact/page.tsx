import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import {
  ContactClient,
  ContactSidePanel,
} from "@/components/marketing/contact/ContactClient";

export const metadata: Metadata = {
  title: "Contact Hoizr — for Indian event organizers, venues & promoters",
  description:
    "Talk to the Hoizr team about your next event in Mumbai, Bangalore, Delhi, Pune, Hyderabad, Chennai, or Goa. We'll quote your event-specific commission and get you live in days.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Hoizr — Indian event ticketing & marketing platform",
    description:
      "Get your event-specific commission quote. Quick onboarding and same-day verification. Email hello@hoizr.in or fill the form.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <section className="hm-section pt-12 md:pt-16">
        <div className="max-w-[680px]">
          <div className="hm-eyebrow">Contact Hoizr</div>
          <h1
            className="mt-3 font-bold leading-[1.04] tracking-[-0.03em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(40px, 6vw, 72px)",
            }}
          >
            Tell us about
            <br />
            <span className="text-[var(--m-forest-600)]">your next night.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-[var(--m-ink-3)] max-w-[560px]">
            A real human from the Hoizr team will follow up within one working
            day with your event-specific commission rate and the fastest path
            to going live.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-[1.6fr,1fr] md:gap-8">
          <ContactClient />
          <ContactSidePanel />
        </div>
      </section>
    </MarketingShell>
  );
}
