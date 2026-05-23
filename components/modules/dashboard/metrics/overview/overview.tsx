import MetricDataCard from "@/components/common/metricCard/metricDataCard";
import ProjectedCard from "@/components/common/metricCard/projectedCard";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  DashboardOverviewData,
  MetricsDataRange,
  SalesChartData,
} from "@/generated/graphql";
import { useDashboardMetricStore } from "@/store/dashboardMetric";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import {
  extractErrorMessage,
  formatDateToReportObject,
} from "@/utils/utilFUncs";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface IDashboardSalesChartData {
  date: Date;
  currentSales?: number;
  currentOrders?: number;
  compareSales?: number;
  compareOrders?: number;
}

const prepareChartData = (
  currentData: SalesChartData[],
  compareData: SalesChartData[],
  currentStartDate: Date,
  currentEndDate: Date
): IDashboardSalesChartData[] => {
  const currentDateRange = eachDayOfInterval({
    start: currentStartDate,
    end: currentEndDate,
  });

  const maxDays = Math.max(currentDateRange.length, compareData.length);

  const chartData: IDashboardSalesChartData[] = Array.from(
    { length: maxDays },
    (_, index) => {
      const currentSalesData = currentData[index];
      const compareSalesData = compareData[index];

      return {
        date: currentData[index]?.date ?? "N/A",
        currentSales: currentSalesData?.sales ?? 0,
        currentOrders: currentSalesData?.orders ?? 0,
        compareSales: compareSalesData?.sales ?? 0,
        compareOrders: compareSalesData?.orders ?? 0,
      };
    }
  );

  return chartData.filter(
    (data) => (data.currentSales ?? 0) > 0 || (data.compareSales ?? 0) > 0
  );
};

