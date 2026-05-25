import type { Metadata } from "next";
import { ArrowRight, BookOpenText, MailQuestion, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Help — Hoizr",
  description:
    "Reach the Hoizr team for setup, payout, scanner, and platform support. Same-day reply for event organizers running shows.",
};

const HELP_LANES = [
  {
    icon: MessagesSquare,
    title: "Talk to the team",
    body: "Hoizr's support team is staffed across IST hours and replies same-day for active event organizers.",
    cta: { label: "Email support", href: "mailto:contact@hoizr.com" },
  },
  {
    icon: MailQuestion,
    title: "New organizer questions",
    body: "Considering Hoizr but haven't onboarded yet? The team will help you bring your event onto the platform, publish directly, and understand the AI event offer.",
    cta: { label: "Talk to sales", href: "/contact" },
  },
  {
    icon: BookOpenText,
    title: "Read the playbooks",
    body: "Our blog ships short operator playbooks every couple of weeks — on-sale day, fan CRM growth, door ops, and more.",
    cta: { label: "Open the blog", href: "/blog" },
  },
];

const COMMON_QUERIES = [
  {
    q: "I'm an event organizer. How do I reach support during my event?",
    a: "Email contact@hoizr.com or use the in-dashboard help button. The team monitors both channels across IST hours and during weekend show windows.",
  },
  {
    q: "I'm a customer who bought a ticket. Who do I contact?",
    a: "For ticket queries and refunds, reach contact@hoizr.com or the contact channel inside your order page.",
  },
  {
    q: "I'm a journalist or press contact.",
    a: "Write to contact@hoizr.com and the team will share the press kit and interview path.",
  },
  {
    q: "I'm thinking of partnering with Hoizr.",
    a: "Email contact@hoizr.com with what you're building — agency, venue, collective, or operator network.",
  },
  {
    q: "Something looks broken on this website.",
    a: "Send a quick note to tech@hoizr.com with the URL and a screenshot if possible. The engineering team triages these the same day.",
  },
];

export default function HelpPage() {
  return (
    <MarketingShell>
      <section className="hm-section pt-12 md:pt-16">
        <div className="max-w-[720px]">
          <div className="hm-eyebrow">Help centre</div>
          <h1
            className="mt-3 font-bold leading-[1.02] tracking-[-0.03em] text-[var(--m-ink-1)]"
            style={{
              fontFamily: "var(--m-font-display)",
              fontSize: "clamp(40px, 6vw, 80px)",
            }}
          >
            How can we
            <br />
            <span className="text-[var(--m-forest-600)]">help you out?</span>
          </h1>
          <p className="hm-lead mt-7 max-w-[600px]">
            Pick the lane that matches your role. Hoizr&apos;s support team
            replies same-day for active event organizers and within one working day for
            everyone else.
          </p>
        </div>
      </section>

      <section className="hm-section pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {HELP_LANES.map((lane) => {
            const isExternal = lane.cta.href.startsWith("mailto:");
            return (
              <div
                key={lane.title}
                className="flex flex-col rounded-[var(--m-r-lg)] border border-[var(--m-border)] bg-[var(--m-surface)] p-7"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--m-forest-700)] text-[var(--m-acid)]">
                  <lane.icon size={20} strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-[18px] font-semibold leading-tight tracking-[-0.015em] text-[var(--m-ink-1)]">
                  {lane.title}
                </h3>
                <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-[var(--m-ink-3)]">
                  {lane.body}
                </p>
                {isExternal ? (
                  <a
                    href={lane.cta.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--m-forest-700)] hover:underline"
                  >
                    {lane.cta.label} <ArrowRight size={14} />
                  </a>
                ) : (
                  <Link
                    href={lane.cta.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--m-forest-700)] hover:underline"
                  >
                    {lane.cta.label} <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="hm-section pt-0">
        <div className="max-w-[760px]">
          <div className="hm-eyebrow">Quick answers</div>
          <h2 className="hm-h2 mt-3">Before you write.</h2>
          <div className="mt-10 space-y-6">
            {COMMON_QUERIES.map((q) => (
              <div
                key={q.q}
                className="border-t border-[var(--m-border)] pt-6"
              >
                <div className="text-[16px] font-semibold text-[var(--m-ink-1)]">
                  {q.q}
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--m-ink-3)]">
                  {q.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </MarketingShell>
  );
}
