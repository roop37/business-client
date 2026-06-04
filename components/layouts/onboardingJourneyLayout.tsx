import { PreviewNoise } from "@/components/common/PreviewNoise";
import RotatingTipsPanel from "@/components/common/RotatingTipsPanel";
import useGlobalStore from "@/store/global";
import useMasterStore from "@/store/masters";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  DoorOpenIcon,
  LayoutDashboardIcon,
  MessageCircle,
  PinIcon,
  SparklesIcon,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect } from "react";

type Props = {
  children: ReactNode;
  includeTimezones?: boolean;
};

type OnboardingStep = {
  slug: string;
  title: string;
  shortLabel: string;
  route: string;
  Icon: LucideIcon;
  helper: {
    eyebrow: string;
    headline: string;
    body: string;
    tips: string[];
  };
};

const steps: OnboardingStep[] = [
  {
    slug: "host-type",
    title: "Organizer details",
    shortLabel: "Organizer details",
    route: "/onboarding-host/host-type",
    Icon: UserRound,
    helper: {
      eyebrow: "Step 1 of 3",
      headline: "Tell Hoizr who is organizing.",
      body: "Pick an organizer or venue type, set the public name, logo, and contact line so customers and Hoizr support can reach the right team.",
      tips: [
        "The name and logo will show on every event listing.",
        "Use a contact phone the day-of-event team can answer.",
        "Description is optional — a short 1–2 line intro reads best.",
      ],
    },
  },
  {
    slug: "host-address",
    title: "Operating location",
    shortLabel: "Location",
    route: "/onboarding-host/host-address",
    Icon: PinIcon,
    helper: {
      eyebrow: "Step 2 of 3",
      headline: "Pin the operating address.",
      body: "Hoizr uses the location to surface events to nearby fans, calculate GST jurisdiction, and pre-fill venue details on new events.",
      tips: [
        "Search the place once — Hoizr prefills city and pincode.",
        "Service-area organizers can pick a representative address.",
        "Coordinates stay private and are only used for discovery.",
      ],
    },
  },
  {
    slug: "host-additional-info",
    title: "Business details",
    shortLabel: "Business",
    route: "/onboarding-host/host-additional-info",
    Icon: ClipboardList,
    helper: {
      eyebrow: "Step 3 of 3",
      headline: "Last step before launch.",
      body: "Add registration and GST details so Hoizr can run settlements, generate compliant invoices, and unlock the organizer dashboard.",
      tips: [
        "GST is optional today — required only when payouts kick in.",
        "Website is optional but boosts trust on listings.",
        "All details can be updated later from Organizer Settings.",
      ],
    },
  },
];

// Numeric-only fallback; matches the +91 line printed beside Hoizr's
// other support touchpoints. Override via NEXT_PUBLIC_HOIZR_WHATSAPP.
const DEFAULT_HOIZR_WHATSAPP = "8369572945";

