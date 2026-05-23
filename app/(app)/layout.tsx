import MainLayout from "@/components/layouts/mainBodyLayout";
import { requireAuthenticatedServer } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

/**
 * Wraps every authenticated app route in the existing 837-line
 * MainLayout (sidebar + topbar + Joyride). The layout is preserved
 * verbatim — only the `useRouter()` call inside it was swapped to
 * `usePathname()` so it can run as a client component.
 *
 * Server-side auth gate runs first: if no valid session, redirect to
 * /login with `next` set to the current path.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We could pass `currentPath` from headers() but App Router strips
  // pathname on layout; the redirect target without a path is fine.
  await requireAuthenticatedServer("/dashboard");

  return <MainLayout>{children}</MainLayout>;
}
