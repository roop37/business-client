import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";

const ZCAL_URL = "https://zcal.co/i/2wlfsHdI";
const ZCAL_EMBED_URL =
  "https://zcal.co/i/2wlfsHdI?embed=1&embedType=iframe";

export const metadata: Metadata = {
  title: "Book a Hoizr guided tour",
  description:
    "Book a guided tour of Hoizr's ticketing, audience, campaigns and event operations platform for Indian event organisers.",
  alternates: { canonical: "/book-a-demo" },
  openGraph: {
    title: "Book a Hoizr guided tour",
    description:
      "See how Hoizr supports ticket sales and customer engagement for Indian event organisers.",
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
          <div className="hm-eyebrow">Book a Demo</div>
          <h1 className="hm-h1 mt-4">Take a Guided Tour.</h1>
          <p className="hm-lead mx-auto mt-5 max-w-[650px]">
            Take the first step towards boosting your ticket sales and customer
            engagement with Hoizr&apos;s all-in-one event platform.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-[1096px] overflow-hidden rounded-[var(--m-r-xl)] border border-[var(--m-border)] bg-white shadow-[var(--m-shadow-card)]">
          <iframe
            src={ZCAL_EMBED_URL}
            title="Book a Hoizr guided product tour"
            loading="lazy"
            scrolling="no"
            id="zcal-invite"
            className="block min-h-[544px] h-[544px] w-full min-w-[320px] border-0 md:h-[779px]"
          />
        </div>

        <p className="mt-5 text-center text-[13px] text-[var(--m-ink-3)]">
          If the scheduler does not load,{" "}
          <a
            href={ZCAL_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[var(--m-forest-700)]"
          >
            open the booking page <ExternalLink size={13} />
          </a>
          .
        </p>
      </section>
    </MarketingShell>
  );
}
