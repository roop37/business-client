import MetricDataCard from "@/components/common/metricCard/metricDataCard";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardAnalyticsData } from "@/generated/graphql";
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
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const DashboardAnalytics = () => {
  // Stores
  const { setToastData } = useGlobalStore();
  const { startDate, endDate, startCompareDate, endCompareDate } =
    useDashboardMetricStore();

  // States
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] =
    useState<DashboardAnalyticsData | null>(null);

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
        const { dashboardAnalyticsData } = await sdk.DashboardAnalyticsData({
          input: {
            startDate: startDateFormatted,
            endDate: endDateFormatted,
            startCompareDate: startCompareDateFormatted,
            endCompareDate: endCompareDateFormatted,
          },
        });

        if (!dashboardAnalyticsData) {
          setToastData({
            message:
              "Unable to load the data, please try again after few minutes.",
            type: "error",
          });
          return;
        }

        setAnalyticsData(dashboardAnalyticsData);
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

  if (!analyticsData) {
    return null;
  }

  const chartConfig = {
    value: {
      label: "Total Views",
      color: "#697ED4",
    },
  } satisfies ChartConfig;

  // Transform popup chart data to include details for tooltip
  const transformedPopupData = analyticsData.popupChart.map((item) => ({
    label: item.label,
    value: item.views,
    details: {
      "Popup Cta Clicks": item.clicks,
      "Signup Rate": `${item.signupRate}%`,
      "Popup Close Rate": `${item.closeRate}%`,
      "Popup Close Click": `${item.closeClick}`,
    },
  }));

  const transformedPromotionPageData = analyticsData.promotionChart.map(
    (item) => ({
    label: item.label,
    value: item.views,
    details: {
      "Promotion Cta Clicks": item.clicks,
        "Promotion Bounce Rate": `${item.bounceRate}%`,
    },
    })
  );

  const renderChart = (title: string, data: any[]) => (
    <div className="min-h-[50vh] col-span-1 md:col-span-6 flex flex-col w-full border rounded-xl p-6 space-y-5">
      <h2 className="font-semibold text-2xl">{title}</h2>

      {data.length <= 0 ? (
        <div className="h-full w-full flex flex-col justify-center items-center">
          <p className="text text-gray-500">
            No data available for the selected period
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={"100%"}>
          <ChartContainer config={chartConfig} className="flex-1">
            <BarChart
              data={data.slice(0, 5)}
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
                tickFormatter={(value) => `${value}`}
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
                      {chartConfig[name as keyof typeof chartConfig]?.label ||
                        name}
                    </span>
                    <div className="ml-auto flex items-baseline font-mono font-medium tabular-nums text-foreground">
                      {value}
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
  );

  const renderHorizontalChart = (title: string, data: any[]) => (
    <div className="min-h-[30vh] w-full border rounded-xl p-4 md:p-8">
      <h2 className="font-semibold text-xl md:text-2xl">{title}</h2>

      {data.length <= 0 ? (
        <div className="h-full w-full flex flex-col justify-center items-center">
          <p className="text text-gray-500">
            No data available for the selected period
          </p>
        </div>
      ) : (
        <div className="w-full items-start">
          <ResponsiveContainer width="100%" height={310}>
            <ChartContainer config={chartConfig}>
              <BarChart
                data={data.slice(0, 5)}
                layout="vertical"
                accessibilityLayer
                margin={{
                  right: 30,
                  top: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid
                  horizontal={true}
                  vertical={true}
                  horizontalCoordinatesGenerator={(props) => {
                    return [props.height - 50];
                  }}
                  verticalCoordinatesGenerator={(props) => {
                    return [(props.xAxis = 50)];
                  }}
                />
                <YAxis
                  dataKey="label"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={false}
                  width={50}
                  fontSize={12}
                />
                <XAxis
                  dataKey="value"
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}`}
                  fontSize={12}
                />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px] max-w-[280px]">
                          <div className="font-semibold text-gray-800 mb-3">
                            {label}
                          </div>

                          {/* Main Total Views */}
                          <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                            <div
                              className="h-3 w-3 rounded-sm mr-2"
                              style={{ backgroundColor: "#697ED4" }}
                            />
                            <span className="text-xs text-gray-600">
                              Total Views:{" "}
                            </span>
                            <span className="ml-1 text-xs">
                              {data.value}
                            </span>
                          </div>

                          {/* Details breakdown */}
                          {data.details && (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-gray-700 mb-2">
                                Breakdown:
                              </div>
                              {Object.entries(data.details).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-xs text-gray-600">
                                      {key}:
                                    </span>
                                    <span className="font-medium text-xs text-gray-800">
                                      {String(value)}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={40}
                >
                  <LabelList
                    dataKey="label"
                    position="center"
                    offset={0}
                    fill="white"
                    fontSize={11}
                    style={{
                      fontWeight: "500",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                    }}
                  />
                  <LabelList
                    dataKey="value"
                    position="right"
                    offset={8}
                    fill="var(--color-value)"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 flex flex-col">
      {/* Overview Section with Charts */}
      <div className="space-y-6">
        <div className="border-b pb-2">
          <h2 className="font-bold text-2xl text-gray-800">Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsData.metrics.map((metric) => (
            <MetricDataCard key={metric.name} {...metric} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
          {renderChart("Top 5 Item Views", analyticsData.itemsChart)}
          {renderChart("Top 5 Category Views", analyticsData.categoriesChart)}
        </div>
      </div>

      {/* Popup Section with Horizontal Chart */}
      {analyticsData.popupmetrics && analyticsData.popupmetrics.length > 0 && (
        <div className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="font-bold text-2xl text-gray-800">
              Promotional Popup Metrics
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.popupmetrics.map((metric) => (
              <MetricDataCard key={metric.name} {...metric} />
            ))}
          </div>
          {analyticsData.popupChart && analyticsData.popupChart.length >= 3 && (
            <div className="mt-4">
              {renderHorizontalChart(
                "Promotional Popup Overview",
                transformedPopupData
              )}
            </div>
          )}
        </div>
      )}

      {/* Promotional Page Metrics Section */}
      {analyticsData.promotionmetrics &&
        analyticsData.promotionmetrics.length > 0 && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h2 className="font-bold text-2xl text-gray-800">
                Promotional Page Metrics
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsData.promotionmetrics.map((metric) => (
                <MetricDataCard key={metric.name} {...metric} />
              ))}
            </div>
            {analyticsData.promotionChart &&
              analyticsData.promotionChart.length >= 3 && (
            <div className="mt-4">
              {renderHorizontalChart(
                "Promotional Page Overview",
                transformedPromotionPageData
              )}
            </div>
          )}
          </div>
        )}
    </div>
  );
};

export default DashboardAnalytics;
