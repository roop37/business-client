import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaSort } from "react-icons/fa";
import ReportDataTablePagination from "../common/dataTable/pagination/reportDataTablePagination";
import ReportsDataTableToolbar from "../common/dataTable/toolbar/reports";

interface ReportDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableTitle: string;
  loading?: boolean;
  fileName?: string;
  downloadDisabled?: boolean;
  showFooter?: boolean;
  pageSize?: number;
}

const ReportDataTable = <TData, TValue>({
  columns,
  data,
  tableTitle,
  loading = false,
  fileName = "csvReport",
  downloadDisabled,
  showFooter = true,
  pageSize = 10,
}: ReportDataTableProps<TData, TValue>) => {
  const [tableData, setTableData] = useState<TData[]>(data);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: pageSize },
    },
  });

  return (
    <div className="bg-white text-black rounded-lg max-h-full flex flex-col border border-gray-200 w-full">
      <ReportsDataTableToolbar<TData>
        table={table}
        tableTitle={tableTitle}
        manual={false}
        fileName={`${fileName}`}
        downloadDisabled={downloadDisabled}
      />

      <div className="w-full flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`group hover:cursor-pointer whitespace-nowrap ${
                      header.id === "actions" ? "text-center" : ""
                    }`}
                    onClick={() => {
                      if (header.column.getCanSort()) {
                        header.column.toggleSorting();
                      }
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <span className="ml-2">
                        {header.column.getIsSorted() === "asc" ? (
                          <FaArrowUp className="inline" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <FaArrowDown className="inline" />
                        ) : (
                          <FaSort className="inline" />
                        )}
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {loading ? (
            <TableBody>
              {[1, 2, 3, 4, 5].map((e) => (
                <TableRow key={e}>
                  <TableCell
                    colSpan={columns.length}
                    className="h-[40px] text-center"
                  >
                    <Skeleton className="h-8 w-full rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="text-sm hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2 text-gray-700">
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
                    className="h-20 text-center text-sm text-gray-500"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>

      {showFooter ? <ReportDataTablePagination table={table} /> : <br />}
    </div>
  );
};

export default ReportDataTable;
