import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarPlus2,
  ChartNoAxesCombined,
  CheckCircle2,
  RefreshCw,
  ScanLine,
  Send,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  JsonLdScript,
} from "@/components/marketing/seo/SchemaJsonLd";
import { ORGANISER_JOURNEY } from "@/components/marketing/data/site-copy";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";

const SITE_URL = "https://business.hoizr.com";

export const metadata: Metadata = {
  title: "How Hoizr works for Indian event organisers",
  description: "From the first event draft to the report after doors close.",
  keywords: [
    "how Hoizr works",
    "event organiser journey",
    "guestlist and entry",
    "event ticketing workflow India",
    "reports and settlements",
    "event operations",
  ],
  alternates: {
    canonical: "/how-it-works",
    languages: { "en-IN": "/how-it-works", "x-default": "/how-it-works" },
  },
  openGraph: {
    title: "How Hoizr works for Indian event organisers",
    description:
      "Hoizr keeps event setup, ticket sales, audience engagement, guestlists, entry and reporting connected so the next decision starts with the context from the last one.",
    url: "/how-it-works",
    type: "website",
    siteName: "Hoizr",
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "How Hoizr works for Indian event organisers",
      },
    ],
  },
};

const journeyIcons = [
  Building2,
  CalendarPlus2,
  BadgeCheck,
  Send,
  ScanLine,
  ChartNoAxesCombined,
  RefreshCw,
] as const;

const JOURNEY_STEPS = ORGANISER_JOURNEY.map((step, index) => ({
  ...step,
  n: String(index + 1).padStart(2, "0"),
  icon: journeyIcons[index],
}));

const TEAM_ROLES: {
  icon: LucideIcon;
  title: string;
  body: string;
  points: string[];
}[] = [
  {
    icon: Users,
    title: "Owner",
    body:
      "The owner sees the organisation, event readiness, collaborators and the overall publishing flow.",
    points: ["Organisation", "Publishing", "Collaborators", "Readiness"],
  },
  {
    icon: Send,
    title: "Marketing",
    body:
      "The marketing team works from the event context, audience records and campaign surfaces that belong to the current event.",
    points: ["Audience records", "Campaigns", "Reminders", "Post-event follow-up"],
  },
  {
    icon: Wallet,
    title: "Finance",
    body:
      "Finance handles payout details, settlement review and the numbers the event needs after the night ends.",
    points: ["Payouts", "Settlements", "Refunds", "Exports"],
  },
  {
    icon: ScanLine,
    title: "Door staff",
    body:
      "Door staff get only the scanning, guestlist and arrival tools they need to keep entry moving.",
    points: ["Scanning", "Guestlists", "Arrivals", "Exceptions"],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I publish before the full organisation setup is complete?",
    a: "You can draft the event early, but the organiser workspace, payout details, policies and public organisation profile should be ready before the event goes live.",
  },
  {
    q: "What can I use today?",
    a: "Current capabilities include event publishing, ticketing, add-ons, promo codes, offline issuing, payment links, customer records, email and WhatsApp campaigns, guestlists, collaborators, teams, scanners, reports, payouts, settlements, selected automations and event evaluation.",
  },
  {
    q: "Can collaborators and team members use the workspace?",
    a: "Yes. Organisers can invite team members with roles and permissions, and event collaborators can receive event-specific access such as metrics, campaigns, customers or offline ticket issuing.",
  },
  {
    q: "Can I run free or RSVP events?",
    a: "Yes. Hoizr supports free and RSVP events alongside exclusive and non-exclusive paid event formats.",
  },
  {
    q: "Can I see the platform before signing up?",
    a: "Yes. Book a guided tour and the Hoizr team will walk through the current platform around your event format and operating needs.",
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How Hoizr works for Indian event organisers",
  description:
    "Hoizr keeps event setup, ticket sales, audience engagement, guestlists, entry and reporting connected so the next decision starts with the context from the last one.",
  inLanguage: "en-IN",
  totalTime: "PT15M",
  url: `${SITE_URL}/how-it-works`,
  image: `${SITE_URL}/opengraph-image.webp`,
  step: ORGANISER_JOURNEY.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.title,
    text: step.body,
  })),
};

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <JsonLdScript id="hoizr-howto-jsonld" data={howToJsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: "Hoizr", href: "/" },
          { name: "How it works", href: "/how-it-works" },
        ]}
      />
      <FaqJsonLd items={FAQS} />

      <Hero />
      <Journey />
      <TeamRoles />
      <HowItWorksFAQ />
      <FinalCTA />
    </MarketingShell>
  );
}

