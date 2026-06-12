"use client";

import { useState } from "react";
import WhatsAppCampaigns from "./WhatsAppCampaigns";
import WhatsAppTemplatesManager from "./WhatsAppTemplatesManager";

type Tab = "campaigns" | "templates";

/**
 * WhatsApp section shell: top-level tabs separating Campaigns (the sends) from
 * Templates (the message library hosts author/request). Campaigns pick from
 * approved templates; authoring lives here under Templates.
 */
const WhatsAppSection = () => {
  const [tab, setTab] = useState<Tab>("campaigns");

  return (
    <div className="flex flex-col gap-4 font-owner">
      <div className="flex items-center gap-1 border-b border-owner-border">
        {(
          [
            { id: "campaigns", label: "Campaigns" },
            { id: "templates", label: "Templates" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? "border-b-2 border-owner-blue-500 px-3 pb-2 text-[13px] font-semibold text-owner-blue-500"
                : "px-3 pb-2 text-[13px] text-owner-fg-3 hover:text-owner-fg-1"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "campaigns" ? <WhatsAppCampaigns /> : <WhatsAppTemplatesManager />}
    </div>
  );
};

export default WhatsAppSection;
