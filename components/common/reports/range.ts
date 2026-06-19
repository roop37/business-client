import type { ReportDateInput } from "./types";

export type ReportRangePreset = "today" | "yesterday" | "last7" | "last30";

export const RANGE_PRESETS: { value: ReportRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
];

// IST = UTC+5:30. Shift "now" into IST so the calendar day matches how
// main-server buckets orders (timezone: "Asia/Kolkata").
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

const istToday = (): Date => {
  const shifted = new Date(Date.now() + IST_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return shifted; // a UTC-mirrors-IST midnight; read with getUTC*
};

const addDays = (d: Date, n: number): Date =>
  new Date(d.getTime() + n * 24 * 60 * 60 * 1000);

const toInput = (d: Date): ReportDateInput => ({
  day: d.getUTCDate(),
  month: d.getUTCMonth() + 1,
  year: d.getUTCFullYear(),
});

export const getPresetRange = (
  preset: ReportRangePreset
): { startDate: ReportDateInput; endDate: ReportDateInput } => {
  const today = istToday();
  switch (preset) {
    case "today":
      return { startDate: toInput(today), endDate: toInput(today) };
    case "yesterday": {
      const y = addDays(today, -1);
      return { startDate: toInput(y), endDate: toInput(y) };
    }
    case "last7":
      return { startDate: toInput(addDays(today, -6)), endDate: toInput(today) };
    case "last30":
    default:
      return { startDate: toInput(addDays(today, -29)), endDate: toInput(today) };
  }
};
