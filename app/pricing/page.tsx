import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PricingFAQ } from "@/components/marketing/pricing/PricingFAQ";
import { PricingHero } from "@/components/marketing/pricing/PricingHero";
import { PricingIncluded } from "@/components/marketing/pricing/PricingIncluded";
import { PricingPromise } from "@/components/marketing/pricing/PricingPromise";
import { AiOfferSpotlight } from "@/components/marketing/sections/AiOfferSpotlight";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";
import { FounderCard } from "@/components/marketing/sections/FounderCard";

export const metadata: Metadata = {
  title: "Pricing for Indian event organizers, venues & promoters — Hoizr",
  description:
    "Lowest ticketing commission in India for event organizers, venues, and promoters. Hoizr quotes a per-event rate based on format, city, scale, and ticket mix — no convenience fees, no long contracts.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — Hoizr ticketing for Indian event organizers",
    description:
      "Per-event commission, no convenience fees, no contracts. Built for India's clubs, festivals, comedy promoters, and live music venues.",
    url: "/pricing",
    type: "website",
  },
};

export default function PricingPage() {
  return (
    <MarketingShell>
      <PricingHero />
      <PricingPromise />
      <PricingIncluded />
      <AiOfferSpotlight />
      <PricingFAQ />
      <FounderCard />
      <FinalCTA />
    </MarketingShell>
  );
}
