import { ComparingTypes } from "@/components/ui/customReportDateSelector";
import { CompareDataRange } from "@/components/ui/dateRange";
import { MetricsDataRange } from "@/generated/graphql";
import { startOfWeek } from "date-fns";
import { DateTime } from "luxon";
import { create } from "zustand";

export type DashboardMetricState = {
  selectedMenu: "Overview" | "Website Analytics" | "Menu" | "Marketing";
  setSelectedMenu: (
    menu: "Overview" | "Website Analytics" | "Menu" | "Marketing"
  ) => void;

  dataRange: MetricsDataRange;
  setDataRange: (range: MetricsDataRange) => void;

  compareDataRange: CompareDataRange | null;
  setCompareDataRange: (range: CompareDataRange | null) => void;

  startDate: Date;
  setStartDate: (date: Date) => void;

  endDate: Date;
  setEndDate: (date: Date) => void;

  // New comparison-related state
  startCompareDate: Date | null;
  setStartCompareDate: (date: Date | null) => void;

  endCompareDate: Date | null;
  setEndCompareDate: (date: Date | null) => void;

  selectedComparisonType: ComparingTypes;
  setSelectedComparisonType: (type: ComparingTypes) => void;
};

// FIXME:NEED TO INITIALIZE RESTAURANTTIMEZONE HERE
// const initializeDates = (hostTz: string = "America/New_York") => {
//   const nowInRestaurantTz = DateTime.now().setZone(hostTz);
//   const todayStart = nowInRestaurantTz.startOf("day");

//   return {
//     startDate: nowInRestaurantTz.startOf("week").toJSDate(),
//     endDate: todayStart.toJSDate(),
//   };
// };

// const { startDate, endDate } = initializeDates();

export const useDashboardMetricStore = create<DashboardMetricState>((set) => ({
  selectedMenu: "Overview",
  setSelectedMenu: (menu) => set({ selectedMenu: menu }),

  dataRange: MetricsDataRange.ThisWeek,
  setDataRange: (range) => set({ dataRange: range }),

  compareDataRange: null,
  setCompareDataRange: (range) => set({ compareDataRange: range }),

  startDate: startOfWeek(new Date()),
  setStartDate: (date) => set({ startDate: date }),

  endDate: new Date(),
  setEndDate: (date) => set({ endDate: date }),

  // New comparison-related state initialization
  startCompareDate: null,
  setStartCompareDate: (date) => set({ startCompareDate: date }),

  endCompareDate: null,
  setEndCompareDate: (date) => set({ endCompareDate: date }),

  selectedComparisonType: ComparingTypes.CUSTOM,
  setSelectedComparisonType: (type) => set({ selectedComparisonType: type }),
}));
