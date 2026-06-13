import {
  Badge,
  OwnerButton,
  PageHeader,
  PillTabs,
  inrFormat,
} from "@/components/common/owner";
import DataTable from "@/components/common/dataTable";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import ReusableModal from "@/components/common/modal/modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FilterDataEnum,
  FilterDataInput,
  Order,
  OrderType,
  RowsPerPageEnum,
  SortDataEnum,
  SortDataInput,
} from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import { convertToRestoTimezone } from "@/utils/formattedTime";
import { sdk } from "@/utils/graphqlClient";
import {
  calculateOrderTotal,
  extractErrorMessage,
  getPageSizeEnum,
  getPageSizeNumber,
} from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Download, Plus, Upload } from "lucide-react";
import { FiClock } from "react-icons/fi";
import { format } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";

type OrderHistoryItem = {
  __typename?: "Order";
  _id: string;
  orderId: string;
  orderType: OrderType | null | undefined;
  createdAt: string;
  items: {
    __typename?: "OrderItem";
    itemPrice: number;
    itemName: string;
    qty: number;
    modifierGroups: {
      __typename?: "OrderModifierGroups";
      mgName: string;
      selectedModifiers: {
        __typename?: "OrderModifier";
        modifierPrice: number;
        modifierName: string;
      }[];
    }[];
  }[];
};

type Customer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string | null;
  phone: string;
  orderHistory: OrderHistoryItem[];
  loyaltyWallet: {
    balance: number;
    lifeTimePointsEarned: number;
  };
  createdAt: string;
  ltv: number;
  aov: number;
  aipo: number;
  offerTake: number;
  firstOrderDate: string;
  lastOrderDate: string;
};

type RangeTab = "1m" | "3m" | "6m" | "1y";

const rangeTabs = [
  { value: "1m", label: "1m" },
  { value: "3m", label: "3m" },
  { value: "6m", label: "6m" },
  { value: "1y", label: "1y" },
] satisfies { value: RangeTab; label: string }[];

