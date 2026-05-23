import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MetricsTrendTypeEnum,
  MetricsValueTypeEnum,
} from "@/generated/graphql";
import React from "react";
import { FiInfo } from "react-icons/fi";

interface MetricCardProps {
  name: string;
  value: string;
  valueType: MetricsValueTypeEnum;
  trendValue?: string | null;
  trendType?: MetricsTrendTypeEnum | null;
  helpText?: string | null;
}

export const MetricDataCard: React.FC<MetricCardProps> = ({
  name,
  value,
  valueType,
  trendValue,
  trendType,
  helpText,
}) => {
  const formattedValue = (valueType: MetricsValueTypeEnum, value: string) => {
    switch (valueType) {
      case MetricsValueTypeEnum.Amount:
        return `$${value}`;
      case MetricsValueTypeEnum.Percentage:
        return `${value}%`;
      case MetricsValueTypeEnum.Text:
        return value;
      default:
        return value;
    }
  };
  return (
    <Card className="rounded-lg hover:shadow-md transition-shadow duration-200 max-h-[140px] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm text-gray-600">{name}</CardTitle>
        <div>
          {helpText && (
            <div className="relative group cursor-pointer">
              <FiInfo className="w-5 h-5 text-blue-700 transition-colors duration-200" />
              <div className="absolute right-0 top-4 md:top-0 xl:top-4 w-[45vw] md:w-[15vw] p-2 bg-[#F3F7FB] font-semibold text-gray-600 text-xs  rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 break-words whitespace-normal">
                {helpText}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start gap-2">
          <span className="text-lg font-medium">
            {formattedValue(valueType, value)}
          </span>
          {trendValue && trendType ? (
            <p className={`flex items-center text-xs`}>
              <span
                className={`px-1 py-1 rounded-md ${
                  ["Refund Orders", "Refunds"].includes(name)
                    ? trendType === MetricsTrendTypeEnum.Upwards
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                    : trendType === MetricsTrendTypeEnum.Upwards
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {trendValue.split(" ")[0]}
              </span>
              {/* <span className="hidden md:block ml-1">
                {trendValue
                  .split(" ")
                  .slice(1, trendValue.split(" ").length)
                  .join(" ")}
              </span> */}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricDataCard;
