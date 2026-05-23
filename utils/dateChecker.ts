interface TimeInterval {
  start: string;
  end: string;
}

interface DaySchedule {
  day: string;
  hours: TimeInterval[];
  active: boolean;
}

export function checkOverlap(hours: TimeInterval[]): boolean {
  hours.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  for (let i = 1; i < hours.length; i++) {
    const currentStart = new Date(hours[i].start).getTime();
    const previousEnd = new Date(hours[i - 1].end).getTime();

    if (currentStart <= previousEnd) {
      return true; // Overlap found
    }
  }

  return false;
}
