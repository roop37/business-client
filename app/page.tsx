import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AiSupport } from "@/components/marketing/sections/AiSupport";
import { Beliefs } from "@/components/marketing/sections/Beliefs";
import { ComingSoonBento } from "@/components/marketing/sections/ComingSoonBento";
import { CurrentPlatform } from "@/components/marketing/sections/CurrentPlatform";
import { FAQ } from "@/components/marketing/sections/FAQ";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";
import { EventFormats } from "@/components/marketing/sections/EventFormats";
import { Hero } from "@/components/marketing/sections/Hero";
import { HowHoizrWorks } from "@/components/marketing/sections/HowHoizrWorks";
import { OutcomePillars } from "@/components/marketing/sections/OutcomePillars";
import { PlatformComparison } from "@/components/marketing/sections/PlatformComparison";
import { ProblemStatement } from "@/components/marketing/sections/ProblemStatement";
import { FreeAccess } from "@/components/marketing/sections/FreeAccess";

export const metadata: Metadata = {
  title:
    "Hoizr — Ticketing & marketing for Indian event organizers, venues, and promoters",
  description:
    "Hoizr is built for Indian event organizers, venues, and promoters. Direct publishing, owned fan CRM, AI event evaluation, and marketing tools tuned for clubs, festivals, comedy shows, and live music nights.",
  alternates: {
    canonical: "/",
    languages: { "en-IN": "/", "x-default": "/" },
  },
  // Next.js does not deep-merge `openGraph` — declaring it here
  // replaces the layout block in full, so the images array has to
  // be repeated explicitly or the home page ships with no OG image.
  openGraph: {
    title:
      "Hoizr — Ticketing & marketing for Indian event organizers, venues, and promoters",
    description:
      "The operating stack for India's clubs, festivals, comedy promoters, and live music venues. Direct ticketing, owned fan CRM, and AI event evaluation.",
    url: "/",
    type: "website",
    siteName: "Hoizr",
    locale: "en_IN",
    countryName: "India",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "Hoizr — India's ticketing and marketing platform for event organizers, venues, and promoters",
      },
    ],
  },
};

export default function Home() {
  return (
    <MarketingShell>
      <Hero />
      <EventFormats />
      <ProblemStatement />
      <OutcomePillars />
      <PlatformComparison />
      <HowHoizrWorks />
      <CurrentPlatform />
      <AiSupport />
      <FreeAccess />
      <ComingSoonBento />
      <Beliefs />
      <FAQ />
      <FinalCTA />
    </MarketingShell>
  );
}
