import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("homepage composes the approved outcome-led journey order", () => {
  const source = read("app/page.tsx");
  const orderedSnippets = [
    "<Hero />",
    "<EventFormats />",
    "<ProblemStatement />",
    "<OutcomePillars />",
    "<PlatformComparison />",
    "<HowHoizrWorks />",
    "<CurrentPlatform />",
    "<AiSupport />",
    "<FreeAccess />",
    "<ComingSoonBento />",
    "<Beliefs />",
    "<FAQ />",
    "<FinalCTA />",
  ];

  let previousIndex = -1;
  for (const snippet of orderedSnippets) {
    const index = source.indexOf(snippet);
    assert.ok(index >= 0, `Missing ${snippet}`);
    assert.ok(index > previousIndex, `${snippet} is out of order`);
    previousIndex = index;
  }

  assert.doesNotMatch(source, /FounderQuoteBanner/);
  assert.doesNotMatch(source, /FounderCard/);
  assert.doesNotMatch(source, /PricingTeaserCards/);
  assert.doesNotMatch(source, /PillarGrid/);
  assert.doesNotMatch(source, /ProductStoryGallery/);
  assert.doesNotMatch(source, /DiscoveryBento/);
  assert.doesNotMatch(source, /RepeatFansBento/);
  assert.doesNotMatch(source, /OperationsBento/);
  assert.doesNotMatch(source, /AiOfferSpotlight/);
  assert.doesNotMatch(source, /AiSeoPanel/);
  assert.doesNotMatch(source, /Playbooks/);
});

test("homepage sections use the approved copy and separate current products from coming soon", () => {
  const source = [
    read("components/marketing/sections/Hero.tsx"),
    read("components/marketing/sections/EventFormats.tsx"),
    read("components/marketing/sections/ProblemStatement.tsx"),
    read("components/marketing/sections/OutcomePillars.tsx"),
    read("components/marketing/sections/PlatformComparison.tsx"),
    read("components/marketing/sections/HowHoizrWorks.tsx"),
    read("components/marketing/sections/CurrentPlatform.tsx"),
    read("components/marketing/sections/AiSupport.tsx"),
    read("components/marketing/sections/FreeAccess.tsx"),
    read("components/marketing/sections/FinalCTA.tsx"),
    read("components/marketing/data/site-copy.ts"),
  ].join("\n");
  const currentPlatformSource = read(
    "components/marketing/sections/CurrentPlatform.tsx"
  );

  assert.match(
    source,
    /Sell tickets, understand your audience and bring them back for the\s+next event\./
  );
  assert.match(source, /Free signup\. No setup fee\. No subscription\. No card details required\./);
  assert.match(source, /The event is one business\. The tools should work like one\./);
  assert.match(
    source,
    /When ticketing,\s+campaigns,\s+customer records,\s+guestlists and door\s+operations/
  );
  assert.match(source, /Built for the events India goes out for/);
  assert.match(source, /Listing-only or ticketing-only tools/);
  assert.match(source, /Before a paid event is published, Hoizr can evaluate the event context and surface the available event-specific options\./);
  assert.match(source, /AI where it removes work — not where it invents promises\./);
  assert.match(source, /Start building the event before a sales call\./);
  assert.match(source, /Build the audience for this event — and the next one\./);
  assert.match(source, /Eight live products, no coming-soon haze\./);

  assert.match(currentPlatformSource, /ALL_PRODUCTS/);
  assert.doesNotMatch(currentPlatformSource, /COMING_SOON_PRODUCTS/);
  assert.doesNotMatch(currentPlatformSource, /House Parties \+ Instagram Attendee Filtering/);
  assert.doesNotMatch(currentPlatformSource, /Coming Soon/);
});
