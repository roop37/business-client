export const EVENT_FORMATS = [
  "Parties & club nights",
  "Concerts & live music",
  "Festivals",
  "Comedy",
  "Free & RSVP events",
  "Exclusive & non-exclusive events",
] as const;

export const ORGANISER_PROBLEMS = [
  "Ticketing lives in one place while campaigns and customer data live somewhere else.",
  "Guestlists move through chats and sheets, leaving the door team to reconcile the mess.",
  "The event ends, but the audience insight needed for the next event is scattered or lost.",
] as const;

export const PLATFORM_COMPARISON = [
  {
    alternative: "Focuses on publishing inventory",
    hoizr: "Connects publishing, sales, audience and operations",
  },
  {
    alternative: "Customer data ends at the transaction",
    hoizr: "Builds an organiser-owned audience record",
  },
  {
    alternative: "Marketing runs in a disconnected tool",
    hoizr: "Campaigns use event and customer context",
  },
  {
    alternative: "Door activity stays separate",
    hoizr: "Guestlists, scanning and event reporting connect",
  },
] as const;

export const ORGANISER_JOURNEY = [
  {
    title: "Create your organisation",
    body: "Set up the public brand, operating details, team access and payout profile once.",
  },
  {
    title: "Build the event",
    body: "Add the format, venue, dates, lineup, tickets, extras, policies and collaborators.",
  },
  {
    title: "Publish and start selling",
    body: "Complete the readiness checks, review event context and publish the customer-facing page.",
  },
  {
    title: "Reach your audience",
    body: "Run email and WhatsApp campaigns using event and customer context.",
  },
  {
    title: "Manage guestlists and entry",
    body: "Control guest approvals, scanner access and ticket validation from the same event.",
  },
  {
    title: "Review performance and settlements",
    body: "See sales, attendance, campaigns, refunds and settlement-ready numbers.",
  },
  {
    title: "Build the next event from the last one",
    body: "Use customer and event history to start the next campaign with better context.",
  },
] as const;

export const FREE_ACCESS_POINTS = [
  "Free signup",
  "No setup fee",
  "No subscription",
  "No card details required",
] as const;
