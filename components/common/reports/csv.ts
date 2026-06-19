import type { ReportTable } from "./types";

const escapeCell = (value: string): string => {
  const v = value ?? "";
  // Quote if the cell contains a comma, quote, or newline; double internal quotes.
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
};

/**
 * Dependency-free client CSV export for a report table. Uses the table's
 * column headers as the header row and the raw cell strings (preformatted by
 * the server) as the body — no currency symbols so the file is spreadsheet-clean.
 */
export const downloadReportCsv = (filename: string, table: ReportTable): void => {
  const header = table.columns.map((c) => escapeCell(c.header)).join(",");
  const body = table.rows
    .map((row) => {
      const byKey = new Map(row.cells.map((cell) => [cell.key, cell.value]));
      return table.columns
        .map((col) => escapeCell(byKey.get(col.key) ?? ""))
        .join(",");
    })
    .join("\n");

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
