import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterDataEnum, SortDataEnum } from "@/generated/graphql";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { FaSort } from "react-icons/fa";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import DataTableInfiniteFooter from "./infinite";
import DataTablePagination from "./pagination";
import DataTableToolbar from "./toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalRows: number;
  hideDownloadButton?: boolean;
  loading: boolean;
  manualPagination: boolean;
  pageSize: number;
  pageSizeChangeHandler?: (size: number) => void;
  staticTable?: boolean;
  pageCount?: number;
  nextPage?: () => void;
  prevPage?: () => void;
  paginationData?: PaginationState;
  addClickHandler?: () => void;
  downloadClickHandler?: (selectedIds?: string[]) => Promise<void>;
  downloadFileName?: string;
  downloadLoading?: boolean;
  defaultSortColumn?: string;
  filterClickHandler?: (data: {
    key?: string;
    filterFn?: FilterDataEnum;
    value?: string | string[];
  }) => Promise<void>;
  hideSearch?: boolean;
  searchFilter?: string;
  setSearchFilter?: (value: string) => void;

  sortData?: SortingState;
  sortClickHandler?: (data: {
    key?: string;
    sortType?: SortDataEnum;
  }) => Promise<void>;

  cursorPagination?: boolean;
  hasMore?: boolean;
  loadMore?: (lastRow: string) => void;
  showDateRange?: boolean;
  dateRangeCompareAllowed?: boolean;
  bulkUpdateItemsClick?: (selectedIds?: string[]) => Promise<void>;
  selectAllEnabled?: boolean;
  selectAllFunction?: () => Promise<string[]>;
  selectAllText?: string;
  deselectAllText?: string;
}

const DataTable = <TData, TValue>({
  columns,
  data,
  totalRows,
  loading,
  manualPagination,
  pageSize,
  pageSizeChangeHandler,
  pageCount,
  paginationData,
  nextPage,
  prevPage,
  addClickHandler,
  downloadClickHandler,
  downloadFileName,
  downloadLoading,
  filterClickHandler,
  hideSearch = false,
  searchFilter,
  setSearchFilter,
  sortClickHandler,
  hideDownloadButton = false,
  cursorPagination = false,
  hasMore = false,
  staticTable = false,
  loadMore,
  defaultSortColumn,
  showDateRange = false,
  dateRangeCompareAllowed = false,
  bulkUpdateItemsClick,
  selectAllEnabled = false,
  selectAllFunction,
  selectAllText = "Select all rows",
  deselectAllText = "Deselect all rows",
}: DataTableProps<TData, TValue>) => {
  const [tableData, setTableData] = useState<TData[]>(data);
  const [selectAllLoading, setSelectAllLoading] = useState(false);

  const handleSelectAll = async () => {
    if (!selectAllFunction) return;

    setSelectAllLoading(true);
    try {
      const allIds = await selectAllFunction();
      const newSelection: Record<string, boolean> = {};
      allIds.forEach((id) => {
        newSelection[id] = true;
      });
      table.setRowSelection(newSelection);
    } catch (error) {
      // Handle error
    } finally {
      setSelectAllLoading(false);
    }
  };

  const handleDeselectAll = () => {
    table.setRowSelection({});
  };

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const tableMeta = useMemo(() => {
    return {
      updateData: (rowIndex: number, columnId: string, value: TData) =>
        setTableData((prev) =>
          prev.map((row, index) =>
            index === rowIndex
              ? {
                  ...prev[rowIndex],
                  [columnId]: value,
                }
              : row
          )
        ),
    };
  }, []);

  const table = useReactTable(
    manualPagination
      ? {
          data: tableData,
          columns,
          getCoreRowModel: getCoreRowModel(),
          manualPagination: true,
          manualFiltering: true,
          manualSorting: true,
          pageCount: pageCount,
          state: { pagination: paginationData },
          getRowId: (row) => {
            return (row as any).id;
          },
          meta: tableMeta,
        }
      : {
          data: tableData,
          columns,
          getCoreRowModel: getCoreRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          getSortedRowModel: getSortedRowModel(),
          initialState: {
            pagination: { pageIndex: 0, pageSize: pageSize },
            sorting: defaultSortColumn
              ? [{ id: defaultSortColumn, desc: true }]
              : [],
          },
          meta: tableMeta,
        }
  );

  return (
    <div className="max-h-[70vh] min-h-0 rounded-owner-lg border border-owner-border bg-owner-bg text-owner-fg-1 flex flex-col justify-between overflow-hidden">
      {/* Toolbar */}

      {!staticTable && (
        <DataTableToolbar<TData>
          table={table}
          hideSearch={hideSearch}
          hideDownloadButton={hideDownloadButton}
          manual={manualPagination}
          fileName={downloadFileName}
          downloadLoading={downloadLoading}
          addClickHandler={addClickHandler}
          downloadClickHandler={downloadClickHandler}
          filterClickHandler={filterClickHandler}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          showDateRange={showDateRange}
          dateRangeCompareAllowed={dateRangeCompareAllowed}
          bulkUpdateItemsClick={bulkUpdateItemsClick}
        />
      )}

      {/* Table */}
      <div className="w-full min-h-0 flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-owner-bg">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`group hover:cursor-pointer whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.04em] text-owner-fg-3 border-b border-dashed border-owner-border ${
                        header.id === "actions" ? "text-center" : ""
                      }`}
                      onClick={(e) => {
                        if (header.column.getCanSort()) {
                          const handler =
                            header.column.getToggleSortingHandler();
                          if (handler) {
                            handler(e);
                          }

                          if (manualPagination && sortClickHandler) {
                            sortClickHandler({
                              key: header.column.id,
                              sortType:
                                {
                                  asc: SortDataEnum.Asc,
                                  desc: SortDataEnum.Desc,
                                }[
                                  header.column.getNextSortingOrder() as string
                                ] ?? SortDataEnum.None,
                            });
                          }
                        }
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.isPlaceholder
                        ? null
                        : header.column.getCanSort()
                        ? {
                            asc: <FaArrowUp className="inline-block ml-2" />,
                            desc: <FaArrowDown className="inline-block ml-2" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <FaSort className="inline-block ml-2" />
                          )
                        : null}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {loading ? (
            <>
              <TableBody>
                {[1, 2, 3, 4, 5].map((e) => (
                  <TableRow key={e}>
                    <TableCell
                      colSpan={columns.length}
                      className="h-[40px] text-center"
                    >
                      <Skeleton className="h-[40px] w-full rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-dashed border-owner-border-soft bg-owner-bg hover:bg-owner-bg-subtle"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>

      {/* Footer / Pagination Controls */}

      {!staticTable && (
        <div>
          {cursorPagination ? (
            <DataTableInfiniteFooter<TData>
              hasMore={hasMore}
              table={table}
              loadMoreHandler={loadMore}
            />
          ) : (
            <DataTablePagination<TData>
              table={table}
              manual={manualPagination}
              totalRows={totalRows}
              pageSizeChangeHandler={pageSizeChangeHandler}
              nextPage={nextPage}
              prevPage={prevPage}
              selectAllEnabled={selectAllEnabled}
              selectAllLoading={selectAllLoading}
              selectAllText={selectAllText}
              deselectAllText={deselectAllText}
              handleSelectAll={handleSelectAll}
              handleDeselectAll={handleDeselectAll}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DataTable;
