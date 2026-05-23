"use client";

import { BentoCard } from "../bento/BentoCard";
import { BrandImageVisual } from "../bento/BrandImageVisual";

/**
 * Operations pillar.
 *
 * Span layout (12-col):
 *   row 1: Door Scanning 7 · Reporting & Analytics 5
 *   row 2: Promoter caps  8 · AI Event Assistant   4
 *   row 3: Automations    12
 *
 * The grid is intentionally explicit rather than dense/row-span
 * packed. The dense grid created unstable whitespace in screenshots
 * when card min-heights and auto rows disagreed.
 */
export const OperationsBento = () => {
  return (
    <section className="hm-section">
      <div className="max-w-[760px]">
        <div className="hm-eyebrow">Run your events</div>
        <h2 className="hm-h2 mt-3">
          Pull off the night without the chaos.
        </h2>
        <p className="hm-lead mt-5 max-w-[600px]">
          From the door to the books, Hoizr replaces the spreadsheets, group
          chats, and last-minute scrambles with one workspace built around how
          live nights actually run.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-5 md:mt-12">
        <BentoCard
          tone="ink"
          span={7}
          minHeight={460}
          eyebrow="Door Scanning"
          title="Door staff, QR scanning, live arrivals."
          body="Multi-scanner support with one-tap setup and live entry counters. Door teams see who's arrived and who's still en route — no walkie-talkies needed."
          href="/product/door-scanning"
          visual={
            <BrandImageVisual
              src="/images/hero/Door-Scanning-hero-run-your-event.png"
              alt="Door scanning product workflow"
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
          eyebrow="Reporting & Analytics"
          title="Sell-through. Sources. Settlement."
          body="Plain-English numbers that show what worked, what brought them in, and what's owed — settlement-ready the morning after the show."
          href="/product/reporting-analytics"
          visual={
            <BrandImageVisual
              src="/images/hero/Reporting-Analytics-Home-run-your-events.png"
              alt="Reporting and analytics dashboard"
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
          span={8}
          minHeight={420}
          eyebrow="Guestlist Management"
          title="Promoter caps. Invite QRs. Live arrivals."
          body="Hand out invite codes per promoter, cap their list, and watch arrivals roll in at the door. No more spreadsheet bickering on Saturday night."
          href="/product/guestlist-management"
          visual={
            <BrandImageVisual
              src="/images/hero/%20Guestlist-Management-home-Run-your-events.png"
              alt="Guestlist management product workflow"
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
          eyebrow="AI Event Assistant"
          title="AI prices your event."
          body="One scoped AI feature, done well. Hoizr reads your event's format, city, scale, and ticket mix, then quotes the lowest commission we can offer for that specific show."
          href="/product/ai-event-assistant"
          visual={
            <BrandImageVisual
              src="/images/hero/AI-Event-Assistant-home-Run-your-events.png"
              alt="AI event assistant product workflow"
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
          span={12}
          minHeight={300}
          eyebrow="Automations"
          title="Recipes that run the boring stuff."
          body="Auto-open Phase 2 when Phase 1 sells out. Auto-send 24-hour reminders. Auto-recycle a refunded ticket to the waitlist. Set once, never again."
          href="/product/automations"
          visual={
            <BrandImageVisual
              src="/images/hero/Automations-home-Run-your-events.png"
              alt="Automation product workflow"
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
