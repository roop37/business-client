"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {error?.message ?? "Unexpected error"}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-dark px-4 py-2 text-sm font-semibold text-cream"
      >
        Try again
      </button>
    </div>
  );
}
