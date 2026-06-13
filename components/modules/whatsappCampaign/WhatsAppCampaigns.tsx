"use client";

import DataTable from "@/components/common/dataTable";
import DataTableDateTimeCell from "@/components/common/dataTable/common/dateTimeCell";
import DataTableNumberCell from "@/components/common/dataTable/common/numberCell";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import ReusableModal from "@/components/common/modal/modal";
import { OwnerButton } from "@/components/common/owner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useGlobalStore from "@/store/global";
import useOriginalWhatsappCampaignStore from "@/store/originalWhatsappCampaignStore";
import useWhatsappCampaignStore from "@/store/whatsappCampaignStore";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  deleteWhatsAppCampaign,
  duplicateWhatsAppCampaign,
  fetchWhatsAppCampaigns,
  resumeWhatsAppCampaign,
  type WhatsAppCampaign,
} from "@/utils/whatsappCampaignClient";
import {
  fetchWhatsAppTemplateById,
  type WhatsAppMessageTemplate,
} from "@/utils/whatsappTemplateClient";
import { previewLabelForValue } from "@/utils/whatsappMergeTags";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Play } from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { BsCopy } from "react-icons/bs";
import { FiInfo } from "react-icons/fi";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { WhatsAppTemplatePreview } from "./WhatsAppTemplatePreview";

// IMPORTANT: TypeGraphQL serialises this enum's KEYS, so `status` arrives as
// the lowercase key ("draft", "scheduled", "paused"…), NOT the capitalised
// value ("Draft"). Normalise before every comparison — the table was first
// copied from the email table (capitalised) which silently hid all the
// status-gated actions (Edit/Continue, Resume, Delete) on drafts.
const normStatus = (s?: string | null): string => (s ?? "draft").toLowerCase();

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  processing: "Processing",
  paused: "Paused",
  completed: "Completed",
  failed: "Failed",
};

const statusLabel = (s?: string | null): string =>
  STATUS_LABEL[normStatus(s)] ?? (s || "Draft");

// A campaign is still editable (and deletable) while it is a Draft or a
// not-yet-sent Scheduled row — mirrors the email table's `canEdit` rule.
const isEditable = (c: WhatsAppCampaign): boolean => {
  const s = normStatus(c.status);
  return s === "draft" || s === "scheduled";
};

