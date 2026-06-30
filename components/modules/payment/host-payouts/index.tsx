"use client";

import {
  Badge,
  Card,
  OwnerButton,
} from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  Building2,
  CheckCircle2,
  Info,
  Landmark,
  Plus,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AddPayoutModal from "./addPayoutModal";

type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type HostPayoutAccount = {
  _id: string;
  entityName?: string | null;
  entityType?: string | null;
  panNumber?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  accountHolderName: string;
  accountNumber: string;
  last4: string;
  ifscCode: string;
  bankName: string;
  branchName?: string | null;
  accountType: "SAVINGS" | "CURRENT";
  upiId?: string | null;
  isActive: boolean;
  isPrimary: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  isGstRegistered: boolean;
  gstin?: string | null;
  registeredBusinessName?: string | null;
};

const StatusBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  if (status === "VERIFIED")
    return <Badge tone="success">Verified</Badge>;
  if (status === "REJECTED")
    return <Badge tone="danger">Rejected</Badge>;
  return <Badge tone="warning">Pending</Badge>;
};

const HostPayouts: React.FC = () => {
  const { setToastData } = useGlobalStore();
  const [data, setData] = useState<HostPayoutAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [primaryLoadingId, setPrimaryLoadingId] = useState<string | undefined>();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await (sdk as any).hostPayoutAccounts();
      const accounts: HostPayoutAccount[] =
        response?.hostPayoutAccounts ?? [];
      setData(accounts);
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, [setToastData]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const primaryPayout = useMemo(
    () => data.find((account) => account.isPrimary),
    [data]
  );

  const handleSetPrimary = async (id: string) => {
    try {
      setPrimaryLoadingId(id);
      const res = await (sdk as any).setPrimaryHostPayoutAccount({ id });
      if (res?.setPrimaryHostPayoutAccount) {
        setToastData({
          type: "success",
          message: "Primary payout updated",
        });
        await fetchAccounts();
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setPrimaryLoadingId(undefined);
    }
  };

  const columnHelper = createColumnHelper<HostPayoutAccount>();
  const columns: ColumnDef<HostPayoutAccount, any>[] = useMemo(
    () => [
      columnHelper.accessor("bankName", {
        header: "Bank",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <DataTableTextCell
              className="font-semibold"
              value={row.original.bankName}
            />
            {row.original.branchName ? (
              <span className="text-[12px] text-owner-fg-4">
                {row.original.branchName}
              </span>
            ) : null}
          </div>
        ),
      }),
      columnHelper.accessor("accountHolderName", {
        header: "Account holder",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell value={row.original.accountHolderName} />
        ),
      }),
      columnHelper.accessor("last4", {
        header: "Account",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-mono text-sm text-owner-fg-1">
            •••• {row.original.last4}
          </span>
        ),
      }),
      columnHelper.accessor("ifscCode", {
        header: "IFSC",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-mono text-sm text-owner-fg-1">
            {row.original.ifscCode}
          </span>
        ),
      }),
      columnHelper.accessor("verificationStatus", {
        header: "Status",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusBadge status={row.original.verificationStatus} />
            {row.original.isPrimary ? <Badge tone="info">Primary</Badge> : null}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const account = row.original;
          const canSetPrimary =
            account.verificationStatus === "VERIFIED" && !account.isPrimary;
          const showRejectionReason =
            account.verificationStatus === "REJECTED" &&
            account.rejectionReason;
          return (
            <div className="flex items-center justify-center">
              {canSetPrimary ? (
                <OwnerButton
                  variant="secondary"
                  size="sm"
                  leadingIcon={<CheckCircle2 size={13} />}
                  disabled={primaryLoadingId === account._id}
                  onClick={() => handleSetPrimary(account._id)}
                >
                  Set primary
                </OwnerButton>
              ) : showRejectionReason ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help text-[12.5px] font-medium text-owner-danger-text underline">
                        Reason
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-owner-fg-1 text-white">
                      <p>{account.rejectionReason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-owner-fg-4">—</span>
              )}
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper, primaryLoadingId]
  );

  return (
    <div className="flex flex-col gap-6 font-owner">
      {/* Primary payout summary card */}
      <Card padding={20}>
        {primaryPayout ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-owner-md bg-owner-blue-050 text-owner-blue-500">
                <Landmark size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[15px] font-semibold text-owner-fg-1">
                    {primaryPayout.entityName ||
                      primaryPayout.accountHolderName}
                  </h2>
                  <StatusBadge status={primaryPayout.verificationStatus} />
                  <Badge tone="info">Primary</Badge>
                </div>
                <div className="mt-2 grid gap-1 text-[13px] text-owner-fg-3 md:grid-cols-2 lg:grid-cols-3">
                  <span>{primaryPayout.bankName}</span>
                  <span>Account •••• {primaryPayout.last4}</span>
                  <span>IFSC {primaryPayout.ifscCode}</span>
                  {primaryPayout.panNumber ? (
                    <span>PAN {primaryPayout.panNumber}</span>
                  ) : null}
                  {primaryPayout.isGstRegistered && primaryPayout.gstin ? (
                    <span>GSTIN {primaryPayout.gstin}</span>
                  ) : null}
                  {primaryPayout.contactEmail ? (
                    <span>{primaryPayout.contactEmail}</span>
                  ) : null}
                </div>
              </div>
            </div>
            <OwnerButton
              variant="secondary"
              leadingIcon={<Plus size={15} />}
              onClick={() => setAddOpen(true)}
            >
              Add payout
            </OwnerButton>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-owner-md bg-owner-bg-subtle text-owner-fg-2">
                <Building2 size={22} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-owner-fg-1">
                  Add payout details
                </h2>
                <p className="mt-1 max-w-2xl text-[13.5px] text-owner-fg-3">
                  Paid events can be published only after one active payout
                  profile is verified by Hoizr.
                </p>
              </div>
            </div>
            <OwnerButton
              variant="primary"
              leadingIcon={<Plus size={15} />}
              onClick={() => setAddOpen(true)}
            >
              Add payout
            </OwnerButton>
          </div>
        )}
      </Card>

      {/* Accounts table */}
      <DataTable
        totalRows={data.length}
        columns={columns}
        data={data}
        loading={loading}
        manualPagination={false}
        hideDownloadButton
        pageSize={10}
        addClickHandler={() => setAddOpen(true)}
      />

      <Card padding={16}>
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-owner-md bg-owner-bg-subtle text-owner-fg-2">
            <Info size={16} />
          </div>
          <div className="text-[13px] leading-5 text-owner-fg-3">
            <span className="font-semibold text-owner-fg-1">
              Need to remove a payout?
            </span>{" "}
            For your security, payout accounts can&apos;t be deleted from this
            dashboard. Email{" "}
            <a
              href="mailto:contact@hoizr.com?subject=Payout%20deletion%20request"
              className="font-medium text-owner-blue-500 underline"
            >
              contact@hoizr.com
            </a>{" "}
            from your registered email with the account holder name and last 4
            digits of the bank account, and our team will verify and remove it
            for you.
          </div>
        </div>
      </Card>

      <AddPayoutModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          fetchAccounts();
        }}
      />
    </div>
  );
};

export default HostPayouts;
