export type HostTip = {
  id: string;
  category: "sales" | "platform" | "city";
  title: string;
  body: string;
};

/**
 * Rotating tips shown alongside onboarding and event journey flows.
 * Mix of India-specific event sales tactics and Hoizr platform best-practice.
 * Keep entries punchy (≤ 2 short sentences).
 */
export const HOST_TIPS: HostTip[] = [
  {
    id: "mumbai-weekday",
    category: "city",
    title: "Mumbai weekdays are gold",
    body: "Mumbai's club crowd is week-day active. Tuesday and Wednesday genre nights consistently outsell typical mid-week events in other metros.",
  },
  {
    id: "goa-season",
    category: "city",
    title: "Goa season is 6 months long",
    body: "Goa runs hot from October to March. Push events 10–14 days before peak weekends — North Goa fills first, then the South sells late.",
  },
  {
    id: "bangalore-genre",
    category: "city",
    title: "Bangalore loves genre nights",
    body: "Techno, indie, comedy, and Bollywood Sundays each have a fierce local audience. Niche outsells general in BLR — go specific in your event title.",
  },
  {
    id: "pune-college",
    category: "city",
    title: "Pune flows with college calendars",
    body: "Pune's audience peaks Friday and Sunday during semesters. Avoid exam weeks (April, November). Comedy and live music outperform pure clubbing.",
  },
  {
    id: "delhi-weekend",
    category: "city",
    title: "Delhi NCR is Saturday-night first",
    body: "Saturday is non-negotiable in Delhi. Drop tickets 10 days before, second wave 72 hours before. WhatsApp blasts outperform Instagram for the final push.",
  },
  {
    id: "tickets-on-sale",
    category: "sales",
    title: "Launch the day the lineup is final",
    body: "On-sale-day demand peaks in the first 6 hours. Don't wait — even a single confirmed headliner is enough to drop the first ticket tier.",
  },
  {
    id: "tiers",
    category: "sales",
    title: "Three tiers, not five",
    body: "Early-bird, regular, last-release. More than three tiers fragments urgency. Set tight quotas — sold-out signals drive the next tier faster.",
  },
  {
    id: "wa-first",
    category: "sales",
    title: "WhatsApp beats Instagram for the final push",
    body: "Indian fans buy from WhatsApp groups in the 48 hours before doors. Update your campaign list, write one short message, send Friday 7pm.",
  },
  {
    id: "collab-events",
    category: "platform",
    title: "Add a collaborator to double reach",
    body: "Adding another organizer as a collaborator means the event lands on both audiences. Both teams can run campaigns against the combined buyer list.",
  },
  {
    id: "ai-offers",
    category: "platform",
    title: "Pick the AI offer that fits the night",
    body: "AI offers tune commission and upfront fee to your event's history. Larger discounts = more customer savings; sell-through gate protects you below 40–60% capacity.",
  },
  {
    id: "scanner",
    category: "platform",
    title: "Set scanners before doors open",
    body: "Add scanner accounts under Teams ahead of the event. Each gets a one-time access code — door staff can't issue or refund tickets, just check entry.",
  },
  {
    id: "drafts-while-verifying",
    category: "platform",
    title: "Build the event while payout verifies",
    body: "Payout verification takes 1–4 hours. You can still draft and edit the full event in the meantime — it just can't accept paid bookings until verified.",
  },
];
