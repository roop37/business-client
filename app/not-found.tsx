"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-base text-muted-foreground">
        We couldn&apos;t find that page.
      </p>
      <Link
        href="/dashboard"
        className="mt-4 rounded-lg bg-dark px-4 py-2 text-sm font-semibold text-cream"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
