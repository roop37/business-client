import DataTable from "@/components/common/dataTable";
import DataTableDateTimeCell from "@/components/common/dataTable/common/dateTimeCell";
import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import EmptyStateView from "@/components/common/emptyTableView/emptyTableView";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ActivityActionType,
  ActivityLogResponse,
  FilterDataEnum,
  FilterDataInput,
  RowsPerPageEnum,
  Scalars,
  SortDataEnum,
  SortDataInput,
} from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import {
  extractErrorMessage,
  getPageSizeEnum,
  getPageSizeNumber,
} from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";

export type ActivityLogWithId = ActivityLogResponse & {
  id: Scalars["String"]["output"];
};

const HostLogs: React.FC = () => {
  const { setToastData } = useGlobalStore();

  const [data, setData] = useState<ActivityLogWithId[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Table Sorting States
  const [sortData, setSortData] = useState<{
    key?: string;
    sortType?: SortDataEnum;
  }>();

  // Table Download States
  const downloadFileName = useMemo(() => "Logs", []);
  const [downloadBtnLoading, setDownloadBtnLoading] = useState(false);

  useEffect(() => {
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

        const response = await sdk.getActivityLogs({
          pagination: {
            pageNumber: pageIndex,
            rowsPerPage: pageSize,
          },
          filter: filterInput ? [filterInput] : null,
          sort: sortInput,
          search: (searchFilter ?? "") === "" ? null : searchFilter,
        });
        if (!response?.getActivityLogs) {
          setToastData({
            type: "error",
            message: "Something went wrong, please try again later",
          });
          return;
        }

        setData(
          response.getActivityLogs.activityLogs.map((el) => ({
            id: el._id,
            _id: el._id,
            actionType: el.actionType,
            createdAt: el.createdAt,
            description: el.description,
            performedBy: el.performedBy,
            performedOn: el.performedOn,
            updatedAt: el.updatedAt,
          }))
        );
        setTotalData(response.getActivityLogs.total);
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
  }, [pageIndex, pageSize, setToastData, filterData, sortData, searchFilter]);

  const formatType = (type: ActivityActionType): string => {
    switch (type) {
      case ActivityActionType.CloverStatus:
        return "Clover Status Change";
      case ActivityActionType.OnlineOrderingStatus:
        return "Online Ordering Status Change";
      case ActivityActionType.UserLogin:
        return "User Login";
      case ActivityActionType.RefundOrder:
        return "Refund";
      case ActivityActionType.UserLogout:
        return "User Logout";
      case ActivityActionType.RefundOrderLoyaltyPoints:
        return "Refund Points";
      case ActivityActionType.CategoryStatus:
        return "Category Status Change";
      case ActivityActionType.ItemStatus:
        return "Item Status Change";
      case ActivityActionType.MenuStatus:
        return "Menu Status Change";
      case ActivityActionType.ItemRedemption:
        return "Loyalty Rewards";
      case ActivityActionType.PointsRedemption:
        return "Loyalty Rewards";
      case ActivityActionType.SquareStatus:
        return "Square Status Change";
      case ActivityActionType.WebsiteBuilderModified:
        return "Website Builder Modified";
      case ActivityActionType.BulkItemUpdated:
        return "Bulk Item Updated";
      case ActivityActionType.BulkCatUpdated:
        return "Bulk Category Updated";
      case ActivityActionType.PosSync:
        return "POS Sync";
      case ActivityActionType.AutoPosSync:
        return "Auto POS Sync";
      case ActivityActionType.TaxRateUpdated:
        return "Tax Rate Updated";
      case ActivityActionType.PromoCodeUpdated:
        return "Promo Code Updated";
      case ActivityActionType.RestaurantSettingsUpdated:
        return "Settings Updated";
      case ActivityActionType.TeamUpdated:
        return "Team Updated";
      case ActivityActionType.LoyaltySettingsUpdated:
        return "Loyalty Settings Updated";
      case ActivityActionType.SyncRulesUpdated:
        return "Sync Rules Updated";

      default:
        return "";
    }
  };

  // Table Config
  const columnHelper = useMemo(
    () => createColumnHelper<ActivityLogResponse>(),
    []
  );

  const columns: ColumnDef<ActivityLogResponse, any>[] = useMemo(
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

      columnHelper.accessor("performedBy", {
        header: "User",
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              <DataTableTextCell value={row.original.performedBy} />
            </div>
          );
        },
      }),

      columnHelper.accessor("actionType", {
        header: "Action",
        enableSorting: false,
        cell: ({ row }) => {
          const type = row.original.actionType;
          return (
            <div className="flex items-center">
              <DataTableTextCell value={formatType(type)} />
            </div>
          );
        },
      }),
      columnHelper.accessor("description", {
        header: "Description",
        enableSorting: false,
        cell: ({ row }) => {
          return <DataTableTextCell value={row.original.description} />;
        },
      }),

      columnHelper.accessor("createdAt", {
        header: "Performed On",
        enableColumnFilter: false,
        cell: ({ getValue }) => <DataTableDateTimeCell value={getValue()} />,
      }),
    ],
    [columnHelper]
  );

  const handleCsvDownload = async (selectedIds?: string[]) => {
    setDownloadBtnLoading(true);
    try {
      const response = await sdk.activityLogCsvExport({
        input: {
          fileName: downloadFileName,
          selectedRows: selectedIds,
        },
      });

      if (!response.activityLogCsvExport) {
        setToastData({
          message:
            "Something went wrong when trying to export, please try again!",
          type: "error",
        });
        return;
      }

      window.open(response.activityLogCsvExport, "_blank", "noreferrer");
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
    <div className="py-2">
      <div
        style={{ height: "calc(100vh - 180px)" }}
        className={`${
          filterData || sortData || data?.length || searchFilter || loading
            ? ""
            : "hidden"
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
            pageIndex: pageIndex - 1, // tanstack table considers index to start from 0
            pageSize: getPageSizeNumber(pageSize),
          }}
          pageSizeChangeHandler={(size) => {
            setPageIndex(1);
            setPageSize(getPageSizeEnum(size));
          }}
          downloadClickHandler={async (selectedIds) => {
            handleCsvDownload(selectedIds);
          }}
          downloadFileName={downloadFileName}
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

      <div
        className={`${
          !data?.length && !filterData && !sortData && !searchFilter && !loading
            ? ""
            : "hidden"
        }`}
      >
        <EmptyStateView title={"No Data Found"} />
      </div>
    </div>
  );
};

export default HostLogs;
