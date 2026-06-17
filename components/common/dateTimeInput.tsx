"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDaysIcon, ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Calendar + time-of-day picker — the same control the Event Journey uses
 * (extracted here so the coupon editor and others share one consistent
 * date-time experience instead of the native `datetime-local`). The value is
 * a `YYYY-MM-DDTHH:mm` string, matching `datetime-local`.
 */
const timePickerOptions = Array.from({ length: 24 * 12 }, (_, index) => {
  const minutes = index * 5;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}`;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return {
    value,
    label: `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`,
  };
});

export const DateTimeInput = ({
  label,
  value,
  onChange,
  disabled = false,
  minDate,
  maxDate,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}) => {
  const [date = "", time = ""] = value ? value.split("T") : ["", ""];
  const [pendingTime, setPendingTime] = useState(time);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  useEffect(() => {
    if (time) setPendingTime(time);
    else if (!value) setPendingTime("");
  }, [time, value]);

  const update = (nextDate: string, nextTime: string) => {
    const resolvedDate = nextDate || date;
    const resolvedTime = nextTime || time || pendingTime || "00:00";
    if (!resolvedDate) {
      setPendingTime(resolvedTime);
      onChange("");
      return;
    }
    onChange(`${resolvedDate}T${resolvedTime}`);
  };

  const dateAsDate = date ? new Date(`${date}T00:00:00`) : undefined;
  const formatDate = (d?: Date) =>
    d
      ? new Intl.DateTimeFormat("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(d)
      : "Pick a date";
  const selectedTimeLabel =
    timePickerOptions.find((o) => o.value === (time || pendingTime))?.label ||
    time ||
    pendingTime ||
    "Pick a time";

  return (
    <label className="block min-w-0 text-sm font-medium">
      {label}
      <div className="mt-1 rounded-lg border border-[var(--owner-border)] bg-white p-2 shadow-sm focus-within:border-[var(--owner-blue-500)]">
        <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className="flex h-10 items-center gap-2 rounded-md bg-[var(--owner-bg)] px-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CalendarDaysIcon
                  size={16}
                  className="shrink-0 text-[var(--owner-blue-500)]"
                />
                <span
                  className={`min-w-0 flex-1 truncate ${
                    !date ? "text-[var(--owner-fg-4)]" : ""
                  }`}
                >
                  {date ? formatDate(dateAsDate) : "Pick a date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto bg-white p-0 shadow-lg">
              <Calendar
                mode="single"
                selected={dateAsDate}
                disabled={(d) => {
                  if (minDate) {
                    const min = new Date(minDate);
                    min.setHours(0, 0, 0, 0);
                    if (d < min) return true;
                  }
                  if (maxDate) {
                    const max = new Date(maxDate);
                    max.setHours(23, 59, 59, 999);
                    if (d > max) return true;
                  }
                  return false;
                }}
                onSelect={(d) => {
                  if (!d) return;
                  const iso = `${d.getFullYear()}-${String(
                    d.getMonth() + 1
                  ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  update(iso, time);
                  setPickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className="flex h-10 items-center gap-2 rounded-md bg-[var(--owner-bg)] px-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ClockIcon
                  size={15}
                  className="shrink-0 text-[var(--owner-blue-500)]"
                />
                <span
                  className={`min-w-0 flex-1 truncate ${
                    !(time || pendingTime) ? "text-[var(--owner-fg-4)]" : ""
                  }`}
                >
                  {selectedTimeLabel}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="max-h-72 w-56 overflow-y-auto bg-white p-2 shadow-lg"
            >
              <div className="grid grid-cols-2 gap-1">
                {timePickerOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      update(date, option.value);
                      setTimePickerOpen(false);
                    }}
                    className={`rounded-md px-2 py-1.5 text-left text-xs transition ${
                      option.value === (time || pendingTime)
                        ? "bg-[var(--owner-blue-500)] font-semibold text-white"
                        : "text-[var(--owner-fg-2)] hover:bg-[var(--owner-bg-subtle)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </label>
  );
};

export default DateTimeInput;
