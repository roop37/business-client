"use client";

import {
  Badge,
  Card,
  inrFormat,
  OwnerButton,
  OwnerTable,
  StatTile,
} from "@/components/common/owner";
import type { BadgeTone } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { Download, RefreshCcw, ReceiptText } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type SettlementStatus =
  | "SCHEDULED"
  | "PENDING"
  | "PAUSED"
  | "ON_HOLD"
  | "VERIFIED"
  | "PROCESSING"
  | "PAID"
  | "REJECTED"
  | "FAILED"
  | "CANCELLED";

type SettlementRow = {
  _id: string;
  eventId: string;
  grossAmount: number;
  hoizrCommissionTotal: number;
  hoizrCommissionGstTotal: number;
  ticketGstFlowThroughTotal?: number | null;
  finalDeclaredOfferAmount?: number | null;
  razorpayFeeTotal?: number | null;
  netPayoutAmount: number;
  refundsTotal?: number | null;
  chargebacksTotal?: number | null;
  orderCount: number;
  status: SettlementStatus;
  scheduledFor?: string | null;
  paidAt?: string | null;
  razorpayPayoutId?: string | null;
  invoiceId?: string | null;
  invoiceUrl?: string | null;
  errorMessage?: string | null;
};

const STATUS_OPTIONS: Array<{ value: "ALL" | SettlementStatus; label: string }> = [
  { value: "PAID", label: "Paid" },
  { value: "ALL", label: "All" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "PROCESSING", label: "Processing" },
  { value: "FAILED", label: "Failed" },
];

const statusTone = (status: SettlementStatus): BadgeTone => {
  if (status === "PAID") return "success";
  if (status === "FAILED" || status === "REJECTED") return "danger";
  if (status === "PAUSED" || status === "ON_HOLD") return "warning";
  if (status === "PROCESSING" || status === "VERIFIED") return "info";
  return "neutral";
};

const dateFmt = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const compactId = (value: string) => value.slice(-8).toUpperCase();

