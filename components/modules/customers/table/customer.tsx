import {
  Badge,
  Card,
  OwnerButton,
  PageHeader,
  PillTabs,
  inrFormat,
} from "@/components/common/owner";
import EmptyStateView from "@/components/common/emptyTableView/emptyTableView";
import ReusableModal from "@/components/common/modal/modal";
import Loader from "@/components/loader";
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
import { Download, Filter, Plus, Search, Upload } from "lucide-react";
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

const initialsFor = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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

      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <div className="owner-search flex-1">
          <Search size={18} />
          <input
            value={searchFilter}
            onChange={(event) => {
              setPageIndex(1);
              setFilterData(undefined);
              setSearchFilter(event.target.value);
            }}
            placeholder="Search customers by name, phone, or email"
          />
        </div>
        <OwnerButton
          variant="secondary"
          leadingIcon={<Filter size={16} />}
        >
          Filter
        </OwnerButton>
        <OwnerButton
          variant="secondary"
          leadingIcon={<Download size={16} />}
          onClick={handleCsvDownload}
          disabled={downloadBtnLoading}
        >
          Export
        </OwnerButton>
      </div>

      <Card padding={0} className="overflow-hidden">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Loader />
          </div>
        ) : data.length ? (
          <div className="overflow-x-auto">
            <table className="owner-table min-w-[1040px]">
              <caption className="sr-only">Customers</caption>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Last event</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Email</th>
                  <th scope="col" className="num">Events</th>
                  <th scope="col" className="num">Spent</th>
                  <th scope="col">Tier</th>
                  <th scope="col">Marketing</th>
                </tr>
              </thead>
              <tbody>
                {data.map((customer, index) => {
                  const name = customerName(customer);
                  const tier = tierForCustomer(customer);
                  return (
                    <tr key={customer._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, hsl(${
                                index * 47
                              }, 70%, 60%), hsl(${
                                index * 47 + 40
                              }, 70%, 50%))`,
                            }}
                          >
                            {initialsFor(name)}
                          </div>
                          <span className="font-medium">{name}</span>
                        </div>
                      </td>
                      <td className="text-owner-fg-3">
                        {customer.lastOrderDate
                          ? convertToRestoTimezone(
                              timezone,
                              new Date(customer.lastOrderDate)
                            )
                          : "No orders"}
                      </td>
                      <td className="text-owner-fg-3 tabular-nums">
                        {customer.phone || "N/A"}
                      </td>
                      <td className="text-owner-fg-3">{customer.email || "N/A"}</td>
                      <td className="num font-medium">
                        {customer.orderHistory.length.toLocaleString("en-IN")}
                      </td>
                      <td className="num">{inrFormat(customer.ltv)}</td>
                      <td>
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
                      </td>
                      <td>
                        <Badge tone={customer.email ? "success" : "neutral"}>
                          {customer.email ? "Subscribed" : "Unsubscribed"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyStateView title="No customers found, please wait for your first customer to arrive!" />
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-owner-border-soft px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[13px] text-owner-fg-4">
            Page {pageIndex} of {pageCount} - {totalData.toLocaleString("en-IN")} customers
          </span>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-owner-sm border border-owner-border bg-owner-bg px-2 text-[13px] text-owner-fg-2"
              value={getPageSizeNumber(pageSize)}
              onChange={(event) => {
                setPageIndex(1);
                setPageSize(getPageSizeEnum(Number(event.target.value)));
              }}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>
            <OwnerButton
              variant="secondary"
              size="sm"
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 1))}
              disabled={pageIndex <= 1}
            >
              Previous
            </OwnerButton>
            <OwnerButton
              variant="secondary"
              size="sm"
              onClick={() => setPageIndex((prev) => Math.min(prev + 1, pageCount))}
              disabled={pageIndex >= pageCount}
            >
              Next
            </OwnerButton>
          </div>
        </div>
      </Card>

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
