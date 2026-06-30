import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Download } from "lucide-react";
import { OwnerButton } from "@/components/common/owner";
import { downloadReportCsv } from "./csv";
import { formatReportValue, type ReportTable as ReportTableType } from "./types";

const numericPattern = /-?\d+(\.\d+)?/;
const toSortable = (value: string): number | string => {
  const match = value?.replace(/,/g, "").match(numericPattern);
  // A cell that is purely a number (optionally with a %/₹ around it) sorts numerically.
  if (match && /^[^a-zA-Z]*$/.test(value ?? "")) return Number(match[0]);
  return (value ?? "").toLowerCase();
};

interface ReportTableProps {
  table: ReportTableType;
  fileName: string;
  canDownload?: boolean;
  // When a row carries a hidden `__action` cell (e.g. "order:<id>" /
  // "promo:<code>"), clicking the row fires this. The `__action` cell is
  // never rendered as a column.
  onRowAction?: (action: string) => void;
}

export const ReportTable = ({
  table,
  fileName,
  canDownload = true,
  onRowAction,
}: ReportTableProps) => {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const rows = useMemo(() => {
    const cellMap = (row: ReportTableType["rows"][number]) =>
      new Map(row.cells.map((c) => [c.key, c.value]));
    const list = table.rows.map((r) => ({ row: r, map: cellMap(r) }));
    if (!sort) return list;
    return [...list].sort((a, b) => {
      const av = toSortable(a.map.get(sort.key) ?? "");
      const bv = toSortable(b.map.get(sort.key) ?? "");
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [table.rows, sort]);

  const toggleSort = (key: string) =>
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );

  return (
    <div className="overflow-hidden rounded-owner-md border border-owner-border bg-owner-bg">
      <div className="flex items-center justify-between gap-3 border-b border-owner-border-soft px-4 py-3">
        <h3 className="text-[14px] font-semibold text-owner-fg-1">{table.title}</h3>
        {canDownload ? (
          <OwnerButton
            variant="secondary"
            size="sm"
            leadingIcon={<Download size={14} />}
            onClick={() => downloadReportCsv(fileName, table)}
            disabled={table.rows.length === 0}
          >
            CSV
          </OwnerButton>
        ) : null}
      </div>
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead className="sticky top-0 bg-owner-bg-subtle">
            <tr>
              {table.columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`cursor-pointer select-none whitespace-nowrap px-4 py-2.5 font-semibold text-owner-fg-3 ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {active ? (
                        sort?.dir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="text-owner-fg-4/60" />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map(({ map }, index) => {
                const action = map.get("__action");
                const clickable = Boolean(action && onRowAction);
                return (
                <tr
                  key={index}
                  onClick={clickable ? () => onRowAction!(action!) : undefined}
                  className={`border-t border-owner-border-soft hover:bg-owner-bg-subtle/60 ${
                    clickable ? "cursor-pointer" : ""
                  }`}
                >
                  {table.columns.map((col) => (
                    <td
                      key={col.key}
                      className={`whitespace-nowrap px-4 py-2.5 text-owner-fg-1 ${
                        col.align === "right" ? "text-right tabular-nums" : "text-left"
                      }`}
                    >
                      {formatReportValue(map.get(col.key) ?? "", col.valueType)}
                    </td>
                  ))}
                </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={table.columns.length}
                  className="px-4 py-8 text-center text-[13px] text-owner-fg-4"
                >
                  No rows for this range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportTable;
