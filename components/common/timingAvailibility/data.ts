export const timeSlotList = Array.from({ length: 24 * 60 }, (_, i) => {
  const hours24 = Math.floor(i / 60);
  const minutes = i % 60;

  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const hh24 = String(hours24).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const hh12 = String(hours12).padStart(2, "0");

  return {
    label: `${hh12}:${mm} ${period}`,
    value: `${hh24}:${mm}`,
  };
});
