import MetricDataCard from "@/components/common/metricCard/metricDataCard";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardMenuData } from "@/generated/graphql";
import { useDashboardMetricStore } from "@/store/dashboardMetric";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import {
  extractErrorMessage,
  formatDateToReportObject,
} from "@/utils/utilFUncs";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const DashboardMenu = () => {
  // Stores
  const { setToastData } = useGlobalStore();
  const { startDate, endDate, startCompareDate, endCompareDate } =
    useDashboardMetricStore();

  // States
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState<DashboardMenuData | null>(null);

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
        const { dashboardMenuData } = await sdk.DashboardMenuData({
          input: {
            startDate: startDateFormatted,
            endDate: endDateFormatted,
            startCompareDate: startCompareDateFormatted,
            endCompareDate: endCompareDateFormatted,
          },
        });

        if (!dashboardMenuData) {
          setToastData({
            message:
              "Unable to load the data, please try again after few minutes.",
            type: "error",
          });
          return;
        }

        setMenuData(dashboardMenuData);
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

  if (!menuData) {
    return null;
  }

  const chartConfig = {
    value: {
      label: "Sales",
      color: "#697ED4",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8 flex flex-col">
      <div className="space-y-2 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuData.metrics.map((metric) => {
            return <MetricDataCard key={metric.name} {...metric} />;
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
        <div className="min-h-[50vh] col-span-1 md:col-span-6 flex flex-col w-full border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-2xl">Top 5 Selling Items</h2>

          {menuData.itemsChart.length <= 0 ? (
            <div className="h-full w-full flex flex-col justify-center items-center">
              <p className="text text-gray-500">
                No data available, for the selected period
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={"100%"}>
              <ChartContainer config={chartConfig} className="flex-1">
                <BarChart
                  data={menuData.itemsChart}
                  accessibilityLayer
                  {...{
                    overflow: "visible",
                  }}
                  margin={{ bottom: 120 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    textAnchor="end"
                    angle={-45}
                    interval={0}
                    tick={{
                      fontSize: 12,
                      width: 200,
                      textAnchor: "end",
                      style: {
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        lineHeight: 1.2,
                      },
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip
                    formatter={(value, name) => (
                      <div className="flex min-w-[130px] items-center text-xs text-muted-foreground space-x-2">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                          style={
                            {
                              "--color-bg": `var(--color-${name})`,
                            } as React.CSSProperties
                          }
                        />
                        <span>
                          {chartConfig[name as keyof typeof chartConfig]
                            ?.label || name}
                        </span>
                        <div className="ml-auto flex items-baseline font-mono font-medium tabular-nums text-foreground">
                          ${value}
                        </div>
                      </div>
                    )}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ResponsiveContainer>
          )}
        </div>

        <div className="min-h-[50vh] col-span-1 md:col-span-6 flex flex-col w-full border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-2xl">Top 5 Selling Categories</h2>

          {menuData.categoriesChart.length <= 0 ? (
            <div className="h-full w-full flex flex-col justify-center items-center">
              <p className="text text-gray-500">
                No data available, for the selected period
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={"100%"}>
              <ChartContainer config={chartConfig} className="flex-1">
                <BarChart
                  data={menuData.categoriesChart}
                  accessibilityLayer
                  {...{
                    overflow: "visible",
                  }}
                  margin={{ bottom: 120 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    angle={-45}
                    interval={0}
                    tick={{
                      fontSize: 12,
                      width: 200,
                      textAnchor: "end",
                      style: {
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        lineHeight: 1.2,
                      },
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip
                    formatter={(value, name) => (
                      <div className="flex min-w-[130px] items-center text-xs text-muted-foreground space-x-2">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                          style={
                            {
                              "--color-bg": `var(--color-${name})`,
                            } as React.CSSProperties
                          }
                        />
                        <span>
                          {chartConfig[name as keyof typeof chartConfig]
                            ?.label || name}
                        </span>
                        <div className="ml-auto flex items-baseline font-mono font-medium tabular-nums text-foreground">
                          ${value}
                        </div>
                      </div>
                    )}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardMenu;
