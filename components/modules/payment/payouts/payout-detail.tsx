// @ts-nocheck
import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import DataTable from "@/components/common/dataTable";
import DataTableDateTimeCell from "@/components/common/dataTable/common/dateTimeCell";
import DataTableNumberCell from "@/components/common/dataTable/common/numberCell";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import { PayoutDetail, PayoutTransaction } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage, formatNumberToMax2 } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { FiX } from "react-icons/fi";

interface PayoutDetailProps {
  selectedPayoutId?: string;
  onClose: () => void;
}

type TransactionRow = Omit<PayoutTransaction, "__typename">;

type TransactionRowType = {
  id: string;
} & TransactionRow;

type TPayoutDetail = Omit<PayoutDetail, "stripePayoutId">;

const PayoutDetailSection = ({
  title,
  value,
  isNegative,
}: {
  title: string;
  value: number;
  isNegative: boolean;
}) => (
  <div className="flex flex-1 w-full flex-col items-start justify-start px-2">
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p
      className={`text-lg font-medium text-blackBg mt-auto ${
        isNegative ? "text-red-500" : ""
      }`}
    >
      ${value}
    </p>
  </div>
);

const PayoutDetailModal: React.FC<PayoutDetailProps> = ({
  onClose,
  selectedPayoutId,
}) => {
  const { setToastData } = useGlobalStore();
  // HOIZR: order receipt store removed (restaurant feature)
  const setIsOrderReciptOpen = (_v: boolean) => {};
  const setOrderReciptId = (_v: string | null) => {};
  const [loading, setLoading] = useState<boolean>(true);
  const [payoutDetails, setPayoutDetails] = useState<TPayoutDetail>();
  const [data, setData] = useState<TransactionRowType[]>([]);
  const [totals, setTotals] = useState<{
    payout: number;
    subtotal: number;
    discount: number;
    taxes: number;
    tips: number;
    chooseFees: number;
    cardFees: number;
    delivery: number;
  }>({
    payout: 0,
    subtotal: 0,
    discount: 0,
    taxes: 0,
    tips: 0,
    chooseFees: 0,
    cardFees: 0,
    delivery: 0,
  });

  const calculateTotals = useCallback((details: TPayoutDetail) => {
    let payout = details.payoutAmount;
    let subtotal = 0;
    let discount = 0;
    let taxes = 0;
    let tips = 0;
    let chooseFees = 0;
    let cardFees = 0;
    let delivery = 0;

    let net = 0;

    details.transactions.forEach((transaction) => {
      subtotal += transaction.subTotalAmount;
      discount += transaction.discountAmount;
      taxes += transaction.taxAmount;
      tips += transaction.tipAmount;
      chooseFees += transaction.platformFeeAmount;
      cardFees += transaction.stripeFeeAmount;
      delivery += transaction.deliveryAmount;
      net += transaction.netAmount;
    });

    return {
      payout,
      subtotal: formatNumberToMax2(subtotal),
      discount: formatNumberToMax2(discount),
      taxes: formatNumberToMax2(taxes),
      tips: formatNumberToMax2(tips),
      chooseFees: formatNumberToMax2(chooseFees),
      cardFees: formatNumberToMax2(cardFees),
      delivery: formatNumberToMax2(delivery),
    };
  }, []);

  useEffect(() => {
    const fetchFunc = async () => {
      setLoading(true);
      try {
        const response = await sdk.getPayoutTransactions({
          payoutId: selectedPayoutId ?? "",
        });

        if (!response?.getPayoutTransactions) {
          setToastData({
            type: "error",
            message: "Unable to load details, please try again later",
          });
          return;
        }

        setPayoutDetails(response.getPayoutTransactions);
        setData(
          response.getPayoutTransactions.transactions.map((e) => ({
            ...e,
            id: e.stripeId,
          }))
        );
        const calcTotals = calculateTotals(response.getPayoutTransactions);
        setTotals(calcTotals);
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

    if (selectedPayoutId) {
      fetchFunc();
    }
  }, [calculateTotals, selectedPayoutId, setToastData]);

  const columnHelper = createColumnHelper<TransactionRowType>();

  const columns: ColumnDef<TransactionRowType, any>[] = useMemo(
    () => [
      columnHelper.accessor("transactionDate", {
        header: "Date",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,

        cell: ({ row }) => {
          return <DataTableDateTimeCell value={row.original.transactionDate} />;
        },
      }),
      columnHelper.accessor("type", {
        header: "Type",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,

        cell: ({ row }) => {
          return <DataTableTextCell value={row.original.type} />;
        },
      }),
      columnHelper.accessor("subTotalAmount", {
        header: "Gross",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <DataTableNumberCell
              isPrice={true}
              value={row.original.subTotalAmount}
            />
          );
        },
      }),
      columnHelper.accessor("discountAmount", {
        header: "Discount",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <DataTableNumberCell
              isPrice={true}
              value={row.original.discountAmount}
            />
          );
        },
      }),
      columnHelper.accessor("netAmount", {
        header: "Net",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <DataTableNumberCell
              isPrice={true}
              value={row.original.netAmount}
            />
          );
        },
      }),
      columnHelper.accessor("deliveryAmount", {
        header: "Delivery",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <DataTableNumberCell
              isPrice={true}
              value={row.original.deliveryAmount}
            />
          );
        },
      }),
      columnHelper.accessor("tipAmount", {
        header: "Tip",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <DataTableNumberCell
              isPrice={true}
              value={row.original.tipAmount}
            />
          );
        },
      }),
      columnHelper.accessor("stripeFeeAmount", {
        header: "Payment Fees",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <DataTableNumberCell
              isPrice={true}
              value={row.original.stripeFeeAmount}
            />
          );
        },
      }),
      columnHelper.accessor("platformFeeAmount", {
        header: "Choose Fees",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <DataTableNumberCell
              isPrice={true}
              value={row.original.platformFeeAmount}
            />
          );
        },
      }),
      columnHelper.accessor("taxAmount", {
        header: "Taxes",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <DataTableNumberCell
              isPrice={true}
              value={row.original.taxAmount}
            />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Order",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2">
              <CButton
                variant={ButtonType.Text}
                type="button"
                onClick={() => {
                  setOrderReciptId(row.original.orderId);
                  setIsOrderReciptOpen(true);
                }}
              >
                Order Details
              </CButton>
            </div>
          );
        },
      }),
    ],
    [columnHelper, setIsOrderReciptOpen, setOrderReciptId]
  );

  if (!selectedPayoutId) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 !m-0">
      <div className="bg-white rounded-xl shadow-2xl w-full h-full overflow-y-auto">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <div className="flex flex-col items-start justify-center space-y-1">
            <p className="text-xl text-blackBg">Payout Details</p>
            <p className="text-xs text-blackBg/40">{selectedPayoutId}</p>
          </div>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            onClick={onClose}
          >
            <FiX size={24} className="text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="w-full flex justify-center items-center align-middle ">
            <FaSpinner className="animate-spin text-4xl text-primary" />
          </div>
        ) : payoutDetails ? (
          <div className="px-6 py-2 space-y-3">
            <h2 className="text-lg font-normal mb-2">Overview</h2>
            <div className="flex w-full">
              <div className="flex flex-wrap w-full">
                <PayoutDetailSection
                  isNegative={false}
                  title="Payout Amount"
                  value={totals.payout}
                />
                <PayoutDetailSection
                  isNegative={false}
                  title="Gross Sales"
                  value={totals.subtotal}
                />
                <PayoutDetailSection
                  isNegative={true}
                  title="Discount"
                  value={totals.discount}
                />
                <PayoutDetailSection
                  isNegative={false}
                  title="Taxes"
                  value={totals.taxes}
                />
                <PayoutDetailSection
                  isNegative={false}
                  title="Tips"
                  value={totals.tips}
                />
                <PayoutDetailSection
                  isNegative={false}
                  title="Choose Fees"
                  value={totals.chooseFees}
                />
                <PayoutDetailSection
                  isNegative={true}
                  title="Payment Fees"
                  value={totals.cardFees}
                />
                <PayoutDetailSection
                  isNegative={false}
                  title="Delivery"
                  value={totals.delivery}
                />
              </div>
            </div>

            <hr />
            <br />
            <section className="flex-grow overflow-y-auto">
              <h2 className="text-lg font-normal mb-2">
                Transactions ({payoutDetails.transactions.length})
              </h2>
              <div className="overflow-y-auto max-h-[calc(100vh-340px)]">
                {payoutDetails.transactions.length > 0 ? (
                  <DataTable
                    totalRows={data.length}
                    columns={columns}
                    data={data}
                    loading={loading}
                    manualPagination={false}
                    pageSize={100}
                    downloadFileName="Payouts_Data"
                    staticTable={true}
                  />
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    There are no transactions.
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-red-500">Failed to load payout details.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default PayoutDetailModal;
