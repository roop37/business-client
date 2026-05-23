// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import React from "react";

// interface MetricCardProps {
//   title: string;
//   value: number | string;
//   subTitle?: string;
//   prefix?: string;
//   suffix?: string;
// }

// export const MetricCard: React.FC<MetricCardProps> = ({
//   title,
//   value,
//   prefix = "$",
//   suffix,
//   subTitle,
// }) => (
//   <Card className="rounded-xl">
//     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//       <CardTitle className="text-sm font-medium">{title}</CardTitle>
//       {/* <svg
//         xmlns="http://www.w3.org/2000/svg"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="2"
//         className="h-4 w-4 text-muted-foreground"
//       >
//         <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
//       </svg> */}

//       {/* <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="24"
//         height="24"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="2"
//         className="h-4 w-4 text-muted-foreground"
//       >
//         <line x1="19" x2="5" y1="5" y2="19" />
//         <circle cx="6.5" cy="6.5" r="2.5" />
//         <circle cx="17.5" cy="17.5" r="2.5" />
//       </svg> */}
//     </CardHeader>
//     <CardContent>
//       <div className="text-2xl font-bold">{value}</div>
//       {(subTitle ?? "").length > 0 ? (
//         <p className="text-xs text-muted-foreground">{subTitle}</p>
//       ) : null}
//     </CardContent>
//   </Card>
//   // <div className="bg-secondaryBg bg-opacity-15 hover:bg-secondaryBg p-4 rounded-xl border border-gray-300 shadow-sm transition-colors duration-300 ease-in-out">
//   //   <div className="space-y-1">
//   //     <p className="text-sm text-gray-800">{title}</p>
//   //     {subTitle && <p className="text-xs text-gray-500">{subTitle}</p>}

//   //     <div className="flex items-center">
//   //       <h2 className="text-xl font-medium">
//   //         {prefix} {value} {suffix}
//   //       </h2>
//   //     </div>
//   //   </div>
//   // </div>
// );

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { TrendingDown, TrendingUp } from "lucide-react";
// import React from "react";

// interface MetricCardProps {
//   title: string;
//   value: number | string;
//   subTitle?: string;
//   prefix?: string;
//   suffix?: string;
//   trend?: {
//     value: number;
//     isPositive: boolean;
//   };
// }

// export const MetricCard: React.FC<MetricCardProps> = ({
//   title,
//   value,
//   prefix,
//   suffix,
//   subTitle,
//   trend,
// }) => (
//   <Card className="rounded-lg hover:shadow-md transition-shadow duration-200">
//     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
//       <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
//     </CardHeader>
//     <CardContent>
//       <div className="flex items-center gap-2">
//         <span className="text-lg font-medium">
//           {prefix}
//           {value}
//           {suffix}
//         </span>
//         {trend && (
//           <div
//             className={`flex items-center text-sm ${
//               trend.isPositive ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {trend.isPositive ? (
//               <TrendingUp className="h-4 w-4" />
//             ) : (
//               <TrendingDown className="h-4 w-4" />
//             )}
//             <span className="ml-1">{trend.value}%</span>
//           </div>
//         )}
//       </div>
//       {subTitle && <p className="text-xs text-gray-500 mt-1">{subTitle}</p>}
//     </CardContent>
//   </Card>
// );

// export default MetricCard;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string | null;
  showTrend?: boolean;
  trendPercent?: number | null;
  prefix?: string;
  suffix?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  showTrend = false,
  trendPercent = null,
  prefix = "",
  suffix = "",
}) => (
  <Card className="rounded-lg hover:shadow-md transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
      <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2">
        <span className="text-lg font-medium">
          {prefix}
          {value}
          {suffix}
        </span>
        {showTrend && trendPercent !== null && (
          <div
            className={`flex items-center text-sm ${
              trendPercent >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trendPercent >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="ml-1">{Math.abs(trendPercent)}%</span>
          </div>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </CardContent>
  </Card>
);

export default MetricCard;
