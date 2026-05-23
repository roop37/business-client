"use client";

import { BentoCard } from "../bento/BentoCard";
import { BrandImageVisual } from "../bento/BrandImageVisual";
import { BrandLineVisual } from "../bento/BrandLineVisual";

/**
 * Discovery pillar.
 *
 * Span layout (12-col):
 *   row 1: Event SEO 7 · Event Marketplace 5
 *   row 2: Reviews Engine 4 · Listings 4 · Organisation page 4   ← Reviews extended up
 *
 * SEO + Reviews use supplied discovery images. Remaining cards keep
 * the existing brand-line treatment.
 */
export const DiscoveryBento = () => {
  return (
    <section className="hm-section">
      <div className="max-w-[760px]">
        <div className="hm-eyebrow">Grow online discovery</div>
        <h2 className="hm-h2 mt-3">
          Get found by fans who don&apos;t know you yet.
        </h2>
        <p className="hm-lead mt-5 max-w-[600px]">
          Hoizr ships your event onto the surfaces Indian fans actually use to
          decide what to do on a Saturday night — Google, Maps, our marketplace,
          your organisation page.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-5 md:mt-12">
        <BentoCard
          tone="ink"
          span={7}
          minHeight={460}
          eyebrow="Event SEO"
          title="Schema, city pages, meta — all auto-tuned."
          body="Every show ships with structured data and India-specific city + genre pages. Your event lands the rich-result spot Google reserves for the best-tagged page."
          href="/product/event-seo"
          visual={
            <BrandImageVisual
              src="/images/discovery/SEO-Discovery-Get-found.png"
              alt="Event SEO discovery workflow"
              fit="cover"
              position="center"
              dark
              dim
            />
          }
          layout="fill"
          delay={0}
        />
        <BentoCard
          tone="ink"
          span={5}
          minHeight={460}
          eyebrow="Event Marketplace"
          title="Featured on Hoizr's discovery feed."
          body="Curated by genre, city, and time of night. Your show appears in front of fans who've bought tickets to something like it before."
          href="/product/event-marketplace"
          visual={
            <BrandLineVisual
              label="Event Marketplace"
              orientation="portrait"
              showBadge={false}
            />
          }
          layout="fill"
          delay={0.05}
        />
        <BentoCard
          tone="ink"
          span={4}
          minHeight={420}
          eyebrow="Reviews Engine"
          title="Turn happy attendees into Google reviews on autopilot."
          body="Post-event prompts collect Google + Hoizr reviews from the people who actually came — automatically, without nagging."
          href="/product/reviews-engine"
          visual={
            <BrandImageVisual
              src="/images/discovery/Reviews-Engine-Discovery-get-found.png"
              alt="Reviews engine discovery workflow"
              fit="cover"
              position="center"
              dark
              dim
            />
          }
          layout="fill"
          delay={0.1}
        />
        <BentoCard
          tone="ink"
          span={4}
          minHeight={420}
          eyebrow="Listings Management"
          title="One inbox for Google, Maps, and discovery sites."
          body="Keep listings consistent across Google, Maps, Hoizr discovery, and city event surfaces without chasing edits in five tabs."
          href="/product/listings-management"
          layout="fill"
          delay={0.15}
        />
        <BentoCard
          tone="ink"
          span={4}
          minHeight={420}
          eyebrow="Organisation page"
          title="Your brand's permanent home."
          body="Lineup history, upcoming nights, and a direct ticket button. The page fans actually save and revisit."
          href="/product/organisation-page"
          titleClassName="hm-cursive"
          visual={
            <BrandLineVisual
              label="Organisation Page"
              orientation="blue"
              showBadge={false}
            />
          }
          layout="fill"
          delay={0.2}
        />
      </div>
    </section>
  );
};
