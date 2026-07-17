import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const BASE = "/org-settings/developers";
const TABS = [
  { label: "API keys", href: BASE },
  { label: "Webhooks", href: `${BASE}/webhooks` },
  { label: "Whitelabel", href: `${BASE}/whitelabel` },
];

export const DevelopersTabs: React.FC = () => {
  const { pathname } = useRouter();
  return (
    <div className="mb-6 flex gap-1 border-b border-owner-border">
      {TABS.map((t) => {
        const active =
          t.href === BASE ? pathname === BASE : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "border-owner-primary text-owner-fg-1"
                : "border-transparent text-owner-fg-3 hover:text-owner-fg-1"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
};

export default DevelopersTabs;
