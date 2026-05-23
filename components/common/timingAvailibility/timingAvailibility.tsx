import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { isAfter, isBefore, parse } from "date-fns";
import React, { useEffect, useState } from "react";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import Select from "react-select";
import CustomSwitch from "../customSwitch/customSwitch";
import { timeSlotList } from "./data";
import {
  Availability,
  AvailabilityComponentProps,
  daysOfWeek,
} from "./interface";

// const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
//   const time = moment()
//     .startOf("day")
//     .add(30 * i, "minutes");
//   return {
//     label: time.format("hh:mm A"),
//     value: time.toISOString(),
//   };
// });

// const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
//   const hour = Math.floor(i / 2);
//   const minute = (i % 2) * 15;
//   const timeString = format(new Date(0, 0, 0, hour, minute), "HH:mm"); // Format as HH:mm

//   return {
//     label: format(new Date(0, 0, 0, hour, minute), "hh:mm a"), // Display-friendly format
//     value: timeString, // Use HH:mm format
//   };
// });

const AvailabilityComponent: React.FC<AvailabilityComponentProps> = ({
  availability,
  setAvailability,
}) => {
  const [validationErrors, setValidationErrors] = useState<string | null>(null);
  const [copiedDayIndex, setCopiedDayIndex] = useState<number | null>(null);

  // const timesList = useCallback((): { label: string; value: string }[] => {
  //   const timeSlots: { label: string; value: string }[] = [];

  //   // Start at 12:00 AM
  //   let currentTime = new Date();
  //   currentTime.setHours(0, 0, 0, 0); // Set to 12:00 AM

  //   // End at 11:59 PM
  //   const endTime = new Date();
  //   endTime.setHours(23, 59, 0, 0); // Set to 11:59 PM

  //   while (currentTime <= endTime) {
  //     const timeString = format(currentTime, "hh:mm a");
  //     timeSlots.push({
  //       label: timeString,
  //       value: format(currentTime, "HH:mm"),
  //     });

  //     // Add 15 minutes
  //     currentTime = addMinutes(currentTime, 15);
  //   }

  //   return timeSlots;
  // }, []);

  // useEffect(() => {
  //   const options = timesList();
  //   setTimeOptions(options);
  // }, [timesList]);

  useEffect(() => {
    const firstFilledDayIndex = availability?.findIndex(
      (day) => day.active && day.hours.length > 0
    );
    if (firstFilledDayIndex >= 0 && copiedDayIndex === null) {
      setCopiedDayIndex(firstFilledDayIndex);
    }
  }, [availability, copiedDayIndex]);

  const defaultStartTime = { label: "09:00 AM", value: "09:00" };
  const defaultEndTime = { label: "10:00 PM", value: "22:00" };

  // FUNCTIONS WITH VALIDATION
  // const handleAddHours = (index: number) => {
  //   const newHours = [...availability];
  //   const isFirstSlot = newHours[index].hours.length === 0;

  //   newHours[index].hours.push({
  //     start: isFirstSlot ? defaultStartTime : { label: "", value: "" },
  //     end: isFirstSlot ? defaultEndTime : { label: "", value: "" },
  //   });

  //   const { success, error, invalidFields } = validateAvailability(newHours);
  //   if (!success) {
  //     setToastData({
  //       message: extractErrorMessage(error!),
  //       type: "error",
  //     });

  //     invalidFields.forEach(({ dayIndex, hourIndex, field }) => {
  //       newHours[dayIndex].hours[hourIndex][field] =
  //         field === "start" ? defaultStartTime : defaultEndTime;
  //     });
  //     setAvailability(newHours);
  //     return;
  //   }

  //   setAvailability(newHours);
  //   setValidationErrors(null);
  // };

  const handleAddHours = (index: number) => {
    const newHours = [...availability];
    const isFirstSlot = newHours[index].hours.length === 0;

    newHours[index].hours.push({
      start: isFirstSlot ? defaultStartTime : { label: "", value: "" },
      end: isFirstSlot ? defaultEndTime : { label: "", value: "" },
    });

    const { success, error, invalidFields } = validateAvailability(newHours);
    if (!success) {
      setToastData({
        message: extractErrorMessage(error!),
        type: "error",
      });

      invalidFields.forEach(({ dayIndex, hourIndex, field }) => {
        newHours[dayIndex].hours[hourIndex][field] =
          field === "start" ? defaultStartTime : defaultEndTime;
      });
      setAvailability(newHours);
      return;
    }

    setAvailability(newHours);
    setValidationErrors(null);
  };

  // const handleRemoveHours = (dayIndex: number, hourIndex: number) => {
  //   const newHours = [...availability];
  //   newHours[dayIndex].hours.splice(hourIndex, 1);

  //   const { success, error, invalidFields } = validateAvailability(newHours);
  //   if (!success) {
  //     setToastData({
  //       message: extractErrorMessage(error!),
  //       type: "error",
  //     });

  //     invalidFields.forEach(({ dayIndex, hourIndex, field }) => {
  //       newHours[dayIndex].hours[hourIndex][field] =
  //         field === "start" ? defaultStartTime : defaultEndTime;
  //     });
  //     setAvailability(newHours);
  //     return;
  //   }

  //   setAvailability(newHours);
  // };

  const handleRemoveHours = (dayIndex: number, hourIndex: number) => {
    const newHours = [...availability];
    newHours[dayIndex].hours.splice(hourIndex, 1);

    const { success, error, invalidFields } = validateAvailability(newHours);
    if (!success) {
      setToastData({
        message: extractErrorMessage(error!),
        type: "error",
      });

      invalidFields.forEach(({ dayIndex, hourIndex, field }) => {
        newHours[dayIndex].hours[hourIndex][field] =
          field === "start" ? defaultStartTime : defaultEndTime;
      });
      setAvailability(newHours);
      return;
    }

    setAvailability(newHours);
  };

  // const handleCopyHours = (dayIndex: number) => {
  //   const newAvailability = [...availability];
  //   const hoursToCopy = newAvailability[dayIndex].hours.map((hour) => ({
  //     start: { ...hour.start },
  //     end: { ...hour.end },
  //   }));

  //   newAvailability.forEach((day) => {
  //     day.active = true;
  //     day.hours = hoursToCopy.map((hour) => ({
  //       start: { ...hour.start },
  //       end: { ...hour.end },
  //     }));
  //   });

  //   const { success, error, invalidFields } =
  //     validateAvailability(newAvailability);
  //   if (!success) {
  //     setToastData({
  //       message: extractErrorMessage(error!),
  //       type: "error",
  //     });

  //     // Reset invalid dropdowns
  //     invalidFields.forEach(({ dayIndex, hourIndex, field }) => {
  //       newAvailability[dayIndex].hours[hourIndex][field] =
  //         field === "start" ? defaultStartTime : defaultEndTime;
  //     });
  //     setAvailability(newAvailability);
  //     return;
  //   }

  //   setAvailability(newAvailability);
  //   setCopiedDayIndex(null);
  // };

  // const validateAvailability = (data: Availability[]) => {
  //   let error: string | null = null;
  //   const invalidFields: {
  //     dayIndex: number;
  //     hourIndex: number;
  //     field: "start" | "end";
  //   }[] = [];

  //   data?.forEach((day, dayIndex) => {
  //     if (day.active) {
  //       day.hours.forEach((hour, hourIndex) => {
  //         if (moment(hour.start.value).isAfter(moment(hour.end.value))) {
  //           error = `Start time cannot be after end time on ${
  //             daysOfWeek.find((d) => d.value === day.day)?.label
  //           }`;
  //           invalidFields.push({ dayIndex, hourIndex, field: "start" });
  //         }
  //         for (let i = 0; i < day.hours.length; i++) {
  //           if (i !== hourIndex) {
  //             if (
  //               moment(hour.start.value).isBefore(
  //                 moment(day.hours[i].end.value)
  //               ) &&
  //               moment(hour.end.value).isAfter(moment(day.hours[i].start.value))
  //             ) {
  //               error = `Overlapping hours on ${
  //                 daysOfWeek.find((d) => d.value === day.day)?.label
  //               }`;
  //               invalidFields.push({ dayIndex, hourIndex, field: "start" });
  //             }
  //           }
  //         }
  //       });
  //     }
  //   });

  //   return { success: error === null, error, invalidFields };
  // };

  const handleCopyHours = (dayIndex: number) => {
    const newAvailability = [...availability];
    const hoursToCopy = newAvailability[dayIndex].hours.map((hour) => ({
      start: { ...hour.start },
      end: { ...hour.end },
    }));

    newAvailability.forEach((day) => {
      day.active = true;
      day.hours = hoursToCopy.map((hour) => ({
        start: { ...hour.start },
        end: { ...hour.end },
      }));
    });

    const { success, error, invalidFields } =
      validateAvailability(newAvailability);
    if (!success) {
      setToastData({
        message: extractErrorMessage(error!),
        type: "error",
      });

      // Reset invalid dropdowns
      invalidFields.forEach(({ dayIndex, hourIndex, field }) => {
        newAvailability[dayIndex].hours[hourIndex][field] =
          field === "start" ? defaultStartTime : defaultEndTime;
      });
      setAvailability(newAvailability);
      return;
    }

    setAvailability(newAvailability);
    setCopiedDayIndex(null);
  };

  const validateAvailability = (data: Availability[]) => {
    let error: string | null = null;
    const invalidFields: {
      dayIndex: number;
      hourIndex: number;
      field: "start" | "end";
    }[] = [];
    const latestTime = timeSlotList[timeSlotList.length - 1]?.value;

    data?.forEach((day, dayIndex) => {
      if (day.active) {
        day.hours.forEach((hour, hourIndex) => {
          const startTime = parse(hour.start.value, "HH:mm", new Date());
          const endTime = hour?.end?.value
            ? parse(hour.end.value, "HH:mm", new Date())
            : parse(latestTime, "HH:mm", new Date());
          if (isAfter(startTime, endTime)) {
            error = `Start time cannot be after end time for ${
              daysOfWeek.find((d) => d.value === day.day)?.label
            }`;
            invalidFields.push({ dayIndex, hourIndex, field: "start" });
          }

          for (let i = 0; i < day.hours.length; i++) {
            if (i !== hourIndex) {
              const compareStart = parse(
                day.hours[i].start.value,
                "HH:mm",
                new Date()
              );
              const compareEnd = parse(
                day.hours[i].end.value,
                "HH:mm",
                new Date()
              );

              if (
                isBefore(startTime, compareEnd) &&
                isAfter(endTime, compareStart)
              ) {
                error = `Overlapping hours on ${
                  daysOfWeek.find((d) => d.value === day.day)?.label
                }`;
                invalidFields.push({ dayIndex, hourIndex, field: "start" });
              }
            }
          }
        });
      }
    });

    return { success: error === null, error, invalidFields };
  };

  const { setToastData } = useGlobalStore();

  useEffect(() => {
    const res = validateAvailability(availability);
    if (res.error) {
      setToastData({
        message: extractErrorMessage(res.error),
        type: "error",
      });
    }
  }, [availability]);

  return (
    <div>
      {validationErrors && (
        <div className="text-red-500 mb-2">{validationErrors}</div>
      )}
      {availability?.map((day, index) => (
        <div key={index} className="mb-4">
          <div className="flex  items-center justify-between">
            <div className="flex items-center" style={{ width: "270px" }}>
              <CustomSwitch
                checked={day.active}
                // onChange={() => {
                //   const newAvailability = [...availability];
                //   newAvailability[index].active =
                //     !newAvailability[index].active;
                //   if (
                //     newAvailability[index].active &&
                //     newAvailability[index].hours.length === 0
                //   ) {
                //     handleAddHours(index);
                //   }
                //   setAvailability(newAvailability);
                // }}
                onChange={() => {
                  const newAvailability = [...availability];
                  newAvailability[index].active =
                    !newAvailability[index].active;
                  if (
                    newAvailability[index].active &&
                    newAvailability[index].hours.length === 0
                  ) {
                    handleAddHours(index);
                  }
                  setAvailability(newAvailability);
                }}
                label={
                  daysOfWeek.find((d) => d.value === day.day)?.label ||
                  "Unknown Day"
                }
                className="mr-2"
              />

              <div className="font-bold text-sm">
                {daysOfWeek.find((d) => d.value === day.day)?.label ||
                  "Unknown Day"}
              </div>
            </div>
            <div className="flex flex-col" style={{ width: "790px" }}>
              {day.hours.map((hour, hourIndex) => (
                <div
                  key={hourIndex}
                  className="flex flex-col md:flex-row space-y-2 md:space-y-0 items-center mb-2"
                >
                  <Select
                    classNames={{
                      option: (state) =>
                        `!text-sm hover:!bg-primary hover:!text-white focus:!bg-transparent text-left ${
                          state.isSelected ? "!bg-primary text-white" : ""
                        }  `,
                      placeholder: (state) => `text-base font-normal`,
                      singleValue: (state) => `text-base font-noraml`,
                    }}
                    maxMenuHeight={200}
                    isSearchable={false}
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    menuPlacement="auto"
                    menuShouldScrollIntoView={false}
                    options={timeSlotList}
                    value={hour.start}
                    placeholder="Start"
                    onChange={(selectedOption) => {
                      const newAvailability = [...availability];
                      newAvailability[index].hours[hourIndex].start =
                        selectedOption!;
                      setAvailability(newAvailability);
                    }}
                    isDisabled={!day.active}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),

                      container: (base) => ({
                        ...base,
                        flex: 1,
                        marginRight: "10px",
                      }),
                    }}
                  />
                  <Select
                    classNames={{
                      option: (state) =>
                        `!text-sm hover:!bg-primary hover:!text-white focus:!bg-transparent text-left ${
                          state.isSelected ? "!bg-primary text-white" : ""
                        }  `,
                      placeholder: (state) => `text-base font-normal`,
                      singleValue: (state) => `text-base font-noraml`,
                    }}
                    maxMenuHeight={200}
                    isSearchable={false}
                    placeholder="End"
                    options={timeSlotList}
                    value={hour.end}
                    onChange={(selectedOption) => {
                      const newAvailability = [...availability];
                      newAvailability[index].hours[hourIndex].end =
                        selectedOption!;
                      setAvailability(newAvailability);
                    }}
                    menuPlacement="auto"
                    isDisabled={!day.active}
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    menuShouldScrollIntoView={false}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),

                      container: (base) => ({
                        ...base,
                        flex: 1,
                        marginRight: "10px",
                      }),
                    }}
                  />
                </div>
              ))}
            </div>
            <div
              className="flex items-end justify-end"
              style={{ width: "120px" }}
            >
              {day.active && (
                <>
                  {day.hours.length > 0 && (
                    <>
                      {day.hours.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveHours(index, day.hours.length - 1)
                          }
                          className="mr-1 text-2xl hover:text-primary"
                          disabled={!day.active}
                        >
                          <CiCircleMinus />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleAddHours(index)}
                        className="mr-1 text-2xl hover:text-primary"
                        disabled={!day.active}
                      >
                        <CiCirclePlus />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
            <div
              className="flex items-center"
              style={{ width: "150px", marginLeft: "10px" }}
            >
              {copiedDayIndex === index && (
                <button
                  className="text-primary text-sm"
                  type="button"
                  onClick={() => handleCopyHours(index)}
                >
                  Copy to all
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AvailabilityComponent;