// Colored status pill — mirrors customCampaign.tsx#getStatusColor so the
// WhatsApp table reads visually identical to the email table.
const getStatusColor = (status?: string | null): string => {
  switch (normStatus(status)) {
    case "draft":
      return "bg-gray-200 text-gray-600";
    case "scheduled":
      return "bg-blue-100 text-blue-600";
    case "processing":
    case "paused":
      return "bg-amber-100 text-amber-600";
    case "completed":
      return "bg-green-100 text-green-600";
    case "failed":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export const WhatsAppCampaigns = () => {
  const { setToastData } = useGlobalStore();
  const router = useRouter();
  const resetWorking = useWhatsappCampaignStore((s) => s.resetState);
  const resetOriginal = useOriginalWhatsappCampaignStore(
    (s) => s.resetOriginalState
  );

  const [rows, setRows] = useState<WhatsAppCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewCampaign, setPreviewCampaign] =
    useState<WhatsAppCampaign | null>(null);
  const [previewTemplate, setPreviewTemplate] =
    useState<WhatsAppMessageTemplate | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWhatsAppCampaigns();
      setRows(res.items ?? []);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [setToastData]);

  useEffect(() => {
    load();
  }, [load]);

  const resetBothStores = () => {
    resetWorking();
    resetOriginal();
  };

  const startNew = () => {
    resetBothStores();
    router.push("/campaigns/whatsapp/onboarding/basics");
  };

  // Continue/Edit a draft: reset the working + original stores (exactly like
  // the old editDraft), then route into Step 1 with the editId so the journey
  // rehydrates from the server.
  const editDraft = (id: string) => {
    resetBothStores();
    router.push(`/campaigns/whatsapp/onboarding/basics?editId=${id}`);
  };

  const handlePreview = async (campaign: WhatsAppCampaign) => {
    setPreviewCampaign(campaign);
    setPreviewTemplate(null);
    setIsPreviewOpen(true);
    if (!campaign.templateId) return;
    setPreviewLoading(true);
    try {
      const tpl = await fetchWhatsAppTemplateById(campaign.templateId);
      setPreviewTemplate(tpl);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setPreviewLoading(false);
    }
  };

  const resume = async (id: string) => {
    setActionLoading(true);
    try {
      await resumeWhatsAppCampaign(id);
      setToastData({ type: "success", message: "Campaign resumed." });
      await load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setActionLoading(false);
    }
  };

  const duplicate = async (id: string) => {
    setActionLoading(true);
    try {
      await duplicateWhatsAppCampaign(id);
      setToastData({ type: "success", message: "Duplicated as a draft." });
      await load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await deleteWhatsAppCampaign(id);
      setToastData({
        type: "success",
        message: "Campaign deleted successfully!",
      });
      await load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setActionLoading(false);
    }
  };

  const columnHelper = createColumnHelper<WhatsAppCampaign>();

  const columns: ColumnDef<WhatsAppCampaign, any>[] = useMemo(
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
              onClick={() => handlePreview(row.original)}
              value={row.original.campaignName}
            />
            <span className="text-[12px] text-owner-fg-4">
              {row.original.templateSlugSnapshot ?? "—"}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell
            value={statusLabel(row.original.status)}
            className={`px-3 py-1 text-sm font-medium justify-center rounded-full inline-block ${getStatusColor(
              row.original.status
            )}`}
          />
        ),
      }),
      columnHelper.accessor("stats.messagesSent", {
        header: "Sent",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableNumberCell value={row.original.stats?.messagesSent ?? 0} />
        ),
      }),
      columnHelper.accessor("stats.messagesDelivered", {
        header: "Delivered",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableNumberCell
            value={row.original.stats?.messagesDelivered ?? 0}
          />
        ),
      }),
      columnHelper.accessor("stats.messagesRead", {
        header: "Read",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableNumberCell value={row.original.stats?.messagesRead ?? 0} />
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
          const c = row.original;
          const canEdit = isEditable(c);
          const isPaused = normStatus(c.status) === "paused";

          return (
            <TooltipProvider>
              <div className="flex space-x-2 justify-center items-center">
                {isPaused ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <Play
                        className="text-primary text-lg cursor-pointer"
                        size={18}
                        onClick={() => resume(c._id)}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>Resume campaign</p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}

                <Tooltip>
                  <TooltipTrigger>
                    <FiInfo
                      className="text-primary font-bold text-lg cursor-pointer"
                      onClick={() => handlePreview(c)}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white max-w-xs">
                    <p>Preview campaign</p>
                  </TooltipContent>
                </Tooltip>

                {canEdit ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <MdOutlineEdit
                        className="text-primary text-lg cursor-pointer"
                        onClick={() => editDraft(c._id)}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white max-w-xs">
                      <p>
                        {normStatus(c.status) === "draft"
                          ? "Continue campaign"
                          : "Edit campaign"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}

                <Tooltip>
                  <TooltipTrigger>
                    <BsCopy
                      className="text-primary text-sm cursor-pointer"
                      onClick={() => duplicate(c._id)}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white max-w-xs">
                    <p>Duplicate</p>
                  </TooltipContent>
                </Tooltip>

                {canEdit ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <MdDeleteOutline
                        className="text-primary text-lg cursor-pointer"
                        onClick={() => {
                          setDeleteId(c._id);
                          setIsDeleteOpen(true);
                        }}
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
    [columnHelper]
  );

  return (
    <div className="flex flex-col gap-4 font-owner">
      {actionLoading ? (
        <div className="flex items-center justify-center py-16">
          <FaSpinner className="animate-spin text-primary text-4xl" />
        </div>
      ) : (
        <DataTable
          totalRows={rows.length}
          columns={columns}
          data={rows}
          loading={loading}
          manualPagination={false}
          hideDownloadButton
          pageSize={10}
          addClickHandler={startNew}
        />
      )}

      <div className="rounded-owner-md border border-owner-border bg-owner-bg p-3.5 text-[12px] leading-5 text-owner-fg-3">
        A paused campaign ran out of marketing credit mid-send. Top up your
        balance and hit <strong>Resume</strong> — only the customers who
        haven&apos;t been messaged yet will receive it.
      </div>

      {/* Delete confirmation modal — mirrors the email table's delete UX. */}
      <ReusableModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteId(null);
        }}
        title="Delete Campaign"
      >
        <div className="flex flex-col space-y-4">
          <p className="text-owner-fg-3">
            Are you sure you want to delete this campaign? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-2">
            <OwnerButton
              variant="secondary"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteId(null);
              }}
            >
              Cancel
            </OwnerButton>
            <OwnerButton
              variant="primary"
              onClick={() => {
                if (deleteId) {
                  void handleDelete(deleteId);
                }
                setIsDeleteOpen(false);
                setDeleteId(null);
              }}
            >
              Delete
            </OwnerButton>
          </div>
        </div>
      </ReusableModal>

      {/* Preview modal — renders the WhatsApp chat-bubble preview, same UX as
          the email table's preview modal. */}
      <ReusableModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewCampaign(null);
          setPreviewTemplate(null);
        }}
        width="ml"
        title={`Preview Campaign: ${previewCampaign?.campaignName ?? ""}`}
      >
        <div className="overflow-y-auto">
          {previewLoading ? (
            <div className="flex h-64 items-center justify-center">
              <FaSpinner className="animate-spin text-primary text-3xl" />
            </div>
          ) : previewTemplate ? (
            <WhatsAppTemplatePreview
              template={previewTemplate}
              // Show friendly labels for dynamic customer tokens (e.g.
              // "Customer first name") instead of the raw stored token — the
              // same treatment the onboarding layout's live preview uses.
              variables={(previewCampaign?.templateVariables ?? []).map((v) => ({
                ...v,
                value: previewLabelForValue(v.value),
              }))}
              headerMediaUrl={previewCampaign?.headerMediaUrl ?? undefined}
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-owner-fg-3">
              <p>No template available for preview</p>
            </div>
          )}
        </div>
      </ReusableModal>
    </div>
  );
};

export default WhatsAppCampaigns;
