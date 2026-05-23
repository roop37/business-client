"use client";

import { BentoCard } from "../bento/BentoCard";
import { BrandImageVisual } from "../bento/BrandImageVisual";

/**
 * Repeat-fans pillar.
 *
 * Span layout (12-col):
 *   row 1: Marketing Campaigns 7 · Conversation Marketing 5
 *   row 2: Email & SMS 4 · Loyalty & Rewards 4 · Push 4
 *
 * All visual slots use the matching home hero image asset from
 * `/public/images/hero`.
 */
export const RepeatFansBento = () => {
  return (
    <section className="hm-section">
      <div className="max-w-[760px]">
        <div className="hm-eyebrow">Grow repeat fans</div>
        <h2 className="hm-h2 mt-3">
          Bring last weekend&apos;s crowd back next weekend.
        </h2>
        <p className="hm-lead mt-5 max-w-[600px]">
          The fans you sell to are yours. Hoizr keeps their numbers, their
          tastes, and their attendance history on your side — and gives you the
          channels to actually reach them.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-5 md:mt-12">
        <BentoCard
          tone="ink"
          span={7}
          minHeight={440}
          eyebrow="Marketing Campaigns"
          title="Multi-channel drops, one composer."
          body="Compose once, schedule the wave: email, SMS, WhatsApp, push, and in-app — each tuned to the fan segment most likely to convert."
          href="/product/marketing-campaigns"
          visual={
            <BrandImageVisual
              src="/images/hero/Marketing-Campaigns-home-Grow-repeat-fans.png"
              alt="Marketing campaigns product workflow"
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
          minHeight={440}
          eyebrow="Conversation Marketing"
          title="Where India actually replies."
          body="High-intent chat campaigns without exposing vendor plumbing. Fans see the message; you see the funnel — replies, opens, paying buyers."
          href="/product/conversation-marketing"
          visual={
            <BrandImageVisual
              src="/images/hero/Conversation-Marketing-home-Grow-repeat-fans.png"
              alt="Conversation marketing product workflow"
              fit="cover"
              position="center"
              dark
              dim
            />
          }
          layout="fill"
          delay={0.05}
        />
        <BentoCard
          tone="ink"
          span={4}
          minHeight={420}
          eyebrow="Email & SMS Marketing"
          title="Owned-channel outreach."
          body="Send to your CRM, not a marketplace's. Templated playbooks for on-sale, last-call, and post-event flows that lift repeat rates."
          href="/product/email-sms-marketing"
          visual={
            <BrandImageVisual
              src="/images/hero/Email-SMS-Marketing-home-Grow-repeat-fans.png"
              alt="Email and SMS marketing product workflow"
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
          eyebrow="Loyalty & Rewards"
          title="Turn a fan into a regular."
          body="Tiered perks — early access, skip-the-line, lineup leaks — that make your most engaged fans show up more often and bring friends."
          href="/product/loyalty-rewards"
          visual={
            <BrandImageVisual
              src="/images/hero/Loyalty-Rewards-home-Grow-repeat-fans.png"
              alt="Loyalty and rewards product workflow"
              fit="cover"
              position="center"
              dark
              dim
            />
          }
          layout="fill"
          delay={0.15}
        />
        <BentoCard
          tone="ink"
          span={4}
          minHeight={420}
          eyebrow="Push Notifications"
          title="On-sale alerts. Last calls. Lineup drops."
          body="The channel that doesn't cost a paisa per message. Targeted by attendance history so the right fan gets the right nudge."
          href="/product/push-notifications"
          visual={
            <BrandImageVisual
              src="/images/hero/Push-Notifications-Home-Grow-repeat-fans.png"
              alt="Push notifications product workflow"
              fit="cover"
              position="center"
              dark
              dim
            />
          }
          layout="fill"
          delay={0.2}
        />
      </div>
    </section>
  );
};