const SettlementHistory = () => {
  const { setToastData } = useGlobalStore();
  const [rows, setRows] = useState<SettlementRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"ALL" | SettlementStatus>("PAID");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await sdk.hostListPayoutSettlements({
        input: {
          status: status === "ALL" ? undefined : status,
          page,
          pageSize,
        },
      });
      setRows(response?.hostListPayoutSettlements?.items ?? []);
      setTotal(response?.hostListPayoutSettlements?.total ?? 0);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, [page, setToastData, status]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleTotals = useMemo(() => {
    return rows.reduce(
      (acc, row) => ({
        gross: acc.gross + Number(row.grossAmount ?? 0),
        net: acc.net + Number(row.netPayoutAmount ?? 0),
        refunds:
          acc.refunds +
          Number(row.refundsTotal ?? 0) +
          Number(row.chargebacksTotal ?? 0),
        paid: acc.paid + (row.status === "PAID" ? 1 : 0),
      }),
      { gross: 0, net: 0, refunds: 0, paid: 0 }
    );
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const downloadStatement = async (settlement: SettlementRow) => {
    setDownloadingId(settlement._id);
    try {
      const response: any = await sdk.hostGetPayoutStatementUrl({
        settlementId: settlement._id,
      });
      const signedUrl = response?.hostGetPayoutStatementUrl?.signedUrl;
      if (!signedUrl) {
        throw new Error("Statement URL was not returned");
      }
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-owner">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Visible net payout"
          value={inrFormat(visibleTotals.net)}
          hint={`${rows.length} rows on this page`}
        />
        <StatTile
          label="Visible gross"
          value={inrFormat(visibleTotals.gross)}
          hint="Before fees, refunds, and charges"
        />
        <StatTile
          label="Refunds + chargebacks"
          value={inrFormat(visibleTotals.refunds)}
          hint="Already subtracted from settlement"
        />
        <StatTile
          label="Paid rows"
          value={visibleTotals.paid.toLocaleString("en-IN")}
          hint={`${total.toLocaleString("en-IN")} total matching filter`}
        />
      </div>

      <OwnerTable
        loading={loading}
        rowCount={rows.length}
        empty="No settlements found for this filter."
      >
        <OwnerTable.Toolbar>
          <div className="flex items-center gap-2">
            <ReceiptText size={16} className="text-owner-blue-500" />
            <div>
              <div className="text-[14px] font-semibold text-owner-fg-1">
                Payout settlement history
              </div>
              <div className="text-[12.5px] text-owner-fg-4">
                Reconcile bank deposits against Hoizr settlement calculations.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "ALL" | SettlementStatus);
                setPage(1);
              }}
              className="h-9 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] outline-none focus:border-owner-blue-200 focus:ring-2 focus:ring-owner-blue-050"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <OwnerButton
              variant="secondary"
              size="sm"
              leadingIcon={<RefreshCcw size={13} />}
              onClick={load}
            >
              Refresh
            </OwnerButton>
          </div>
        </OwnerTable.Toolbar>
        <OwnerTable.Head>
          <OwnerTable.HeaderCell>Settlement</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Status</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Gross</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Refunds</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Net payout</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Schedule</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Statement</OwnerTable.HeaderCell>
        </OwnerTable.Head>
        <OwnerTable.Body>
          {rows.map((row) => {
            const refundAdjustments =
              Number(row.refundsTotal ?? 0) + Number(row.chargebacksTotal ?? 0);
            const canDownload = row.status === "PAID";
            return (
              <OwnerTable.Row key={row._id}>
                <OwnerTable.Cell>
                  <div className="font-mono text-[12px] text-owner-fg-1">
                    {compactId(row._id)}
                  </div>
                  <div className="text-[12px] text-owner-fg-4">
                    Event {compactId(row.eventId)} · {row.orderCount} orders
                  </div>
                  {row.razorpayPayoutId ? (
                    <div className="mt-1 font-mono text-[11px] text-owner-fg-4">
                      {row.razorpayPayoutId}
                    </div>
                  ) : null}
                </OwnerTable.Cell>
                <OwnerTable.Cell>
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  {row.errorMessage ? (
                    <div className="mt-1 max-w-[220px] text-[11px] text-owner-danger-text">
                      {row.errorMessage}
                    </div>
                  ) : null}
                </OwnerTable.Cell>
                <OwnerTable.Cell align="right">
                  {inrFormat(row.grossAmount)}
                </OwnerTable.Cell>
                <OwnerTable.Cell align="right">
                  {refundAdjustments > 0 ? inrFormat(refundAdjustments) : "-"}
                </OwnerTable.Cell>
                <OwnerTable.Cell align="right" bold>
                  {inrFormat(row.netPayoutAmount)}
                </OwnerTable.Cell>
                <OwnerTable.Cell>
                  <div className="text-[12px] text-owner-fg-3">
                    Eligible {dateFmt(row.scheduledFor)}
                  </div>
                  <div className="text-[12px] text-owner-fg-3">
                    Paid {dateFmt(row.paidAt)}
                  </div>
                </OwnerTable.Cell>
                <OwnerTable.Cell align="right">
                  <OwnerButton
                    variant="secondary"
                    size="sm"
                    leadingIcon={<Download size={13} />}
                    disabled={!canDownload || downloadingId === row._id}
                    onClick={() => downloadStatement(row)}
                  >
                    PDF
                  </OwnerButton>
                </OwnerTable.Cell>
              </OwnerTable.Row>
            );
          })}
        </OwnerTable.Body>
        <OwnerTable.Footer
          summary={`Page ${page} of ${totalPages} · ${total.toLocaleString("en-IN")} settlements`}
        >
          <div className="flex items-center gap-2">
            <OwnerButton
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Prev
            </OwnerButton>
            <OwnerButton
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Next
            </OwnerButton>
          </div>
        </OwnerTable.Footer>
      </OwnerTable>

      <Card padding={16} className="text-[12.5px] leading-5 text-owner-fg-3">
        Statements are minted as short-lived signed URLs when you click PDF.
        Reopen this page and click PDF again if a link expires.
      </Card>
    </div>
  );
};

export default SettlementHistory;
