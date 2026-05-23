import { AvailabilityInput, Day } from "@/generated/graphql";
import { format, parse } from "date-fns";
import { timeSlotList } from "./data";

export interface Availability {
  day: Day;
  hours: {
    start: { label: string; value: string };
    end: { label: string; value: string };
  }[];
  active: boolean;
}

export interface AvailabilityComponentProps {
  availability: Availability[];
  setAvailability: React.Dispatch<React.SetStateAction<Availability[]>>;
}

export const daysOfWeek = [
  { value: "Sunday", label: "Sunday" },
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
];

export type TimeOption = {
  label: string;
  value: string;
};
export type FormattedAvailability = {
  day: string;
  hours: {
    start: string;
    end: string;
  }[];
  active: boolean;
};

// export const timeOptions: TimeOption[] = Array.from(
//   { length: 24 * 2 },
//   (_, i) => {
//     const time = moment()
//       .startOf("day")
//       .add(30 * i, "minutes");
//     return {
//       label: time.format("hh:mm A"),
//       value: time.toISOString(),
//     };
//   }
// );
// export const timeOptions: TimeOption[] = Array.from(
//   { length: 24 * 2 },
//   (_, i) => {
//     const time = format(new Date().setHours(0, i * 15, 0, 0), "HH:mm");
//     return {
//       label: format(new Date().setHours(0, i * 15, 0, 0), "hh:mm a"),
//       value: time, // Use HHmm format here
//     };
//   }
// );

// export const reverseFormatAvailability = (
//   formattedAvailability: FormattedAvailability[]
// ): Availability[] => {
//   const timeMap = new Map<string, string>(
//     timeOptions.map((option) => [
//       moment(option.value).format("HH:mm"),
//       option.label,
//     ])
//   );

//   return formattedAvailability.map((item) => {
//     const today = moment().startOf("day");

//     return {
//       day: item.day as Day,
//       hours: item.hours.map((hour) => {
//         const startTime = moment(hour.start);
//         const endTime = moment(hour.end);

//         // Combine today's date with the time from the input
//         const startOfDay = today.clone().set({
//           hour: startTime.hour(),
//           minute: startTime.minute(),
//           second: startTime.second(),
//           millisecond: startTime.millisecond(),
//         });
//         const endOfDay = today.clone().set({
//           hour: endTime.hour(),
//           minute: endTime.minute(),
//           second: endTime.second(),
//           millisecond: endTime.millisecond(),
//         });

//         return {
//           start: {
//             label: timeMap.get(startTime.format("HH:mm")) || "",
//             value: startOfDay.toISOString(),
//           },
//           end: {
//             label: timeMap.get(endTime.format("HH:mm")) || "",
//             value: endOfDay.toISOString(),
//           },
//         };
//       }),
//       active: item.active,
//     };
//   });
// };

export const reverseFormatAvailability = (
  formattedAvailability: FormattedAvailability[]
): Availability[] => {
  const timeMap = new Map<string, string>(
    timeSlotList.map((option) => [
      format(parse(option.value, "HH:mm", new Date()), "HH:mm"),
      option.label,
    ])
  );

  return formattedAvailability.map((item) => ({
    day: item.day as Day,
    hours: item.hours.map((hour) => ({
      start: {
        label: timeMap.get(hour.start) || "",
        value: hour.start,
      },
      end: {
        label: timeMap.get(hour.end) || "",
        value: hour.end,
      },
    })),
    active: item.active,
  }));
};
export interface Availability {
  day: Day;
  hours: {
    start: { label: string; value: string };
    end: { label: string; value: string };
  }[];
  active: boolean;
}

export const formatAvailability = (
  availability: Availability[]
): AvailabilityInput[] => {
  const dayMap: { [key: string]: Day } = {
    Sunday: Day.Sunday,
    Monday: Day.Monday,
    Tuesday: Day.Tuesday,
    Wednesday: Day.Wednesday,
    Thursday: Day.Thursday,
    Friday: Day.Friday,
    Saturday: Day.Saturday,
  };

  return availability.map((item) => ({
    day: dayMap[item.day],
    hours: item.hours.map((hour) => ({
      // start: new Date(hour.start.value).toISOString(),
      // end: new Date(hour.end.value).toISOString(),
      start: hour.start.value,
      end: hour.end.value,
    })),
    active: item.active,
  }));
};
