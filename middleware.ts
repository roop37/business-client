import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Demo-mode "auth": there is no login. Every request is treated as an
 * authenticated demo host so the SSR auth gates (which look for an
 * `accessToken` cookie and call the mocked `meUser` query) always pass.
 * Sign-in / sign-up / blocker screens simply redirect into the dashboard.
 */
const AUTH_ROUTES = new Set([
  "/login",
  "/signup",
  "/select-host",
  "/account/blocked",
  "/account/access-blocked",
  "/account/verification-pending",
  "/account/payment-pending",
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (AUTH_ROUTES.has(pathname) || pathname.startsWith("/blocker/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const headers = new Headers(req.headers);
  const existing = headers.get("cookie") ?? "";
  if (!/(^|;\s*)accessToken=/.test(existing)) {
    headers.set("cookie", `${existing}${existing ? "; " : ""}accessToken=demo-access-token`);
  }
  const res = NextResponse.next({ request: { headers } });
  if (!req.cookies.get("accessToken")) {
    res.cookies.set("accessToken", "demo-access-token", { path: "/", sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|demo/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|woff2?|ttf|txt|xml|json)$).*)"],
};
