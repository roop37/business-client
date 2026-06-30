import { create } from "zustand";

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last-3-days"
  | "last-7-days"
  | "last-week"
  | "last-month";

export type DateRangeOption = {
  value: DateRangePreset;
  label: string;
};

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last-3-days", label: "Last 3 days" },
  { value: "last-7-days", label: "Last 7 days" },
  { value: "last-week", label: "Last Week" },
  { value: "last-month", label: "Last Month" },
];

const startOfDay = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const computeRange = (
  preset: DateRangePreset,
  now: Date = new Date(),
): { from: Date; to: Date } => {
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const y = addDays(now, -1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case "last-3-days":
      return { from: startOfDay(addDays(now, -2)), to: endOfDay(now) };
    case "last-7-days":
      return { from: startOfDay(addDays(now, -6)), to: endOfDay(now) };
    case "last-week": {
      // ISO week: previous Monday → previous Sunday.
      const dow = now.getDay(); // 0=Sun..6=Sat
      const daysSinceMonday = dow === 0 ? 6 : dow - 1;
      const thisMonday = addDays(now, -daysSinceMonday);
      const lastMonday = addDays(thisMonday, -7);
      const lastSunday = addDays(lastMonday, 6);
      return { from: startOfDay(lastMonday), to: endOfDay(lastSunday) };
    }
    case "last-month": {
      const firstOfThis = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstOfPrev = new Date(
        firstOfThis.getFullYear(),
        firstOfThis.getMonth() - 1,
        1,
      );
      const lastOfPrev = new Date(
        firstOfThis.getFullYear(),
        firstOfThis.getMonth(),
        0,
      );
      return { from: startOfDay(firstOfPrev), to: endOfDay(lastOfPrev) };
    }
  }
};

export type DateRangeStore = {
  preset: DateRangePreset;
  from: Date;
  to: Date;
  setPreset: (preset: DateRangePreset) => void;
};

const DEFAULT_PRESET: DateRangePreset = "last-7-days";
const initialRange = computeRange(DEFAULT_PRESET);

const useDateRangeStore = create<DateRangeStore>((set) => ({
  preset: DEFAULT_PRESET,
  from: initialRange.from,
  to: initialRange.to,
  setPreset: (preset) => {
    const { from, to } = computeRange(preset);
    set({ preset, from, to });
  },
}));

export const labelForPreset = (preset: DateRangePreset): string =>
  DATE_RANGE_OPTIONS.find((o) => o.value === preset)?.label ?? "Date range";

export default useDateRangeStore;
