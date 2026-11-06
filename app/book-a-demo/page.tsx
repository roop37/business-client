import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Book a guided tour of Hoizr",
  description:
    "Take a 30-minute guided tour of Hoizr — ticketing, fan CRM, marketing, guestlists, and the door — walked through for your event format and city.",
  alternates: { canonical: "/book-a-demo" },
  openGraph: {
    title: "Book a guided tour of Hoizr",
    description:
      "See how Hoizr helps Indian event organizers sell tickets, own their fans, and run the door.",
    url: "/book-a-demo",
    type: "website",
    siteName: "Hoizr",
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "Book a guided tour of Hoizr",
      },
    ],
  },
};

export default function BookADemoPage() {
  return (
    <MarketingShell>
      <section className="hm-section pt-12 md:pt-16">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="hm-eyebrow">Book a demo</div>
          <h1 className="hm-display mt-4 text-[clamp(40px,7vw,72px)]">
            Take a guided tour.
          </h1>
          <p className="hm-lead mx-auto mt-5 max-w-[620px]">
            Take the first step towards boosting your ticket sales and customer
            engagement with Hoizr&apos;s all-in-one event platform.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-[760px] rounded-[var(--m-r-xl)] border border-[var(--m-border)] bg-white p-8 text-center shadow-[var(--m-shadow-card)]">
          <div className="mx-auto mb-3 inline-block rounded bg-amber-400 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#191C24]">
            Demo mode
          </div>
          <h2 className="text-[22px] font-semibold text-[var(--m-ink-1,#191C24)]">
            Hoizr is sunset and open-sourced
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-relaxed text-[var(--m-ink-3)]">
            Guided tours are no longer scheduled. Explore the full platform
            yourself, right now, with sample data — or get in touch if you need
            help with the open-source code.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/dashboard"
              className="rounded-full bg-[#191C24] px-5 py-2.5 text-[14px] font-semibold text-white"
            >
              Open the demo dashboard
            </a>
            <a
              href="mailto:hoizr.tech@gmail.com"
              className="rounded-full border border-[var(--m-border)] px-5 py-2.5 text-[14px] font-semibold"
            >
              hoizr.tech@gmail.com
            </a>
            <a
              href="https://github.com/roop37/business-client"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--m-forest-700)]"
            >
              View source <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