const OnboardingJourneyLayout = ({ children, includeTimezones }: Props) => {
  const router = useRouter();
  const activeSlug = router.query.onBoardingRoute?.toString() ?? "";
  const isAddingNewOrganizer = router.query.create?.toString() === "1";
  const whatsappNumber =
    process.env.NEXT_PUBLIC_HOIZR_WHATSAPP || DEFAULT_HOIZR_WHATSAPP;
  const whatsappHref = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;
  const { setToastData } = useGlobalStore();
  const { setMasterStates, setMasterTimezones } = useMasterStore();

  // `host-basic-info` is a legacy alias for the host-type entry; collapse
  // both into a single index so the sidebar highlights the right step.
  const normalizedActiveSlug =
    activeSlug === "host-basic-info" ? "host-type" : activeSlug;
  const activeIndex = Math.max(
    steps.findIndex((step) => step.slug === normalizedActiveSlug),
    0
  );
  const activeStep = steps[activeIndex];

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const resStates = await sdk.getActiveStates();
        if (resStates?.getActiveStates) {
          setMasterStates(
            resStates.getActiveStates.map(
              (state: { value: string; _id: string }) => ({
                value: state._id,
                label: state.value,
              })
            )
          );
        }

        if (includeTimezones) {
          const resTimeZones = await sdk.getActiveTimezones();
          if (resTimeZones?.getActiveTimezones) {
            setMasterTimezones(
              resTimeZones.getActiveTimezones.map(
                (timeZone: {
                  gmtOffset: number;
                  value: string;
                  _id: string;
                }) => ({
                  value: timeZone._id,
                  label: `${timeZone.value} (GMT${timeZone.gmtOffset / 3600})`,
                })
              )
            );
          }
        }
      } catch (error) {
        setToastData({
          type: "error",
          message: extractErrorMessage(error),
        });
      }
    };

    fetchMasters();
  }, [includeTimezones, setMasterStates, setMasterTimezones, setToastData]);

  const handleLogout = async () => {
    try {
      const response = await sdk.userLogout();
      if (response?.userLogout) {
        router.replace("/login");
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    }
  };

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[var(--owner-bg-sidebar)] text-[var(--owner-fg-1)]">
      <header className="flex min-h-[64px] shrink-0 items-center justify-between border-b border-[var(--owner-border)] bg-[var(--owner-bg-sidebar)] px-4 md:px-6">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--owner-fg-4)]">
            Organizer onboarding
          </p>
          <h1 className="truncate text-lg font-semibold tracking-tight">
            {activeStep?.title ?? "Welcome to Hoizr"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-md border border-[var(--owner-border)] bg-[var(--owner-bg)] px-3 py-1.5 text-xs font-semibold sm:inline-flex">
            Step {activeIndex + 1} / {steps.length}
          </span>
          {isAddingNewOrganizer ? (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] px-3 py-2 text-sm font-semibold text-[var(--owner-fg-1)]"
            >
              <LayoutDashboardIcon size={16} />
              Leave
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] px-3 py-2 text-sm font-semibold text-[var(--owner-fg-1)]"
          >
            <DoorOpenIcon size={16} />
            Log out
          </button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        <aside className="hidden min-h-0 border-r border-[var(--owner-border)] bg-[var(--owner-bg-sidebar)] p-4 lg:block">
          <nav className="space-y-2">
            {steps.map((step, index) => {
              const active = index === activeIndex;
              const complete = index < activeIndex;
              return (
                <button
                  key={step.slug}
                  type="button"
                  onClick={() => router.push(step.route)}
                  aria-current={active ? "step" : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-[var(--owner-fg-1)] text-[var(--owner-accent-acid)]"
                      : complete
                      ? "text-[var(--owner-fg-1)] hover:bg-[var(--owner-bg-subtle)]"
                      : "text-[var(--owner-fg-3)] hover:bg-[var(--owner-bg-subtle)]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                      active
                        ? "bg-[var(--owner-accent-acid)] text-[var(--owner-fg-1)]"
                        : "bg-[var(--owner-bg)] text-[var(--owner-fg-2)] ring-1 ring-[var(--owner-border)]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    {step.shortLabel}
                  </span>
                  <step.Icon
                    size={16}
                    className={active ? "opacity-90" : "opacity-60"}
                  />
                </button>
              );
            })}
          </nav>

          <div className="mt-6 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4 text-xs leading-5 text-[var(--owner-fg-3)]">
            <p className="font-semibold text-[var(--owner-fg-1)]">
              We&apos;d love to help you get set up.
            </p>
            <p className="mt-1">
              If anything here feels rough, reach out — we can walk you
              through it, or onboard you ourselves. Setup usually takes 4–6
              minutes, and Hoizr autosaves so you can return any time.
            </p>
            <Link
              href="mailto:contact@hoizr.com"
              className="mt-3 inline-flex font-semibold text-[var(--owner-fg-1)] underline-offset-4 hover:underline"
            >
              contact@hoizr.com →
            </Link>
            <Link
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 font-semibold text-[var(--owner-blue-500)] underline-offset-4 hover:underline"
            >
              <MessageCircle size={13} strokeWidth={2.2} />
              WhatsApp us — usually a few-minute reply
            </Link>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          {/* Mobile step chips — horizontal scrolling list matches the
              EventJourney mobile affordance. */}
          <div className="flex gap-2 overflow-x-auto border-b border-[var(--owner-border)] bg-[var(--owner-bg-sidebar)] px-4 py-3 lg:hidden">
            {steps.map((step, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={step.slug}
                  type="button"
                  onClick={() => router.push(step.route)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-[var(--owner-fg-1)] text-[var(--owner-accent-acid)]"
                      : "bg-[var(--owner-bg-subtle)] text-[var(--owner-fg-3)]"
                  }`}
                >
                  {index + 1}. {step.shortLabel}
                </button>
              );
            })}
          </div>

          <section className="min-h-0 min-w-0 flex-1 overflow-hidden p-4 md:p-6">
            <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center">
              <AnimatePresence mode="wait">{children}</AnimatePresence>
            </div>
          </section>
        </div>

        <aside className="relative hidden min-h-0 overflow-hidden border-l border-[var(--owner-border)] bg-[var(--owner-fg-1)] text-[var(--owner-bg)] xl:block">
          {/* Soft cyan/violet bloom + film grain over a dark surface —
              matches the EventJourney preview aside so onboarding +
              event-creation share one visual language. Onboarding can
              feel transactional (forms, tips, footer); the bloom gives
              the side rail a sense of place. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 60% at 50% -10%, rgba(120, 220, 255, 0.12), transparent 55%), radial-gradient(80% 50% at 110% 100%, rgba(197, 255, 61, 0.08), transparent 60%)",
            }}
          />
          <PreviewNoise opacity={0.35} patternAlpha={12} />

          <div className="relative z-10 flex h-full flex-col overflow-y-auto p-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--owner-accent-acid)] ring-1 ring-inset ring-white/15">
              <SparklesIcon size={12} />
              {activeStep?.helper.eyebrow}
            </div>
            <h2 className="mt-3 text-[22px] font-semibold leading-tight tracking-tight">
              {activeStep?.helper.headline}
            </h2>
            {activeStep?.helper.body ? (
              <p className="mt-2 text-[13px] leading-relaxed text-white/65">
                {activeStep.helper.body}
              </p>
            ) : null}

            <div className="mt-5">
              <RotatingTipsPanel className="!border-white/15 !bg-white/[0.06] [&_p]:!text-white/85 [&_.text-\\[var\\(--owner-fg-3\\)\\]]:!text-white/70 [&_.text-\\[var\\(--owner-fg-1\\)\\]]:!text-white" />
            </div>

            <div className="mt-auto" />

            <div className="mt-6 rounded-xl border border-white/12 bg-white/[0.04] p-4 text-[12px] leading-5 text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--owner-accent-acid)]/15 text-[var(--owner-accent-acid)]">
                  <SparklesIcon size={12} />
                </span>
                <p className="text-[12.5px] font-semibold text-white/90">
                  Saved as you go
                </p>
              </div>
              <p className="mt-2">
                Hoizr autosaves after each step. Close the tab and come back —
                your progress is held against this account.
              </p>
            </div>
          </div>
        </aside>
      </main>

      <footer className="hidden shrink-0 items-center justify-between border-t border-[var(--owner-border)] bg-[var(--owner-bg-sidebar)] px-6 py-3 text-xs text-[var(--owner-fg-3)] md:flex">
        <span className="font-serif text-base tracking-tight text-[var(--owner-fg-1)]">
          HOIZR
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="https://www.hoizr.com/terms-conditions"
            target="_blank"
            className="hover:text-[var(--owner-fg-1)] hover:underline"
          >
            Terms
          </Link>
          <Link
            href="https://www.hoizr.com/privacy-policy"
            target="_blank"
            className="hover:text-[var(--owner-fg-1)] hover:underline"
          >
            Privacy
          </Link>
          <Link
            href="mailto:contact@hoizr.com"
            className="hover:text-[var(--owner-fg-1)] hover:underline"
          >
            contact@hoizr.com
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingJourneyLayout;
