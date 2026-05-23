import DataTableTextCell from "@/components/common/dataTable/common/textCell";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import ReportDataTable from "@/components/ui/reportDataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PermissionTypeEnum,
  ReportsTypeEnum,
  TrendsReportData,
} from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import useUserStore from "@/store/user";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { extractErrorMessage, formatReportType } from "@/utils/utilFUncs";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { ChevronLeft } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const SalesTrendReport = () => {
  // Configs
  const router = useRouter();
  const columnHelper = createColumnHelper<any>();

  // Stores
  const { setToastData } = useGlobalStore();
  const { setSelectedSideBarMenu } = useGlobalStore();
  const { meUser } = useUserStore();
  const { timezone } = useHostsStore();

  // States
  const [inputData, setInputData] = useState<{
    currentMonth: string;
    compareMonth: string;
    currentYear: string;
    compareYear: string;
  }>({
    currentMonth: DateTime.now().toFormat("MMMM"),
    compareMonth: "Previous Month",
    currentYear: DateTime.now().toFormat("yyyy"),
    compareYear: DateTime.now().minus({ year: 1 }).toFormat("yyyy"),
  });
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState<TrendsReportData | null>(null);
  const [hasDownloadAccess, setHasDownloadAccess] = useState(false);

  // Table States
  const [monthlyTable, setMonthlyTable] = useState<{
    columns: ColumnDef<any, any>[];
    rows: { [key: string]: string }[];
  }>({ columns: [], rows: [] });
  const [yearlyTable, setYearlyTable] = useState<{
    columns: ColumnDef<any, any>[];
    rows: { [key: string]: string }[];
  }>({ columns: [], rows: [] });

  useEffect(() => {
    const canAccess = hasAccess(
      meUser?.permissions ?? [],
      PermissionTypeEnum.DownloadReports
    );

    setHasDownloadAccess(canAccess);
  }, [meUser?.permissions]);

  useEffect(() => {
    const fetchFunc = async () => {
      try {
        setLoading(true);

        const { getSalesTrendReport } = await sdk.getSalesTrendReport({
          input: inputData,
        });

        if (!getSalesTrendReport) {
          setToastData({
            type: "error",
            message:
              "Unable to fetch report data, please try again after sometime.",
          });
          return;
        }

        setReportsData(getSalesTrendReport);
        setSelectedSideBarMenu(formatReportType(ReportsTypeEnum.SalesTrend));

        // Prepare Table Data
        const { monthly, yearly } = getSalesTrendReport;

        const monthColumns: ColumnDef<any, any>[] =
          monthly.tableData.columns.map((col) => {
            return columnHelper.accessor(col.key, {
              header: col.header,
              enableSorting: false,
              enableColumnFilter: false,
              cell: ({ row }) => {
                return <DataTableTextCell value={row.original[col.key]} />;
              },
            });
          });

        const monthRows = monthly.tableData.rows.map((row) => {
          let finalRow: { [key: string]: any } = {};

          row.row.forEach((rowData) => {
            finalRow[rowData["key"]] = rowData["value"];
          });

          return finalRow;
        });

        const yearColumns: ColumnDef<any, any>[] = yearly.tableData.columns.map(
          (col) => {
            return columnHelper.accessor(col.key, {
              header: col.header,
              enableSorting: false,
              enableColumnFilter: false,
              cell: ({ row }) => {
                return <DataTableTextCell value={row.original[col.key]} />;
              },
            });
          }
        );

        const yearRows = yearly.tableData.rows.map((row) => {
          let finalRow: { [key: string]: any } = {};

          row.row.forEach((rowData) => {
            finalRow[rowData["key"]] = rowData["value"];
          });

          return finalRow;
        });

        setMonthlyTable({ columns: monthColumns, rows: monthRows });
        setYearlyTable({ columns: yearColumns, rows: yearRows });
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        setToastData({
          type: "error",
          message: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFunc();
    // Only for columnHelper
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputData, setSelectedSideBarMenu, setToastData]);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin text-gray-500">
          <FaSpinner className="text-primary" size={39} />
        </div>
      </div>
    );
  }

  if (!reportsData) {
    return null;
  }

  const formatUSAmount = (num: number): string => {
    if (num < 1_000) {
      return num.toString(); // Ones, tens, and hundreds remain unchanged
    } else if (num < 1_000_000) {
      return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + "k"; // Thousands as 'k'
    } else {
      return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + "M"; // Lakhs as 'M'
    }
  };

  const CustomTooltip = ({ active, payload, label, yearly }: any) => {
    if (active && payload && payload.length) {
      const payloadObject = payload[0].payload;
      const value = payloadObject?.date ?? "";
      let dateStr = "";
      if (value !== "" && yearly === undefined) {
        if (value === "N/A") {
          dateStr = "N/A";
        } else {
          const dateSplit = value.split("T");
          const partSplit = dateSplit[0].split("-");
          dateStr = `${partSplit[1]}-${partSplit[2]}-${partSplit[0]}`;
        }
      }

      // const tz = timezone.split(" ")[0];

      // const payloadObject = payload[0].payload;
      // const value = payloadObject?.date ?? "";
      // let dateStr = "";
      // if (value !== "" && yearly === undefined) {
      //   if (value === "N/A") {
      //     dateStr = "N/A";
      //   } else {
      //     const restoTz = DateTime.fromISO(value).setZone(tz);
      //     dateStr = restoTz.toFormat("MM-dd-yyyy");
      //   }
      // }

      // let compareDateStr = "";
      // if (payload.length > 1) {
      //   const payloadObject = payload[1].payload;
      //   const value = payloadObject?.date ?? "";
      //   if (value !== "" && yearly === undefined) {
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
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            router.back();
          }}
          className="flex flex-row justify-center items-center space-x-1 group cursor-pointer text-sm"
        >
          <ChevronLeft
            className="group-hover:text-primary inline-block"
            size={18}
          />
          <span className="group-hover:text-primary">Go Back</span>
        </button>
      </div>

      <div className="min-h-[50vh] flex flex-col w-full col-span-1 md:col-span-9 border rounded-xl p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
          <div>
            <h2 className="font-semibold text-xl sm:text-2xl">
              Monthly Sales Trend
            </h2>
            <p className="text-xs font-light mt-1 sm:mt-2 flex justify-start items-center">
              <span className="h-2 w-2 bg-primary block rounded-sm mr-2"></span>
              Current Period: {inputData.currentMonth}
            </p>
            <p className="text-xs font-light mt-1 flex justify-start items-center">
              <span className="h-2 w-2 bg-primary/30 block rounded-sm mr-2"></span>
              Compare Period: {inputData.compareMonth}
            </p>
          </div>
          <div className="flex flex-wrap md:flex-nowrap justify-start sm:justify-center items-center gap-2">
            <Select
              value={inputData.currentMonth}
              onValueChange={(value) => {
                setInputData((prev) => ({
                  ...prev,
                  currentMonth: value,
                  compareMonth: "Previous Month",
                }));
              }}
            >
              <SelectTrigger className="h-8 w-auto text-xs">
                <SelectValue placeholder={"Select month"} />
              </SelectTrigger>
              <SelectContent side="top">
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((e) => (
                  <SelectItem key={e} value={`${e}`}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs font-light text-gray-400">VS</p>
            <Select
              value={inputData.compareMonth}
              onValueChange={(value) => {
                setInputData((prev) => ({
                  ...prev,
                  compareMonth: value,
                }));
              }}
            >
              <SelectTrigger className="h-8 min-w-[100px] text-xs">
                <SelectValue placeholder={"Select month"} />
              </SelectTrigger>
              <SelectContent side="top">
                {["Previous Month", "Same Period Previous Year"].map((e) => (
                  <SelectItem key={e} value={`${e}`} className="text-xs">
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full h-[30vh] sm:h-[40vh] md:h-[50vh]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={{}} className="">
              <LineChart
                data={reportsData.monthly.salesTrendChart}
                accessibilityLayer
                margin={{
                  bottom: 40,
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
                  angle={-45}
                  tickFormatter={(value) => {
                    if (value === "N/A") {
                      return "";
                    } else {
                      const dateSplit = value.split("T");
                      const partSplit = dateSplit[0].split("-");
                      return `${partSplit[1]}-${partSplit[2]}-${partSplit[0]}`;
                    }
                  }}
                  interval={window.innerWidth < 768 ? 4 : 2}
                  height={60}
                />
                <YAxis
                  label={{
                    value: "Net Sales ($)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -5,
                    style: { textAnchor: "middle" },
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${formatUSAmount(value)}`}
                  width={window.innerWidth < 768 ? 60 : 80}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Line
                  dataKey="sales"
                  name="Current Period"
                  type="monotone"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  connectNulls
                />
                <Line
                  dataKey="compareSales"
                  name="Compare Period"
                  type="monotone"
                  stroke="#2947c24D"
                  strokeWidth={2}
                  connectNulls
                />
              </LineChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </div>

      <ReportDataTable
        tableTitle={"Monthly Sales Trend"}
        columns={monthlyTable.columns}
        data={monthlyTable.rows}
        loading={loading}
        fileName={`Monthly_Sales_Trend_${Date.now()}`}
        downloadDisabled={!hasDownloadAccess}
        showFooter={false}
        pageSize={31}
      />

      <div className="min-h-[50vh] flex flex-col w-full col-span-1 md:col-span-9 border rounded-xl p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
          <div>
            <h2 className="font-semibold text-xl sm:text-2xl">
              Yearly Sales Trend
            </h2>
            <p className="text-xs font-light mt-1 sm:mt-2 flex justify-start items-center">
              <span className="h-2 w-2 bg-primary block rounded-sm mr-2"></span>
              Current Period: {inputData.currentYear}
            </p>
            <p className="text-xs font-light mt-1 flex justify-start items-center">
              <span className="h-2 w-2 bg-primary/30 block rounded-sm mr-2"></span>
              Compare Period: {inputData.compareYear}
            </p>
          </div>
          <div className="flex flex-wrap justify-start sm:justify-center items-center gap-2">
            <Select
              value={inputData.currentYear}
              onValueChange={(value) => {
                setInputData((prev) => ({
                  ...prev,
                  currentYear: value,
                  compareYear: DateTime.fromFormat(value, "yyyy")
                    .minus({ year: 1 })
                    .year.toString(),
                }));
              }}
            >
              <SelectTrigger className="h-8 min-w-[70px] text-xs">
                <SelectValue placeholder={"Select year"} />
              </SelectTrigger>
              <SelectContent side="top">
                {[
                  DateTime.now().year.toString(),
                  DateTime.now().minus({ year: 1 }).year.toString(),
                  DateTime.now().minus({ year: 2 }).year.toString(),
                ].map((e) => (
                  <SelectItem key={e} value={`${e}`}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs font-light text-gray-400">VS</p>
            <Select
              value={inputData.compareYear}
              onValueChange={(value) => {
                setInputData((prev) => ({
                  ...prev,
                  compareYear: value,
                }));
              }}
            >
              <SelectTrigger className="h-8 min-w-[70px] text-xs">
                <SelectValue placeholder={"Select year"} />
              </SelectTrigger>
              <SelectContent side="top">
                {[
                  DateTime.fromFormat(inputData.currentYear, "yyyy")
                    .minus({ year: 1 })
                    .year.toString(),
                  DateTime.fromFormat(inputData.currentYear, "yyyy")
                    .minus({ year: 2 })
                    .year.toString(),
                  DateTime.fromFormat(inputData.currentYear, "yyyy")
                    .minus({ year: 3 })
                    .year.toString(),
                ].map((e) => (
                  <SelectItem key={e} value={`${e}`}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full h-[30vh] sm:h-[40vh] md:h-[50vh]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={{}} className="">
              <BarChart
                data={reportsData.yearly.salesTrendChart}
                accessibilityLayer
                margin={{
                  bottom: 20,
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
                  angle={-45}
                  tickFormatter={(value) => {
                    if (value === "N/A") {
                      return "";
                    } else {
                      const tz = timezone.split(" ")[0];
                      const restoTz = DateTime.fromISO(value).setZone(tz);
                      return restoTz.toFormat("MMM");
                    }
                  }}
                  height={50}
                />
                <YAxis
                  label={{
                    value: "Net Sales ($)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -5,
                    style: { textAnchor: "middle" },
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${formatUSAmount(value)}`}
                  width={window.innerWidth < 768 ? 60 : 80}
                />
                <ChartTooltip content={<CustomTooltip yearly={true} />} />
                <Bar
                  dataKey="sales"
                  name="Current Period"
                  fill="var(--primary)"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={window.innerWidth < 640 ? 15 : 25}
                />
                <Bar
                  dataKey="compareSales"
                  name="Compare Period"
                  fill="#2947c24D"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={window.innerWidth < 640 ? 15 : 25}
                />
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </div>

      <ReportDataTable
        tableTitle={"Yearly Sales Trend"}
        columns={yearlyTable.columns}
        data={yearlyTable.rows}
        loading={loading}
        fileName={`Yearly_Sales_Trend_${Date.now()}`}
        downloadDisabled={!hasDownloadAccess}
        showFooter={false}
        pageSize={12}
      />
    </div>
  );
};

export default SalesTrendReport;
