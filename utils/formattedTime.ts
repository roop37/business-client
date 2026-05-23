import { DateTime } from "luxon";

type Avl = {
  day: string;
  active: boolean;
  hours: { start: string; end: string }[];
};

export const isAsapAvailable = (hostTz: string, avl: Avl[]): boolean => {
  const customerNow = new Date();
  const hostNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
    zone: hostTz,
  });

  const dayName = hostNowLuxon.weekdayLong ?? "";

  // Find the availability for the current day
  const availability = avl.find(
    (day) => day.day.toLowerCase() === dayName.toLowerCase()
  );

  if (!availability || !availability.active) {
    return false; // Restaurant is closed today
  }

  // Convert current time to minutes since midnight
  const nowMinutes = hostNowLuxon.hour * 60 + hostNowLuxon.minute;

  // Check if within any available slot
  for (const slot of availability.hours) {
    const [startHours, startMinutes] = slot.start.split(":").map(Number);
    const [endHours, endMinutes] = slot.end.split(":").map(Number);

    const startTimeMinutes = startHours * 60 + startMinutes;
    let endTimeMinutes = endHours * 60 + endMinutes;

    // Handle cross-midnight
    if (endTimeMinutes < startTimeMinutes) {
      endTimeMinutes += 24 * 60;
    }

    if (nowMinutes >= startTimeMinutes && nowMinutes <= endTimeMinutes) {
      return true; // Current time is within this slot
    }
  }

  return false; // No matching slot found
};

export const scheduleDaysList = (
  hostTz: string,
  avl: Avl[]
): { value: Date; label: string }[] => {
  const daysCount = 8;

  const customerNow = new Date();
  const hostNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
    zone: hostTz,
  });

  const result: { value: Date; label: string }[] = [];
  let dayOffset = 0;

  while (result.length < daysCount) {
    const restaurantDate = hostNowLuxon.plus({ days: dayOffset });

    const dayName = restaurantDate.weekdayLong ?? "";

    // Find availability for the day
    const availability = avl.find(
      (day) => day.day.toLowerCase() === dayName.toLowerCase()
    );

    if (availability && availability.active) {
      const label =
        dayOffset === 0
          ? `Today ${restaurantDate.toFormat("LLL dd")}`
          : dayOffset === 1
          ? `Tomorrow ${restaurantDate.toFormat("LLL dd")}`
          : `${restaurantDate.toFormat("EEEE LLL dd")}`;

      result.push({ value: restaurantDate.toJSDate(), label });
    }

    dayOffset++;
  }

  return result;
};

export const getTimeSlots = (
  hostTz: string,
  avl: Avl[],
  selectedDayLabel: string,
  isAsap: boolean,
  prepTimeMinutes: number,
  startMins: number, // Time after start time to begin accepting orders
  endMins: number // Time before end time to stop accepting orders
): string[] => {
  const customerNow = new Date();
  const hostNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
    zone: hostTz,
  });

  // Parse selected day label
  const [dayLabel, , dayDate] = selectedDayLabel.split(" ");
  const selectedDate = hostNowLuxon.set({ day: Number(dayDate) });

  // Get the day name
  const dayName = selectedDate.weekdayLong ?? "";

  // Find availability for the selected day
  const availability = avl.find(
    (day) => day.day.toLowerCase() === dayName.toLowerCase()
  );

  if (!availability || !availability.active) {
    return []; // Return empty list if the day is not active
  }

  const timeSlots: string[] = [];
  const interval = 15; // Slot interval in minutes

  for (const slot of availability.hours) {
    const [startHours, startMinutes] = slot.start.split(":").map(Number);
    const [endHours, endMinutes] = slot.end.split(":").map(Number);

    let slotStartTime = selectedDate.set({
      hour: startHours,
      minute: startMinutes + startMins + prepTimeMinutes,
      second: 0,
      millisecond: 0,
    });

    let slotEndTime = selectedDate.set({
      hour: endHours,
      minute: endMinutes - endMins,
      second: 0,
      millisecond: 0,
    });

    // Adjust start time to the upper 15-minute interval
    slotStartTime = slotStartTime.plus({
      minute: 15 - (slotStartTime.minute % 15),
    });

    // Adjust end time to the lower 15-minute interval
    slotEndTime = slotEndTime.plus({
      minute: -(slotEndTime.minute % 15),
    });

    // Adjust for ASAP logic
    if (isAsap && dayLabel === "Today") {
      // Calculate the first available slot
      const prepTime = hostNowLuxon.plus({ minute: prepTimeMinutes });
      const nearest15MinSlot = prepTime.plus({
        minute: 15 - (prepTime.minute % 15),
      });

      if (nearest15MinSlot > slotStartTime) {
        slotStartTime = nearest15MinSlot; // Start from the nearest ASAP slot
      }
    }

    let currentTime = slotStartTime;

    while (currentTime <= slotEndTime) {
      const slotString = currentTime.toFormat("hh:mm a ZZZZ");

      timeSlots.push(slotString);
      currentTime = currentTime.plus({ minute: interval }); // Increment by interval
    }
  }

  return timeSlots;
};

export const convertNowToUtc = (
  hostTz: string, // Restaurant timezone,
  prepTimeMinutes: number
): string => {
  const customerNow = new Date();
  const hostNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
    zone: hostTz,
  });

  return hostNowLuxon.plus({ minute: prepTimeMinutes }).toISO() ?? "";
};

export const convertToUtcForTimeSlots = (
  selectedDayLabel: string, // e.g., "Mon Nov 18"
  selectedTimeSlot: string, // e.g., "07:00 AM GMT-5"
  hostTz: string // Restaurant timezone
): string => {
  const customerNow = new Date();
  const hostNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
    zone: hostTz,
  });

  const [, , dayDate] = selectedDayLabel.split(" ");
  const [hourMins, amPm] = selectedTimeSlot.split(" ");

  const [h, m] = hourMins.split(":");
  let hour = Number(h);
  const minute = Number(m);

  if (amPm === "PM") {
    if (hour <= 11) {
      hour += 12;
    }
  } else if (amPm === "AM") {
    if (hour === 12) {
      hour = 0;
    }
  }

  const selectedDate = hostNowLuxon.set({
    day: Number(dayDate),
    hour: hour,
    minute: minute,
    second: 0,
    millisecond: 0,
  });

  return selectedDate.toISO() ?? "";
};

export const convertToRestoTimezone = (hostTz: string, date: Date) => {
  if (!date) {
    return "";
  }

  hostTz = hostTz?.split(" ")[0] ?? "";
  date = new Date(date);
  // Luxon returns the literal string "Invalid DateTime" for unparseable
  // inputs; collapse that to N/A so drafted/unscheduled rows don't
  // display the noisy debug text in the table.
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }
  const formatted = DateTime.fromJSDate(date, { zone: hostTz }).toFormat(
    "dd MMM hh:mm a ZZZZ"
  );
  if (!formatted || formatted === "Invalid DateTime") {
    return "N/A";
  }
  return formatted;
};
