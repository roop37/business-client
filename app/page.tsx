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
import { Hero } from "@/components/marketing/sections/Hero";
import { OperationsBento } from "@/components/marketing/sections/OperationsBento";
import { PillarGrid } from "@/components/marketing/sections/PillarGrid";
import { Playbooks } from "@/components/marketing/sections/Playbooks";
import { ProductStoryGallery } from "@/components/marketing/sections/ProductStoryGallery";
import { RepeatFansBento } from "@/components/marketing/sections/RepeatFansBento";
import { ValueMarquee } from "@/components/marketing/sections/ValueMarquee";

export const metadata: Metadata = {
  title:
    "Hoizr — Ticketing & marketing for Indian event organizers, venues, and promoters",
  description:
    "Hoizr is built for Indian event organizers, venues, and promoters. Lowest commission in India, owned fan CRM, AI event-specific pricing, and marketing tools tuned for clubs, festivals, comedy shows, and live music nights.",
  alternates: { canonical: "/" },
  openGraph: {
    title:
      "Hoizr — Ticketing & marketing for Indian event organizers, venues, and promoters",
    description:
      "The platform for India's clubs, festivals, comedy promoters, and live music venues. Direct ticketing, owned fan CRM, AI commission pricing.",
    url: "/",
    type: "website",
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
      <ValueMarquee />
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
