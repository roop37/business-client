"use client";

import { DEMO_STORAGE_KEY } from "@/utils/demo/db";

const REPO_URL = "https://github.com/roop37/business-client";
const CONTACT = "hoizr.tech@gmail.com";

/**
 * Slim announcement bar shown on every page of the demo deployment.
 * Mounted from app/layout.tsx and pages/_app.tsx.
 */
export const DemoBanner = () => {
  const reset = () => {
    try {
      window.localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  return (
    <div
      role="region"
      aria-label="Demo notice"
      className="demo-banner relative z-[80] flex w-full items-center justify-center gap-2 bg-[#191C24] px-3 text-[11px] sm:text-[12px] leading-none text-white"
      style={{ height: "var(--demo-banner-h, 32px)" }}
    >
      <span className="shrink-0 rounded bg-amber-400 px-1.5 py-[3px] text-[10px] font-bold uppercase tracking-wider text-[#191C24]">
        Demo mode
      </span>
      <span className="min-w-0 truncate">
        <span className="hidden sm:inline">
          Hoizr is sunset and open-sourced — you&apos;re exploring sample data.{" "}
        </span>
        <span className="sm:hidden">Sunset &amp; open-source · </span>
        <span className="hidden sm:inline">Need help? Contact </span>
        <a className="font-semibold underline underline-offset-2" href={`mailto:${CONTACT}`}>
          {CONTACT}
        </a>
      </span>
      <a
        className="hidden shrink-0 rounded border border-white/30 px-2 py-1 text-[11px] hover:bg-white/10 md:inline"
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
      >
        Source ↗
      </a>
      <button
        type="button"
        onClick={reset}
        className="hidden shrink-0 rounded border border-white/30 px-2 py-1 text-[11px] hover:bg-white/10 md:inline"
      >
        Reset demo
      </button>
    </div>
  );
};

export default DemoBanner;
