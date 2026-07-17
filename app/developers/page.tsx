import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  KeyRound,
  Palette,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  JsonLdScript,
} from "@/components/marketing/seo/SchemaJsonLd";
import WhitelabelLeadForm from "@/components/marketing/WhitelabelLeadForm";

const SITE_URL = "https://business.hoizr.com";

export const metadata: Metadata = {
  title: {
    absolute: "Hoizr Developers — Sell event tickets from your own website (API, webhooks, whitelabel)",
  },
  description:
    "Sell tickets for your published Hoizr events directly on your own website. Use the Hoizr ticketing API and embed, get order webhooks in real time, or run a fully whitelabel checkout under your own brand. Built for Indian event organizers.",
  keywords: [
    "event ticketing API India",
    "sell tickets on your own website",
    "ticketing webhooks",
    "whitelabel ticketing platform India",
    "embed ticket checkout",
    "Hoizr API",
    "event API for developers",
  ],
  alternates: {
    canonical: "/developers",
    languages: { "en-IN": "/developers", "x-default": "/developers" },
  },
  openGraph: {
    title: "Hoizr Developers — ticketing API, webhooks & whitelabel",
    description:
      "Sell Hoizr event tickets from your own site via API or embed, receive real-time order webhooks, or go fully whitelabel under your own brand.",
    url: "/developers",
    type: "website",
    siteName: "Hoizr",
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image.webp",
        width: 1200,
        height: 630,
        alt: "Hoizr Developers — ticketing API, webhooks, and whitelabel for Indian event organizers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoizr Developers — ticketing API, webhooks & whitelabel",
    description:
      "Sell tickets on your own website with the Hoizr API, get real-time order webhooks, or run a whitelabel checkout.",
  },
};

