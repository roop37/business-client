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
import { PermissionTypeEnum, CampaignReportData } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useUserStore from "@/store/user";
import { sdk } from "@/utils/graphqlClient";
import { hasAccess } from "@/utils/hasAccess";
import { extractErrorMessage } from "@/utils/utilFUncs";
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
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const CampaignReport = () => {
  // Configs
  const router = useRouter();
  const columnHelper = createColumnHelper<any>();

  // Stores
  const { setToastData, setSelectedSideBarMenu } = useGlobalStore();
  const { meUser } = useUserStore();

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
  const [reportsData, setReportsData] = useState<CampaignReportData | null>(
    null
  );
  const [hasDownloadAccess, setHasDownloadAccess] = useState(false);

  // Table States
  const [campaignTable, setCampaignTable] = useState<{
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

        const { getCampaignReport } = await sdk.getCampaignReport({
          input: inputData,
        });

        if (!getCampaignReport) {
          setToastData({
            type: "error",
            message:
              "Unable to fetch campaign report data, please try again after sometime.",
          });
          return;
        }

        setReportsData(getCampaignReport as CampaignReportData);
        setSelectedSideBarMenu("Campaign Report");

        // Prepare Table Data
        const { tableData } = getCampaignReport;

        const columns: ColumnDef<any, any>[] = tableData.columns.map((col) => {
          return columnHelper.accessor(col.key, {
            header: col.header,
            enableSorting: false,
            enableColumnFilter: false,
            cell: ({ row }) => {
              return <DataTableTextCell value={row.original[col.key]} />;
            },
          });
        });

        const rows = tableData.rows.map((row) => {
          let finalRow: { [key: string]: any } = {};

          row.row.forEach((rowData) => {
            finalRow[rowData["key"]] = rowData["value"];
          });

          return finalRow;
        });

        setCampaignTable({ columns, rows });
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const payloadObject = payload[0].payload;
      const campaignName = (payloadObject as any)?.campaignName || "N/A";

      return (
        <div className="bg-white p-2 border shadow-md rounded-lg min-w-[150px]">
          <p className="font-medium text-xs mb-1">Campaign Metrics</p>
          <p className="text-gray-500 text-xs mb-1">Campaign: {campaignName}</p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-gray-500 text-xs">
              {entry.name}: {entry.value !== undefined ? entry.value : "N/A"}
            </p>
          ))}
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

      {reportsData.campaignChart && reportsData.campaignChart.length > 0 ? (
        <div className="min-h-[50vh] flex flex-col w-full col-span-1 md:col-span-9 border rounded-xl p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
            <div>
              <h2 className="font-semibold text-xl sm:text-2xl">
                Campaign Performance
              </h2>
            </div>
            <div className="flex flex-wrap md:flex-nowrap justify-start sm:justify-center items-center gap-2">
              <Select
                value={inputData.currentMonth}
                onValueChange={(value) => {
                  setInputData((prev) => ({
                    ...prev,
                    currentMonth: value,
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
              <Select
                value={inputData.currentYear}
                onValueChange={(value) => {
                  setInputData((prev) => ({
                    ...prev,
                    currentYear: value,
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
            </div>
          </div>

          <div className="w-full h-[30vh] sm:h-[40vh] md:h-[50vh]">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer config={{}} className="">
                <BarChart
                  data={reportsData.campaignChart.map((item, index) => ({
                    ...item,
                    uniqueKey: `${
                      (item as any).campaignName || `Campaign ${index + 1}`
                    }-${index}`,
                  }))}
                  accessibilityLayer
                  margin={{
                    bottom: 40,
                    right: 12,
                    left: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="uniqueKey"
                    axisLine={false}
                    tickLine={false}
                    textAnchor={"end"}
                    angle={-45}
                    tickFormatter={(value) => {
                      // Extract campaign name from uniqueKey (remove the index suffix)
                      const campaignName = value
                        .split("-")
                        .slice(0, -1)
                        .join("-");
                      return campaignName || "N/A";
                    }}
                    interval={0}
                    height={80}
                    tick={{
                      fontSize: 12,
                      width: 120,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Count / Amount",
                      angle: -90,
                      position: "insideLeft",
                      offset: -5,
                      style: { textAnchor: "middle" },
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}`}
                    width={window.innerWidth < 768 ? 60 : 80}
                  />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="emailsSent"
                    name="Emails Sent"
                    fill="#06b6d4"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={window.innerWidth < 640 ? 10 : 15}
                  />
                  <Bar
                    dataKey="emailOpens"
                    name="Email Opens"
                    fill="#10b981"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={window.innerWidth < 640 ? 10 : 15}
                  />
                  <Bar
                    dataKey="emailClicks"
                    name="Email Clicks"
                    fill="#a855f7"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={window.innerWidth < 640 ? 10 : 15}
                  />
                  <Bar
                    dataKey="salesContribution"
                    name="Sales Contribution"
                    fill="#2563eb"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={window.innerWidth < 640 ? 10 : 15}
                  />
                </BarChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-2">
            <p className="text-xs font-light flex justify-start items-center">
              <span className="h-2 w-2 bg-[#06b6d4] block rounded-sm mr-2"></span>
              Emails Sent
            </p>
            <p className="text-xs font-light flex justify-start items-center">
              <span className="h-2 w-2 bg-[#10b981] block rounded-sm mr-2"></span>
              Email Opens
            </p>
            <p className="text-xs font-light flex justify-start items-center">
              <span className="h-2 w-2 bg-[#a855f7] block rounded-sm mr-2"></span>
              Email Clicks
            </p>
            <p className="text-xs font-light flex justify-start items-center">
              <span className="h-2 w-2 bg-[#2563eb] block rounded-sm mr-2"></span>
              Sales Contribution ($)
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-[30vh] flex flex-col w-full col-span-1 md:col-span-9 border rounded-xl p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
            <div>
              <h2 className="font-semibold text-xl sm:text-2xl">
                Campaign Performance
              </h2>
            </div>
            <div className="flex flex-wrap md:flex-nowrap justify-start sm:justify-center items-center gap-2">
              <Select
                value={inputData.currentMonth}
                onValueChange={(value) => {
                  setInputData((prev) => ({
                    ...prev,
                    currentMonth: value,
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
              <Select
                value={inputData.currentYear}
                onValueChange={(value) => {
                  setInputData((prev) => ({
                    ...prev,
                    currentYear: value,
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
            </div>
          </div>
          <div className="flex items-center justify-center h-[20vh] text-gray-500">
            <p className="text-sm">
              No campaign data available for the selected period
            </p>
          </div>
        </div>
      )}

      <ReportDataTable
        tableTitle={reportsData.tableData.title}
        columns={campaignTable.columns}
        data={campaignTable.rows}
        loading={loading}
        fileName={`Campaign_Report_${inputData.currentMonth}_${
          inputData.currentYear
        }_${Date.now()}`}
        downloadDisabled={!hasDownloadAccess}
        showFooter={false}
        pageSize={50}
      />
    </div>
  );
};

export default CampaignReport;
