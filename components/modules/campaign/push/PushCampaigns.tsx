"use client";

import ConfirmModal from "@/components/common/confirm-modal";
import DataTable from "@/components/common/dataTable";
import DataTableDateTimeCell from "@/components/common/dataTable/common/dateTimeCell";
import DataTableNumberCell from "@/components/common/dataTable/common/numberCell";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import {
  Card,
  OwnerButton,
  PageHeader,
} from "@/components/common/owner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CustomCampaignFilter,
  CustomEmailTargetType,
  RowsPerPageEnum,
} from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage, formatResEmailTarget } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Megaphone,
  Plus,
  Send,
  Users,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import {
  PUSH_BODY_LIMIT,
  PUSH_TITLE_LIMIT,
  buildPushCampaignInput,
  validatePushCampaignDraft,
  type PushCampaignDraft,
} from "./pushCampaignUtils";

const DEFAULT_DRAFT: PushCampaignDraft = {
  campaignName: "",
  pushTitle: "",
  pushBody: "",
  deepLink: "",
  imageUrl: "",
  target: CustomEmailTargetType.AllCustomer,
  eventId: "",
  csvDataUrl: "",
  filters: [],
  scheduleType: "now",
  scheduleTime: null,
};

type ConfirmAction = {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "default" | "danger" | "warning";
  onConfirm: () => void | Promise<void>;
};

const FILTER_OPTIONS = [
  CustomCampaignFilter.Active,
  CustomCampaignFilter.Dormant,
  CustomCampaignFilter.NewCustomers,
  CustomCampaignFilter.Repeat,
  CustomCampaignFilter.TopSpenders,
  CustomCampaignFilter.Male,
  CustomCampaignFilter.Female,
  CustomCampaignFilter.Other,
].filter(Boolean);

const formatFilterLabel = (filter: string) =>
  filter
    .split(/(?=[A-Z])/)
    .join(" ")
    .replace(/^\w/, (char) => char.toUpperCase());

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not scheduled";

