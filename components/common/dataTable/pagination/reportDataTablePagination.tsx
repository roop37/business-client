import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@tanstack/react-table";
import PaginationButton from "./buttons";

interface ReportDataTablePaginationProps<TData> {
  table: Table<TData>;
}

const ReportDataTablePagination = <TData,>({
  table,
}: ReportDataTablePaginationProps<TData>) => {
  return (
    <div className="flex items-center justify-between p-4 w-full border-t">
      <p className="font-normal text-xs text-opacity-80">
        {/* {table.getState().rowSelection
          ? Object.keys(table.getState().rowSelection).length
          : 0}{" "}
        row(s) selected */}
      </p>
      <div className="flex justify-center items-center space-x-5">
        <div className="flex items-center space-x-2">
          <p className="text-xs font-normal">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs">
              <SelectValue
                placeholder={`${table.getState().pagination.pageSize}`}
              />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 30, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-center items-center space-x-3 text-xs">
          <PaginationButton
            type="prev"
            clickHandler={() => {
              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
          />
          <p className="mx-2">
            {table.getPageCount() > 0
              ? `${
                  table.getState().pagination.pageIndex + 1
                } / ${table.getPageCount()}`
              : "0 / 0"}
          </p>
          <PaginationButton
            type="next"
            clickHandler={() => {
              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportDataTablePagination;
