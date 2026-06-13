"use client";

import {
  Badge,
  inrFormat,
  OwnerButton,
  StatTile,
} from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Download, Receipt } from "lucide-react";
import React, { useMemo } from "react";

type PayoutInvoiceRow = {
  id: string;
  invoiceId: string;
  issued: string;
  period: string;
  amount: number;
  gst: number;
  status: "Paid" | "Pending";
  pdfUrl?: string;
};

// No real invoices wired yet — keep a deliberately empty seed so the
// UI shows the empty state instead of mock rows. When the API ships
// (e.g. `myPayoutInvoices`), swap this for a real query and the table
// will render automatically.
const rows: PayoutInvoiceRow[] = [];

const InvoicesTable: React.FC = () => {
  const settled = rows
    .filter((r) => r.status === "Paid")
    .reduce((s, r) => s + r.amount, 0);
  const pending = rows
    .filter((r) => r.status === "Pending")
    .reduce((s, r) => s + r.amount, 0);
  const totalGst = rows.reduce((s, r) => s + r.gst, 0);

  const columnHelper = createColumnHelper<PayoutInvoiceRow>();
  const columns: ColumnDef<PayoutInvoiceRow, any>[] = useMemo(
    () => [
      columnHelper.accessor("invoiceId", {
        header: "Invoice",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-owner-sm bg-owner-blue-050 text-owner-blue-500">
              <Receipt size={14} />
            </span>
            <span className="font-ownerMono text-[13px] text-owner-fg-1">
              {row.original.invoiceId}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("issued", {
        header: "Issued",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => <DataTableTextCell value={row.original.issued} />,
      }),
      columnHelper.accessor("period", {
        header: "Period",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => <DataTableTextCell value={row.original.period} />,
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-owner-fg-1 tabular-nums">
            {inrFormat(row.original.amount)}
          </span>
        ),
      }),
      columnHelper.accessor("gst", {
        header: "GST (18%)",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-owner-fg-4 tabular-nums">
            {inrFormat(row.original.gst)}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge tone={row.original.status === "Paid" ? "success" : "warning"}>
            {row.original.status}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "PDF",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            {row.original.pdfUrl ? (
              <OwnerButton
                variant="ghost"
                size="sm"
                leadingIcon={<Download size={13} />}
                onClick={() =>
                  typeof window !== "undefined"
                    ? window.open(row.original.pdfUrl!, "_blank")
                    : null
                }
              >
                PDF
              </OwnerButton>
            ) : (
              <span className="text-[13px] text-owner-fg-4">—</span>
            )}
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper]
  );

  return (
    <div className="flex flex-col gap-6 font-owner">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Settled this month"
          value={inrFormat(settled)}
          hint="Net of fees and GST"
        />
        <StatTile
          label="Pending settlement"
          value={inrFormat(pending)}
          hint="Awaiting event completion or verification"
        />
        <StatTile
          label="GST collected"
          value={inrFormat(totalGst)}
          hint="Available in your GST report"
        />
      </div>

      <DataTable
        totalRows={rows.length}
        columns={columns}
        data={rows}
        loading={false}
        manualPagination={false}
        hideDownloadButton
        pageSize={10}
      />
    </div>
  );
};

export default InvoicesTable;
