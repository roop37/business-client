"use client";

import ReusableModal from "@/components/common/modal/modal";
import { defaultTemplates } from "@/components/modules/campaignOnboarding/defaultTemplates/defaultTemplate";
import {
  applyTemplateMergeTags,
  stripHeaderFooterFromHtml,
  stripHeaderFooterFromJson,
} from "@/components/modules/campaignOnboarding/templateUtils";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import {
  Bell,
  ChevronRight,
  Coins,
  Instagram,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

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
    label: "Email campaign",
    description: "Designed email blast — opens the builder with your event preloaded.",
    Icon: Mail,
    available: true,
  },
  {
    id: "push",
    label: "Push notifications",
    description: "Mobile + web push to your followers.",
    Icon: Bell,
    available: false,
  },
  {
    id: "whatsapp",
    label: "WhatsApp broadcast",
    description: "1:1 broadcasts via your WhatsApp Business number.",
    Icon: MessageCircle,
    available: true,
  },
  {
    id: "sms",
    label: "SMS blast",
    description: "Short, high-deliverability SMS to verified phones.",
    Icon: MessageSquare,
    available: false,
  },
  {
    id: "instagram",
    label: "Instagram post",
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const findCleanSlateTemplate = () =>
  defaultTemplates.find((t) => t.name.toLowerCase() === "clean slate") ??
  defaultTemplates[0];

const RunCampaignModal = () => {
  const router = useRouter();
  const {
    runCampaignModalEvent,
    closeRunCampaignModal,
    openTopUpModal,
    setToastData,
    marketingCreditVersion,
  } = useGlobalStore();
  const { selectedHost, hostLogo, hostAddress } = useHostsStore();
  const businessAddress = hostAddress?.addressLine1 || "";
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<"email" | "whatsapp" | null>(null);
  const [eventTickets, setEventTickets] = useState<
    Array<{ ticketName: string; description?: string | null }>
  >([]);

  useEffect(() => {
    if (!runCampaignModalEvent) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
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
        }),
      sdk
        .getMyEventsForSelector()
        .then((res) => {
          if (cancelled) return;
          const ev = res?.getMyEvents?.find(
            (e) => e._id === runCampaignModalEvent.eventId,
          );
          const tickets = (ev?.tickets ?? [])
            .filter((t) => t.ticketVisible !== false)
            .map((t) => ({ ticketName: t.ticketName, description: t.description }));
          setEventTickets(tickets);
        })
        .catch(() => {
          if (!cancelled) setEventTickets([]);
        }),
    ]).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // marketingCreditVersion bumps after a verified top-up (the top-up modal
    // can be launched from inside this modal) — refetch so the shown balance
    // updates without closing/reopening.
  }, [runCampaignModalEvent, marketingCreditVersion]);

  // Clean Slate template prepared once (strip + merge-tag substitute).
  // Re-runs when the host or event changes so the editor preview shows
  // the right brand context out of the gate.
  const startingTemplate = useMemo(() => {
    if (!runCampaignModalEvent) return null;
    const base = findCleanSlateTemplate();
    if (!base) return null;
    const strippedJson = stripHeaderFooterFromJson(base.template.designJson);
    const strippedHtml = stripHeaderFooterFromHtml(base.template.html ?? "");
    const merged = applyTemplateMergeTags(strippedHtml, strippedJson, {
      hostName: selectedHost || "",
      hostLogo: hostLogo || "",
      hostAddress: businessAddress,
      eventTitle: runCampaignModalEvent.title,
    });
    return {
      content: base.template.content ?? "",
      html: merged.html,
      designJson: merged.designJson,
    };
  }, [
    businessAddress,
    hostLogo,
    runCampaignModalEvent,
    selectedHost,
  ]);

  const handleEmail = async () => {
    if (!runCampaignModalEvent || !startingTemplate || creating) return;
    setCreating("email");
    try {
      const newId = await sdk
        .createHostEmailCampaign({
          input: {
            campaignName: runCampaignModalEvent.title || "Untitled campaign",
            emailSubject: runCampaignModalEvent.title || "",
            emailTemplate: {
              content: startingTemplate.content,
              designJson: JSON.stringify(startingTemplate.designJson),
              html: startingTemplate.html,
            },
          },
        })
        .then((res) => res?.createHostEmailCampaign);

      if (!newId) {
        throw new Error("Campaign creation returned no id");
      }

      // Attach the source event so the worker (and any audience filters
      // that key on event) can resolve recipients later. Failure here
      // doesn't block the user — the editor will still open and they
      // can pick the event manually on the audience step.
      try {
        await sdk.updateHostEmailCampaign({
          input: {
            campaignId: newId,
            eventId: runCampaignModalEvent.eventId,
          },
        });
      } catch (error) {
        setToastData({
          type: "warning",
          message:
            "Created the campaign — couldn't auto-link the event, pick it on the audience step.",
        });
      }

      closeRunCampaignModal();
      router.push(
        `/campaigns/onboarding/template-edit?editId=${encodeURIComponent(newId)}`,
      );
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setCreating(null);
    }
  };

  const handleWhatsApp = async () => {
    if (!runCampaignModalEvent || creating) return;
    setCreating("whatsapp");
    try {
      const newId = await sdk
        .createHostWhatsAppCampaign({
          input: { campaignName: runCampaignModalEvent.title || "Untitled campaign" },
        })
        .then((res) => res?.createHostWhatsAppCampaign);

      if (!newId) throw new Error("Campaign creation returned no id");

      try {
        await sdk.updateHostWhatsAppCampaign({
          input: { campaignId: newId, eventId: runCampaignModalEvent.eventId },
        });
      } catch {
        setToastData({
          type: "warning",
          message:
            "Created the campaign — couldn't auto-link the event, pick it on the audience step.",
        });
      }

      closeRunCampaignModal();
      router.push(
        `/campaigns/whatsapp/onboarding/basics?editId=${encodeURIComponent(newId)}`,
      );
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setCreating(null);
    }
  };

  const handleChannel = (channel: Channel) => {
    if (!runCampaignModalEvent) return;
    if (channel.id === "email") {
      void handleEmail();
      return;
    }
    if (channel.id === "whatsapp") {
      void handleWhatsApp();
      return;
    }
    if (!channel.available) {
      setToastData({
        type: "warning",
        message: `${channel.label} campaigns are coming soon.`,
      });
      return;
    }
  };

  return (
    <ReusableModal
      isOpen={Boolean(runCampaignModalEvent)}
      onClose={creating ? () => undefined : closeRunCampaignModal}
      title="Run a campaign"
      width="ml"
    >
      <div className="mb-4">
        <p className="text-[12.5px] text-owner-fg-3">
          For{" "}
          <span className="font-medium text-owner-fg-1">
            {runCampaignModalEvent?.title || "Untitled event"}
          </span>
        </p>
        {eventTickets.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1">
            {eventTickets.map((t) => (
              <li key={t.ticketName} className="flex items-start gap-1.5 text-[12px] text-owner-fg-3">
                <span className="mt-0.5 shrink-0 text-owner-fg-4">·</span>
                <span>
                  <span className="font-medium text-owner-fg-2">{t.ticketName}</span>
                  {t.description ? (
                    <span className="ml-1 text-owner-fg-4">— {t.description}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

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
                Tap to top up — used for emails, push, WhatsApp, and
                paid boosts.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-owner-blue-500 px-3 py-1.5 text-[12.5px] font-semibold text-white shadow-sm transition group-hover:bg-owner-blue-600">
              <Plus size={13} />
              Top up
            </span>
          </button>
        </li>

        {CHANNELS.map((channel) => {
          const isCreating = creating === channel.id;
          return (
            <li key={channel.id}>
              <button
                type="button"
                onClick={() => handleChannel(channel)}
                disabled={isCreating}
                aria-disabled={!channel.available}
                className={`group flex w-full items-center gap-3 rounded-owner-md border bg-owner-bg px-4 py-3 text-left transition ${
                  channel.available
                    ? "border-owner-border hover:border-owner-blue-200 hover:shadow-sm"
                    : "border-dashed border-owner-border opacity-80 hover:border-owner-border"
                } ${isCreating ? "cursor-wait opacity-80" : ""}`}
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
                        Soon
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-[1.4] text-owner-fg-3">
                    {channel.description}
                  </p>
                </div>
                {isCreating ? (
                  <Loader2
                    size={18}
                    className="shrink-0 animate-spin text-owner-fg-3"
                  />
                ) : channel.available ? (
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
