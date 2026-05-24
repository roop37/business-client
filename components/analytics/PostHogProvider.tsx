"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as RawPostHogProvider } from "posthog-js/react";
import { Suspense, useEffect, type ReactNode } from "react";

/**
 * PostHog wiring for business-client.
 *
 * - Reads the key + host from `NEXT_PUBLIC_POSTHOG_KEY` /
 *   `NEXT_PUBLIC_POSTHOG_HOST` so the token isn't hard-coded.
 * - Initialises once on the client; SSR skipped.
 * - `person_profiles: "identified_only"` — anonymous waitlist visitors
 *   don't burn profile quota; we'll `posthog.identify(...)` when a
 *   host logs into the dashboard later.
 * - Manual `$pageview` capture on every App Router route change
 *   (App Router doesn't emit the legacy `routeChangeComplete`).
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (typeof window !== "undefined" && POSTHOG_KEY && !posthog.__loaded) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: "2026-01-30",
    person_profiles: "identified_only",
    capture_pageview: false,
  });
}

const PostHogPageView = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || typeof window === "undefined" || !POSTHOG_KEY) return;
    const search = searchParams?.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    posthog.capture("$pageview", {
      $current_url: window.location.origin + url,
    });
  }, [pathname, searchParams]);

  return null;
};

export const PostHogAnalytics = ({ children }: { children: ReactNode }) => {
  if (!POSTHOG_KEY) return <>{children}</>;
  return (
    <RawPostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </RawPostHogProvider>
  );
};
