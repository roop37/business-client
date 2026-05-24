"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MARKETING_PILLARS } from "./data/nav-products";
import { useWaitlist } from "./waitlist/WaitlistContext";

type OpenMenu = "products" | "company" | "resources" | null;

const RESOURCE_LINKS = [
  { label: "Playbooks", href: "/resources#playbooks", blurb: "Short, opinionated guides for India's live nights — door ops, on-sale day, refund policy, teardown." },
  { label: "Blog", href: "/blog", blurb: "Migration playbooks, fan-CRM tactics, AI pricing studies — for Indian event organizers." },
  { label: "How Hoizr works", href: "/how-it-works", blurb: "Quick onboarding, same-day verification, and the operating flow from signup to a sold-out night." },
  { label: "Help center", href: "/help", blurb: "Support routes, dashboard basics, launch-day checks, and weekend escalation." },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about", blurb: "Why Hoizr exists and who is building it." },
  { label: "Contact", href: "/contact", blurb: "Talk to the team about events, venues, partnerships, or support." },
];

const NAV_BLOG_CARDS = [
  {
    title: "On-sale day without panic",
    href: "/blog/on-sale-day-playbook-indian-event-hosts",
    image: "/images/playbooks/Backstage-atmosphere-at-a-live-event.png",
  },
  {
    title: "Door ops that keep the line moving",
    href: "/blog/door-ops-playbook-for-indian-club-nights",
    image: "/images/playbooks/Nightclub-entrance-with-wristband-check.png",
  },
];

const EASE = [0.2, 0.6, 0.2, 1] as const;

