import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Megaphone,
  MessageSquare,
  QrCode,
  Rocket,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AiOfferSpotlight } from "@/components/marketing/sections/AiOfferSpotlight";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
} from "@/components/marketing/seo/SchemaJsonLd";

export const metadata: Metadata = {
  title:
    "How Hoizr works for Indian event organizers, venues & promoters",
  description:
    "A detailed walkthrough of how Hoizr takes Indian event hosts from signup to event setup, AI rate quote, ticket sales, campaigns, door scanning, reporting, and settlement-ready operations.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How Hoizr works for Indian event organizers & venues",
    description:
      "One workspace for event setup, AI pricing, direct ticket sales, owned fan CRM, campaigns, guestlist, door scanning, reporting, and settlement-ready event ops.",
    url: "/how-it-works",
    type: "website",
  },
};

type FlowStep = {
  n: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  details: string[];
};

type TeamView = {
  icon: LucideIcon;
  title: string;
  body: string;
  points: string[];
};

const OPERATING_FLOW: FlowStep[] = [
  {
    n: "01",
    icon: Building2,
    eyebrow: "Create workspace",
    title: "Set up your organisation once.",
    body:
      "Hoizr starts with the host workspace: legal entity, public brand profile, default venue details, team access, payout details, and the permanent organisation page fans can revisit.",
    details: [
      "Organisation page with upcoming and past events",
      "Team roles for owner, marketer, finance, and door staff",
      "Default policies, venue details, and brand assets",
    ],
  },
  {
    n: "02",
    icon: CalendarPlus,
    eyebrow: "Build the event",
    title: "Create the listing, ticket ladder, and operating rules.",
    body:
      "Add the lineup, date, venue, ticket phases, capacity, add-ons, guestlist rules, refund window, and collaborator access. Hoizr turns that setup into a public event page and an internal runbook.",
    details: [
      "Ticket phases, access types, add-ons, and cart controls",
      "Refund rules, age notes, venue instructions, and entry policy",
      "SEO metadata, share previews, and event schema generated on publish",
    ],
  },
  {
    n: "03",
    icon: Sparkles,
    eyebrow: "AI rate quote",
    title: "Get an event-specific Hoizr commission offer.",
    body:
      "Hoizr reads the event format, city, expected scale, ticket mix, and listing completeness, then quotes the lowest commission we can offer for that specific show.",
    details: [
      "No public one-size-fits-all percentage",
      "Rate is tied to the specific event, not your entire account",
      "Offer context stays visible before you publish",
    ],
  },
  {
    n: "04",
    icon: Ticket,
    eyebrow: "Sell direct",
    title: "Publish, track sources, and keep the buyer relationship.",
    body:
      "The event goes live with direct ticket checkout, source tracking, promoter links, and fan CRM capture. Every buyer strengthens the host account instead of disappearing into a marketplace.",
    details: [
      "Source tracking for campaigns, creators, and promoter links",
      "Buyer records flow into owned fan CRM",
      "Ticket inventory and phases stay visible in real time",
    ],
  },
  {
    n: "05",
    icon: Megaphone,
    eyebrow: "Campaigns",
    title: "Bring the right audience back into the funnel.",
    body:
      "Use CRM segments to send on-sale drops, reminders, last-call pushes, and post-event flows across owned channels. Buyers move out of sales flows and into arrival or loyalty flows.",
    details: [
      "Segments by purchase history, attendance, city, and interest",
      "Campaign calendar for email, SMS, WhatsApp, push, and in-app",
      "Suppression logic keeps paid buyers from seeing stale sales nudges",
    ],
  },
  {
    n: "06",
    icon: ScanLine,
    eyebrow: "Door ops",
    title: "Run scanners, guestlist, and live arrivals from one view.",
    body:
      "Door staff scan QR tickets, check guestlist entries, issue wristbands, and see live arrivals. The host can watch capacity, no-shows, and promoter arrivals while the line is moving.",
    details: [
      "Multi-scanner setup with simple staff access",
      "Guestlist caps, invite QRs, and promoter arrival counters",
      "Refunded, duplicated, or already-scanned tickets are clearly flagged",
    ],
  },
  {
    n: "07",
    icon: BarChart3,
    eyebrow: "After the show",
    title: "Review, settle, and prepare the next drop.",
    body:
      "The morning after, Hoizr gives the team sell-through, sources, arrivals, refunds, and settlement-ready numbers. The fan CRM updates so the next weekend starts warmer.",
    details: [
      "Revenue, source, ticket phase, and promoter reporting",
      "Settlement-ready statement for finance review",
      "Audience segments ready for the next event campaign",
    ],
  },
];

