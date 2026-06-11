"use client";

import {
  Badge,
  type BadgeTone,
  Card,
  OwnerButton,
  OwnerTable,
} from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  duplicateWhatsAppCampaign,
  fetchWhatsAppCampaigns,
  resumeWhatsAppCampaign,
  type WhatsAppCampaign,
} from "@/utils/whatsappCampaignClient";
import { Copy, Play, Plus, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { WhatsAppCampaignBuilder } from "./WhatsAppCampaignBuilder";

const statusTone = (status?: string | null): BadgeTone => {
  switch (status) {
    case "Completed":
      return "success";
    case "Failed":
      return "danger";
    case "Paused":
      return "warning";
    case "Processing":
    case "Scheduled":
      return "info";
    default:
      return "neutral";
  }
};

const dateFmt = (v?: string | null) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
};

export const WhatsAppCampaigns = () => {
  const { setToastData } = useGlobalStore();
  const [rows, setRows] = useState<WhatsAppCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
    if (!creating) load();
  }, [creating, load]);

  const resume = async (id: string) => {
    setBusyId(id);
    try {
      await resumeWhatsAppCampaign(id);
      setToastData({ type: "success", message: "Campaign resumed." });
      await load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const duplicate = async (id: string) => {
    setBusyId(id);
    try {
      await duplicateWhatsAppCampaign(id);
      setToastData({ type: "success", message: "Duplicated as a draft." });
      await load();
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  if (creating) {
    return (
      <div className="flex flex-col gap-4 font-owner">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[16px] font-semibold text-owner-fg-1">
              New WhatsApp campaign
            </div>
            <div className="text-[12.5px] text-owner-fg-3">
              Pick a template, fill the variables, and preview exactly what the
              customer receives.
            </div>
          </div>
          <OwnerButton variant="secondary" onClick={() => setCreating(false)}>
            Back to campaigns
          </OwnerButton>
        </div>
        <WhatsAppCampaignBuilder onDone={() => setCreating(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 font-owner">
      <OwnerTable
        loading={loading}
        rowCount={rows.length}
        empty="No WhatsApp campaigns yet. Create your first one."
      >
        <OwnerTable.Toolbar>
          <div className="text-[14px] font-semibold text-owner-fg-1">
            WhatsApp campaigns
          </div>
          <div className="flex items-center gap-2">
            <OwnerButton
              variant="secondary"
              size="sm"
              leadingIcon={<RefreshCcw size={13} />}
              onClick={load}
            >
              Refresh
            </OwnerButton>
            <OwnerButton
              variant="primary"
              size="sm"
              leadingIcon={<Plus size={13} />}
              onClick={() => setCreating(true)}
            >
              New campaign
            </OwnerButton>
          </div>
        </OwnerTable.Toolbar>
        <OwnerTable.Head>
          <OwnerTable.HeaderCell>Campaign</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Status</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Sent</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Delivered</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Read</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Updated</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Actions</OwnerTable.HeaderCell>
        </OwnerTable.Head>
        <OwnerTable.Body>
          {rows.map((c) => (
            <OwnerTable.Row key={c._id}>
              <OwnerTable.Cell>
                <div className="text-[13px] font-semibold text-owner-fg-1">
                  {c.campaignName}
                </div>
                <div className="text-[12px] text-owner-fg-4">
                  {c.templateSlugSnapshot ?? "—"}
                </div>
              </OwnerTable.Cell>
              <OwnerTable.Cell>
                <Badge tone={statusTone(c.status)}>{c.status ?? "Draft"}</Badge>
              </OwnerTable.Cell>
              <OwnerTable.Cell align="right">
                {c.stats?.messagesSent ?? 0}
              </OwnerTable.Cell>
              <OwnerTable.Cell align="right">
                {c.stats?.messagesDelivered ?? 0}
              </OwnerTable.Cell>
              <OwnerTable.Cell align="right">
                {c.stats?.messagesRead ?? 0}
              </OwnerTable.Cell>
              <OwnerTable.Cell>{dateFmt(c.updatedAt)}</OwnerTable.Cell>
              <OwnerTable.Cell align="right">
                <div className="flex items-center justify-end gap-1.5">
                  {c.status === "Paused" ? (
                    <OwnerButton
                      variant="primary"
                      size="sm"
                      leadingIcon={<Play size={12} />}
                      disabled={busyId === c._id}
                      onClick={() => resume(c._id)}
                    >
                      Resume
                    </OwnerButton>
                  ) : null}
                  <OwnerButton
                    variant="secondary"
                    size="sm"
                    leadingIcon={<Copy size={12} />}
                    disabled={busyId === c._id}
                    onClick={() => duplicate(c._id)}
                  >
                    Duplicate
                  </OwnerButton>
                </div>
              </OwnerTable.Cell>
            </OwnerTable.Row>
          ))}
        </OwnerTable.Body>
      </OwnerTable>

      <Card padding={14} className="text-[12px] leading-5 text-owner-fg-3">
        A paused campaign ran out of marketing credit mid-send. Top up your
        balance and hit <strong>Resume</strong> — only the customers who
        haven&apos;t been messaged yet will receive it.
      </Card>
    </div>
  );
};

export default WhatsAppCampaigns;
