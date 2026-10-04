"use client";

import {
  Badge,
  Card,
  inrFormat,
  OwnerButton,
  StatTile,
} from "@/components/common/owner";
import type { BadgeTone } from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { RefreshCcw, ReceiptText } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type SettlementStatus = "PENDING" | "PAUSED" | "PAID" | "CANCELLED";

type SettlementRow = {
  _id: string;
  eventId: string;
  grossAmount: number;
  hoizrCommissionTotal: number;
  hoizrCommissionGstTotal: number;
  ticketGstFlowThroughTotal?: number | null;
  razorpayFeeTotal?: number | null;
  netPayoutAmount: number;
  refundsTotal?: number | null;
  chargebacksTotal?: number | null;
  orderCount: number;
  status: SettlementStatus;
  scheduledFor?: string | null;
  paidAt?: string | null;
  settlementNote?: string | null;
};

const STATUS_OPTIONS: Array<{ value: "ALL" | SettlementStatus; label: string }> = [
  { value: "PAID", label: "Paid" },
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PAUSED", label: "Paused" },
];

const statusTone = (status: SettlementStatus): BadgeTone => {
  if (status === "PAID") return "success";
  if (status === "PAUSED") return "warning";
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

  const columnHelper = createColumnHelper<SettlementRow>();
  const columns: ColumnDef<SettlementRow, any>[] = useMemo(
    () => [
      columnHelper.accessor("_id", {
        header: "Settlement",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-[12px] text-owner-fg-1">
              {compactId(row.original._id)}
            </span>
            <span className="text-[12px] text-owner-fg-4">
              Event {compactId(row.original.eventId)} · {row.original.orderCount}{" "}
              orders
            </span>
            {row.original.settlementNote ? (
              <span className="mt-1 font-mono text-[11px] text-owner-fg-4">
                Ref: {row.original.settlementNote}
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
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Badge tone={statusTone(row.original.status)}>
              {row.original.status}
            </Badge>
          </div>
        ),
      }),
      columnHelper.accessor("grossAmount", {
        header: "Gross",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {inrFormat(row.original.grossAmount)}
          </span>
        ),
      }),
      columnHelper.accessor("refundsTotal", {
        header: "Refunds",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const refundAdjustments =
            Number(row.original.refundsTotal ?? 0) +
            Number(row.original.chargebacksTotal ?? 0);
          return (
            <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
              {refundAdjustments > 0 ? inrFormat(refundAdjustments) : "-"}
            </span>
          );
        },
      }),
      columnHelper.accessor("netPayoutAmount", {
        header: "Net payout",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-owner-fg-1 tabular-nums">
            {inrFormat(row.original.netPayoutAmount)}
          </span>
        ),
      }),
      columnHelper.accessor("scheduledFor", {
        header: "Schedule",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col text-[12px] text-owner-fg-3">
            <span>Eligible {dateFmt(row.original.scheduledFor)}</span>
            <span>Paid {dateFmt(row.original.paidAt)}</span>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper]
  );

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
      </div>

      <DataTable
        totalRows={total}
        columns={columns}
        data={rows}
        loading={loading}
        manualPagination={true}
        hideDownloadButton
        pageSize={pageSize}
        pageCount={totalPages}
        nextPage={() => {
          if (page < totalPages) setPage((current) => current + 1);
        }}
        prevPage={() => {
          if (page > 1) setPage((current) => current - 1);
        }}
        paginationData={{ pageIndex: page - 1, pageSize }}
      />

      <Card padding={16} className="text-[12.5px] leading-5 text-owner-fg-3">
        Statements are minted as short-lived signed URLs when you click PDF.
        Reopen this page and click PDF again if a link expires.
      </Card>
    </div>
  );
};

export default SettlementHistory;
