"use client";

import ReusableModal from "@/components/common/modal/modal";
import { CustomEmailTargetType } from "@/generated/graphql";
import { sdk } from "@/utils/graphqlClient";
import useGlobalStore from "@/store/global";
import useWhatsAppCampaignStore from "@/store/whatsappCampaignStore";
import {
  ChevronRight,
  Coins,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Channel = {
  id: "whatsapp" | "meta";
  label: string;
  description: string;
  Icon: LucideIcon;
  available: boolean;
};

const CHANNELS: Channel[] = [
  {
    id: "whatsapp",
    label: "WhatsApp campaign",
    description: "Broadcast to event buyers and opted-in customers.",
    Icon: MessageCircle,
    available: true,
  },
  {
    id: "meta",
    label: "Meta x Hoizr campaign",
    description: "Hoizr runs the Meta ad account and charges ad cost + 8%.",
    Icon: Sparkles,
    available: false,
  },
];

const inrFormat = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const RunCampaignModal = () => {
  const router = useRouter();
  const {
    runCampaignModalEvent,
    closeRunCampaignModal,
    openTopUpModal,
    setToastData,
  } = useGlobalStore();
  const hydrateWhatsAppCampaign = useWhatsAppCampaignStore((s) => s.hydrate);
  const resetWhatsAppCampaign = useWhatsAppCampaignStore((s) => s.reset);
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
    if (channel.id === "whatsapp") {
      resetWhatsAppCampaign();
      hydrateWhatsAppCampaign({
        campaignName: runCampaignModalEvent.title || "Untitled campaign",
        eventId: runCampaignModalEvent.eventId,
        targetType: CustomEmailTargetType.EventSpecific,
      });
      closeRunCampaignModal();
      router.push("/campaigns/whatsapp/onboarding/basic");
      return;
    }
    if (!channel.available) {
      setToastData({
        type: "warning",
        message:
          "Meta x Hoizr campaigns will run through Hoizr's Meta account and debit ad cost + 8%.",
      });
      return;
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

      <ul className="flex flex-col gap-2.5">
        {/* Marketing credit — first horizontal card. Clicking the whole
            row opens the top-up modal so the host can refill without
            leaving the run-campaign flow. */}
        <li>
          <button
            type="button"
            onClick={() => openTopUpModal()}
            className="group flex w-full items-center gap-3 rounded-owner-md border border-owner-border bg-owner-bg-subtle px-4 py-3 text-left transition hover:border-owner-blue-200 hover:bg-owner-bg"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
              <Coins size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-owner-fg-3">
                Marketing credit
              </p>
              <p className="text-[15.5px] font-semibold tabular-nums text-owner-fg-1">
                {loading
                  ? "…"
                  : balance === null
                    ? "Unknown"
                    : inrFormat(balance)}
              </p>
              <p className="mt-0.5 text-[12px] leading-[1.4] text-owner-fg-3">
                Tap to top up — used for WhatsApp and Meta x Hoizr campaigns.
              </p>
            </div>
          </button>
        </li>

        {CHANNELS.map((channel) => {
          return (
            <li key={channel.id}>
              <button
                type="button"
                onClick={() => handleChannel(channel)}
                aria-disabled={!channel.available}
                className={`group flex w-full items-center gap-3 rounded-owner-md border bg-owner-bg px-4 py-3 text-left transition ${
                  channel.available
                    ? "border-owner-border hover:border-owner-blue-200 hover:shadow-sm"
                    : "border-dashed border-owner-border opacity-80 hover:border-owner-border"
                }`}
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-owner-md ${
                    channel.available
                      ? "bg-owner-blue-050 text-owner-blue-500"
                      : "bg-owner-bg-subtle text-owner-fg-3"
                  }`}
                >
                  <channel.Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14.5px] font-semibold text-owner-fg-1">
                      {channel.label}
                    </span>
                    {!channel.available ? (
                      <span className="rounded-full bg-owner-bg-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-owner-fg-3">
                        Hoizr-run
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-[1.4] text-owner-fg-3">
                    {channel.description}
                  </p>
                </div>
                {channel.available ? (
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-owner-fg-4 transition group-hover:text-owner-fg-2"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </ReusableModal>
  );
};

export default RunCampaignModal;
