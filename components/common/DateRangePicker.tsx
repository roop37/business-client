"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useDateRangeStore, {
  DATE_RANGE_OPTIONS,
  DateRangePreset,
  labelForPreset,
} from "@/store/dateRange";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { useState } from "react";

/**
 * Topbar date-range pill + popover. Selection lives in `useDateRangeStore`
 * so any surface that wants to filter against the selection just reads
 * `from` / `to` from the store.
 */
const DateRangePicker = () => {
  const { preset, setPreset } = useDateRangeStore();
  const [open, setOpen] = useState(false);

  const handleSelect = (next: DateRangePreset) => {
    setPreset(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="hidden h-9 items-center gap-2 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] font-medium text-owner-fg-2 shadow-owner-sm transition hover:bg-owner-bg-subtle md:inline-flex"
        >
          <CalendarDays size={15} className="text-owner-fg-4" />
          {labelForPreset(preset)}
          <ChevronDown size={14} className="text-owner-fg-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[200px] p-1.5"
      >
        <ul className="flex flex-col">
          {DATE_RANGE_OPTIONS.map((option) => {
            const active = option.value === preset;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between rounded-owner-sm px-2.5 py-1.5 text-left text-[13px] transition ${
                    active
                      ? "bg-owner-blue-050 font-semibold text-owner-blue-600"
                      : "text-owner-fg-1 hover:bg-owner-bg-subtle"
                  }`}
                >
                  <span>{option.label}</span>
                  {active ? (
                    <Check size={14} className="text-owner-blue-600" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
