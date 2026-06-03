"use client";

import ReusableModal from "@/components/common/modal/modal";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import useGlobalStore from "@/store/global";
import {
  Bell,
  Coins,
  Instagram,
  Mail,
  MessageCircle,
  MessageSquare,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Channel = {
  id: "email" | "push" | "whatsapp" | "sms" | "instagram" | "meta";
  label: string;
  description: string;
  Icon: LucideIcon;
  available: boolean;
};

const CHANNELS: Channel[] = [
  {
    id: "email",
    label: "Email",
    description: "Send a designed email to your audience.",
    Icon: Mail,
    available: true,
  },
  {
    id: "push",
    label: "Push",
    description: "Mobile + web push to your customer base.",
    Icon: Bell,
    available: false,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "1:1 broadcasts via your WhatsApp Business number.",
    Icon: MessageCircle,
    available: false,
  },
  {
    id: "sms",
    label: "SMS",
    description: "Short, high-deliverability SMS to verified phones.",
    Icon: MessageSquare,
    available: false,
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Auto-post the event flyer + caption to your handle.",
    Icon: Instagram,
    available: false,
  },
  {
    id: "meta",
    label: "Meta Ads",
    description: "Boost the event flyer as a paid ad with Meta.",
    Icon: Sparkles,
    available: false,
  },
];

const inrFormat = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const RunCampaignModal = () => {
  const router = useRouter();
  const {
    runCampaignModalEvent,
    closeRunCampaignModal,
    openTopUpModal,
    setToastData,
  } = useGlobalStore();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!runCampaignModalEvent) return;
    let cancelled = false;
    setLoading(true);
    sdk
      .myMarketingCreditLedger({
        pagination: { pageNumber: 1, rowsPerPage: "ONE" as any },
      })
      .then((res) => {
        if (cancelled) return;
        const next = res?.myMarketingCreditLedger?.balance;
        setBalance(typeof next === "number" ? next : Number(next ?? 0));
      })
      .catch(() => {
        // Best-effort — the modal still works without a balance.
        if (!cancelled) setBalance(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [runCampaignModalEvent]);

  const handleChannel = (channel: Channel) => {
    if (!runCampaignModalEvent) return;
    if (!channel.available) {
      setToastData({
        type: "warning",
        message: `${channel.label} campaigns are coming soon.`,
      });
      return;
    }
    if (channel.id === "email") {
      const { eventId, title } = runCampaignModalEvent;
      const params = new URLSearchParams({
        eventId,
        title,
      });
      closeRunCampaignModal();
      router.push(`/campaigns/onboarding/template-select?${params.toString()}`);
    }
  };

  return (
    <ReusableModal
      isOpen={Boolean(runCampaignModalEvent)}
      onClose={closeRunCampaignModal}
      title="Run a campaign"
      width="ml"
    >
      <p className="mb-4 text-[12.5px] text-owner-fg-3">
        For{" "}
        <span className="font-medium text-owner-fg-1">
          {runCampaignModalEvent?.title || "Untitled event"}
        </span>
      </p>

      <div className="mb-5 flex items-center justify-between gap-3 rounded-owner-md border border-owner-border bg-owner-bg-subtle px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
            <Coins size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-owner-fg-3">
              Marketing credit
            </p>
            <p className="text-[15px] font-semibold tabular-nums text-owner-fg-1">
              {loading
                ? "…"
                : balance === null
                  ? "Unknown"
                  : inrFormat(balance)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openTopUpModal()}
          className="owner-btn owner-btn--secondary owner-btn--sm"
        >
          <Plus size={14} />
          Buy credit
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CHANNELS.map((channel) => {
          const disabled = !channel.available;
          return (
            <button
              key={channel.id}
              type="button"
              onClick={() => handleChannel(channel)}
              disabled={disabled && false /* keep clickable so we toast */}
              className={`group relative flex items-start gap-3 rounded-owner-md border bg-owner-bg p-3 text-left transition ${
                channel.available
                  ? "border-owner-border hover:-translate-y-0.5 hover:border-owner-blue-200 hover:shadow-sm"
                  : "cursor-not-allowed border-dashed border-owner-border opacity-70 hover:border-owner-border"
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-owner-md ${
                  channel.available
                    ? "bg-owner-blue-050 text-owner-blue-500"
                    : "bg-owner-bg-subtle text-owner-fg-3"
                }`}
              >
                <channel.Icon size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold text-owner-fg-1">
                    {channel.label}
                  </span>
                  {!channel.available ? (
                    <span className="rounded-full bg-owner-bg-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-owner-fg-3">
                      Soon
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[12.5px] leading-5 text-owner-fg-3">
                  {channel.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ReusableModal>
  );
};

export default RunCampaignModal;
