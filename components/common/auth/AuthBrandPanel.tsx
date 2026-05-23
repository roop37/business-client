"use client";

import AuthLogo from "@/components/common/auth/AuthLogo";
import {
  BarChart3,
  Bot,
  Megaphone,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type AuthStory = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const AUTH_STORIES: AuthStory[] = [
  {
    icon: TrendingDown,
    title: "Lowest commission in India.",
    body: "Get a single per-event ticket commission with no convenience fees. We will match or beat verified Indian competitors.",
  },
  {
    icon: Megaphone,
    title: "Marketing built for better nights.",
    body: "Run campaigns against your customer base, bring collaborators in, and turn every event into its own sales channel.",
  },
  {
    icon: BarChart3,
    title: "Tracking that explains revenue.",
    body: "Study sales, audiences, campaigns, and payouts from one owner-grade dashboard before you make the next call.",
  },
  {
    icon: Bot,
    title: "Claude AI in your workflow.",
    body: "Smarter guidance for event setup, copy, and campaign decisions — without adding manual work to the team.",
  },
];

const AuthBrandPanel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStory = AUTH_STORIES[activeIndex];
  const ActiveIcon = activeStory.icon;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % AUTH_STORIES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <aside className="relative hidden h-screen overflow-hidden bg-[var(--owner-bg-subtle)] px-8 py-10 text-[var(--owner-fg-1)] lg:flex lg:flex-col xl:px-12">
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[480px] flex-col">
        {/* Brand mark — top, centered, dark on light panel. */}
        <div className="pt-2 text-center">
          <Link
            href="/"
            aria-label="Go to Hoizr landing page"
            className="inline-flex justify-center"
          >
            <AuthLogo width={148} />
          </Link>
        </div>

        {/* Story copy now lives inside the visual panel so the right
            column reads as one taller brand image instead of two blocks. */}
        <div className="mt-7 flex min-h-0 flex-1 items-stretch pb-2">
          <div className="relative flex min-h-[560px] w-full overflow-hidden rounded-[32px] border border-white/20 bg-black shadow-[0_22px_54px_rgba(15,15,15,0.14)] xl:min-h-[660px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/brand/metallic-line-portrait.png"
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.74)_0%,rgba(0,0,0,0.34)_42%,rgba(0,0,0,0.78)_100%)]"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_50%_0%,rgba(214,255,63,0.32),transparent_65%)]"
            />

            <div className="relative z-10 flex h-full w-full flex-col justify-between p-7 text-white xl:p-9">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/18 bg-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.22)] backdrop-blur">
                <ActiveIcon size={21} strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="max-w-[360px] text-[30px] font-semibold leading-[1.04] tracking-[-0.024em] text-white xl:text-[34px]">
                  {activeStory.title}
                </h2>
                <p className="mt-4 max-w-[360px] text-[15px] leading-6 text-white/78">
                  {activeStory.body}
                </p>

                <div className="mt-7 flex gap-2">
                  {AUTH_STORIES.map((story, index) => (
                    <button
                      key={story.title}
                      type="button"
                      aria-label={`Show ${story.title}`}
                      onClick={() => setActiveIndex(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeIndex === index
                          ? "w-8 bg-[#d6ff3f]"
                          : "w-1.5 bg-white/42"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AuthBrandPanel;
