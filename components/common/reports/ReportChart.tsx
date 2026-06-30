import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inrFormat } from "@/components/common/owner";
import type { ReportChart as ReportChartType } from "./types";

const PALETTE = ["#0F8842", "#3E82D9", "#D6A22D", "#B54D77", "#151412", "#6B7280"];

const compact = (n: number) => {
  if (Math.abs(n) >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

/** Flatten contract points ({ x, values:[{key,value}] }) into recharts rows. */
const toRows = (chart: ReportChartType) =>
  chart.points.map((p) => {
    const row: Record<string, string | number> = { [chart.xKey]: p.x };
    for (const v of p.values) row[v.key] = v.value;
    return row;
  });

export const ReportChart = ({ chart }: { chart: ReportChartType }) => {
  const data = toRows(chart);
  if (!data.length) return null;

  const axisTick = { fill: "#77736B", fontSize: 12 };
  const grid = <CartesianGrid stroke="#EEE9DF" strokeDasharray="3 5" vertical={false} />;
  const tooltip = (
    <Tooltip
      formatter={(value: number) => inrFormat(Number(value))}
      contentStyle={{
        borderRadius: 10,
        border: "1px solid #E7E1D5",
        fontSize: 12,
      }}
    />
  );

  return (
    <div className="rounded-owner-md border border-owner-border bg-owner-bg p-4">
      <h3 className="mb-3 text-[14px] font-semibold text-owner-fg-1">{chart.title}</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "Bar" ? (
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              {grid}
              <XAxis dataKey={chart.xKey} tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis hide />
              {tooltip}
              {chart.seriesKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={PALETTE[i % PALETTE.length]} radius={[6, 6, 0, 0]} maxBarSize={40} />
              ))}
            </BarChart>
          ) : chart.type === "Line" ? (
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              {grid}
              <XAxis dataKey={chart.xKey} tickLine={false} axisLine={false} tick={axisTick} minTickGap={20} />
              <YAxis hide />
              {tooltip}
              {chart.seriesKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2.5} dot={false} />
              ))}
            </LineChart>
          ) : chart.type === "Donut" ? (
            <PieChart>
              {tooltip}
              <Pie
                data={data}
                dataKey={chart.seriesKeys[0]}
                nameKey={chart.xKey}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`fill-${chart.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F8842" stopOpacity={0.26} />
                  <stop offset="95%" stopColor="#0F8842" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              {grid}
              <XAxis dataKey={chart.xKey} tickLine={false} axisLine={false} tick={axisTick} minTickGap={20} />
              <YAxis hide tickFormatter={compact} />
              {tooltip}
              {chart.seriesKeys.map((key, i) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={PALETTE[i % PALETTE.length]}
                  strokeWidth={2.5}
                  fill={`url(#fill-${chart.key})`}
                  dot={false}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportChart;
