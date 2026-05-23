"use client";

import { Label } from "@/components/ui/label";
import { DateTime } from "luxon";
import * as React from "react";
import { TimePeriodSelect } from "./period-select";
import { TimePickerInput } from "./time-picker-input";
import { Period } from "./time-picker-utils";

interface TimePickerDemoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function TimePicker({ date, setDate }: TimePickerDemoProps) {
  const [period, setPeriod] = React.useState<Period>("PM");

  const hourRef = React.useRef<HTMLInputElement>(null);
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const periodRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (date) {
      const amPm = DateTime.fromJSDate(date).toFormat("a");
      setPeriod(amPm as Period);
    }
  }, [date]);

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center w-full">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <TimePickerInput
          picker="12hours"
          period={period}
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center w-full">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <TimePickerInput
          picker="minutes"
          id="minutes12"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center w-full">
        <Label htmlFor="period" className="text-xs">
          Period
        </Label>
        <TimePeriodSelect
          period={period}
          setPeriod={setPeriod}
          date={date}
          setDate={setDate}
          ref={periodRef}
          // onLeftFocus={() => secondRef.current?.focus()}
        />
      </div>
    </div>
  );
}
