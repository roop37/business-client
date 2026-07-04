"use client";

import {
  Badge,
  BadgeTone,
  OwnerButton,
  PageHeader,
  inrFormat,
} from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { GraphQLClient } from "graphql-request";
import { Plus, Upload } from "lucide-react";
import { format } from "date-fns";
import CustomerOrdersModal from "../CustomerOrdersModal";
import React, { useEffect, useMemo, useState } from "react";

type HostCustomerRow = {
  customerId: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  orderCount: number;
  showsAttended: number;
  totalSpent: number;
  aov: number;
  lifetimePoints: number;
  customerSince?: string | null;
};

/** Global loyalty tier ladder (host-tunable bands come later). */
const tierFor = (points: number): { label: string; tone: BadgeTone } => {
  if (points >= 2000) return { label: "Legend", tone: "success" };
  if (points >= 500) return { label: "Insider", tone: "info" };
  return { label: "Regular", tone: "neutral" };
};

const resolveEndpoint = (): string => {
  const base = process.env.NEXT_PUBLIC_SERVER_BASE_URL?.replace(/\/+$/, "");
  if (!base) return "http://localhost:4000/graphql";
  return base.endsWith("/graphql") ? base : `${base}/graphql`;
};

const gql = new GraphQLClient(resolveEndpoint(), {
  credentials: "include",
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    let res = await fetch(input, init);
    if (res.status === 401) {
      try {
        const refresher = new GraphQLClient(resolveEndpoint(), {
          credentials: "include",
        });
        await refresher.request("mutation { tokensRefresh }");
        res = await fetch(input, init);
      } catch {
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return res;
  },
});

const HOST_CUSTOMERS_QUERY = `
  query HostCustomers($page: Int, $pageSize: Int) {
    hostCustomers(page: $page, pageSize: $pageSize) {
      total
      items {
        customerId name email phone orderCount showsAttended totalSpent aov lifetimePoints customerSince
      }
    }
  }
`;

const PAGE_SIZE = 25;

const CustomerRecord: React.FC = () => {
  const [data, setData] = useState<HostCustomerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<HostCustomerRow | null>(null);
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();

  useEffect(() => {
    setSelectedSideBarMenu("Customers");
  }, [setSelectedSideBarMenu]);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const resp = await gql.request<{
          hostCustomers: { items: HostCustomerRow[]; total: number };
        }>(HOST_CUSTOMERS_QUERY, { page: pageIndex, pageSize: PAGE_SIZE });
        setData(resp.hostCustomers.items ?? []);
        setTotalData(resp.hostCustomers.total ?? 0);
      } catch (err) {
        setToastData({ type: "error", message: extractErrorMessage(err) });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [pageIndex, setToastData]);

  const pageCount = Math.max(Math.ceil(totalData / PAGE_SIZE), 1);

  const columnHelper = createColumnHelper<HostCustomerRow>();

  const columns: ColumnDef<HostCustomerRow, any>[] = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell
            className="cursor-pointer hover:text-owner-primary"
            onClick={() => setSelectedCustomer(row.original)}
            value={row.original.name ?? "—"}
          />
        ),
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell value={row.original.phone ?? "—"} />
        ),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell value={row.original.email ?? "—"} />
        ),
      }),
      columnHelper.accessor("showsAttended", {
        header: "Shows",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell
            value={row.original.showsAttended.toLocaleString("en-IN")}
          />
        ),
      }),
      columnHelper.accessor("orderCount", {
        header: "Orders",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell
            value={row.original.orderCount.toLocaleString("en-IN")}
          />
        ),
      }),
      columnHelper.accessor("totalSpent", {
        header: "Spent",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {inrFormat(row.original.totalSpent)}
          </span>
        ),
      }),
      columnHelper.accessor("aov", {
        header: "AOV",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {inrFormat(row.original.aov)}
          </span>
        ),
      }),
      columnHelper.accessor("lifetimePoints", {
        header: "Loyalty",
        enableSorting: false,
        cell: ({ row }) => {
          const pts = row.original.lifetimePoints ?? 0;
          const tier = tierFor(pts);
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
                {pts.toLocaleString("en-IN")}
              </span>
              <Badge tone={tier.tone}>{tier.label}</Badge>
            </div>
          );
        },
      }),
      columnHelper.accessor("customerSince", {
        header: "Customer since",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell
            value={
              row.original.customerSince
                ? format(new Date(row.original.customerSince), "MMM yyyy")
                : "—"
            }
          />
        ),
      }),
      columnHelper.display({
        id: "marketing",
        header: "Marketing",
        cell: ({ row }) => (
          <Badge tone={row.original.email ? "success" : "neutral"}>
            {row.original.email ? "Subscribed" : "Unsubscribed"}
          </Badge>
        ),
      }),
    ],
    [columnHelper]
  );

  return (
    <>
    <CustomerOrdersModal
      customer={selectedCustomer}
      onClose={() => setSelectedCustomer(null)}
    />
    <div className="min-w-0">
      <PageHeader
        title="Customers"
        actions={
          <>
            <OwnerButton variant="secondary" leadingIcon={<Upload size={16} />}>
              Import
            </OwnerButton>
            <OwnerButton leadingIcon={<Plus size={16} />}>
              Add customer
            </OwnerButton>
          </>
        }
      />

      <DataTable
        totalRows={totalData}
        columns={columns}
        data={data}
        loading={loading}
        manualPagination={true}
        pageSize={PAGE_SIZE}
        pageCount={pageCount}
        nextPage={() => {
          if (pageIndex < pageCount) setPageIndex((prev) => prev + 1);
        }}
        prevPage={() => {
          if (pageIndex > 1) setPageIndex((prev) => prev - 1);
        }}
        paginationData={{
          pageIndex: pageIndex - 1,
          pageSize: PAGE_SIZE,
        }}
        pageSizeChangeHandler={() => {}}
      />
    </div>
    </>
  );
};

export default CustomerRecord;