const FAQS = [
  {
    q: "Can I sell Hoizr event tickets on my own website?",
    a: "Yes. Once you create and publish an event on Hoizr, you can sell its tickets from your own site using the Hoizr ticketing API or a drop-in embed. Payments, ticket delivery, scanning, and payouts are still handled by Hoizr.",
  },
  {
    q: "What can the Hoizr API do?",
    a: "The API lets your site fetch event and ticket details, run the customer sign-up with OTP verification, create an order, and take payment through Razorpay. Buyers still verify their phone with an OTP before a purchase completes, exactly like on hoizr.com.",
  },
  {
    q: "Do you support webhooks?",
    a: "Yes. Register an HTTPS endpoint and Hoizr sends a signed POST the moment an order is paid, refunded, or cancelled, so your system stays in sync without polling. Each delivery is HMAC-signed and carries a unique delivery id for de-duplication.",
  },
  {
    q: "What is whitelabel and how do I get it?",
    a: "Whitelabel runs the entire ticketing experience under your own brand and domain, with Hoizr invisible to your buyers. It is set up with you one-on-one — request it from the Developers section of your dashboard or from this page and our team will reach out.",
  },
  {
    q: "Is the API secure?",
    a: "Yes. Server-side calls use a secret key; browser calls use a publishable key restricted to domains you allow. Purchases always require an OTP-verified customer session, and rate limits protect every endpoint. Hoizr never exposes raw customer data through the API.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Hoizr Ticketing API & Whitelabel",
  serviceType: "Event ticketing API, webhooks, and whitelabel checkout",
  description:
    "Sell Hoizr event tickets from your own website via API or embed, receive real-time signed order webhooks, or run a fully whitelabel checkout under your own brand.",
  provider: { "@type": "Organization", name: "Hoizr", url: SITE_URL },
  areaServed: { "@type": "Country", name: "India" },
  audience: {
    "@type": "BusinessAudience",
    audienceType: "Event organizers, venues, promoters, and developers in India",
  },
  url: `${SITE_URL}/developers`,
};

type Capability = {
  icon: typeof Code2;
  title: string;
  body: string;
  points: string[];
};

const CAPABILITIES: Capability[] = [
  {
    icon: Code2,
    title: "Ticketing API",
    body: "Wire Hoizr ticket sales into your own site. Your UI, Hoizr's payments, scanning, and payouts underneath.",
    points: [
      "Fetch events, ticket types, prices, and live availability",
      "OTP-verified customer sign-up before every purchase",
      "Create orders and take payment via Razorpay",
    ],
  },
  {
    icon: Webhook,
    title: "Webhooks",
    body: "Know the instant an order changes, without polling. Signed, retried, de-duplicated.",
    points: [
      "order.paid, order.refunded, order.cancelled events",
      "HMAC-signed with your secret; unique delivery id per event",
      "Automatic retries with backoff + a delivery log in your dashboard",
    ],
  },
  {
    icon: Palette,
    title: "Whitelabel",
    body: "Run the whole experience under your own brand and domain. Set up with you, one-on-one.",
    points: [
      "Your brand on the ticket page, emails, and checkout",
      "Hoizr stays invisible to your buyers",
      "Request it from your dashboard or below",
    ],
  },
];

export default function DevelopersPage() {
  return (
    <MarketingShell>
      <JsonLdScript id="hoizr-developers-service-jsonld" data={serviceJsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: "Hoizr", href: "/" },
          { name: "Developers", href: "/developers" },
        ]}
      />
      <FaqJsonLd items={FAQS} />

      {/* Hero */}
      <section className="hm-section">
        <div className="mx-auto max-w-3xl text-center">
          <div className="hm-eyebrow">Developers</div>
          <h1 className="hm-h2 mt-3">
            Sell your event tickets anywhere you want.
          </h1>
          <p className="hm-lead mx-auto mt-4 max-w-2xl">
            Create your event on Hoizr, then sell its tickets from your own
            website — through our API and embed, with real-time order webhooks,
            or fully whitelabel under your brand. Payments, tickets, scanning,
            and payouts stay on Hoizr.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/get-started" className="hm-btn hm-btn-primary">
              Get API access <ArrowRight size={16} />
            </Link>
            <a href="#whitelabel" className="hm-btn hm-btn-ghost">
              Request whitelabel
            </a>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="hm-section">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="rounded-2xl border border-black/10 bg-white p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F8842]/10">
                  <Icon size={20} className="text-[#0F8842]" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-neutral-900">{c.title}</h2>
                <p className="mt-1.5 text-sm text-neutral-600">{c.body}</p>
                <ul className="mt-4 space-y-2">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0F8842]" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works — GEO-friendly, concrete, scannable */}
      <section className="hm-section">
        <div className="mx-auto max-w-3xl">
          <div className="hm-eyebrow">How the API works</div>
          <h2 className="hm-h2 mt-3">Four steps from your site to a sold ticket.</h2>
          <ol className="mt-6 space-y-4">
            {[
              "Generate an API key in your dashboard under Developers — a secret key for your server, or a publishable key restricted to your domains for the browser.",
              "Fetch the event and its ticket types to render your own checkout UI.",
              "Verify the buyer with a one-time password (OTP), then create the order — you receive a Razorpay checkout to complete payment.",
              "Confirm the payment and listen for the order.paid webhook to fulfill on your side.",
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F8842] text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <p className="pt-0.5 text-sm text-neutral-700">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded-xl border border-black/10 bg-white p-4">
              <KeyRound size={18} className="mt-0.5 shrink-0 text-[#0F8842]" />
              <p className="text-sm text-neutral-700">
                <span className="font-semibold text-neutral-900">Two key types.</span>{" "}
                Secret keys for your server, publishable keys locked to your
                domains for the browser.
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-black/10 bg-white p-4">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#0F8842]" />
              <p className="text-sm text-neutral-700">
                <span className="font-semibold text-neutral-900">OTP-gated.</span>{" "}
                Every purchase requires a phone-verified buyer, exactly like on
                hoizr.com.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Whitelabel + lead form */}
      <section id="whitelabel" className="hm-section">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="hm-eyebrow">Whitelabel</div>
            <h2 className="hm-h2 mt-3">Your brand, front and centre.</h2>
            <p className="hm-lead mt-4">
              Run the entire ticketing experience under your own name and
              domain, with Hoizr working quietly underneath. Whitelabel is set
              up with you one-on-one — tell us what you’re building and our team
              will take it from there.
            </p>
          </div>
          <WhitelabelLeadForm />
        </div>
      </section>

      {/* FAQ — mirrors FAQ JSON-LD for AI + search citation */}
      <section className="hm-section">
        <div className="mx-auto max-w-3xl">
          <div className="hm-eyebrow">Common questions</div>
          <h2 className="hm-h2 mt-3">Developer FAQ.</h2>
          <div className="mt-6 divide-y divide-black/10">
            {FAQS.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="text-base font-semibold text-neutral-900">{f.q}</h3>
                <p className="mt-2 text-sm text-neutral-700">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </MarketingShell>
  );
}