const Hero = () => (
  <section className="hm-section pt-12 md:pt-16">
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.72fr)]">
      <div>
        <div className="hm-eyebrow">How Hoizr works</div>
        <h1
          className="mt-4 font-bold leading-[1.02] tracking-[-0.03em] text-[var(--m-ink-1)]"
          style={{
            fontFamily: "var(--m-font-display)",
            fontSize: "clamp(42px, 6.6vw, 88px)",
          }}
        >
          From the first event draft to the report after doors close.
        </h1>
        <p className="hm-lead mt-7 max-w-[660px]">
          Hoizr keeps event setup, ticket sales, audience engagement,
          guestlists, entry and reporting connected so the next decision starts
          with the context from the last one.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="hm-btn hm-btn-primary">
            Get Started
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/book-a-demo"
            className="hm-btn hm-btn-ghost border border-[var(--m-border)]"
          >
            Book a Demo
          </Link>
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--m-border)] bg-[var(--m-surface)] p-6 shadow-[var(--m-shadow-card)] md:p-8">
        <div className="grid gap-3">
          {JOURNEY_STEPS.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-4 rounded-[20px] border border-[var(--m-border)] bg-[var(--m-canvas)] p-4"
            >
              <span
                className={`grid h-11 w-11 place-items-center rounded-2xl ${
                  index === 2
                    ? "bg-[var(--m-forest-700)] text-[var(--m-acid)]"
                    : "bg-[var(--m-canvas-2)] text-[var(--m-forest-700)]"
                }`}
              >
                <step.icon size={18} />
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--m-ink-4)]">
                  {step.n}
                </div>
                <div className="mt-1 text-[15px] font-semibold text-[var(--m-ink-1)]">
                  {step.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Journey = () => (
  <section className="hm-section">
    <div className="grid gap-10 lg:grid-cols-[320px,1fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <div className="hm-eyebrow">Seven-step journey</div>
        <h2 className="hm-h2 mt-3">Each step hands context to the next one.</h2>
        <p className="hm-lead mt-5 max-w-[600px]">
          The organiser story stays in one flow: create the organisation,
          build the event, publish, reach the audience, manage entry, review
          the numbers and start the next event with better context.
        </p>
      </div>

      <div className="space-y-4">
        {JOURNEY_STEPS.map((step, index) => (
          <article
            key={step.title}
            className={`rounded-[26px] border p-6 md:p-7 ${
              index === 2
                ? "border-[var(--m-forest-700)] bg-[var(--m-forest-700)] text-white shadow-[var(--m-shadow-pop)]"
                : "border-[var(--m-border)] bg-[var(--m-surface)] text-[var(--m-ink-1)] shadow-[var(--m-shadow-card)]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`hoizr-mark text-[38px] leading-none ${
                  index === 2 ? "text-[var(--m-acid)]" : "text-[var(--m-ink-4)]"
                }`}
              >
                {step.n}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    index === 2 ? "text-white/60" : "text-[var(--m-ink-4)]"
                  }`}
                >
                  {step.title}
                </div>
                <p
                  className={`mt-3 text-[15px] leading-[1.65] ${
                    index === 2 ? "text-white/84" : "text-[var(--m-ink-2)]"
                  }`}
                >
                  {step.body}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const TeamRoles = () => (
  <section className="hm-section">
    <div className="max-w-[760px]">
      <div className="hm-eyebrow">Roles and permissions</div>
      <h2 className="hm-h2 mt-3">
        Current access stays scoped to the work each person actually does.
      </h2>
      <p className="hm-lead mt-5 max-w-[620px]">
        Organisers can invite team members with roles and permissions, and
        collaborators can be scoped to event-specific access when they need
        metrics, campaigns, customers or offline ticket issuing.
      </p>
    </div>

    <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {TEAM_ROLES.map((role) => (
        <article
          key={role.title}
          className="flex min-h-[280px] flex-col rounded-[24px] border border-[var(--m-border)] bg-[var(--m-surface)] p-5"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--m-forest-700)] text-[var(--m-acid)]">
            <role.icon size={19} />
          </span>
          <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.015em]">
            {role.title}
          </h3>
          <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--m-ink-3)]">
            {role.body}
          </p>
          <div className="mt-auto pt-5">
            <div className="flex flex-wrap gap-2">
              {role.points.map((point) => (
                <span
                  key={point}
                  className="rounded-full bg-[var(--m-canvas-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--m-ink-3)]"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const HowItWorksFAQ = () => (
  <section className="hm-section">
    <div className="grid gap-10 lg:grid-cols-[320px,1fr]">
      <div>
        <div className="hm-eyebrow">Common questions</div>
        <h2 className="hm-h2 mt-3">What organisers usually ask before switching.</h2>
      </div>
      <div className="overflow-hidden rounded-[26px] border border-[var(--m-border)] bg-[var(--m-surface)]">
        {FAQS.map((item) => (
          <article
            key={item.q}
            className="border-b border-[var(--m-border)] p-6 last:border-b-0 md:p-7"
          >
            <div className="flex gap-3">
              <CheckCircle2
                size={18}
                className="mt-1 shrink-0 text-[var(--m-forest-700)]"
              />
              <div>
                <h3 className="text-[18px] font-semibold tracking-[-0.01em]">
                  {item.q}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--m-ink-3)]">
                  {item.a}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
