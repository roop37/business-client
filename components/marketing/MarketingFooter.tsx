"use client";

import Link from "next/link";
import { MARKETING_PILLARS } from "./data/nav-products";
import { useWaitlist } from "./waitlist/WaitlistContext";

const COMPANY_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
];
const RESOURCE_LINKS = [
  { label: "Find Event", href: "https://hoizr.com" },
  { label: "Resources", href: "/resources" },
  { label: "Flyer stickers", href: "/resources#stickers" },
  { label: "Playbooks", href: "/resources#playbooks" },
  { label: "Blog", href: "/blog" },
  { label: "Help center", href: "/help" },
];
// Pre-launch: account links (Get event rate · Host login) are hidden
// while the dashboard is closed to the public. Restore when the
// dashboard reopens.
// const ACCOUNT_LINKS = [
//   { label: "Get event rate", href: "/signup" },
//   { label: "Host login", href: "/login" },
// ];
const SUPPORT_LINKS = [
  { label: "Contact", href: "/contact" },
  { label: "contact@hoizr.com", href: "mailto:contact@hoizr.com" },
  { label: "Call +91 83695 72945", href: "tel:+918369572945" },
  { label: "WhatsApp +91 83695 72945", href: "https://wa.me/918369572945" },
  { label: "tech@hoizr.com", href: "mailto:tech@hoizr.com" },
];

const INSTAGRAM_URL = "https://www.instagram.com/hoizr.technologies";
const LEGAL_LINKS = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Cookies", href: "/legal/cookies" },
  { label: "GST · CIN", href: "/legal/entity" },
];

export const MarketingFooter = () => {
  const { open: openWaitlist } = useWaitlist();
  return (
    <footer className="relative z-10 block shrink-0 overflow-hidden border-t border-white/10 bg-[#050504] text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/marketing/hero/hero-lines-star.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 pb-10">
        {/* The big closing wordmark */}
        <div
          className="hoizr-mark tracking-[0.04em] !text-white leading-none mb-12 select-none"
          style={{ fontSize: "clamp(44px, 14vw, 120px)" }}
        >
          HOIZR
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-10">
          {MARKETING_PILLARS.map((pillar) => (
            <div key={pillar.id}>
              <div className="hm-eyebrow mb-3 !text-white/45">{pillar.label}</div>
              <ul className="space-y-2">
                {pillar.products.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/product/${p.slug}`}
                      className="text-[13.5px] font-medium text-white/76 transition-colors duration-200 hover:text-[var(--m-acid)] hover:[text-shadow:0_0_14px_rgba(214,255,63,0.55)]"
                    >
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <div className="hm-eyebrow mb-3 !text-white/45">Company</div>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13.5px] font-medium text-white/76 transition-colors duration-200 hover:text-[var(--m-acid)] hover:[text-shadow:0_0_14px_rgba(214,255,63,0.55)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hm-eyebrow mt-6 mb-3 !text-white/45">Resources</div>
            <ul className="space-y-2">
              {RESOURCE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13.5px] font-medium text-white/76 transition-colors duration-200 hover:text-[var(--m-acid)] hover:[text-shadow:0_0_14px_rgba(214,255,63,0.55)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="hm-eyebrow mb-3 !text-white/45">Support</div>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13.5px] font-medium text-white/76 transition-colors duration-200 hover:text-[var(--m-acid)] hover:[text-shadow:0_0_14px_rgba(214,255,63,0.55)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hm-eyebrow mt-6 mb-3 !text-white/45">Account</div>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => openWaitlist("footer")}
                  className="text-[13.5px] font-medium text-white/76 transition-colors duration-200 hover:text-[var(--m-acid)] hover:[text-shadow:0_0_14px_rgba(214,255,63,0.55)]"
                >
                  Join the waitlist
                </button>
              </li>
              {/* Pre-launch: login + signup links hidden. Restore when dashboard reopens.
              {ACCOUNT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13.5px] font-medium text-white/76 transition-colors duration-200 hover:text-[var(--m-acid)] hover:[text-shadow:0_0_14px_rgba(214,255,63,0.55)]">
                    {l.label}
                  </Link>
                </li>
              ))}
              */}
            </ul>
            <div className="hm-eyebrow mt-6 mb-3 !text-white/45">India desk</div>
            <p className="text-[13.5px] font-medium leading-relaxed text-white/76">
              Mumbai · Bengaluru · Delhi NCR
            </p>
            <div className="hm-eyebrow mt-6 mb-3 !text-white/45">Follow</div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[13.5px] font-medium text-white/76 transition-colors duration-200 hover:text-[var(--m-acid)] hover:[text-shadow:0_0_14px_rgba(214,255,63,0.55)]"
            >
              Instagram · @hoizr.technologies ↗
            </a>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/12 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-white/45">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} Hoizr Technologies Pvt. Ltd.</span>
            <span aria-hidden className="text-white/25">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--m-acid)]"
              />
              <span className="font-semibold text-white/70">
                AI by Claude
              </span>
              <span className="text-white/45">(Anthropic)</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors duration-200 hover:text-[var(--m-acid)] hover:[text-shadow:0_0_12px_rgba(214,255,63,0.5)]"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
