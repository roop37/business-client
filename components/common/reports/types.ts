import { inrFormat } from "@/components/common/owner";

// Client mirror of the main-server `HostReportData` GraphQL contract
// (hand-written — no codegen dependency, matching the graphqlClient pattern).

export type ReportValueType = "Amount" | "Number" | "Percentage" | "Text";
export type ReportChartType = "Line" | "Bar" | "Area" | "Donut";

export interface ReportMetric {
  key: string;
  label: string;
  value: string;
  valueType: ReportValueType;
  helpText?: string | null;
  trendValue?: string | null;
  trendDirection?: string | null;
}

export interface ReportTableColumn {
  key: string;
  header: string;
  align?: string | null;
  valueType?: ReportValueType | null;
}

export interface ReportTableCell {
  key: string;
  value: string;
}

export interface ReportTableRow {
  cells: ReportTableCell[];
}

export interface ReportTable {
  title: string;
  columns: ReportTableColumn[];
  rows: ReportTableRow[];
}

export interface ReportChartSeriesValue {
  key: string;
  value: number;
}

export interface ReportChartPoint {
  x: string;
  values: ReportChartSeriesValue[];
}

export interface ReportChart {
  key: string;
  title: string;
  type: ReportChartType;
  xKey: string;
  seriesKeys: string[];
  points: ReportChartPoint[];
}

export interface HostReportData {
  type: string;
  metrics: ReportMetric[];
  tables: ReportTable[];
  charts: ReportChart[];
  freshnessLabel: string;
  generatedAt: string;
}

export type ReportDateInput = { day: number; month: number; year: number };

/** Format a preformatted server value string for display by its type. */
export const formatReportValue = (
  value: string,
  valueType?: ReportValueType | null
): string => {
  if (value == null || value === "") return "-";
  switch (valueType) {
    case "Amount":
      return inrFormat(Number(value), {
        decimals: Number(value) > 0 && Number(value) < 1000 ? 2 : 0,
      });
    case "Number":
      return Number(value).toLocaleString("en-IN");
    case "Percentage":
      return `${value}%`;
    default:
      return value;
  }
};
