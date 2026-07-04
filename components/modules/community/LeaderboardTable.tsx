"use client";

import { Badge, BadgeTone, PageHeader } from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  fetchLoyaltyLeaderboard,
  LoyaltyLeaderboardRow,
} from "@/utils/communityClient";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";

/** Global loyalty tier ladder (host-tunable bands come later). */
const tierFor = (points: number): { label: string; tone: BadgeTone } => {
  if (points >= 2000) return { label: "Legend", tone: "success" };
  if (points >= 500) return { label: "Insider", tone: "info" };
  return { label: "Regular", tone: "neutral" };
};

const PAGE_SIZE = 25;

const LeaderboardTable: React.FC = () => {
  const [data, setData] = useState<LoyaltyLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();

  useEffect(() => {
    setSelectedSideBarMenu("Community");
  }, [setSelectedSideBarMenu]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const resp = await fetchLoyaltyLeaderboard(pageIndex, PAGE_SIZE);
        setData(resp.items);
        setTotalData(resp.total);
      } catch (err) {
        setToastData({ type: "error", message: extractErrorMessage(err) });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [pageIndex, setToastData]);

  const pageCount = Math.max(Math.ceil(totalData / PAGE_SIZE), 1);
  const columnHelper = createColumnHelper<LoyaltyLeaderboardRow>();

  const columns: ColumnDef<LoyaltyLeaderboardRow, any>[] = useMemo(
    () => [
      columnHelper.accessor("rank", {
        header: "#",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-owner-fg-1 tabular-nums">
            {row.original.rank}
          </span>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Fan",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell value={row.original.name ?? "Customer"} />
        ),
      }),
      columnHelper.accessor("lifetimePoints", {
        header: "Lifetime points",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {(row.original.lifetimePoints ?? 0).toLocaleString("en-IN")}
          </span>
        ),
      }),
      columnHelper.display({
        id: "tier",
        header: "Tier",
        cell: ({ row }) => {
          const tier = tierFor(row.original.lifetimePoints ?? 0);
          return <Badge tone={tier.tone}>{tier.label}</Badge>;
        },
      }),
    ],
    [columnHelper]
  );

  return (
    <div className="min-w-0">
      <PageHeader
        title="Community"
        subtitle="Your top fans, ranked by the loyalty points they've earned with you."
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
        paginationData={{ pageIndex: pageIndex - 1, pageSize: PAGE_SIZE }}
        pageSizeChangeHandler={() => {}}
      />
    </div>
  );
};

export default LeaderboardTable;