const QUICK_ONBOARD_STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Rocket,
    title: "Sign up in minutes",
    body:
      "Email or phone, organisation basics, and the first event you want to publish. No long forms, no mandatory sales call.",
  },
  {
    icon: ShieldCheck,
    title: "Verification runs in the background",
    body:
      "GSTIN (if applicable), bank, and KYC submitted once. Hoizr's verification queue clears most hosts within hours, not days — you keep building your event while it processes.",
  },
  {
    icon: Sparkles,
    title: "You're live as soon as we are",
    body:
      "The moment verification clears, your event publishes, payouts unlock, and your team logs in. No staged rollouts, no waiting on a second review.",
  },
];

const TEAM_VIEWS: TeamView[] = [
  {
    icon: ShieldCheck,
    title: "Owner view",
    body:
      "The owner sees the business layer: event health, ticket revenue, commission offer, collaborators, source performance, and settlement status.",
    points: ["Event health", "Rate offer", "Revenue", "Payout status"],
  },
  {
    icon: Send,
    title: "Marketing view",
    body:
      "The marketing team works from CRM segments, campaign drafts, source links, reminder cadence, and post-event flows without touching finance settings.",
    points: ["CRM segments", "Campaign calendar", "Source links", "Buyer suppression"],
  },
  {
    icon: Users,
    title: "Promoter view",
    body:
      "Promoters get controlled links and guestlist caps. Hosts see what each collaborator issued, sold, and actually brought through the door.",
    points: ["Invite codes", "Ticket links", "Caps", "Arrivals"],
  },
  {
    icon: QrCode,
    title: "Door view",
    body:
      "Door staff see only the tools they need: scan, validate, check guestlist, resolve obvious exceptions, and keep the queue moving.",
    points: ["QR scanning", "Guestlist", "Live count", "Exceptions"],
  },
  {
    icon: Wallet,
    title: "Finance view",
    body:
      "Finance gets itemised numbers for gross sales, refunds, commission, taxes where applicable, payout status, and settlement-ready exports.",
    points: ["Gross sales", "Refunds", "Commission", "Settlement"],
  },
];

const RUN_OF_SHOW = [
  {
    when: "T-21 days",
    title: "On-sale launch",
    body:
      "Publish the event, send warm-list campaigns, share tracked links with collaborators, and watch first-day source movement.",
  },
  {
    when: "T-14 days",
    title: "Audience shaping",
    body:
      "Segment by past attendance, genre interest, and source response. Adjust ticket phases and creative based on actual buyer behavior.",
  },
  {
    when: "T-7 days",
    title: "Promoter and guestlist control",
    body:
      "Lock guestlist caps, review promoter movement, prepare door roles, and confirm refund/cancellation policy is clear.",
  },
  {
    when: "T-1 day",
    title: "Operational rehearsal",
    body:
      "Test scanner access, confirm wristband or stamp rules, send last-call campaigns, and share the final door runbook.",
  },
  {
    when: "Event night",
    title: "Live entry and arrival tracking",
    body:
      "Door staff scan tickets and invites while the host watches live arrivals, exceptions, guestlist usage, and capacity signals.",
  },
  {
    when: "Morning after",
    title: "Reporting and next event prep",
    body:
      "Review sell-through, source performance, attendance, refunds, and settlement-ready numbers. Rebuild segments for the next drop.",
  },
];

