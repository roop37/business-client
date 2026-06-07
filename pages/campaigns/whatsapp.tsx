import CampaignLayout from "@/components/layouts/campaignNestedLayout";
import MainLayout from "@/components/layouts/mainBodyLayout";
import {
  Badge,
  OwnerButton,
  OwnerTable,
  PageHeader,
  PillTabs,
} from "@/components/common/owner";
import MarketingCreditWarning from "@/components/modules/campaign/MarketingCreditWarning";
import { RowsPerPageEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  Copy,
  MessageCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

const HostWhatsAppCampaignStatus = {
  Draft: "Draft",
  Processing: "Processing",
  Scheduled: "Scheduled",
  Completed: "Completed",
  Failed: "Failed",
} as const;

type HostWhatsAppCampaignStatus =
  (typeof HostWhatsAppCampaignStatus)[keyof typeof HostWhatsAppCampaignStatus];

const HostWhatsAppCampaignPublicationStatus = {
  Drafted: "Drafted",
  Active: "Active",
} as const;

type HostWhatsAppCampaignPublicationStatus =
  (typeof HostWhatsAppCampaignPublicationStatus)[keyof typeof HostWhatsAppCampaignPublicationStatus];

type HostWhatsAppCampaignScheduleType = "Now" | "Later";

/**
 * Host-facing WhatsApp campaign list. Mirrors the email list page in
 * spirit but uses the simpler OwnerTable primitive (consistent with the
 * marketing-credit page) so the host sees the same visual language
 * across all marketing tabs.
 *
 * Why not DataTable? The heavy DataTable + filter machinery is overkill
 * here — WhatsApp campaigns have a smaller surface (no email-subject
 * column, no separate "sent" stat). A focused OwnerTable is friendlier
 * for the host's scan-and-act flow.
 */

type WhatsAppCampaignRow = {
  id: string;
  name: string;
  status: HostWhatsAppCampaignStatus | string;
  publicationStatus: HostWhatsAppCampaignPublicationStatus | string;
  scheduleType?: HostWhatsAppCampaignScheduleType | string | null;
  scheduleTime?: string | null;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  updatedAt?: string | null;
};

type StatusFilter = "all" | "drafts" | "scheduled" | "completed" | "failed";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "drafts", label: "Drafts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const statusBadge = (row: WhatsAppCampaignRow) => {
  if (row.publicationStatus === "Drafted") {
    return <Badge tone="neutral">Draft</Badge>;
  }
  if (row.status === HostWhatsAppCampaignStatus.Scheduled) {
    return <Badge tone="info">Scheduled · {formatDate(row.scheduleTime)}</Badge>;
  }
  if (row.status === HostWhatsAppCampaignStatus.Processing) {
    return <Badge tone="info">Sending</Badge>;
  }
  if (row.status === HostWhatsAppCampaignStatus.Completed) {
    return <Badge tone="success">Sent</Badge>;
  }
  if (row.status === HostWhatsAppCampaignStatus.Failed) {
    return <Badge tone="danger">Failed</Badge>;
  }
  return <Badge tone="neutral">{row.status ?? "—"}</Badge>;
};

const matchesTab = (row: WhatsAppCampaignRow, tab: StatusFilter): boolean => {
  if (tab === "all") return true;
  if (tab === "drafts") return row.publicationStatus === "Drafted";
  if (tab === "scheduled")
    return row.status === HostWhatsAppCampaignStatus.Scheduled;
  if (tab === "completed")
    return row.status === HostWhatsAppCampaignStatus.Completed;
  if (tab === "failed")
    return row.status === HostWhatsAppCampaignStatus.Failed;
  return true;
};

