import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MetricsDataRange } from "@/generated/graphql";
import useHostsStore from "@/store/host";
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isAfter,
  isSameDay,
  isValid,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";
import { AlertCircle, CalendarIcon } from "lucide-react";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

type DateRangeOption = {
  label: string;
  value: MetricsDataRange;
  description?: string;
};

export enum ComparingTypes {
  TODAY_VS_YESTERDAY = "TODAY_VS_YESTERDAY",
  THIS_WEEK_VS_LAST_WEEK = "THIS_WEEK_VS_LAST_WEEK",
  THIS_MONTH_VS_LAST_MONTH = "THIS_MONTH_VS_LAST_MONTH",
  THIS_YEAR_VS_LAST_YEAR = "THIS_YEAR_VS_LAST_YEAR",
  CUSTOM = "CUSTOM",
}

interface ComparisonOption {
  label: string;
  value: ComparingTypes;
  description: string;
}

const formatDateRange = (range: MetricsDataRange): string => {
  switch (range) {
    case MetricsDataRange.Today:
      return "Today";
    case MetricsDataRange.Yesterday:
      return "Yesterday";
    case MetricsDataRange.ThisWeek:
      return "This Week";
    case MetricsDataRange.LastWeek:
      return "Last Week";
    case MetricsDataRange.ThisMonth:
      return "This Month";
    case MetricsDataRange.LastMonth:
      return "Last Month";
    case MetricsDataRange.ThisYear:
      return "This Year";
    case MetricsDataRange.LastYear:
      return "Last Year";
    case MetricsDataRange.Custom:
      return "Custom";
    default:
      return "Select Range";
  }
};

