import { MetricsDataRange } from "@/generated/graphql";
import { useDashboardMetricStore } from "@/store/dashboardMetric";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import CButton from "../common/button/button";
import { ButtonType } from "../common/button/interface";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export enum CompareDataRange {
  PreviousDay = "PreviousDay",
  PreviousWeek = "PreviousWeek",
  PreviousMonth = "PreviousMonth",
  PreviousYear = "PreviousYear",
  Custom = "Custom",
}

const formatCurrentDataRange = (value: MetricsDataRange): string => {
  switch (value) {
    case MetricsDataRange.Today:
      return "Today";
    case MetricsDataRange.Yesterday:
      return "Yesterday";
    case MetricsDataRange.ThisWeek:
      return "This Week";
    case MetricsDataRange.ThisMonth:
      return "This Month";
    case MetricsDataRange.ThisYear:
      return "This Year";
    case MetricsDataRange.Custom:
      return "Custom";
    default:
      return "Unknown";
  }
};

const formatCompareDataRange = (value: CompareDataRange): string => {
  switch (value) {
    case CompareDataRange.PreviousDay:
      return "Previous Day";
    case CompareDataRange.PreviousWeek:
      return "Previous Week";
    case CompareDataRange.PreviousMonth:
      return "Previous Month";
    case CompareDataRange.PreviousYear:
      return "Previous Year";
    case CompareDataRange.Custom:
      return "Custom";
    default:
      return "Unknown";
  }
};

const dataRangeList = [
  MetricsDataRange.Today,
  MetricsDataRange.Yesterday,
  MetricsDataRange.ThisWeek,
  MetricsDataRange.ThisMonth,
  MetricsDataRange.ThisYear,
  MetricsDataRange.Custom,
];

const compareDataRangeList = [
  CompareDataRange.PreviousDay,
  CompareDataRange.PreviousWeek,
  CompareDataRange.PreviousMonth,
  CompareDataRange.PreviousYear,
  // CompareDataRange.Custom,
];

