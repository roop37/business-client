"use client";

import {
  Badge,
  inrFormat,
  OwnerButton,
  OwnerTable,
  StatTile,
} from "@/components/common/owner";
import { Download, Receipt } from "lucide-react";
import React from "react";

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

      <OwnerTable
        loading={false}
        rowCount={rows.length}
        empty="No payout invoices yet. Once your first payout settles, the tax invoice will appear here."
      >
        <OwnerTable.Toolbar>
          <span className="text-[14px] font-semibold text-owner-fg-1">
            All invoices
          </span>
          <OwnerButton
            variant="secondary"
            size="sm"
            leadingIcon={<Download size={13} />}
            disabled
          >
            Download all
          </OwnerButton>
        </OwnerTable.Toolbar>
        <OwnerTable.Head>
          <OwnerTable.HeaderCell>Invoice</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Issued</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Period</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">Amount</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">GST (18%)</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell>Status</OwnerTable.HeaderCell>
          <OwnerTable.HeaderCell align="right">PDF</OwnerTable.HeaderCell>
        </OwnerTable.Head>
        <OwnerTable.Body>
          {rows.map((row) => (
            <OwnerTable.Row key={row.id}>
              <OwnerTable.Cell>
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-owner-sm bg-owner-blue-050 text-owner-blue-500">
                    <Receipt size={14} />
                  </span>
                  <span className="font-ownerMono text-[13px]">
                    {row.invoiceId}
                  </span>
                </div>
              </OwnerTable.Cell>
              <OwnerTable.Cell>{row.issued}</OwnerTable.Cell>
              <OwnerTable.Cell>{row.period}</OwnerTable.Cell>
              <OwnerTable.Cell align="right" bold>
                {inrFormat(row.amount)}
              </OwnerTable.Cell>
              <OwnerTable.Cell align="right" muted>
                {inrFormat(row.gst)}
              </OwnerTable.Cell>
              <OwnerTable.Cell>
                <Badge tone={row.status === "Paid" ? "success" : "warning"}>
                  {row.status}
                </Badge>
              </OwnerTable.Cell>
              <OwnerTable.Cell align="right">
                {row.pdfUrl ? (
                  <OwnerButton
                    variant="ghost"
                    size="sm"
                    leadingIcon={<Download size={13} />}
                    onClick={() =>
                      typeof window !== "undefined"
                        ? window.open(row.pdfUrl!, "_blank")
                        : null
                    }
                  >
                    PDF
                  </OwnerButton>
                ) : (
                  <span className="text-[13px] text-owner-fg-4">—</span>
                )}
              </OwnerTable.Cell>
            </OwnerTable.Row>
          ))}
        </OwnerTable.Body>
        <OwnerTable.Footer summary={`${rows.length} invoices`} />
      </OwnerTable>
    </div>
  );
};

export default InvoicesTable;