const customerName = (customer: Customer) =>
  [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
  "Unnamed customer";

const tierForCustomer = (customer: Customer) => {
  if (Number(customer.ltv ?? 0) >= 20000 || customer.orderHistory.length >= 10) {
    return "Founder";
  }
  if (Number(customer.ltv ?? 0) >= 8000 || customer.orderHistory.length >= 4) {
    return "Insider";
  }
  return "Regular";
};

const CustomerRecord: React.FC = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [orderHistoryData, setOrderHistoryData] = useState<
    OrderHistoryItem[] | null
  >(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [pageSize, setPageSize] = useState<RowsPerPageEnum>(
    RowsPerPageEnum.Ten
  );
  const [filterData, setFilterData] = useState<{
    key?: string;
    filterFn?: FilterDataEnum;
    value?: string | string[];
  }>();
  const [searchFilter, setSearchFilter] = useState("");
  const [sortData, setSortData] = useState<{
    key?: string;
    sortType?: SortDataEnum;
  }>();
  const [downloadBtnLoading, setDownloadBtnLoading] = useState(false);
  const [range, setRange] = useState<RangeTab>("6m");
  const { timezone } = useHostsStore();
  const downloadFileName = useMemo(() => "CustomerData", []);

  useEffect(() => {
    setSelectedSideBarMenu("Customers");
  }, [setSelectedSideBarMenu]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let filterInput: FilterDataInput | null = null;
        let sortInput: SortDataInput | null = null;

        if (
          filterData?.key &&
          filterData.value &&
          filterData.filterFn
        ) {
          filterInput = {
            key: filterData.key,
            operation: filterData.filterFn,
          };

          if (Array.isArray(filterData.value)) {
            filterInput.valueArr = filterData.value;
          } else {
            filterInput.value = filterData.value.toString();
          }
        }

        if (sortData?.key && sortData.sortType) {
          sortInput = {
            key: sortData.key,
            sortType: sortData.sortType,
          };
        }

        const response = await sdk.fetchRestaurantCustomers({
          pagination: {
            pageNumber: pageIndex,
            rowsPerPage: pageSize,
          },
          filter: filterInput ? [filterInput] : null,
          sort: sortInput,
          search: searchFilter.trim() === "" ? null : searchFilter,
        });

        if (!response?.fetchRestaurantCustomers) {
          setToastData({
            type: "error",
            message: "Unable to load customer list, please try again later.",
          });
          return;
        }

        setData(
          response.fetchRestaurantCustomers.items.map((el: any) => ({
            _id: el._id,
            aov: Number(el.aov ?? 0),
            dob: el.dob ? format(el.dob, "dd/MM/yyyy") : null,
            createdAt: el.createdAt,
            email: el.email ?? "",
            phone: el.phone ?? "",
            firstName: el.firstName ?? "",
            firstOrderDate: el.firstOrderDate,
            lastName: el.lastName ?? "",
            lastOrderDate: el.lastOrderDate,
            loyaltyWallet: el.loyaltyWallet ?? {
              balance: 0,
              lifeTimePointsEarned: 0,
            },
            ltv: Number(el.ltv ?? 0),
            aipo: Number(el.aipo ?? 0),
            offerTake: Number(el.offerTake ?? 0),
            orderHistory: el.orderHistory ?? [],
          }))
        );
        setTotalData(response.fetchRestaurantCustomers.total ?? 0);
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [
    pageIndex,
    pageSize,
    setToastData,
    filterData,
    sortData,
    searchFilter,
  ]);

  const pageCount = Math.max(
    Math.ceil(totalData / getPageSizeNumber(pageSize)),
    1
  );

  const openOrderHistory = (customer: Customer) => {
    setOrderHistoryData(customer.orderHistory);
    setIsOrderHistoryOpen(true);
  };

  const columnHelper = createColumnHelper<Customer>();

  const columns: ColumnDef<Customer, any>[] = useMemo(
    () => [
      columnHelper.accessor("firstName", {
        header: "Name",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: true,
        cell: ({ row }) => {
          const name = customerName(row.original);
          return (
            <DataTableTextCell
              className="cursor-pointer"
              onClick={() => openOrderHistory(row.original)}
              value={name}
            />
          );
        },
      }),
      columnHelper.accessor("lastOrderDate", {
        header: "Last event",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell
            value={
              row.original.lastOrderDate
                ? convertToRestoTimezone(
                    timezone,
                    new Date(row.original.lastOrderDate)
                  )
                : "No orders"
            }
          />
        ),
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell value={row.original.phone || "N/A"} />
        ),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        enableColumnFilter: true,
        filterFn: "auto",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableTextCell value={row.original.email || "N/A"} />
        ),
      }),
      columnHelper.accessor("orderHistory", {
        header: "Shows",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell
            value={row.original.orderHistory.length.toLocaleString("en-IN")}
          />
        ),
      }),
      columnHelper.accessor("ltv", {
        header: "Spent",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {inrFormat(row.original.ltv)}
          </span>
        ),
      }),
      columnHelper.accessor("aov", {
        header: "AOV",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-owner-fg-1 tabular-nums">
            {inrFormat(row.original.aov)}
          </span>
        ),
      }),
      columnHelper.accessor("firstOrderDate", {
        header: "Customer since",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <DataTableTextCell
            value={
              row.original.firstOrderDate
                ? format(new Date(row.original.firstOrderDate), "MMM yyyy")
                : "—"
            }
          />
        ),
      }),
      columnHelper.display({
        id: "tier",
        header: "Tier",
        cell: ({ row }) => {
          const tier = tierForCustomer(row.original);
          return (
            <Badge
              tone={
                tier === "Founder"
                  ? "info"
                  : tier === "Insider"
                  ? "success"
                  : "neutral"
              }
            >
              {tier}
            </Badge>
          );
        },
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
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TooltipProvider>
            <div className="flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger>
                  <FiClock
                    className="text-primary text-lg cursor-pointer"
                    onClick={() => openOrderHistory(row.original)}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-xs">
                  <p>Order history</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnHelper, timezone]
  );

  const insights = useMemo(() => {
    const returning = data.filter((customer) => customer.orderHistory.length > 1);
    const emailSubscribers = data.filter((customer) => customer.email);
    const whatsappOptIns = data.filter((customer) => customer.phone);
    return [
      { label: "New Customers", value: totalData || data.length },
      { label: "Returning Customers", value: returning.length },
      { label: "New Subscribers", value: emailSubscribers.length },
      { label: "Email Subscribers", value: emailSubscribers.length },
      { label: "WhatsApp Opt-ins", value: whatsappOptIns.length },
    ];
  }, [data, totalData]);

  const handleCsvDownload = async () => {
    setDownloadBtnLoading(true);
    try {
      const response = await sdk.restaurantCustomerCSVDownload({
        input: {
          fileName: downloadFileName,
          selectedRows: undefined,
        },
      });

      if (!response.restaurantCustomerCSVDownload) {
        setToastData({
          message: "Unable to fetch customer export, please try again.",
          type: "error",
        });
        return;
      }

      window.open(response.restaurantCustomerCSVDownload, "_blank", "noreferrer");
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setDownloadBtnLoading(false);
    }
  };

  return (
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

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="text-[15px] font-medium text-owner-fg-2">
          Customer Insights
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PillTabs tabs={rangeTabs} value={range} onChange={setRange} />
          <OwnerButton variant="secondary" trailingIcon={<Download size={14} />}>
            See All Reports
          </OwnerButton>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {insights.map((insight) => (
          <div key={insight.label}>
            <div className="mb-2.5 text-[14px] text-owner-fg-3">
              {insight.label}
            </div>
            <div className="text-[32px] font-semibold tracking-[-0.02em] text-owner-fg-1 tabular-nums">
              {Number(insight.value ?? 0).toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>

      <DataTable
        totalRows={totalData}
        columns={columns}
        data={data}
        loading={loading}
        manualPagination={true}
        pageSize={getPageSizeNumber(pageSize)}
        pageCount={pageCount}
        nextPage={() => {
          if (pageIndex < pageCount) setPageIndex((prev) => prev + 1);
        }}
        prevPage={() => {
          if (pageIndex > 1) setPageIndex((prev) => prev - 1);
        }}
        paginationData={{
          pageIndex: pageIndex - 1,
          pageSize: getPageSizeNumber(pageSize),
        }}
        pageSizeChangeHandler={(size) => {
          setPageIndex(1);
          setPageSize(getPageSizeEnum(size));
        }}
        downloadClickHandler={async () => {
          await handleCsvDownload();
        }}
        downloadFileName={downloadFileName}
        downloadLoading={downloadBtnLoading}
        filterClickHandler={async (next) => {
          setPageIndex(1);
          setSearchFilter("");
          setFilterData(next);
        }}
        sortClickHandler={async (next) => {
          setSortData(next);
        }}
        searchFilter={searchFilter}
        setSearchFilter={(value) => {
          setPageIndex(1);
          setFilterData(undefined);
          setSearchFilter(value);
        }}
      />

      <ReusableModal
        isOpen={isOrderHistoryOpen}
        width="md"
        onClose={() => {
          setIsOrderHistoryOpen(false);
          setOrderHistoryData(null);
        }}
        title="Order History"
      >
        <div className="flex flex-col space-y-2">
          {orderHistoryData && orderHistoryData.length > 0 ? (
            orderHistoryData.map((order, index) => (
              <div
                key={`${order.orderId || index}-${index}`}
                className="flex items-center justify-between border-b border-owner-border-soft p-2"
              >
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-owner-fg-1">
                      #{order.orderId}
                    </p>
                    <span className="text-sm font-medium text-owner-fg-3">
                      | {inrFormat(calculateOrderTotal(order as Order))}
                    </span>
                  </div>
                  <p className="text-sm text-owner-fg-3">
                    {convertToRestoTimezone(timezone, new Date(order.createdAt))}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-owner-fg-4">
              No order history available.
            </p>
          )}
        </div>
      </ReusableModal>
    </div>
  );
};

export default CustomerRecord;
