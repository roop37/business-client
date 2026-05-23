import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import React from "react";
import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
} from "recharts";

interface DataItem {
  [key: string]: string | number;
}

interface BarChartProps {
  data: DataItem[];
  dataKey: string;
  valueKey: string;
  title?: string;
  description?: string;
  className?: string;
  barColor?: string;
}

const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  dataKey,
  valueKey,
  title,
  description,
  className = "h-[300px]",
  barColor = "hsl(var(--primary))",
}) => {
  const chartConfig: ChartConfig = {
    [valueKey]: {
      label: valueKey.charAt(0).toUpperCase() + valueKey.slice(1),
      color: barColor,
    },
  };

  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={chartConfig} className={className}>
          <RechartsBarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-muted"
            />
            <XAxis
              dataKey={dataKey}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-sm"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-sm"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey={valueKey} fill={barColor} radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BarChartComponent;
