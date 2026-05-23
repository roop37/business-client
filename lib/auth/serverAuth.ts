import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import { UserStatus } from "@/generated/graphql";
import { sdk } from "@/utils/graphqlClient";

/**
 * `redirect()` from `next/navigation` signals the framework by
 * throwing a special `NEXT_REDIRECT` error. A blanket `catch` around
 * the call therefore swallows the redirect — the user lands back on
 * the original page with no navigation. Always rethrow if the thrown
 * value is a redirect signal so Next can do its job.
 *
 * The previous version of this file wrapped `redirect("/dashboard")`
 * in a try/catch meant only for GraphQL failures; it accidentally ate
 * the redirect signal too, which is why multi-host users were stuck
 * looping on /login even with valid cookies.
 */
const isFrameworkRedirect = (error: unknown): boolean => {
  // Next 14 exposes isRedirectError; fall back to a string-match in
  // case the internal path changes between minor versions.
  try {
    if (isRedirectError(error)) return true;
  } catch {
    // ignore — fall through to the message check
  }
  const message = (error as { message?: string })?.message ?? "";
  return message === "NEXT_REDIRECT";
};

/**
 * Shared App-Router helper: if the request carries a valid accessToken
 * cookie AND the user is authenticated server-side, send them to
 * `to`. Used by /login, /signup, and any other "you should not be
 * here when logged in" route.
 *
 * Returns the cookie string for re-use; callers can ignore it.
 */
export const redirectIfAuthenticated = async (
  to: string = "/dashboard"
): Promise<string> => {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieStore.get("accessToken")?.value) return cookieHeader;
  try {
    const response = await sdk.MeCheckUser({}, { cookie: cookieHeader });
    if (response?.meUser) {
      if (response.meUser.status === UserStatus.Blocked) {
        redirect("/account/blocked");
      }
      redirect(to);
    }
  } catch (error) {
    if (isFrameworkRedirect(error)) {
      // Real redirect — let Next.js see it.
      throw error;
    }
    // Auth call failed (network, GraphQL error, etc.) — treat as
    // unauthenticated and fall through to render the page.
  }
  return cookieHeader;
};

/**
 * For pages that REQUIRE a logged-in user. If no valid session is
 * found server-side, send the visitor to the marketing landing (/)
 * with the originally-requested path preserved as `?next=...` so the
 * landing's Login button can route them back after sign-in.
 *
 * This replaces the prior behaviour of bouncing straight to /login —
 * unauthenticated visitors hitting the bare domain should see the
 * brand story first, not a login form.
 */
const unauthRedirect = (currentPath: string): never => {
  redirect(`/?next=${encodeURIComponent(currentPath)}`);
};

export const requireAuthenticatedServer = async (
  currentPath: string
): Promise<void> => {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieStore.get("accessToken")?.value) {
    unauthRedirect(currentPath);
  }
  try {
    const response = await sdk.MeCheckUser({}, { cookie: cookieHeader });
    if (!response?.meUser) {
      unauthRedirect(currentPath);
    }
  } catch (error) {
    if (isFrameworkRedirect(error)) {
      throw error;
    }
    unauthRedirect(currentPath);
  }
};
