import { Availability } from "@/components/common/timingAvailibility/interface";
import { Day } from "@/generated/graphql";

export const initAvailability: Availability[] = [
  { day: Day.Sunday, hours: [], active: false },
  { day: Day.Monday, hours: [], active: false },
  { day: Day.Tuesday, hours: [], active: false },
  { day: Day.Wednesday, hours: [], active: false },
  { day: Day.Thursday, hours: [], active: false },
  { day: Day.Friday, hours: [], active: false },
  { day: Day.Saturday, hours: [], active: false },
];

export const monthsArray = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
