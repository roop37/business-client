import { Table } from "@tanstack/react-table";
// import Select from "react-select";

interface DataTableInfiniteFooterProps<TData> {
  table: Table<TData>;
  hasMore: boolean;
  loadMoreHandler?: (lastRow: string) => void;
}

const DataTableInfiniteFooter = <TData,>(
  props: DataTableInfiniteFooterProps<TData>
) => {
  const { table, loadMoreHandler, hasMore } = props;

  return (
    <div className="flex items-center justify-between p-4 w-full border-t">
      {!hasMore || !loadMoreHandler ? (
        <p className="font-normal text-xs" style={{ opacity: 0.8 }}>
          {"No more results"}
        </p>
      ) : (
        <button
          onClick={() => {
            if (hasMore && loadMoreHandler) {
              const allRows = table.getFilteredRowModel().rows;
              const lastRow = allRows[allRows.length - 1];
              loadMoreHandler((lastRow.original as any).stripePayoutId);
            }
          }}
          className="px-4 py-2 border border-black/10 bg-white text-black rounded-xl hover:bg-black/10 transition-colors flex justify-between items-center space-x-2 text-sm"
        >
          <span>{"Load More"}</span>
        </button>
      )}
    </div>
  );
};

export default DataTableInfiniteFooter;