const DashboardOverview = () => {
  // Stores
  const { setToastData } = useGlobalStore();
  const { startDate, endDate, startCompareDate, endCompareDate, dataRange } =
    useDashboardMetricStore();
  // States
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] =
    useState<DashboardOverviewData | null>(null);
  const [finalChartData, setFinalChartData] = useState<
    IDashboardSalesChartData[]
  >([]);

  // UseEffects
  useEffect(() => {
    const fetchFunc = async () => {
      setLoading(true);
      try {
        let startDateFormatted = formatDateToReportObject(startDate);
        let endDateFormatted = formatDateToReportObject(endDate);
        let startCompareDateFormatted =
          formatDateToReportObject(startCompareDate);
        let endCompareDateFormatted = formatDateToReportObject(endCompareDate);
        const { dashboardOverviewData } = await sdk.DashboardOverviewData({
          input: {
            startDate: startDateFormatted,
            endDate: endDateFormatted,
            startCompareDate: startCompareDateFormatted,
            endCompareDate: endCompareDateFormatted,
          },
        });

        if (!dashboardOverviewData) {
          setToastData({
            message:
              "Unable to load the data for dashboard, please try again after few minutes.",
            type: "error",
          });
          return;
        }

        setOverviewData(dashboardOverviewData);

        if (dashboardOverviewData.compareSalesChart.length > 0) {
          const chartData = prepareChartData(
            dashboardOverviewData.salesChart,
            dashboardOverviewData.compareSalesChart,
            startDate,
            endDate
          );
          setFinalChartData(chartData);
        } else {
          setFinalChartData(
            dashboardOverviewData.salesChart.map((e) => ({
              date: e.date,
              currentSales: e.sales,
              currentOrders: e.orders,
            }))
          );
        }
      } catch (error) {
        const message = extractErrorMessage(error);
        setToastData({
          message,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFunc();
  }, [setToastData, startDate, endDate, startCompareDate, endCompareDate]);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin text-gray-500">
          <FaSpinner className="text-primary" size={39} />
        </div>
      </div>
    );
  }

  if (!overviewData) {
    return null;
  }

  let chartConfig = {
    current: {
      label: "Current",
      color: "#2947c2",
    },
    comparison: {
      label: "Comparison",
      color: "#2947c24D",
    },
  } satisfies ChartConfig;

  const formatUSAmount = (num: number): string => {
    if (num < 1_000) {
      return num.toString(); // Ones, tens, and hundreds remain unchanged
    } else if (num < 1_000_000) {
      return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + "k"; // Thousands as 'k'
    } else {
      return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + "M"; // Lakhs as 'M'
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const payloadObject = payload[0].payload;
      const value = payloadObject?.date ?? "";
      let dateStr = "";
      if (value !== "") {
        if (value === "N/A") {
          dateStr = "N/A";
        } else {
          const dateSplit = value.split("T");
          const partSplit = dateSplit[0].split("-");
          dateStr = `${partSplit[1]}-${partSplit[2]}-${partSplit[0]}`;
        }
      }

      // let compareDateStr = "";
      // if (payload.length > 1) {
      //   const payloadObject = payload[1].payload;
      //   const value = payloadObject?.date ?? "";
      //   if (value !== "") {
      //     if (value === "N/A") {
      //       compareDateStr = "N/A";
      //     } else {
      //       const restoTz = DateTime.fromISO(value).setZone(tz);
      //       compareDateStr = restoTz.toFormat("MM-dd-yyyy");
      //     }
      //   }
      // }

      return (
        <div className="bg-white p-2 border shadow-md rounded-lg min-w-[150px]">
          <p className="font-medium text-xs">Net Sales ($)</p>
          {payload.map((entry: any, idx: number) => {
            return (
              <>
                <p key={entry.dataKey} className="text-gray-500 text-xs">
                  {entry.name}:{" "}
                  {entry.value !== undefined ? `$${entry.value}` : "N/A"}
                </p>
                {dateStr !== "" && idx === 0 ? (
                  <p
                    key={`${entry.dataKey}-${dateStr}`}
                    className="text-gray-500 text-xs"
                  >
                    {payload.length > 1 ? "Current Date" : "Date"}: {dateStr}
                  </p>
                ) : null}
                {/* {compareDateStr !== "" && idx === 1 ? (
                  <p
                    key={`${entry.dataKey}-${compareDateStr}`}
                    className="text-gray-500 text-xs"
                  >
                    {"Compare Date"}: {compareDateStr}
                  </p>
                ) : null} */}
              </>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
        <div className="min-h-[50vh] flex flex-col w-full col-span-1 md:col-span-8 border rounded-xl p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-2xl">Sales Overview</h2>
            <p className="text-xs font-light mt-2 flex justify-start items-center">
              <span className="h-2 w-2 bg-primary block rounded-sm mr-2"></span>
              Current Period:{" "}
              {isSameDay(startDate, endDate)
                ? format(startDate, "PP")
                : `${format(startDate, "PP")} - ${format(endDate, "PP")}`}
            </p>
            {startCompareDate && endCompareDate ? (
              <p className="text-xs font-light mt-1 flex justify-start items-center">
                <span className="h-2 w-2 bg-primary/30 block rounded-sm mr-2"></span>
                Compare Period:{" "}
                {isSameDay(startCompareDate, endCompareDate)
                  ? format(startCompareDate, "PP")
                  : `${format(startCompareDate, "PP")} - ${format(
                      endCompareDate,
                      "PP"
                    )}`}
              </p>
            ) : null}
          </div>

          {finalChartData.length <= 0 ? (
            <div className="h-full w-full grid place-items-center">
              <p className="text text-gray-500">
                No data available, for the selected period
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer config={chartConfig} className="">
                <LineChart
                  data={finalChartData}
                  accessibilityLayer
                  margin={{
                    bottom: finalChartData.length > 5 ? 40 : 0,
                    right: 12,
                    left: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    textAnchor={"end"}
                    angle={finalChartData.length > 5 ? -45 : 0}
                    tickFormatter={(value) => {
                      if (value === "N/A") {
                        return "";
                      } else {
                        const dateSplit = value.split("T");
                        const partSplit = dateSplit[0].split("-");
                        return `${partSplit[1]}-${partSplit[2]}-${partSplit[0]}`;
                        // const tz = timezone.split(" ")[0];
                        // const restoTz = DateTime.fromISO(value).setZone(tz);

                        // return restoTz.toFormat("MM-dd-yyyy");
                      }
                    }}
                    interval={
                      finalChartData.length > 15
                        ? finalChartData.length > 30
                          ? finalChartData.length > 50
                            ? 12
                            : 8
                          : 4
                        : 0
                    }
                  />
                  <YAxis
                    label={{
                      value: "Net Sales ($)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${formatUSAmount(value)}`}
                  />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Line
                    dataKey="currentSales"
                    name="Current"
                    type="monotone"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    connectNulls
                  />
                  {overviewData.compareSalesChart.length > 0 && (
                    <Line
                      dataKey="compareSales"
                      name="Comparison"
                      type="monotone"
                      stroke="#2947c24D"
                      strokeWidth={2}
                      connectNulls
                    />
                  )}
                </LineChart>
              </ChartContainer>
            </ResponsiveContainer>
          )}
        </div>
        <div className="col-span-1 md:col-span-4 w-full space-y-4">
          {overviewData.projectedMonthSales !== null &&
            overviewData.projectedWeekSales !== null &&
            dataRange !== MetricsDataRange.Custom && (
              <div className="grid grid-cols-1 gap-4 col-span-1 md:col-span-3">
                <ProjectedCard
                  name="Monthly Sales Projection"
                  desc={`${format(
                    startOfMonth(new Date()),
                    "MM-dd-yyyy"
                  )} to ${format(endOfMonth(new Date()), "MM-dd-yyyy")}`}
                  value={formatUSAmount(overviewData.projectedMonthSales ?? 0)}
                />
                <ProjectedCard
                  name="Weekly Sales Projection"
                  desc={`${format(
                    startOfWeek(new Date()),
                    "MM-dd-yyyy"
                  )} to ${format(endOfWeek(new Date()), "MM-dd-yyyy")}`}
                  value={formatUSAmount(overviewData.projectedWeekSales ?? 0)}
                />
              </div>
            )}

          <div
            className={`grid ${
              overviewData.projectedMonthSales !== null &&
              overviewData.projectedWeekSales !== null &&
              dataRange !== MetricsDataRange.Custom
                ? "grid-cols-2"
                : "grid-cols-1"
            } gap-4 col-span-1 md:col-span-3`}
          >
            {overviewData.overviewMetrics.map((metric) => {
              return <MetricDataCard key={metric.name} {...metric} />;
            })}
          </div>
        </div>
      </div>
      <div className="space-y-2 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewData.keyMetrics.map((metric) => {
            return <MetricDataCard key={metric.name} {...metric} />;
          })}
        </div>
      </div>
      <div className="space-y-2 flex flex-col">
        <h2>Additional Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewData.additionalMetrics.map((metric) => {
            return <MetricDataCard key={metric.name} {...metric} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