const DataDateRange = ({ allowCompare = true }: { allowCompare?: boolean }) => {
  // Store
  const {
    dataRange,
    compareDataRange,
    startDate,
    endDate,
    startCompareDate,
    endCompareDate,
    setDataRange,
    setCompareDataRange,
    setStartDate,
    setEndDate,
    setStartCompareDate,
    setEndCompareDate,
  } = useDashboardMetricStore();
  const { setToastData } = useGlobalStore();
  const { timezone } = useHostsStore();

  const hostTz = timezone?.split(" ")[0] ?? "";
  // States
  const [dRange, setDRange] = useState<MetricsDataRange | undefined>(dataRange);
  const [sDate, setSDate] = useState<Date | undefined>(startDate);
  const [eDate, setEDate] = useState<Date | undefined>(endDate);

  const [cRange, setCRange] = useState<CompareDataRange | null>(
    compareDataRange
  );
  const [sCDate, setSCDate] = useState<Date | undefined>();
  const [eCDate, setECDate] = useState<Date | undefined>();

  const [isMainOpen, setIsMainOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Handlers / Functions
  const handleDataRangeChange = (range: MetricsDataRange) => {
    setDRange(range);
    setCRange(null);
    setCompareDataRange(null);

    let nowLocal = DateTime.now();
    const restoLocal = DateTime.now().setZone(hostTz);

    if (nowLocal.day > restoLocal.day) {
      nowLocal = nowLocal.minus({ day: 1 });
    } else if (restoLocal.day > nowLocal.day) {
      nowLocal = nowLocal.plus({ day: 1 });
    }

    const nowInRestaurantTz = nowLocal;
    const todayStart = nowInRestaurantTz.startOf("day");
    switch (range) {
      case MetricsDataRange.Today:
        setSDate(todayStart.toJSDate());
        setEDate(todayStart.toJSDate());
        break;
      case MetricsDataRange.Yesterday:
        const yesterdayStart = nowInRestaurantTz
          .minus({ days: 1 })
          .startOf("day");
        setSDate(yesterdayStart.toJSDate());
        setEDate(yesterdayStart.toJSDate());
        break;
      case MetricsDataRange.ThisWeek:
        setSDate(nowInRestaurantTz.startOf("week").toJSDate());
        // Use today's start instead of current time to avoid timezone crossover
        setEDate(todayStart.toJSDate());
        break;
      case MetricsDataRange.ThisMonth:
        setSDate(nowInRestaurantTz.startOf("month").toJSDate());
        setEDate(todayStart.toJSDate());
        break;
      case MetricsDataRange.ThisYear:
        setSDate(nowInRestaurantTz.startOf("year").toJSDate());
        setEDate(todayStart.toJSDate());
        break;
      case MetricsDataRange.Custom:
        setSDate(todayStart.toJSDate());
        setEDate(todayStart.toJSDate());
        break;
      default:
        break;
    }
  };
  const handleCompareDataRangeChange = (range: CompareDataRange) => {
    setCRange(range);

    // Convert startDate to DateTime object in restaurant timezone
    const startDateInTz = DateTime.fromJSDate(startDate);

    // Populate the dates
    switch (range) {
      case CompareDataRange.PreviousDay:
        const prevDay = startDateInTz.minus({ days: 1 }).startOf("day");
        setSCDate(prevDay.toJSDate());
        setECDate(prevDay.toJSDate());
        break;
      case CompareDataRange.PreviousWeek:
        const prevWeekStart = startDateInTz.minus({ weeks: 1 }).startOf("week");
        const prevWeekEnd = prevWeekStart.endOf("week");
        setSCDate(prevWeekStart.toJSDate());
        setECDate(prevWeekEnd.toJSDate());
        break;
      case CompareDataRange.PreviousMonth:
        const prevMonthStart = startDateInTz
          .minus({ months: 1 })
          .startOf("month");
        const prevMonthEnd = prevMonthStart.endOf("month");
        setSCDate(prevMonthStart.toJSDate());
        setECDate(prevMonthEnd.toJSDate());
        break;
      case CompareDataRange.PreviousYear:
        const prevYearStart = startDateInTz.minus({ years: 1 }).startOf("year");
        const prevYearEnd = prevYearStart.endOf("year");
        setSCDate(prevYearStart.toJSDate());
        setECDate(prevYearEnd.toJSDate());
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center space-x-2">
      <Popover
        open={isMainOpen}
        onOpenChange={(e) => {
          setIsMainOpen(e);
          if (!e) {
            setDRange(dataRange);
            setSDate(startDate);
            setEDate(endDate);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between space-x-2 items-center text-center bg-[#F3F7FB] py-2 px-4"
          >
            <CalendarIcon className="text-black" />
            <p className="text-sm">
              {isSameDay(startDate, endDate)
                ? format(startDate, "PP")
                : `${format(startDate, "PP")} - ${format(endDate, "PP")}`}
            </p>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full bg-white flex flex-col"
          align="end"
          side="bottom"
          sideOffset={10}
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col justify-start items-start space-y-2 w-[70px] md:w-[150px]">
              <ul className="space-y-2">
                {dataRangeList.map((range) => (
                  <li
                    key={range}
                    className={`w-full text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-gray-100 ${
                      dRange === range
                        ? "bg-gray-100 text-primary"
                        : "text-gray-600"
                    }`}
                    onClick={() => {
                      handleDataRangeChange(range);
                    }}
                  >
                    {formatCurrentDataRange(range)}
                  </li>
                ))}
              </ul>
            </div>
            <Calendar
              mode="range"
              selected={{ from: sDate, to: eDate }}
              toDate={DateTime.now()
                .setZone(hostTz)
                .startOf("day")
                .toJSDate()}
              onSelect={(range) => {
                setSDate(range?.from);
                setEDate(
                  range?.to === undefined ? range?.from ?? undefined : range?.to
                );
              }}
              disabled={dRange !== MetricsDataRange.Custom}
            />
          </div>
          <div className="flex justify-end items-center space-x-5">
            <CButton
              variant={ButtonType.Text}
              onClick={() => {
                handleDataRangeChange(MetricsDataRange.ThisWeek);
                setDataRange(MetricsDataRange.ThisWeek);
                setStartDate(startOfWeek(new Date()));
                setEndDate(new Date());
                setIsCompareOpen(false);
                setIsMainOpen(false);
              }}
            >
              Reset
            </CButton>
            <CButton
              variant={ButtonType.Secondary}
              onClick={() => {
                if (!sDate || !eDate || !dRange) {
                  setToastData({
                    type: "error",
                    message: "Please select a date range",
                  });
                  return;
                }
                setIsCompareOpen(false);
                setIsMainOpen(false);
                setDataRange(dRange);
                setStartDate(sDate);
                setEndDate(eDate);

                setSCDate(undefined);
                setECDate(undefined);
                setCompareDataRange(null);
                setStartCompareDate(null);
                setEndCompareDate(null);
              }}
            >
              Apply
            </CButton>
          </div>
        </PopoverContent>
      </Popover>
      {allowCompare ? (
        <>
          <p className="text-xs text-gray-500">VS</p>
          <Popover
            open={isCompareOpen}
            onOpenChange={(e) => {
              setIsCompareOpen(e);
              if (!e) {
                setCRange(cRange);
                setSCDate(startCompareDate ?? undefined);
                setECDate(endCompareDate ?? undefined);
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start md:justify-between space-x-2 items-center text-center bg-[#F3F7FB] py-2 px-4"
              >
                <CalendarIcon className="text-black" />
                {startCompareDate && endCompareDate ? (
                  <p className="text-sm">
                    {isSameDay(startCompareDate, endCompareDate)
                      ? format(startCompareDate, "PP")
                      : `${format(startCompareDate, "PP")} - ${format(
                          endCompareDate,
                          "PP"
                        )}`}
                  </p>
                ) : (
                  "Select date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="flex flex-col justify-start items-start w-full"
              align="end"
              side="bottom"
              sideOffset={10}
            >
              <p className="text-xs mb-2 italic text-gray-600">{`Note: Comparative date range has to be in the past`}</p>
              <div className="w-full bg-white flex justify-between items-start">
                <div className="flex flex-col justify-start items-start space-y-2 w-[70px] md:w-[150px]">
                  <ul className="space-y-2">
                    {compareDataRangeList.map((range) => (
                      <li
                        key={range}
                        className={`w-full text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-gray-100 ${
                          cRange === range
                            ? "bg-gray-100 text-primary"
                            : "text-gray-600"
                        }`}
                        onClick={() => {
                          handleCompareDataRangeChange(range);
                        }}
                      >
                        {formatCompareDataRange(range)}
                      </li>
                    ))}
                  </ul>
                </div>
                <Calendar
                  mode="range"
                  toDate={addDays(startDate, -1)}
                  selected={{
                    from: sCDate,
                    to: eCDate,
                  }}
                  onSelect={(range) => {
                    setSCDate(range?.from);
                    setECDate(
                      range?.to === undefined ? range?.from : range?.to
                    );
                  }}
                  disabled={cRange !== CompareDataRange.Custom}
                  initialFocus
                />
              </div>
              <div className="flex justify-end items-center space-x-5 w-full">
                <CButton
                  variant={ButtonType.Text}
                  onClick={() => {
                    setIsCompareOpen(false);
                    setIsMainOpen(false);
                    setSCDate(undefined);
                    setECDate(undefined);
                    setCRange(null);
                    setCompareDataRange(null);
                    setStartCompareDate(null);
                    setEndCompareDate(null);
                  }}
                >
                  Reset
                </CButton>
                <CButton
                  variant={ButtonType.Secondary}
                  onClick={() => {
                    if (!sCDate || !eCDate || !cRange) {
                      setToastData({
                        type: "error",
                        message: "Please select a date range",
                      });
                      return;
                    }
                    setIsCompareOpen(false);
                    setIsMainOpen(false);
                    setCompareDataRange(cRange);
                    setStartCompareDate(sCDate);
                    setEndCompareDate(eCDate);
                  }}
                >
                  Apply
                </CButton>
              </div>
            </PopoverContent>
          </Popover>
        </>
      ) : null}
    </div>
  );
};

export default DataDateRange;
