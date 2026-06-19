import { StatTile } from "@/components/common/owner";
import { ReportChart } from "./ReportChart";
import { ReportTable } from "./ReportTable";
import { formatReportValue, type HostReportData } from "./types";

interface ReportViewProps {
  data: HostReportData;
  fileNamePrefix: string;
  canDownload?: boolean;
  onRowAction?: (action: string) => void;
}

/** Renders a HostReportData payload: KPI cards → charts → tables. */
export const ReportView = ({
  data,
  fileNamePrefix,
  canDownload = true,
  onRowAction,
}: ReportViewProps) => {
  const hasContent =
    data.metrics.length > 0 || data.charts.length > 0 || data.tables.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-owner-md border border-dashed border-owner-border bg-owner-bg-subtle px-5 py-12 text-center text-[14px] text-owner-fg-4">
        No data for this report in the selected range.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.metrics.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((m) => (
            <StatTile
              key={m.key}
              label={m.label}
              value={formatReportValue(m.value, m.valueType)}
              hint={m.helpText ?? undefined}
              delta={
                m.trendValue
                  ? {
                      value: m.trendValue,
                      direction:
                        m.trendDirection === "up"
                          ? "up"
                          : m.trendDirection === "down"
                            ? "down"
                            : "flat",
                      // Neutral tone: an up/down arrow shows direction without
                      // implying "good/bad" (a rise in refunds isn't positive).
                      tone: "neutral",
                    }
                  : undefined
              }
            />
          ))}
        </div>
      ) : null}

      {data.charts.map((chart) => (
        <ReportChart key={chart.key} chart={chart} />
      ))}

      {data.tables.map((table, i) => (
        <ReportTable
          key={`${table.title}-${i}`}
          table={table}
          fileName={`${fileNamePrefix}_${table.title.replace(/\s+/g, "_")}`}
          canDownload={canDownload}
          onRowAction={onRowAction}
        />
      ))}
    </div>
  );
};

export default ReportView;