interface DateRangeSelectorProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  selectedRange: MetricsDataRange;
  onRangeChange: (range: MetricsDataRange) => void;
  compareStartDate: Date | null;
  compareEndDate: Date | null;
  onCompareStartDateChange: (date: Date | null) => void;
  onCompareEndDateChange: (date: Date | null) => void;
  isComparable?: boolean;
  className?: string;
  selectedComparisonType?: ComparingTypes;
  onComparisonTypeChange?: (type: ComparingTypes) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedRange = MetricsDataRange.Today,
  onRangeChange,
  compareStartDate,
  compareEndDate,
  onCompareStartDateChange,
  onCompareEndDateChange,
  isComparable = false,
  className = "",
  selectedComparisonType = ComparingTypes.CUSTOM,
  onComparisonTypeChange = () => {},
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >({
    from: startDate || undefined,
    to: endDate || undefined,
  });
  const [selectedCompareRange, setSelectedCompareRange] = useState<
    DateRange | undefined
  >({
    from: compareStartDate || undefined,
    to: compareEndDate || undefined,
  });

  const dateRangeOptions: DateRangeOption[] = [
    {
      label: "Today",
      value: MetricsDataRange.Today,
      description: "Data for the current day",
    },
    {
      label: "Yesterday",
      value: MetricsDataRange.Yesterday,
      description: "Previous day's data",
    },
    {
      label: "This Week",
      value: MetricsDataRange.ThisWeek,
      description: "Current week's data",
    },
    {
      label: "Last Week",
      value: MetricsDataRange.LastWeek,
      description: "Previous week's data",
    },
    {
      label: "This Month",
      value: MetricsDataRange.ThisMonth,
      description: "Current month's data",
    },
    {
      label: "Last Month",
      value: MetricsDataRange.LastMonth,
      description: "Previous month's data",
    },
    {
      label: "This Year",
      value: MetricsDataRange.ThisYear,
      description: "Current year's data",
    },
    {
      label: "Last Year",
      value: MetricsDataRange.LastYear,
      description: "Previous year's data",
    },
    {
      label: "Custom Range",
      value: MetricsDataRange.Custom,
      description: "Select custom date range",
    },
  ];

  const comparisonOptions: ComparisonOption[] = [
    {
      label: "Today vs Yesterday",
      value: ComparingTypes.TODAY_VS_YESTERDAY,
      description: "Compare today with yesterday",
    },
    {
      label: "This Week vs Last Week",
      value: ComparingTypes.THIS_WEEK_VS_LAST_WEEK,
      description: "Compare this week with previous week",
    },
    {
      label: "This Month vs Last Month",
      value: ComparingTypes.THIS_MONTH_VS_LAST_MONTH,
      description: "Compare this month with previous month",
    },
    {
      label: "This Year vs Last Year",
      value: ComparingTypes.THIS_YEAR_VS_LAST_YEAR,
      description: "Compare this year to date with last year",
    },
    {
      label: "Custom",
      value: ComparingTypes.CUSTOM,
      description: "Select custom comparison dates",
    },
  ];
  const { timezone } = useHostsStore();

  const hostTz = timezone?.split(" ")[0] ?? "";

  let nowLocal = DateTime.now();
  const restoLocal = DateTime.now().setZone(hostTz);

  if (nowLocal.day > restoLocal.day) {
    nowLocal = nowLocal.minus({ day: 1 });
  } else if (restoLocal.day > nowLocal.day) {
    nowLocal = nowLocal.plus({ day: 1 });
  }

  const nowInRestaurantTz = nowLocal;

  const handleComparisonTypeSelect = (type: ComparingTypes) => {
    onComparisonTypeChange(type);

    const today = new Date();

    switch (type) {
      case ComparingTypes.TODAY_VS_YESTERDAY:
        onStartDateChange(today);
        onEndDateChange(today);
        onCompareStartDateChange(subDays(today, 1));
        onCompareEndDateChange(subDays(today, 1));
        break;

      case ComparingTypes.THIS_WEEK_VS_LAST_WEEK:
        const thisWeekStart = startOfWeek(today);
        const thisWeekEnd = endOfWeek(today);
        const lastWeekStart = subDays(thisWeekStart, 7);
        const lastWeekEnd = subDays(thisWeekEnd, 7);

        onStartDateChange(thisWeekStart);
        onEndDateChange(thisWeekEnd);
        onCompareStartDateChange(lastWeekStart);
        onCompareEndDateChange(lastWeekEnd);
        break;

      case ComparingTypes.THIS_MONTH_VS_LAST_MONTH:
        const thisMonthStart = startOfMonth(today);
        const thisMonthEnd = endOfMonth(today);
        const lastMonthStart = startOfMonth(subDays(thisMonthStart, 1));
        const lastMonthEnd = endOfMonth(subDays(thisMonthStart, 1));

        onStartDateChange(thisMonthStart);
        onEndDateChange(thisMonthEnd);
        onCompareStartDateChange(lastMonthStart);
        onCompareEndDateChange(lastMonthEnd);
        break;

      case ComparingTypes.THIS_YEAR_VS_LAST_YEAR:
        const thisYearStart = startOfYear(today);
        const thisYearEnd = endOfYear(today);
        const lastYearStart = startOfYear(subDays(thisYearStart, 1));
        const lastYearEnd = endOfYear(subDays(thisYearStart, 1));

        onStartDateChange(thisYearStart);
        onEndDateChange(thisYearEnd);
        onCompareStartDateChange(lastYearStart);
        onCompareEndDateChange(lastYearEnd);
        break;

      case ComparingTypes.CUSTOM:
        // Don't change dates for custom selection
        break;
    }
  };
  // Update local state when props change
  useEffect(() => {
    setSelectedDateRange({
      from: startDate || undefined,
      to: endDate || undefined,
    });
  }, [startDate, endDate]);

  useEffect(() => {
    setSelectedCompareRange({
      from: compareStartDate || undefined,
      to: compareEndDate || undefined,
    });
  }, [compareStartDate, compareEndDate]);

  const validateDateRange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return true;
    if (!isValid(start) || !isValid(end)) {
      setError("Invalid date selection");
      return false;
    }
    if (isAfter(start, end)) {
      setError("Start date cannot be after end date");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDateSelection = (range: DateRange | undefined) => {
    setSelectedDateRange(range);
    if (range?.from && range?.to) {
      if (validateDateRange(range.from, range.to)) {
        onStartDateChange(range.from);
        onEndDateChange(range.to);

        // Check if the selected dates match any predefined range
        const today = new Date();
        const selectedStart = range.from;
        const selectedEnd = range.to;

        // Format dates to compare only year, month, day
        const formatForCompare = (date: Date) => format(date, "yyyy-MM-dd");

        const selectedStartStr = formatForCompare(selectedStart);
        const selectedEndStr = formatForCompare(selectedEnd);

        // Check against all predefined ranges
        if (
          selectedStartStr === selectedEndStr &&
          selectedStartStr === formatForCompare(today)
        ) {
          onRangeChange(MetricsDataRange.Today);
        } else if (
          selectedStartStr === selectedEndStr &&
          selectedStartStr === formatForCompare(subDays(today, 1))
        ) {
          onRangeChange(MetricsDataRange.Yesterday);
        } else if (
          selectedStartStr === formatForCompare(startOfWeek(today)) &&
          selectedEndStr === formatForCompare(endOfWeek(today))
        ) {
          onRangeChange(MetricsDataRange.ThisWeek);
        } else if (
          selectedStartStr ===
            formatForCompare(startOfWeek(subDays(today, 7))) &&
          selectedEndStr === formatForCompare(endOfWeek(subDays(today, 7)))
        ) {
          onRangeChange(MetricsDataRange.LastWeek);
        } else if (
          selectedStartStr === formatForCompare(startOfMonth(today)) &&
          selectedEndStr === formatForCompare(endOfMonth(today))
        ) {
          onRangeChange(MetricsDataRange.ThisMonth);
        } else if (
          selectedStartStr ===
            formatForCompare(startOfMonth(subDays(startOfMonth(today), 1))) &&
          selectedEndStr ===
            formatForCompare(endOfMonth(subDays(startOfMonth(today), 1)))
        ) {
          onRangeChange(MetricsDataRange.LastMonth);
        } else if (
          selectedStartStr === formatForCompare(startOfYear(today)) &&
          selectedEndStr === formatForCompare(endOfYear(today))
        ) {
          onRangeChange(MetricsDataRange.ThisYear);
        } else if (
          selectedStartStr ===
            formatForCompare(startOfYear(subDays(startOfYear(today), 1))) &&
          selectedEndStr ===
            formatForCompare(endOfYear(subDays(startOfYear(today), 1)))
        ) {
          onRangeChange(MetricsDataRange.LastYear);
        } else {
          onRangeChange(MetricsDataRange.Custom);
        }
      }
    } else if (!range) {
      onStartDateChange(null);
      onEndDateChange(null);
    }
  };
  const handleCompareSelection = (range: DateRange | undefined) => {
    setSelectedCompareRange(range);
    if (range?.from && range?.to) {
      if (validateDateRange(range.from, range.to)) {
        onCompareStartDateChange(range.from);
        onCompareEndDateChange(range.to);
      }
    } else {
      onCompareStartDateChange(null);
      onCompareEndDateChange(null);
    }
  };

  const handleRangeOptionSelect = (range: MetricsDataRange) => {
    onRangeChange(range);
    if (range !== MetricsDataRange.Custom) {
      let nowLocal = DateTime.now();
      const restoLocal = DateTime.now().setZone(hostTz);

      if (nowLocal.day > restoLocal.day) {
        nowLocal = nowLocal.minus({ day: 1 });
      } else if (restoLocal.day > nowLocal.day) {
        nowLocal = nowLocal.plus({ day: 1 });
      }

      const nowInRestaurantTz = nowLocal;
      const todayStart = nowInRestaurantTz.startOf("day");
      let start: Date, end: Date;

      switch (range) {
        case MetricsDataRange.Today:
          start = todayStart.toJSDate();
          end = todayStart.toJSDate();
          break;
        case MetricsDataRange.Yesterday:
          const yesterday = nowInRestaurantTz
            .minus({ days: 1 })
            .startOf("day")
            .toJSDate();
          start = yesterday;
          end = yesterday;
          break;
        case MetricsDataRange.ThisWeek:
          start = nowInRestaurantTz.startOf("week").toJSDate();
          end = todayStart.toJSDate(); // Changed to use todayStart instead of current time
          break;
        case MetricsDataRange.LastWeek:
          const lastWeekStart = nowInRestaurantTz
            .minus({ weeks: 1 })
            .startOf("week");
          const lastWeekEnd = lastWeekStart.endOf("week");
          start = lastWeekStart.toJSDate();
          end = lastWeekEnd.toJSDate();
          break;
        case MetricsDataRange.ThisMonth:
          start = nowInRestaurantTz.startOf("month").toJSDate();
          end = todayStart.toJSDate(); // Changed to use todayStart
          break;
        case MetricsDataRange.LastMonth:
          const lastMonthStart = nowInRestaurantTz
            .minus({ months: 1 })
            .startOf("month");
          const lastMonthEnd = lastMonthStart.endOf("month");
          start = lastMonthStart.toJSDate();
          end = lastMonthEnd.toJSDate();
          break;
        case MetricsDataRange.ThisYear:
          start = nowInRestaurantTz.startOf("year").toJSDate();
          end = todayStart.toJSDate(); // Changed to use todayStart
          break;
        case MetricsDataRange.LastYear:
          const lastYearStart = nowInRestaurantTz
            .minus({ years: 1 })
            .startOf("year");
          const lastYearEnd = lastYearStart.endOf("year");
          start = lastYearStart.toJSDate();
          end = lastYearEnd.toJSDate();
          break;
        default:
          return;
      }

      handleDateSelection({ from: start, to: end });
    }
  };

  const today = new Date();
  const disabledDays = { after: today };

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between space-x-2 items-center text-center bg-[#F3F7FB] py-2 px-4"
          >
            {startDate && endDate && (
              <span className="text-xs text-muted-foreground ">
                {formatDateRange(selectedRange)}
              </span>
            )}
            <CalendarIcon size={10} className="text-black" />
            <div className="flex flex-col  text-black">
              <span className="text-sm">
                {startDate && endDate
                  ? isSameDay(startDate, endDate)
                    ? format(startDate, "MMM dd, yyyy")
                    : `${format(startDate, "MMM dd, yyyy")} - ${format(
                        endDate,
                        "MMM dd, yyyy"
                      )}`
                  : "Select date range"}
              </span>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex h-[500px] w-[800px]">
            <div className="w-[220px] border-r border-border p-4">
              <ScrollArea className="h-full">
                <div>
                  <h4 className="text-md px-2 mb-3 text-black">Date Range</h4>
                  <div className="space-y-1">
                    {dateRangeOptions.map((option) => (
                      <p
                        key={option.value}
                        className={`w-full text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-gray-100 
              ${
                selectedRange === option.value
                  ? "bg-gray-100 text-primary"
                  : "text-gray-600"
              }`}
                        onClick={() => handleRangeOptionSelect(option.value)}
                      >
                        <span className="text-sm">{option.label}</span>
                      </p>
                    ))}

                    {isComparable && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h4 className="text-md px-2 mb-3 text-black">
                            Compare Dates
                          </h4>
                          <div className="space-y-1">
                            {comparisonOptions.map((option) => (
                              <p
                                key={option.value}
                                className={`w-full text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-gray-100
                      ${
                        selectedComparisonType === option.value
                          ? "bg-gray-100 text-primary"
                          : "text-gray-600"
                      }`}
                                onClick={() =>
                                  handleComparisonTypeSelect(option.value)
                                }
                              >
                                <span className="text-sm">{option.label}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>

            <div className="flex-1">
              <ScrollArea className="h-[500px]">
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Select Date Range
                    </h4>
                    <Calendar
                      mode="range"
                      selected={selectedDateRange}
                      onSelect={handleDateSelection}
                      className="rounded-xl border p-3"
                      numberOfMonths={2}
                      disabled={disabledDays}
                      defaultMonth={startDate || undefined}
                      showOutsideDays={false}
                    />
                  </div>

                  {isComparable && startDate && endDate && (
                    <div className="pt-6 border-t">
                      <h4 className="text-sm font-medium mb-3">Compare With</h4>
                      <Calendar
                        mode="range"
                        selected={selectedCompareRange}
                        onSelect={handleCompareSelection}
                        className="rounded-xl border p-3"
                        numberOfMonths={2}
                        disabled={disabledDays}
                        defaultMonth={compareStartDate || undefined}
                        showOutsideDays={false}
                      />
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeSelector;
