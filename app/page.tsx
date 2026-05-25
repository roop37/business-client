import type { Metadata } from "next";
import { blogs } from "@/components/marketing/blog/blog-data";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AiOfferSpotlight } from "@/components/marketing/sections/AiOfferSpotlight";
import { AiSeoPanel } from "@/components/marketing/sections/AiSeoPanel";
import { Beliefs } from "@/components/marketing/sections/Beliefs";
import { DiscoveryBento } from "@/components/marketing/sections/DiscoveryBento";
import { FAQ } from "@/components/marketing/sections/FAQ";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";
import { FounderCard } from "@/components/marketing/sections/FounderCard";
import { FounderQuoteBanner } from "@/components/marketing/sections/FounderQuoteBanner";
import { Hero } from "@/components/marketing/sections/Hero";
import { OperationsBento } from "@/components/marketing/sections/OperationsBento";
import { PillarGrid } from "@/components/marketing/sections/PillarGrid";
import { Playbooks } from "@/components/marketing/sections/Playbooks";
import { PricingTeaserCards } from "@/components/marketing/sections/PricingTeaserCards";
import { ProductStoryGallery } from "@/components/marketing/sections/ProductStoryGallery";
import { RepeatFansBento } from "@/components/marketing/sections/RepeatFansBento";
// ValueMarquee retired in favour of the founder quote banner.
// import { ValueMarquee } from "@/components/marketing/sections/ValueMarquee";

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
  const playbookBlogTeasers = blogs.slice(0, 2).map(
    ({ id, title, excerpt, image, date, category, readTime }) => ({
      id,
      title,
      excerpt,
      image,
      date,
      category,
      readTime,
    })
  );

  return (
    <MarketingShell>
      <Hero />
      <FounderQuoteBanner />
      <PricingTeaserCards />
      <PillarGrid />
      <ProductStoryGallery />
      <AiSeoPanel />
      <DiscoveryBento />
      <RepeatFansBento />
      <OperationsBento />
      <AiOfferSpotlight />
      <Playbooks blogTeasers={playbookBlogTeasers} />
      <Beliefs />
      <FounderCard />
      <FAQ />
      <FinalCTA />
    </MarketingShell>
  );
}