const WhatsAppCampaignsPage = () => {
  const router = useRouter();
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<WhatsAppCampaignRow[]>([]);
  const [tab, setTab] = useState<StatusFilter>("all");

  useEffect(() => {
    setSelectedSideBarMenu("Marketing");
  }, [setSelectedSideBarMenu]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sdk.getAllHostWhatsAppCampaigns({
        pagination: { pageNumber: 1, rowsPerPage: RowsPerPageEnum.Hundred },
      });
      const items = res.getAllHostWhatsAppCampaigns?.items ?? [];
      setRows(
        items.map((c: any) => ({
          id: c._id,
          name: c.campaignName ?? "Untitled",
          status: c.status ?? "draft",
          publicationStatus: c.publicationStatus ?? "Drafted",
          scheduleType: c.scheduleType,
          scheduleTime: c.scheduleTime,
          sent: c.stats?.messagesSent ?? 0,
          delivered: c.stats?.messagesDelivered ?? 0,
          read: c.stats?.messagesRead ?? 0,
          failed:
            (c.stats?.messagesFailed ?? 0) +
            (c.stats?.messagesSyncFailed ?? 0),
          updatedAt: c.updatedAt,
        }))
      );
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [setToastData]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => rows.filter((row) => matchesTab(row, tab)),
    [rows, tab]
  );

  const handleNew = () => {
    router.push("/campaigns/whatsapp/onboarding/basic");
  };

  const handleDuplicate = async (campaignId: string) => {
    try {
      const res = await sdk.duplicateHostWhatsAppCampaign({ campaignId });
      const newId = res.duplicateHostWhatsAppCampaign;
      setToastData({ type: "success", message: "Campaign duplicated" });
      router.push(`/campaigns/whatsapp/onboarding/basic?id=${newId}`);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    try {
      await sdk.deleteHostWhatsAppCampaign({ campaignId });
      setToastData({ type: "success", message: "Campaign deleted" });
      load();
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  return (
    <div className="flex flex-col gap-6 font-owner text-owner-fg-1">
      <PageHeader
        title="WhatsApp campaigns"
        subtitle="Reach your customers on WhatsApp. Hoizr handles delivery; you pay only for accepted sends."
        actions={
          <OwnerButton variant="primary" leadingIcon={<Plus size={16} />} onClick={handleNew}>
            New campaign
          </OwnerButton>
        }
      />

      <MarketingCreditWarning estimatedCost={0} />

      <PillTabs
        value={tab}
        onChange={(v) => setTab(v as StatusFilter)}
        tabs={STATUS_TABS.map((t) => ({ value: t.value, label: t.label }))}
      />

      <OwnerTable
        loading={loading}
        rowCount={filtered.length}
        empty={
          tab === "all"
            ? "No WhatsApp campaigns yet. Send your first one to reach buyers on WhatsApp."
            : `No campaigns matching "${STATUS_TABS.find((t) => t.value === tab)?.label}".`
        }
      >
        <OwnerTable.Head>
          <OwnerTable.HeaderCell>Campaign</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell width="140px">Status</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right" width="90px">
            Sent
          </OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right" width="100px">
            Delivered
          </OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right" width="80px">
            Read
          </OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right" width="80px">
            Failed
          </OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell width="140px">Updated</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell width="140px" align="right">
            Actions
          </OwnerTable.HeaderCell>
        </OwnerTable.Head>
        <OwnerTable.Body>
          {filtered.map((row) => (
            <OwnerTable.Row
              key={row.id}
              onClick={() =>
                router.push(`/campaigns/whatsapp/${row.id}`)
              }
            >
              <OwnerTable.Cell bold>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-owner-md bg-owner-success-bg text-owner-success-text">
                    <MessageCircle size={14} />
                  </span>
                  <span>{row.name}</span>
                </div>
              </OwnerTable.Cell>
              <OwnerTable.Cell>{statusBadge(row)}</OwnerTable.Cell>
              <OwnerTable.Cell align="right">
                {row.sent.toLocaleString("en-IN")}
              </OwnerTable.Cell>
              <OwnerTable.Cell align="right">
                {row.delivered.toLocaleString("en-IN")}
              </OwnerTable.Cell>
              <OwnerTable.Cell align="right">
                {row.read.toLocaleString("en-IN")}
              </OwnerTable.Cell>
              <OwnerTable.Cell align="right">
                {row.failed > 0 ? (
                  <span className="text-owner-danger-text">
                    {row.failed.toLocaleString("en-IN")}
                  </span>
                ) : (
                  "—"
                )}
              </OwnerTable.Cell>
              <OwnerTable.Cell muted>{formatDate(row.updatedAt)}</OwnerTable.Cell>
              <OwnerTable.Cell align="right">
                <div
                  className="inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-label="Duplicate campaign"
                    className="grid h-8 w-8 place-items-center rounded-owner-md text-owner-fg-3 hover:bg-owner-bg-subtle"
                    onClick={() => handleDuplicate(row.id)}
                  >
                    <Copy size={14} />
                  </button>
                  {row.publicationStatus === "Drafted" && (
                    <button
                      type="button"
                      aria-label="Delete campaign"
                      className="grid h-8 w-8 place-items-center rounded-owner-md text-owner-fg-3 hover:bg-owner-danger-bg hover:text-owner-danger-text"
                      onClick={() => handleDelete(row.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </OwnerTable.Cell>
            </OwnerTable.Row>
          ))}
        </OwnerTable.Body>
      </OwnerTable>
    </div>
  );
};

(WhatsAppCampaignsPage as any).getLayout = (page: React.ReactNode) => (
  <MainLayout>
    <CampaignLayout>{page}</CampaignLayout>
  </MainLayout>
);

export default WhatsAppCampaignsPage;