const PLATFORM_MODULES = [
  {
    href: "/product/event-listing",
    icon: Ticket,
    title: "Event Listing",
    body: "Conversion-ready pages with ticket phases, add-ons, source links, policy notes, and checkout.",
  },
  {
    href: "/product/marketing-campaigns",
    icon: MessageSquare,
    title: "Marketing Campaigns",
    body: "One campaign workspace for owned-channel drops, reminders, last-call nudges, and post-event flows.",
  },
  {
    href: "/product/guestlist-management",
    icon: Users,
    title: "Guestlist Management",
    body: "Promoter caps, invite QRs, live arrivals, and accountability without spreadsheet arguments.",
  },
  {
    href: "/product/door-scanning",
    icon: ScanLine,
    title: "Door Scanning",
    body: "Multi-scanner setup, QR validation, arrival counters, and clear exception states for door teams.",
  },
  {
    href: "/product/reporting-analytics",
    icon: BarChart3,
    title: "Reporting & Analytics",
    body: "Sell-through, source performance, arrival data, refund view, and settlement-ready numbers.",
  },
  {
    href: "/product/ai-event-assistant",
    icon: Sparkles,
    title: "AI Event Assistant",
    body: "Event-specific commission offer generation based on format, city, scale, and ticket mix.",
  },
];

const FAQS = [
  {
    q: "Can I publish an event before the full organisation setup is complete?",
    a: "You can draft the event early, but Hoizr expects the host workspace, payout details, policies, and public organisation profile to be ready before the event is pushed live.",
  },
  {
    q: "Does Hoizr replace my marketing tools?",
    a: "Hoizr gives event hosts one campaign workspace tied to buyer and attendance data. It is designed for on-sale, reminder, last-call, and post-event flows that directly connect to ticketing and CRM.",
  },
  {
    q: "How does the AI rate work?",
    a: "Hoizr reviews event context such as format, city, scale, ticket mix, and listing completeness, then generates an event-specific commission offer. It is scoped to the event, not a permanent account-wide public rate.",
  },
  {
    q: "Can multiple door staff scan at the same time?",
    a: "Yes. Hoizr is designed around multi-scanner door operations, simple staff access, live arrival counters, and clear states for valid, refunded, duplicated, or already-scanned tickets.",
  },
  {
    q: "What happens after the event ends?",
    a: "The host gets sell-through, source, attendance, refund, and settlement-ready reporting. The fan CRM also updates so the next campaign can target buyers and attendees with better context.",
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "How it works", href: "/how-it-works" },
        ]}
      />
      <FaqJsonLd items={FAQS} />

      <HowItWorksHero />
      <OperatingFlow />
      <QuickOnboarding />
      <TeamViews />
      <RunOfShow />
      <PlatformModules />
      <HowItWorksFAQ />
      <AiOfferSpotlight />
      <FinalCTA />
    </MarketingShell>
  );
}

