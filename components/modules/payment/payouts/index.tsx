// @ts-nocheck
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GetPayoutsQueryVariables,
  Payout,
  PayoutStatus,
  RowsPerPageEnum,
} from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage, getPageSizeNumber } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { ReceiptTextIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import PayoutDetailModal from "./payout-detail";

type PayoutRow = Omit<Payout, "__typename">;

type PayoutRowType = {
  id: string;
} & PayoutRow;

const PayoutsTable: React.FC = () => {
  const [selectedPayoutId, setSelectedPayoutId] = useState<string>();
  const [hasMore, setHasMore] = useState(true);
  const [lastRow, setLastRow] = useState<string>();
  const [data, setData] = useState<PayoutRowType[]>([]);
  const [loading, setLoading] = useState(false);
  const { setToastData } = useGlobalStore();

  // Fetch payouts data
  useEffect(() => {
    const fetchFunc = async () => {
      setLoading(true);
      try {
        let input: GetPayoutsQueryVariables = {};

        if (lastRow) {
          input = {
            startingAfter: lastRow,
          };
        }

        const response = await sdk.getPayouts(input);

        if (!response?.getPayouts) {
          setToastData({
            type: "error",
            message: "Unable to load payouts, please try again later",
          });
          return;
        }

        setHasMore(response.getPayouts.hasMore);

        if (lastRow) {
          setData((prev) => {
            return [
              ...prev,
              ...response.getPayouts.data.map((e) => ({
                ...e,
                id: e.stripePayoutId || e.razorpayPayoutId,
              })),
            ];
          });
        } else {
          setData(
            response.getPayouts.data.map((e) => ({
              ...e,
              id: e.stripePayoutId || e.razorpayPayoutId,
            }))
          );
        }
      } catch (error: any) {
        const errorMessage = extractErrorMessage(error);
        setToastData({
          type: "error",
          message: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFunc();
  }, [setToastData, lastRow]);

  // Table configuration
  const columnHelper = createColumnHelper<PayoutRowType>();

  const columns: ColumnDef<PayoutRowType, any>[] = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Payout ID",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        // sortingFn: "textCaseSensitive",
        // sortDescFirst: true,
        cell: ({ row }) => {
          return <DataTableTextCell value={row.original.id} />;
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => {
          // Add status styling based on value
          const getStatusColor = (status: PayoutStatus) => {
            switch (status) {
              case PayoutStatus.Paid:
                return "bg-green-100 text-green-600";
              case PayoutStatus.Failed:
                return "bg-red-100 text-yellow-600";
              case PayoutStatus.Pending:
              case PayoutStatus.InTransit:
                return "bg-yellow-100 text-yellow-600";
              default:
                return "text-gray-600";
            }
          };

          const getStatusText = (status: PayoutStatus) => {
            switch (status) {
              case PayoutStatus.Paid:
                return "Paid";
              case PayoutStatus.Failed:
                return "Failed";
              case PayoutStatus.Pending:
                return "Pending";
              case PayoutStatus.InTransit:
                return "In Transit";
              default:
                return "N/A";
            }
          };

          return (
            <span
              className={`font-medium px-4 py-2 rounded-full ${getStatusColor(
                row.original.status
              )}`}
            >
              {getStatusText(row.original.status)}
            </span>
          );
        },
      }),
      columnHelper.accessor("destination", {
        header: "Bank Name",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => {
          return <DataTableTextCell value={row.original.destination} />;
        },
      }),
      columnHelper.accessor("payoutAmount", {
        header: "Amount",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          // Format amount as currency
          const formattedAmount = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(row.original.payoutAmount);
          return <DataTableTextCell value={formattedAmount} />;
        },
      }),
      columnHelper.accessor("payoutInitDate", {
        header: "Initiated Date",
        enableColumnFilter: false,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          // Format date
          const date = new Date(row.original.payoutInitDate);
          const formattedDate = format(date, "dd MMM, yyyy");
          return <DataTableTextCell value={formattedDate} />;
        },
      }),
      columnHelper.accessor("payoutArrivalDate", {
        header: "Arrival Date",
        enableColumnFilter: false,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          // Format date
          const date = new Date(row.original.payoutArrivalDate);
          const formattedDate = format(date, "dd MMM, yyyy");
          return <DataTableTextCell value={formattedDate} />;
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-center">
              <TooltipProvider>
                {/* Edit Promo Code Icon */}
                <Tooltip>
                  <TooltipTrigger>
                    <ReceiptTextIcon
                      size={14}
                      onClick={() => {
                        setSelectedPayoutId(row.original.id);
                      }}
                      className="text-primary cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white max-w-xs">
                    <p>View payout details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      }),
    ],
    [columnHelper]
  );

  return (
    <>
      <div className="py-2" style={{ height: "calc(100vh - 140px)" }}>
        <DataTable
          totalRows={data.length}
          columns={columns}
          data={data}
          loading={loading}
          manualPagination={false}
          pageSize={1000000}
          downloadFileName="Payouts_Data"
          cursorPagination={true}
          hasMore={hasMore}
          loadMore={(lastRow: string) => {
            setLastRow(lastRow);
          }}
          hideSearch
        />
      </div>

      {/* Payout Details Modal */}
      {selectedPayoutId ? (
        <PayoutDetailModal
          selectedPayoutId={selectedPayoutId}
          onClose={() => {
            setSelectedPayoutId(undefined);
          }}
        />
      ) : null}
    </>
  );
};

export default PayoutsTable;
