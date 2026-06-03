"use client";

import { HOST_TIPS, HostTip } from "@/lib/hostTips";
import { Lightbulb, MapPin, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

const ICONS: Record<HostTip["category"], typeof Lightbulb> = {
  city: MapPin,
  sales: TrendingUp,
  platform: Sparkles,
};

const LABELS: Record<HostTip["category"], string> = {
  city: "City insight",
  sales: "Sales tip",
  platform: "Hoizr tip",
};

const ROTATE_INTERVAL_MS = 9000;

/**
 * Rotates through curated tips (city sales hacks for top Indian metros +
 * Hoizr platform usage hints). Fixed in position; only the inner card
 * cross-fades between entries.
 */
const RotatingTipsPanel = ({ className = "" }: { className?: string }) => {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((current) => (current + 1) % HOST_TIPS.length);
        setFading(false);
      }, 350);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const tip = HOST_TIPS[index];
  const Icon = ICONS[tip.category];

  return (
    <div
      className={`rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4 ${className}`}
    >
      <div
        className={`transition-opacity duration-300 ${
          fading ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--owner-blue-500)]">
          <Icon size={13} />
          {LABELS[tip.category]}
        </div>
        <p className="mt-2 text-[13px] font-semibold leading-snug text-[var(--owner-fg-1)]">
          {tip.title}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-[var(--owner-fg-3)]">
          {tip.body}
        </p>
      </div>
      <div className="mt-3 flex gap-1">
        {HOST_TIPS.map((_, i) => (
          <span
            key={i}
            className={`h-0.5 flex-1 rounded-full transition ${
              i === index
                ? "bg-[var(--owner-blue-500)]"
                : "bg-[var(--owner-border)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default RotatingTipsPanel;