// Display label for the lowercase push status enum (draft/scheduled/…).
const statusLabel = (status?: string | null) => {
  const value = (status ?? "draft").toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// Colored status pill — mirrors customCampaign.tsx#getStatusColor and the
// WhatsApp table so all three campaign lists read visually identical. Keyed
// on the Title-cased label so the switch matches the other tables.
const getStatusColor = (status: string): string => {
  switch (status) {
    case "Draft":
      return "bg-gray-200 text-gray-600";
    case "Scheduled":
      return "bg-blue-100 text-blue-600";
    case "Processing":
      return "bg-amber-100 text-amber-600";
    case "Completed":
      return "bg-green-100 text-green-600";
    case "Failed":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// A push campaign is still editable / publishable / deletable while it is a
// draft or a not-yet-sent scheduled row — mirrors the email + WhatsApp tables'
// `canEdit` rule. Once it is processing/completed/failed the send has begun
// and those actions are hidden.
const isEditable = (status?: string | null): boolean => {
  const value = (status ?? "draft").toLowerCase();
  return value === "draft" || value === "scheduled";
};

const normalisePushCampaign = (campaign: any): PushCampaignDraft => ({
  campaignName: campaign?.campaignName ?? "",
  pushTitle: campaign?.pushTitle ?? "",
  pushBody: campaign?.pushBody ?? "",
  deepLink: campaign?.deepLink ?? "",
  imageUrl: campaign?.imageUrl ?? "",
  target: campaign?.target ?? CustomEmailTargetType.AllCustomer,
  eventId: campaign?.eventId ?? "",
  csvDataUrl: campaign?.csvDataUrl ?? "",
  filters: campaign?.filters ?? [],
  scheduleType: campaign?.scheduleType ?? "now",
  scheduleTime: campaign?.scheduleTime ?? null,
});

const DraftField = ({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  multiline,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
}) => (
  <label className="block">
    <span className="owner-label">{label}</span>
    {multiline ? (
      <textarea
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-[104px] w-full resize-none rounded-owner-md border border-owner-border bg-owner-bg px-3 py-2 text-sm text-owner-fg-1 outline-none transition focus:border-owner-blue-500"
      />
    ) : (
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-sm text-owner-fg-1 outline-none transition focus:border-owner-blue-500"
      />
    )}
    {maxLength ? (
      <span className="mt-1 block text-right text-xs text-owner-fg-4">
        {value.length}/{maxLength}
      </span>
    ) : null}
  </label>
);

const PushPreview = ({ draft }: { draft: PushCampaignDraft }) => (
  <div className="rounded-[18px] border border-owner-border bg-owner-bg-subtle p-4">
    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-owner-fg-4">
      <Bell size={14} />
      Customer preview
    </div>
    <div className="rounded-owner-lg border border-owner-border bg-owner-bg p-4 shadow-owner-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
          <Megaphone size={18} />
        </div>
        <div className="min-w-0">
          <div className="line-clamp-2 text-sm font-semibold text-owner-fg-1">
            {draft.pushTitle || "Push title"}
          </div>
          <div className="mt-1 line-clamp-3 text-sm text-owner-fg-3">
            {draft.pushBody ||
              "Body copy appears here exactly as customers see it."}
          </div>
          {draft.deepLink ? (
            <div className="mt-3 inline-flex items-center gap-1 rounded-owner-sm bg-owner-blue-050 px-2 py-1 text-xs font-semibold text-owner-blue-500">
              <ExternalLink size={12} />
              {draft.deepLink}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </div>
);

const PushCampaigns = () => {
  const { setToastData } = useGlobalStore();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PushCampaignDraft>(DEFAULT_DRAFT);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const selectedFilters = useMemo(
    () => draft.filters?.filter(Boolean) ?? [],
    [draft.filters]
  );

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const response = await sdk.getAllHostPushCampaigns({
        pagination: {
          pageNumber: 1,
          rowsPerPage: RowsPerPageEnum.Thirty,
        },
      });
      setCampaigns(response.getAllHostPushCampaigns?.items ?? []);
    } catch (error: any) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
    sdk
      .getMyEventsForSelector()
      .then((response: any) => setEvents(response.getMyEvents ?? []))
      .catch(() => setEvents([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    if (draft.target === CustomEmailTargetType.Csv) {
      setAudienceCount(draft.csvDataUrl ? null : 0);
      return;
    }
    setAudienceLoading(true);
    const timer = window.setTimeout(() => {
      sdk
        .getHostAttendeesTargetCount({
          target: draft.target,
          eventId: draft.eventId || null,
          filters: selectedFilters.length ? selectedFilters : null,
        })
        .then((response: any) => {
          setAudienceCount(response.getHostAttendeesTargetCount ?? 0);
        })
        .catch(() => setAudienceCount(null))
        .finally(() => setAudienceLoading(false));
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [modalOpen, draft.target, draft.eventId, selectedFilters]);

  const resetModal = () => {
    setEditingId(null);
    setDraft(DEFAULT_DRAFT);
    setAudienceCount(null);
  };

  const openCreate = () => {
    resetModal();
    setModalOpen(true);
  };

  const openEdit = (campaign: any) => {
    setEditingId(campaign._id);
    setDraft(normalisePushCampaign(campaign));
    setAudienceCount(campaign.targetCount ?? null);
    setModalOpen(true);
  };

  const updateDraft = (patch: Partial<PushCampaignDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const toggleFilter = (filter: string) => {
    const next = selectedFilters.includes(filter)
      ? selectedFilters.filter((item) => item !== filter)
      : [...selectedFilters, filter];
    updateDraft({ filters: next });
  };

  const saveDraft = async () => {
    const errors = validatePushCampaignDraft(draft);
    if (errors.length) {
      setToastData({ type: "error", message: errors[0] });
      return null;
    }

    setSaving(true);
    try {
      const input = buildPushCampaignInput(draft);
      if (editingId) {
        await sdk.updateHostPushCampaign({ input: { _id: editingId, ...input } });
        setToastData({ type: "success", message: "Push campaign updated." });
        return editingId;
      }
      const response = await sdk.createHostPushCampaign({ input });
      const id = response.createHostPushCampaign?._id;
      setToastData({ type: "success", message: "Push campaign drafted." });
      return id;
    } catch (error: any) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const saveAndClose = async () => {
    const id = await saveDraft();
    if (!id) return;
    setModalOpen(false);
    resetModal();
    loadCampaigns();
  };

  const publishCampaign = async (campaignId: string) => {
    setPublishingId(campaignId);
    try {
      await sdk.publishHostPushCampaign({ campaignId });
      setToastData({ type: "success", message: "Push campaign queued." });
      await loadCampaigns();
    } catch (error: any) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setPublishingId(null);
    }
  };

  const saveAndPublish = async () => {
    const id = await saveDraft();
    if (!id) return;
    setModalOpen(false);
    resetModal();
    await publishCampaign(id);
  };

  const requestSaveAndPublish = () => {
    setConfirmAction({
      title: "Publish push campaign?",
      description:
        "This will save the campaign and queue the notification for delivery. Sent push campaigns cannot be recalled from customer devices.",
      confirmLabel: "Publish campaign",
      tone: "warning",
      onConfirm: saveAndPublish,
    });
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      await sdk.deleteHostPushCampaign({ campaignId });
      setToastData({ type: "success", message: "Push campaign deleted." });
      loadCampaigns();
    } catch (error: any) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  const requestPublishCampaign = (campaign: any) => {
    setConfirmAction({
      title: "Publish push campaign?",
      description: (
        <>
          Queue <strong>{campaign.campaignName || "this push campaign"}</strong>
          for delivery. Once notifications reach devices, this cannot be undone.
        </>
      ),
      confirmLabel: "Publish campaign",
      tone: "warning",
      onConfirm: () => publishCampaign(campaign._id),
    });
  };

  const requestDeleteCampaign = (campaign: any) => {
    setConfirmAction({
      title: "Delete push campaign?",
      description: (
        <>
          Delete <strong>{campaign.campaignName || "this push campaign draft"}</strong>.
          This removes the draft and cannot be undone.
        </>
      ),
      confirmLabel: "Delete campaign",
      tone: "danger",
      onConfirm: () => deleteCampaign(campaign._id),
    });
  };

  const columnHelper = createColumnHelper<any>();

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      columnHelper.accessor("campaignName", {
        header: "Campaign",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <DataTableTextCell
              className="cursor-pointer"
              onClick={() => openEdit(row.original)}
              value={row.original.campaignName}
            />
            <span className="text-[12px] text-owner-fg-4">
              {row.original.pushTitle ?? "—"}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("target", {
        header: "Audience",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <DataTableTextCell
              value={formatResEmailTarget(row.original.target ?? "")}
            />
            {row.original.filters?.length ? (
              <span className="text-[12px] text-owner-fg-4">
                {row.original.filters.map(formatFilterLabel).join(", ")}
              </span>
            ) : null}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          const label = statusLabel(row.original.status);
          return (
            <DataTableTextCell
              value={label}
              className={`px-3 py-1 text-sm font-medium justify-center rounded-full inline-block ${getStatusColor(
                label
              )}`}
            />
          );
        },
      }),
      columnHelper.accessor("scheduleType", {
        header: "Schedule",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell
            value={
              row.original.scheduleType === "later"
                ? formatDateTime(row.original.scheduleTime)
                : "Send now"
            }
          />
        ),
      }),
      columnHelper.accessor("stats.notificationsSent", {
        header: "Sent",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableNumberCell
            value={Number(row.original.stats?.notificationsSent ?? 0)}
          />
        ),
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableDateTimeCell
            value={
              row.original.updatedAt
                ? new Date(row.original.updatedAt)
                : (null as unknown as Date)
            }
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const campaign = row.original;
          const canEdit = isEditable(campaign.status);
          const publishing = publishingId === campaign._id;

          return (
            <TooltipProvider>
              <div className="flex space-x-2 justify-center items-center">
                {canEdit ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <MdOutlineEdit
                        className="text-primary text-lg cursor-pointer"
                        onClick={() => openEdit(campaign)}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>Edit campaign</p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}

                {canEdit ? (
                  <Tooltip>
                    <TooltipTrigger>
                      {publishing ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-primary"
                        />
                      ) : (
                        <Send
                          size={16}
                          className="text-primary cursor-pointer"
                          onClick={() => requestPublishCampaign(campaign)}
                        />
                      )}
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>Publish campaign</p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}

                {canEdit ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <MdDeleteOutline
                        className="text-primary text-lg cursor-pointer"
                        onClick={() => requestDeleteCampaign(campaign)}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>Delete Campaign</p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            </TooltipProvider>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper, publishingId]
  );

  return (
    <div>
      <PageHeader
        title="Push campaigns"
        subtitle="Send short FCM notifications to opted-in customers and event attendees."
        actions={
          <OwnerButton leadingIcon={<Plus size={16} />} onClick={openCreate}>
            New push
          </OwnerButton>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-sm text-owner-fg-4">Total campaigns</div>
          <div className="mt-2 text-3xl font-semibold text-owner-fg-1">
            {campaigns.length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-owner-fg-4">Delivered tokens</div>
          <div className="mt-2 text-3xl font-semibold text-owner-fg-1">
            {campaigns.reduce(
              (sum, campaign) =>
                sum + Number(campaign.stats?.notificationsSent ?? 0),
              0
            )}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-owner-fg-4">Invalid tokens pruned</div>
          <div className="mt-2 text-3xl font-semibold text-owner-fg-1">
            {campaigns.reduce(
              (sum, campaign) =>
                sum + Number(campaign.stats?.notificationsFailed ?? 0),
              0
            )}
          </div>
        </Card>
      </div>

      <DataTable
        totalRows={campaigns.length}
        columns={columns}
        data={campaigns}
        loading={loading}
        manualPagination={false}
        hideDownloadButton
        pageSize={10}
        addClickHandler={openCreate}
      />

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
          <div className="w-full max-w-5xl rounded-owner-xl bg-owner-bg shadow-owner-dropdown">
            <div className="flex items-center justify-between border-b border-owner-border px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-owner-fg-1">
                  {editingId ? "Edit push campaign" : "New push campaign"}
                </h2>
                <p className="mt-1 text-sm text-owner-fg-3">
                  Compose a short notification, choose the audience, then send
                  now or schedule it.
                </p>
              </div>
              <button
                type="button"
                className="rounded-owner-sm p-2 text-owner-fg-4 hover:bg-owner-bg-subtle hover:text-owner-fg-1"
                onClick={() => {
                  setModalOpen(false);
                  resetModal();
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                <Card>
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-owner-fg-1">
                    <Megaphone size={16} />
                    Message
                  </div>
                  <div className="grid gap-4">
                    <DraftField
                      label="Campaign name"
                      value={draft.campaignName ?? ""}
                      placeholder="Weekend drop reminder"
                      onChange={(campaignName) => updateDraft({ campaignName })}
                    />
                    <DraftField
                      label="Push title"
                      value={draft.pushTitle ?? ""}
                      maxLength={PUSH_TITLE_LIMIT}
                      placeholder="Tonight's passes are live"
                      onChange={(pushTitle) => updateDraft({ pushTitle })}
                    />
                    <DraftField
                      label="Body"
                      value={draft.pushBody ?? ""}
                      maxLength={PUSH_BODY_LIMIT}
                      placeholder="Send one clear action. Keep it short for lock screens."
                      multiline
                      onChange={(pushBody) => updateDraft({ pushBody })}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <DraftField
                        label="Deep link"
                        value={draft.deepLink ?? ""}
                        placeholder="/events/your-event or https://..."
                        onChange={(deepLink) => updateDraft({ deepLink })}
                      />
                      <DraftField
                        label="Image URL"
                        value={draft.imageUrl ?? ""}
                        placeholder="https://res.cloudinary.com/..."
                        onChange={(imageUrl) => updateDraft({ imageUrl })}
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-owner-fg-1">
                    <Users size={16} />
                    Audience
                  </div>
                  <div className="grid gap-3 md:grid-cols-4">
                    {[
                      {
                        label: "All attendees",
                        value: CustomEmailTargetType.AllCustomer,
                      },
                      {
                        label: "Event attendees",
                        value: CustomEmailTargetType.EventSpecific,
                      },
                      {
                        label: "Custom",
                        value: CustomEmailTargetType.CustomCustomer,
                      },
                      { label: "CSV", value: CustomEmailTargetType.Csv },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`rounded-owner-md border px-3 py-3 text-left text-sm transition ${
                          draft.target === option.value
                            ? "border-owner-blue-500 bg-owner-blue-050 text-owner-blue-500"
                            : "border-owner-border text-owner-fg-3 hover:border-owner-border-strong"
                        }`}
                        onClick={() =>
                          updateDraft({
                            target: option.value,
                            filters:
                              option.value === CustomEmailTargetType.CustomCustomer
                                ? selectedFilters
                                : [],
                          })
                        }
                      >
                        <span className="font-semibold">{option.label}</span>
                      </button>
                    ))}
                  </div>

                  {draft.target === CustomEmailTargetType.EventSpecific ? (
                    <label className="mt-4 block">
                      <span className="owner-label">Event</span>
                      <select
                        value={draft.eventId ?? ""}
                        onChange={(event) =>
                          updateDraft({ eventId: event.target.value })
                        }
                        className="mt-2 h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-sm outline-none focus:border-owner-blue-500"
                      >
                        <option value="">Select event</option>
                        {events.map((event) => (
                          <option key={event._id} value={event._id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}

                  {draft.target === CustomEmailTargetType.CustomCustomer ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {FILTER_OPTIONS.map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => toggleFilter(filter)}
                          className={`rounded-owner-sm px-3 py-1.5 text-sm font-medium transition ${
                            selectedFilters.includes(filter)
                              ? "bg-owner-blue-500 text-white"
                              : "bg-owner-bg-subtle text-owner-fg-3 hover:bg-owner-blue-050 hover:text-owner-blue-500"
                          }`}
                        >
                          {formatFilterLabel(filter)}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {draft.target === CustomEmailTargetType.Csv ? (
                    <DraftField
                      label="CSV URL"
                      value={draft.csvDataUrl ?? ""}
                      placeholder="Upload CSV through the email flow, or paste a raw CSV URL"
                      onChange={(csvDataUrl) => updateDraft({ csvDataUrl })}
                    />
                  ) : null}

                  <div className="mt-4 rounded-owner-md border border-owner-border bg-owner-bg-subtle px-4 py-3 text-sm text-owner-fg-3">
                    {audienceLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Estimating audience…
                      </span>
                    ) : audienceCount === null ? (
                      "Audience will be resolved at send time."
                    ) : (
                      `${audienceCount} estimated recipients`
                    )}
                  </div>
                </Card>

                <Card>
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-owner-fg-1">
                    <CalendarClock size={16} />
                    Schedule
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      { label: "Send now", value: "now", icon: CheckCircle2 },
                      { label: "Schedule later", value: "later", icon: Clock },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`rounded-owner-md border px-4 py-3 text-left text-sm transition ${
                            draft.scheduleType === option.value
                              ? "border-owner-blue-500 bg-owner-blue-050 text-owner-blue-500"
                              : "border-owner-border text-owner-fg-3 hover:border-owner-border-strong"
                          }`}
                          onClick={() =>
                            updateDraft({
                              scheduleType: option.value,
                              scheduleTime:
                                option.value === "now" ? null : draft.scheduleTime,
                            })
                          }
                        >
                          <span className="inline-flex items-center gap-2 font-semibold">
                            <Icon size={16} />
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {draft.scheduleType === "later" ? (
                    <label className="mt-4 block">
                      <span className="owner-label">Schedule time</span>
                      <input
                        type="datetime-local"
                        value={
                          draft.scheduleTime
                            ? new Date(draft.scheduleTime)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        onChange={(event) =>
                          updateDraft({
                            scheduleTime: event.target.value
                              ? new Date(event.target.value)
                              : null,
                          })
                        }
                        className="mt-2 h-10 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-sm outline-none focus:border-owner-blue-500"
                      />
                    </label>
                  ) : null}
                </Card>
              </div>

              <div className="space-y-4">
                <PushPreview draft={draft} />
                <Card>
                  <div className="text-sm font-semibold text-owner-fg-1">
                    Delivery notes
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-owner-fg-3">
                    <li>Only customers who opted in and have FCM tokens receive this.</li>
                    <li>Invalid device tokens are pruned by the worker.</li>
                    <li>Images render only on clients that support rich push.</li>
                  </ul>
                </Card>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-owner-border px-6 py-4 sm:flex-row sm:justify-end">
              <OwnerButton
                variant="secondary"
                onClick={saveAndClose}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save draft"}
              </OwnerButton>
              <OwnerButton
                onClick={requestSaveAndPublish}
                disabled={saving || Boolean(publishingId)}
                leadingIcon={<Send size={16} />}
              >
                Save and publish
              </OwnerButton>
            </div>
          </div>
        </div>
      ) : null}
      <ConfirmModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title ?? ""}
        description={confirmAction?.description ?? null}
        confirmLabel={confirmAction?.confirmLabel}
        tone={confirmAction?.tone}
        onCancel={() => setConfirmAction(null)}
        onConfirm={async () => {
          await confirmAction?.onConfirm();
        }}
      />
    </div>
  );
};

export default PushCampaigns;
