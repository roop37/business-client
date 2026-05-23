import MetricDataCard from "@/components/common/metricCard/metricDataCard";
import { DashboardMarketingData } from "@/generated/graphql";
import { useDashboardMetricStore } from "@/store/dashboardMetric";
import useGlobalStore from "@/store/global";
import { sdk } from "@/utils/graphqlClient";
import {
  extractErrorMessage,
  formatDateToReportObject,
} from "@/utils/utilFUncs";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";

const DashboardMarketing = () => {
  // Stores
  const { setToastData } = useGlobalStore();
  const { startDate, endDate, startCompareDate, endCompareDate } =
    useDashboardMetricStore();

  // States
  const [loading, setLoading] = useState(false);
  const [marketingData, setMarketingData] =
    useState<DashboardMarketingData | null>(null);

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
        const { dashboardMarketingData } = await sdk.DashboardMarketingData({
          input: {
            startDate: startDateFormatted,
            endDate: endDateFormatted,
            startCompareDate: startCompareDateFormatted,
            endCompareDate: endCompareDateFormatted,
          },
        });

        if (!dashboardMarketingData) {
          setToastData({
            message:
              "Unable to load the data, please try again after few minutes.",
            type: "error",
          });
          return;
        }

        setMarketingData(dashboardMarketingData);
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

  if (!marketingData) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="space-y-2 flex flex-col">
        <h2 className="text-xl font-semibold">Loyalty Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketingData.loyaltyMetrics.map((metric) => {
            return <MetricDataCard key={metric.name} {...metric} />;
          })}
        </div>
      </div>
      <div className="space-y-2 flex flex-col">
        <h2 className="text-xl font-semibold">Promotional Code Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketingData.offerMetrics.map((metric) => {
            return <MetricDataCard key={metric.name} {...metric} />;
          })}
        </div>
      </div>
      <div className="space-y-2 flex flex-col">
        <h2 className="text-xl font-semibold">Email Campaign Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketingData.emailCampaignsMetric.map((metric) => {
            return <MetricDataCard key={metric.name} {...metric} />;
          })}
        </div>
      </div>
      <div className="space-y-2 flex flex-col">
        <h2 className="text-xl font-semibold">Guest Conversion Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketingData.guestConversionMetrics.map((metric) => {
            return <MetricDataCard key={metric.name} {...metric} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardMarketing;
