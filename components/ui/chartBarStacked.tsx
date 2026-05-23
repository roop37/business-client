"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// export function ChartBarStacked() {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Bar Chart - Stacked + Legend</CardTitle>
//         <CardDescription>January - June 2024</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <BarChart accessibilityLayer data={chartData}>
//             <CartesianGrid vertical={false} />
//             <XAxis
//               dataKey="month"
//               tickLine={false}
//               tickMargin={10}
//               axisLine={false}
//               tickFormatter={(value) => value.slice(0, 3)}
//             />
//             <ChartTooltip content={<ChartTooltipContent hideLabel />} />
//             <ChartLegend content={<ChartLegendContent />} />
//             <Bar
//               dataKey="desktop"
//               stackId="a"
//               fill="var(--color-desktop)"
//               radius={[0, 0, 4, 4]}
//             />
//             <Bar
//               dataKey="mobile"
//               stackId="a"
//               fill="var(--color-mobile)"
//               radius={[4, 4, 0, 0]}
//             />
//           </BarChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }

export function ChartBarStacked({
  data,
  title,
  description,
  currentMonth,
  previousMonth,
}: any) {
  const chartConfig = {
    currentMonth: {
      label: currentMonth,
      color: "hsl(var(--chart-1))",
    },
    previousMonth: {
      label: previousMonth,
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const formattedData = data.map((item: any) => ({
    name: item.name,
    currentMonth: item.currentMonth,
    previousMonth: item.previousMonth,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={formattedData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 15)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="currentMonth"
              stackId="a"
              fill="var(--color-current)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="previousMonth"
              stackId="a"
              fill="var(--color-previous)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
