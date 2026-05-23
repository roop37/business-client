import DataTable from "@/components/common/dataTable";
import DataTableDateTimeCell from "@/components/common/dataTable/common/dateTimeCell";
import DataTableListCell from "@/components/common/dataTable/common/listCell";
import DataTableNumberCell from "@/components/common/dataTable/common/numberCell";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import { Checkbox } from "@/components/ui/checkbox";

import {
  FilterDataEnum,
  FilterDataInput,
  PermissionTypeEnum,
  ReportsTypeEnum,
  RowsPerPageEnum,
  SortDataEnum,
  SortDataInput,
} from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import useUserStore from "@/store/user";
import { convertToRestoTimezone } from "@/utils/formattedTime";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import {
  extractErrorMessage,
  formatReportType,
  getPageSizeEnum,
  getPageSizeNumber,
} from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { FaSpinner } from "react-icons/fa";

const CustomerReport = () => {
  const columnHelper = createColumnHelper<any>();

  const { setSelectedSideBarMenu } = useGlobalStore();
  const { meUser } = useUserStore();
  const { timezone } = useHostsStore();
  const router = useRouter();

  // Configs
  const [downloadBtnLoading, setDownloadBtnLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { setToastData } = useGlobalStore();

  // Table Pagination States
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalData, setTotalData] = useState<number>(0);
  const [pageSize, setPageSize] = useState<RowsPerPageEnum>(
    RowsPerPageEnum.Ten
  );

  // Table Filter States
  const [filterData, setFilterData] = useState<{
    key?: string;
    filterFn?: FilterDataEnum;
    value?: string | string[];
  }>();
  const [searchFilter, setSearchFilter] = useState<string>();
  const [hasDownloadAccess, setHasDownloadAccess] = useState(false);

  // Table Sorting States
  const [sortData, setSortData] = useState<{
    key?: string;
    sortType?: SortDataEnum;
  }>();

  useEffect(() => {
    const canAccess = hasAccess(
      meUser?.permissions ?? [],
      PermissionTypeEnum.DownloadReports
    );

    setHasDownloadAccess(canAccess);
  }, [meUser?.permissions]);

  useEffect(() => {
    setSelectedSideBarMenu(formatReportType(ReportsTypeEnum.CustomerReport));

    const fetch = async () => {
      setLoading(true);
      try {
        let filterInput: FilterDataInput | null = null;
        let sortInput: SortDataInput | null = null;

        if (
          filterData &&
          filterData.key &&
          filterData.value &&
          filterData.filterFn
        ) {
          filterInput = {
            key: filterData.key,
            operation: filterData.filterFn,
          };

          if (Array.isArray(filterData.value)) {
            filterInput.valueArr = filterData.value as string[];
          } else {
            filterInput.value = filterData.value.toString();
          }
        }

        if (sortData) {
          if (sortData.key && sortData.sortType) {
            sortInput = {
              key: sortData.key,
              sortType: sortData.sortType,
            };
          }
        }

        const response = await sdk.fetchRestaurantCustomerReport({
          pagination: {
            pageNumber: pageIndex,
            rowsPerPage: pageSize,
          },
          filter: filterInput ? [filterInput] : null,
          sort: sortInput,
          search: (searchFilter ?? "") === "" ? null : searchFilter,
        });
        if (!response?.fetchRestaurantCustomersReport) {
          setToastData({
            type: "error",
            message: "Unable to load customer list, please try again later.",
          });
          return;
        }

        setData(
          response.fetchRestaurantCustomersReport.items.map((el) => ({
            id: el._id,
            _id: el._id,
            aov: el.aov,
            name: el.name,
            dob: el.dob ? format(el.dob, "dd/MM/yyyy") : null,
            email: el.email ?? "",
            phone: el.phone,
            firstOrderDate: el.firstOrderDate,
            lastOrderDate: el.lastOrderDate,
            loyaltyWallet: el.loyaltyWallet,
            ltv: el.ltv,
            offerTake: el.offerTake,
            offerTakePercentage: el.offerTakeRatePercentage,
            orders: el.orders ?? 0,
            emailComms: el?.accountPreferences?.email,
            phoneComms: el?.accountPreferences?.sms,
            createdAt: el.createdAt,
            campaignSuccessRate: el.campaignSuccessRate,
          }))
        );
        setTotalData(response.fetchRestaurantCustomersReport.total);
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

    fetch();
  }, [
    pageIndex,
    pageSize,
    setToastData,
    filterData,
    sortData,
    setSelectedSideBarMenu,
    searchFilter,
  ]);

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px] mr-4 rounded-sm"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px] mr-4 rounded-sm"
          />
        ),
      }),
      columnHelper.accessor("_id", {
        header: "ID",
        enableColumnFilter: true,
        cell: ({ getValue }) => <DataTableTextCell value={getValue()} />,
      }),
      columnHelper.accessor("name", {
        header: "Name",
        enableColumnFilter: true,
        cell: ({ getValue }) => <DataTableTextCell value={getValue()} />,
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        enableColumnFilter: true,
        cell: ({ getValue }) => <DataTableTextCell value={getValue()} />,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        enableColumnFilter: true,
        cell: ({ getValue }) => <DataTableTextCell value={getValue()} />,
      }),
      columnHelper.accessor("dob", {
        header: "Date of Birth",
        enableColumnFilter: false,
        cell: ({ getValue }) => <DataTableTextCell value={getValue()} />,
      }),
      columnHelper.accessor("aov", {
        header: "AOV",
        enableColumnFilter: false,
        enableSorting: false,

        cell: ({ getValue }) => (
          <DataTableNumberCell isPrice={true} value={getValue()} />
        ),
      }),
      columnHelper.accessor("ltv", {
        header: "LTV",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ getValue }) => (
          <DataTableNumberCell isPrice={true} value={getValue()} />
        ),
      }),

      columnHelper.accessor("offerTake", {
        header: "Offers Used",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ getValue }) => <DataTableNumberCell value={getValue()} />,
      }),

      columnHelper.accessor("offerTakePercentage", {
        header: "Offers Take Percentage",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ getValue }) => (
          <DataTableNumberCell isPercentage={true} value={getValue()} />
        ),
      }),
      columnHelper.accessor("loyaltyWallet.lifeTimePointsEarned", {
        header: "Lifetime points earned",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <DataTableNumberCell
              value={row.original.loyaltyWallet.lifeTimePointsEarned}
            />
          );
        },
      }),

      columnHelper.accessor("loyaltyWallet.balance", {
        header: "Balance",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <DataTableNumberCell value={row.original.loyaltyWallet.balance} />
          );
        },
      }),

      columnHelper.display({
        header: "Points Used",
        enableColumnFilter: false,
        enableSorting: false,

        id: "pointsUsed",
        cell: ({ row }) => {
          return (
            <DataTableNumberCell
              value={Math.abs(
                row.original.loyaltyWallet.balance -
                  row.original.loyaltyWallet.lifeTimePointsEarned
              )}
            />
          );
        },
      }),
      columnHelper.accessor("campaignSuccessRate", {
        header: "Campaign Success rate",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <DataTableNumberCell
              isPercentage={true}
              value={row.original.campaignSuccessRate}
            />
          );
        },
      }),

      columnHelper.display({
        header: "Email Communications",
        enableColumnFilter: false,
        enableSorting: false,

        id: "EmailCommunications",
        cell: ({ row }) => {
          return (
            <DataTableTextCell
              value={row.original.emailComms ? "Allowed" : "Not Allowed"}
            />
          );
        },
      }),
      columnHelper.display({
        header: "SMS Communications	",
        enableColumnFilter: false,
        enableSorting: false,

        id: "SMSCommunications	",
        cell: ({ row }) => {
          return (
            <DataTableTextCell
              value={row.original.phoneComms ? "Allowed" : "Not Allowed"}
            />
          );
        },
      }),

      columnHelper.accessor("firstOrderDate", {
        header: "First Order Date",
        enableColumnFilter: false,
        cell: ({ getValue }) => (
          <DataTableTextCell
            value={convertToRestoTimezone(timezone, getValue())}
          />
        ),
      }),
      columnHelper.accessor("lastOrderDate", {
        header: "Last Order Date",
        enableColumnFilter: false,
        cell: ({ getValue }) => (
          <DataTableTextCell
            value={convertToRestoTimezone(timezone, getValue())}
          />
        ),
      }),

      columnHelper.accessor("createdAt", {
        header: "Created At",
        enableSorting: false,

        enableColumnFilter: false,
        cell: ({ getValue }) => <DataTableDateTimeCell value={getValue()} />,
      }),
    ],
    [columnHelper, timezone]
  );

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin text-gray-500">
          <FaSpinner className="text-primary" size={39} />
        </div>
      </div>
    );
  }

  const handleCsvDownload = async (selectedIds?: string[]) => {
    setDownloadBtnLoading(true);
    try {
      const response = await sdk.restaurantCustomerReportCSVDownload({
        input: {
          fileName: "customer-report",
          selectedRows: selectedIds,
        },
      });

      if (!response.restaurantCustomerReportCSVDownload) {
        setToastData({
          message: "Unable to fetch full admin data, please try again!",
          type: "error",
        });
        return;
      }

      window.open(
        response.restaurantCustomerReportCSVDownload,
        "_blank",
        "noreferrer"
      );
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setToastData({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setDownloadBtnLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            router.back();
          }}
          className="flex flex-row justify-center items-center space-x-1 group cursor-pointer text-sm"
        >
          <ChevronLeft
            className="group-hover:text-primary inline-block"
            size={18}
          />
          <span className="group-hover:text-primary">Go Back</span>
        </button>
      </div>
      <div
        style={{ height: "calc(100vh - 180px)" }}
        className={`${
          filterData || sortData || data?.length || searchFilter ? "" : "hidden"
        }`}
      >
        <DataTable
          totalRows={totalData}
          columns={columns}
          data={data}
          loading={loading}
          manualPagination={true}
          pageSize={getPageSizeNumber(pageSize)}
          pageCount={Math.ceil(totalData / getPageSizeNumber(pageSize))}
          nextPage={() => {
            const totalPages = Math.ceil(
              totalData / getPageSizeNumber(pageSize)
            );
            if (pageIndex < totalPages) {
              setPageIndex((prev) => prev + 1);
            }
          }}
          prevPage={() => {
            if (pageIndex > 1) {
              setPageIndex((prev) => prev - 1);
            }
          }}
          paginationData={{
            pageIndex: pageIndex - 1,
            pageSize: getPageSizeNumber(pageSize),
          }}
          pageSizeChangeHandler={(size) => {
            setPageIndex(1);
            setPageSize(getPageSizeEnum(size));
          }}
          downloadClickHandler={async (selectedIds) => {
            handleCsvDownload(selectedIds);
          }}
          downloadFileName={"customer-report"}
          downloadLoading={downloadBtnLoading}
          filterClickHandler={async (data) => {
            setPageIndex(1);
            setSearchFilter(undefined);
            setFilterData(data);
          }}
          sortClickHandler={async (data) => {
            setSortData(data);
          }}
          setSearchFilter={(e) => {
            setPageIndex(1);
            setFilterData(undefined);
            setSearchFilter(e);
          }}
        />
      </div>
    </div>
  );
};

export default CustomerReport;
