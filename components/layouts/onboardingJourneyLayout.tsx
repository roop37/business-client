import useGlobalStore from "@/store/global";
import useMasterStore from "@/store/masters";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  LogOutIcon,
  PinIcon,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect } from "react";

type Props = {
  children: ReactNode;
  includeTimezones?: boolean;
};

const steps = [
  {
    title: "Host Details",
    step: "1/3",
    route: "/onboarding-host/host-type",
    slug: "host-type",
    Icon: UserRound,
  },
  {
    title: "Location",
    step: "2/3",
    route: "/onboarding-host/host-address",
    slug: "host-address",
    Icon: PinIcon,
  },
  {
    title: "Additional Details",
    step: "3/3",
    route: "/onboarding-host/host-additional-info",
    slug: "host-additional-info",
    Icon: ClipboardList,
  },
];

const OnboardingJourneyLayout = ({ children, includeTimezones }: Props) => {
  const router = useRouter();
  const activeSlug = router.query.onBoardingRoute?.toString() ?? "";
  const { setToastData } = useGlobalStore();
  const { setMasterStates, setMasterTimezones } = useMasterStore();
  const normalizedActiveSlug =
    activeSlug === "host-basic-info" ? "host-type" : activeSlug;
  const activeIndex = Math.max(
    steps.findIndex((step) => step.slug === normalizedActiveSlug),
    0
  );

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
                (timeZone: { gmtOffset: number; value: string; _id: string }) => ({
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
    // Lock the page to the viewport height so the form's own scroll
    // container handles overflow. Without this the outer wrapper grew
    // beyond the viewport, the whole page scrolled, and the sticky
    // bottom "Continue" bar disappeared below the fold.
    <div className="hoizr-onboarding-bg h-[100dvh] overflow-hidden text-[var(--owner-fg-1)]">
      <div className="relative z-10 mx-auto flex h-[100dvh] w-full max-w-[1040px] flex-col px-4 py-4 md:px-5">
        <header className="flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="font-serif text-3xl tracking-tight text-[var(--owner-fg-1)]"
          >
            HOIZR
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--owner-blue-500)]"
          >
            <LogOutIcon size={16} />
            Log Out
          </button>
        </header>

        <nav className="mt-4 shrink-0 rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg)]/95 p-2.5 shadow-[0_12px_30px_rgba(56,45,34,0.06)]">
          <div className="grid gap-2 md:grid-cols-3">
            {steps.map(({ title, step, route, slug, Icon }, index) => {
              const active = normalizedActiveSlug === slug;
              const complete = index < activeIndex;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => router.push(route)}
                  className={`flex min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                    active
                      ? "bg-[var(--owner-blue-500)] text-[var(--owner-bg)] shadow-[0_10px_20px_rgba(154,76,38,0.20)]"
                      : complete
                      ? "bg-[var(--owner-blue-050)] text-[var(--owner-blue-500)]"
                      : "text-[var(--owner-fg-3)] hover:bg-[var(--owner-bg-subtle)]"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                      active ? "bg-white/20" : "bg-[var(--owner-blue-050)]"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-medium">
                      Step {step}
                    </span>
                    <span className="block truncate text-sm font-semibold">
                      {title}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <main className="flex min-h-0 flex-1 items-stretch justify-center overflow-hidden py-4">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </main>

        <footer className="mb-1 flex shrink-0 flex-col gap-3 rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg)]/92 px-5 py-3 text-sm shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="font-serif text-xl text-[var(--owner-fg-1)]">HOIZR</div>
          <div className="flex flex-col items-start gap-2 text-sm md:items-end">
            <Link
              className="text-[var(--owner-blue-500)] hover:underline"
              href="mailto:support@hoizr.com"
            >
              Need Help? <span className="text-[var(--owner-fg-1)]">support@hoizr.com</span>
            </Link>
            <div className="flex gap-3">
              <Link
                className="text-[var(--owner-blue-500)] hover:underline"
                href="https://www.hoizr.com/terms-conditions"
                target="_blank"
              >
                Terms and Conditions
              </Link>
              <Link
                className="text-[var(--owner-blue-500)] hover:underline"
                href="https://www.hoizr.com/privacy-policy"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default OnboardingJourneyLayout;