const HowItWorksHero = () => (
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
          From first setup to the morning-after report.
        </h1>
        <p className="hm-lead mt-7 max-w-[660px]">
          Hoizr is not just a checkout link. It is the operating system for
          the event: listing, AI commission quote, direct sales, fan CRM,
          campaigns, guestlist, door scanning, reporting, and settlement-ready
          numbers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {["Quick onboarding · same-day verify", "Owned fan CRM", "Event-specific AI rate", "Live door ops"].map(
            (item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2 text-[13px] font-semibold text-[var(--m-ink-2)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--m-acid)]" />
                {item}
              </span>
            )
          )}
        </div>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/signup" className="hm-btn hm-btn-primary">
            Get my event rate
            <ArrowRight size={16} />
          </Link>
          <Link
            href="#operating-flow"
            className="hm-btn hm-btn-ghost border border-[var(--m-border)]"
          >
            See the flow
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] bg-[var(--m-forest-700)] p-4 text-white shadow-[var(--m-shadow-pop)] md:p-5">
        <div className="absolute inset-0 opacity-35">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/playbooks/Backstage-tech-control-in-ambient-lighting.png"
            alt=""
            aria-hidden
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,7,0.28),rgba(8,8,7,0.92))]"
        />
        <div className="relative z-10">
          <div className="rounded-[18px] border border-white/12 bg-white/10 p-3 backdrop-blur">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/playbooks/Event-management-dashboard-overview.png"
              alt="Hoizr dashboard overview"
              className="aspect-[16/10] w-full rounded-[12px] object-cover"
              draggable={false}
            />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["1,842", "Tickets sold"],
              ["Live", "Door status"],
              ["Ready", "Settlement"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-[16px] border border-white/12 bg-black/26 p-4 backdrop-blur"
              >
                <div className="font-semibold text-[var(--m-acid)]">{value}</div>
                <div className="mt-1 text-[12px] text-white/68">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[18px] border border-white/12 bg-black/28 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--m-acid)] text-black">
                <Rocket size={18} />
              </span>
              <div>
                <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/55">
                  Launch path
                </div>
                <div className="mt-1 text-[18px] font-semibold">
                  Workspace to live event in one guided flow.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const OperatingFlow = () => (
  <section id="operating-flow" className="hm-section">
    <div className="grid gap-10 lg:grid-cols-[320px,1fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <div className="hm-eyebrow">Operating flow</div>
        <h2 className="hm-h2 mt-3">The platform follows the real event lifecycle.</h2>
        <p className="mt-5 text-[15.5px] leading-relaxed text-[var(--m-ink-3)]">
          Each step feeds the next one. The listing creates the checkout. The
          checkout builds the CRM. The CRM powers campaigns. The door creates
          attendance data. Reporting tells you what to change before the next
          show.
        </p>
      </div>

      <div className="space-y-4">
        {OPERATING_FLOW.map((step, index) => (
          <article
            key={step.n}
            className={`relative overflow-hidden rounded-[26px] border border-[var(--m-border)] p-6 md:p-7 ${
              index === 2
                ? "hm-forest-panel"
                : "bg-[var(--m-surface)] text-[var(--m-ink-1)]"
            }`}
          >
            <div className="grid gap-5 md:grid-cols-[128px,1fr]">
              <div className="flex items-start gap-3">
                <span
                  className={`hoizr-mark text-[40px] leading-none ${
                    index === 2 ? "text-white/30" : "text-[var(--m-ink-5)]"
                  }`}
                >
                  {step.n}
                </span>
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl ${
                    index === 2
                      ? "bg-white/10 text-[var(--m-acid)]"
                      : "bg-[var(--m-forest-700)] text-[var(--m-acid)]"
                  }`}
                >
                  <step.icon size={19} strokeWidth={1.8} />
                </span>
              </div>
              <div>
                <div
                  className={`text-[11px] font-bold uppercase tracking-[0.13em] ${
                    index === 2 ? "text-white/60" : "text-[var(--m-ink-4)]"
                  }`}
                >
                  {step.eyebrow}
                </div>
                <h3
                  className="mt-2 font-semibold leading-tight tracking-[-0.02em]"
                  style={{ fontSize: "clamp(22px, 2.5vw, 30px)" }}
                >
                  {step.title}
                </h3>
                <p
                  className={`mt-4 max-w-[660px] text-[15px] leading-[1.65] ${
                    index === 2 ? "text-white/82" : "text-[var(--m-ink-3)]"
                  }`}
                >
                  {step.body}
                </p>
                <div className="mt-5 grid gap-2 md:grid-cols-3">
                  {step.details.map((detail) => (
                    <div
                      key={detail}
                      className={`rounded-[16px] p-3 text-[12.5px] leading-snug ${
                        index === 2
                          ? "border border-white/12 bg-white/8 text-white/76"
                          : "border border-[var(--m-border)] bg-[var(--m-canvas-2)] text-[var(--m-ink-3)]"
                      }`}
                    >
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const QuickOnboarding = () => (
  <section className="hm-section">
    <div className="rounded-[32px] bg-[var(--m-surface)] p-6 shadow-[var(--m-shadow-card)] md:p-9">
      <div className="grid gap-8 lg:grid-cols-[360px,1fr]">
        <div>
          <div className="hm-eyebrow">Quick onboarding · Quick verification</div>
          <h2 className="hm-h2 mt-3">
            Onboarding is quick. Verification is quicker.
          </h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-[var(--m-ink-3)]">
            Hoizr opens your account fast and clears verification in parallel
            — no long forms, no week-long waiting on documents. Most hosts
            move from signup to publish-ready in under a day.
          </p>
        </div>

        <div className="grid gap-3">
          {QUICK_ONBOARD_STEPS.map((step) => (
            <article
              key={step.title}
              className="grid gap-4 rounded-[20px] border border-[var(--m-border)] bg-[var(--m-canvas)] p-5 sm:grid-cols-[56px,1fr]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--m-forest-700)] text-[var(--m-acid)]">
                <step.icon size={20} />
              </span>
              <div className="min-w-0">
                <h3 className="text-[17px] font-semibold tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--m-ink-3)]">
                  {step.body}
                </p>
              </div>
            </article>
          ))}
          <p className="mt-2 text-[12.5px] text-[var(--m-ink-4)]">
            Stuck mid-onboarding? Email{" "}
            <a
              href="mailto:support@hoizr.in"
              className="font-semibold text-[var(--m-forest-700)] hover:underline"
            >
              support@hoizr.in
            </a>{" "}
            — the team unblocks verification queues in IST hours.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const TeamViews = () => (
  <section className="hm-section">
    <div className="max-w-[760px]">
      <div className="hm-eyebrow">Role-based workspace</div>
      <h2 className="hm-h2 mt-3">Every team sees the part of the night they own.</h2>
      <p className="hm-lead mt-5 max-w-[620px]">
        A founder, marketer, promoter, door staff member, and finance lead do
        not need the same dashboard. Hoizr keeps permissions and context clean.
      </p>
    </div>

    <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {TEAM_VIEWS.map((view) => (
        <article
          key={view.title}
          className="flex min-h-[320px] flex-col rounded-[24px] border border-[var(--m-border)] bg-[var(--m-surface)] p-5"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--m-forest-700)] text-[var(--m-acid)]">
            <view.icon size={19} />
          </span>
          <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.015em]">
            {view.title}
          </h3>
          <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--m-ink-3)]">
            {view.body}
          </p>
          <div className="mt-auto pt-5">
            <div className="flex flex-wrap gap-2">
              {view.points.map((point) => (
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

const RunOfShow = () => (
  <section className="hm-section">
    <div className="hm-forest-panel p-6 md:p-9">
      <div className="grid gap-10 lg:grid-cols-[360px,1fr]">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/55">
            Run of show
          </div>
          <h2 className="mt-3 font-bold leading-[1.05] tracking-[-0.025em] text-white" style={{ fontFamily: "var(--m-font-display)", fontSize: "clamp(34px, 4.8vw, 58px)" }}>
            One event, from announcement to teardown.
          </h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-white/72">
            This is how the platform behaves around a real club night,
            concert, comedy show, or festival pre-party.
          </p>
        </div>

        <div className="grid gap-3">
          {RUN_OF_SHOW.map((item) => (
            <article
              key={item.when}
              className="grid gap-4 rounded-[20px] border border-white/12 bg-white/8 p-5 md:grid-cols-[110px,1fr]"
            >
              <div className="text-[12px] font-bold uppercase tracking-[0.13em] text-[var(--m-acid)]">
                {item.when}
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/70">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const PlatformModules = () => (
  <section className="hm-section">
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-[720px]">
        <div className="hm-eyebrow">Platform modules</div>
        <h2 className="hm-h2 mt-3">The pieces that make the flow work.</h2>
        <p className="hm-lead mt-5 max-w-[600px]">
          Each product page goes deeper, but these are the core modules that
          show up in the operating flow.
        </p>
      </div>
      <Link
        href="/product/event-listing"
        className="hm-btn hm-btn-ghost self-start border border-[var(--m-border)] md:self-auto"
      >
        Explore products
        <ArrowRight size={15} />
      </Link>
    </div>

    <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {PLATFORM_MODULES.map((module) => (
        <Link
          key={module.href}
          href={module.href}
          className="group rounded-[24px] border border-[var(--m-border)] bg-[var(--m-surface)] p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--m-shadow-card)]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--m-canvas-2)] text-[var(--m-forest-700)]">
            <module.icon size={19} />
          </span>
          <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.015em] text-[var(--m-ink-1)]">
            {module.title}
          </h3>
          <p className="mt-3 min-h-[72px] text-[14px] leading-relaxed text-[var(--m-ink-3)]">
            {module.body}
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--m-forest-700)]">
            Learn more
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </Link>
      ))}
    </div>
  </section>
);

const HowItWorksFAQ = () => (
  <section className="hm-section">
    <div className="grid gap-10 lg:grid-cols-[320px,1fr]">
      <div>
        <div className="hm-eyebrow">Common questions</div>
        <h2 className="hm-h2 mt-3">What hosts usually ask before switching.</h2>
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