export const MarketingNav = () => {
  const [open, setOpen] = useState<OpenMenu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const lastHoverOpenAt = useRef(0);
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const { open: openWaitlist } = useWaitlist();

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const closeNow = useCallback(() => {
    clearCloseTimer();
    setOpen(null);
  }, [clearCloseTimer]);

  const openMenu = (which: Exclude<OpenMenu, null>, fromHover = false) => {
    if (fromHover) lastHoverOpenAt.current = Date.now();
    clearCloseTimer();
    setOpen(which);
  };

  const toggleMenu = (which: Exclude<OpenMenu, null>) => {
    clearCloseTimer();
    const justOpenedByHover = Date.now() - lastHoverOpenAt.current < 160;
    setOpen((current) =>
      current === which && !justOpenedByHover ? null : which
    );
  };

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setOpen(null);
      closeTimer.current = null;
    }, 110);
  }, [clearCloseTimer]);

  // Close on route change (clicking a menu link navigates and we want the
  // menu to dismiss immediately rather than linger over the new page).
  useEffect(() => {
    closeNow();
    setMobileOpen(false);
  }, [pathname, closeNow]);

  // Escape key closes.
  useEffect(() => {
    if (!open && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeNow();
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, mobileOpen, closeNow]);

  // Click outside the entire nav closes the dropdown. Pointerdown
  // catches the press before Link navigation kicks in.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (target && navRef.current && !navRef.current.contains(target)) {
        closeNow();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, closeNow]);

  // Body scroll lock for mobile menu.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className="hm-nav"
      ref={navRef}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-5 px-6 py-3 md:py-2.5">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Link
            href="/"
            className="hoizr-mark text-[22px] tracking-[0.06em] text-[var(--m-ink-1)]"
            onClick={closeNow}
          >
            HOIZR
          </Link>
        </motion.div>

        <nav className="hidden lg:flex items-center gap-1 lg:ml-10 xl:ml-16">
          <div
            onMouseEnter={() => openMenu("products", true)}
            className="relative"
          >
            <button
              type="button"
              onClick={() => toggleMenu("products")}
              aria-expanded={open === "products"}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-medium text-[var(--m-ink-2)] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
            >
              Products
              <motion.span
                animate={{ rotate: open === "products" ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="inline-flex"
              >
                <ChevronDown size={14} />
              </motion.span>
            </button>
          </div>

          <Link
            href="https://hoizr.com"
            onClick={closeNow}
            onMouseEnter={closeNow}
            className="rounded-full px-3.5 py-2 text-[14px] font-medium text-[var(--m-ink-2)] hover:bg-[rgba(0,0,0,0.05)]"
          >
            Find Event
          </Link>

          <Link
            href="/pricing"
            onClick={closeNow}
            onMouseEnter={closeNow}
            className="rounded-full px-3.5 py-2 text-[14px] font-medium text-[var(--m-ink-2)] hover:bg-[rgba(0,0,0,0.05)]"
          >
            Pricing
          </Link>

          <div
            onMouseEnter={() => openMenu("company", true)}
            className="relative"
          >
            <button
              type="button"
              onClick={() => toggleMenu("company")}
              aria-expanded={open === "company"}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-medium text-[var(--m-ink-2)] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
            >
              Company
              <motion.span
                animate={{ rotate: open === "company" ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="inline-flex"
              >
                <ChevronDown size={14} />
              </motion.span>
            </button>
          </div>

          <div
            onMouseEnter={() => openMenu("resources", true)}
            className="relative"
          >
            <button
              type="button"
              onClick={() => toggleMenu("resources")}
              aria-expanded={open === "resources"}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-medium text-[var(--m-ink-2)] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
            >
              Resources
              <motion.span
                animate={{ rotate: open === "resources" ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="inline-flex"
              >
                <ChevronDown size={14} />
              </motion.span>
            </button>
          </div>
        </nav>

        {/* Pre-launch: login/signup entry points are hidden while the
            dashboard is closed to the public. The single CTA opens the
            waitlist modal. Restore the commented Link components below
            when the dashboard reopens. */}
        {/*
        <div className="hidden lg:flex items-center gap-2">
          <Link
            href="/login"
            onClick={closeNow}
            onMouseEnter={closeNow}
            className="rounded-full px-3.5 py-2 text-[14px] font-medium text-[var(--m-ink-2)] hover:bg-[rgba(0,0,0,0.05)]"
          >
            Login
          </Link>
          <Link
            href="/signup"
            onClick={closeNow}
            onMouseEnter={closeNow}
            className="hm-btn hm-btn-primary text-[14px] py-2.5 px-4"
          >
            Get my event rate
          </Link>
        </div>
        */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              closeNow();
              openWaitlist("nav");
            }}
            onMouseEnter={closeNow}
            className="hm-btn hm-btn-primary text-[14px] py-2.5 px-4"
          >
            Join the waitlist
          </button>
        </div>

        <button
          type="button"
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(0,0,0,0.05)]"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop mega menus */}
      <AnimatePresence>
        {open === "products" && (
          <motion.div
            key="products-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute left-0 right-0 top-full"
          >
            <div className="mx-auto max-w-[1320px] px-6 pb-6">
              <div className="rounded-[28px] border border-[var(--m-border)] bg-[var(--m-surface-elevated)] shadow-[var(--m-shadow-pop)] p-6">
                <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.04 } },
                    }}
                    className="grid grid-cols-2 gap-x-9 gap-y-6 xl:grid-cols-4"
                  >
                    {MARKETING_PILLARS.map((pillar) => (
                      <motion.div
                        key={pillar.id}
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE } },
                        }}
                      >
                        <div className="hm-eyebrow mb-3">{pillar.label}</div>
                        <ul className="space-y-1.5">
                          {pillar.products.map((p) => (
                            <li key={p.slug}>
                              <Link
                                href={`/product/${p.slug}`}
                                onClick={closeNow}
                                className="block rounded-xl px-3 py-2.5 -mx-3 transition-colors hover:bg-[var(--m-canvas-2)]"
                              >
                                <div className="text-[14px] font-semibold text-[var(--m-ink-1)]">
                                  {p.label}
                                </div>
                                <div className="mt-0.5 text-[12.5px] leading-snug text-[var(--m-ink-3)]">
                                  {p.blurb}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.34, ease: EASE, delay: 0.08 }}
                    className="grid gap-4 border-l border-[var(--m-border)] pl-6"
                  >
                    {NAV_BLOG_CARDS.map((card) => (
                      <Link
                        key={card.href}
                        href={card.href}
                        onClick={closeNow}
                        className="group relative min-h-[154px] overflow-hidden rounded-[18px] bg-[#111] text-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={card.image}
                          alt=""
                          aria-hidden
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          draggable={false}
                        />
                        <span
                          aria-hidden
                          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.76))]"
                        />
                        <span className="relative flex h-full min-h-[154px] flex-col justify-end p-5">
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                            Playbook
                          </span>
                          <span className="mt-2 text-[22px] font-semibold leading-[1.05] tracking-[-0.02em]">
                            {card.title}
                          </span>
                          <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--m-acid)]">
                            Read
                            <ArrowUpRight
                              size={13}
                              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                          </span>
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                </div>
                <div className="mt-5 border-t border-[var(--m-border)] pt-4 flex items-center justify-between text-[13px] text-[var(--m-ink-3)]">
                  <span>Built for India. Engineered for live music.</span>
                  {/* Pre-launch: hidden signup CTA replaced by waitlist trigger.
                      <Link href="/signup" onClick={closeNow} className="font-semibold text-[var(--m-forest-700)] hover:underline">
                        Get your event rate →
                      </Link>
                  */}
                  <button
                    type="button"
                    onClick={() => {
                      closeNow();
                      openWaitlist("nav-mega");
                    }}
                    className="font-semibold text-[var(--m-forest-700)] hover:underline"
                  >
                    Join the waitlist →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {open === "company" && (
          <motion.div
            key="company-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute left-1/2 top-full -translate-x-1/2"
          >
            <div className="mx-auto w-[620px] px-6 pb-6">
              <div className="rounded-[24px] border border-[var(--m-border)] bg-[var(--m-surface-elevated)] p-4 shadow-[var(--m-shadow-pop)]">
                <ul className="grid grid-cols-2 gap-1">
                  {COMPANY_LINKS.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, ease: EASE, delay: i * 0.025 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeNow}
                        className="block rounded-xl p-3 transition-colors hover:bg-[var(--m-canvas-2)]"
                      >
                        <div className="text-[14px] font-semibold text-[var(--m-ink-1)]">
                          {item.label}
                        </div>
                        <div className="mt-0.5 text-[12.5px] leading-snug text-[var(--m-ink-3)]">
                          {item.blurb}
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {open === "resources" && (
          <motion.div
            key="resources-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute left-1/2 -translate-x-1/2 top-full"
          >
            <div className="mt-0 mx-auto w-[560px] px-6 pb-6">
              <div className="rounded-[24px] border border-[var(--m-border)] bg-[var(--m-surface-elevated)] shadow-[var(--m-shadow-pop)] p-4">
                <ul className="space-y-1">
                  {RESOURCE_LINKS.map((r, i) => (
                    <motion.li
                      key={r.href}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.28, ease: EASE, delay: i * 0.04 }}
                    >
                      <Link
                        href={r.href}
                        onClick={closeNow}
                        className="block rounded-xl p-3 transition-colors hover:bg-[var(--m-canvas-2)]"
                      >
                        <div className="text-[14px] font-semibold text-[var(--m-ink-1)]">{r.label}</div>
                        <div className="mt-0.5 text-[12.5px] text-[var(--m-ink-3)]">{r.blurb}</div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile slide-down */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[var(--m-canvas)] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--m-border)]">
              <Link href="/" onClick={() => setMobileOpen(false)} className="hoizr-mark text-[22px] tracking-[0.06em]">
                HOIZR
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(0,0,0,0.05)]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-6 space-y-8">
              {MARKETING_PILLARS.map((pillar, p) => (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.34, ease: EASE, delay: 0.05 + p * 0.04 }}
                >
                  <div className="hm-eyebrow mb-3">{pillar.label}</div>
                  <ul className="space-y-1">
                    {pillar.products.map((prod) => (
                      <li key={prod.slug}>
                        <Link
                          href={`/product/${prod.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-xl px-3 py-2.5 -mx-3 text-[15px] font-medium text-[var(--m-ink-1)] hover:bg-[var(--m-canvas-2)]"
                        >
                          {prod.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
              <div className="pt-4 border-t border-[var(--m-border)] grid gap-1">
                <Link onClick={() => setMobileOpen(false)} href="https://hoizr.com" className="rounded-xl px-3 py-2.5 -mx-3 text-[15px] font-medium hover:bg-[var(--m-canvas-2)]">
                  Find Event
                </Link>
                <Link onClick={() => setMobileOpen(false)} href="/pricing" className="rounded-xl px-3 py-2.5 -mx-3 text-[15px] font-medium hover:bg-[var(--m-canvas-2)]">
                  Pricing
                </Link>
                <Link onClick={() => setMobileOpen(false)} href="/about" className="rounded-xl px-3 py-2.5 -mx-3 text-[15px] font-medium hover:bg-[var(--m-canvas-2)]">
                  About
                </Link>
                <Link onClick={() => setMobileOpen(false)} href="/contact" className="rounded-xl px-3 py-2.5 -mx-3 text-[15px] font-medium hover:bg-[var(--m-canvas-2)]">
                  Contact
                </Link>
                <Link onClick={() => setMobileOpen(false)} href="/how-it-works" className="rounded-xl px-3 py-2.5 -mx-3 text-[15px] font-medium hover:bg-[var(--m-canvas-2)]">
                  How it works
                </Link>
                <Link onClick={() => setMobileOpen(false)} href="/resources" className="rounded-xl px-3 py-2.5 -mx-3 text-[15px] font-medium hover:bg-[var(--m-canvas-2)]">
                  Resources
                </Link>
                <Link onClick={() => setMobileOpen(false)} href="/blog" className="rounded-xl px-3 py-2.5 -mx-3 text-[15px] font-medium hover:bg-[var(--m-canvas-2)]">
                  Blog
                </Link>
                {/* Pre-launch: login link hidden until dashboard reopens.
                <Link onClick={() => setMobileOpen(false)} href="/login" className="rounded-xl px-3 py-2.5 -mx-3 text-[15px] font-medium hover:bg-[var(--m-canvas-2)]">
                  Login
                </Link>
                */}
              </div>
              {/* Pre-launch: signup CTA hidden; replaced with waitlist trigger.
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="hm-btn hm-btn-primary w-full"
              >
                Get my event rate
              </Link>
              */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openWaitlist("nav-mobile");
                }}
                className="hm-btn hm-btn-primary w-full"
              >
                Join the waitlist
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
