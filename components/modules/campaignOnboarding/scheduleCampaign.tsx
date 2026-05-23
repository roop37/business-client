import { TimePicker } from "@/components/common/time-picker/time-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CustomEmailTargetType,
  EmailCampaignPublicationStatus,
  EmailCampaignScheduleTypes,
} from "@/generated/graphql";
import { cn } from "@/lib/utils";
import useCampaignStore from "@/store/customCampaignStore";
import useHostsStore from "@/store/host";
import { addDays, format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import MarketingCreditWarning from "../campaign/MarketingCreditWarning";

const CampaignSchedule = () => {
  const {
    scheduleType,
    scheduleDate,
    setScheduleType,
    setScheduleDateTime,
    targetType,
    emailStatus,
    targetCount,
    processedCSVRows,
  } = useCampaignStore();

  const { timezone } = useHostsStore();
  const router = useRouter();
  const { isEdit } = router.query;

  const hostTz = timezone?.split(" ")[0] ?? "";
  const selectedDateTime = scheduleDate;

  // Check if this is an edit mode for an active campaign
  const isEditingActiveCampaign =
    isEdit?.toString() === "true" &&
    emailStatus === EmailCampaignPublicationStatus.Active;
  const estimatedRecipients =
    targetType === CustomEmailTargetType.Csv
      ? processedCSVRows?.length ?? 0
      : targetCount ?? 0;

  const generateTimeSlots = () => {
    const slots: { value: string; label: string }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push({
          value: timeString,
          label: format(parse(timeString, "HH:mm", new Date()), "hh:mm a"),
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleScheduleTypeChange = (type: EmailCampaignScheduleTypes) => {
    setScheduleType(type);
    if (type === EmailCampaignScheduleTypes.Now) {
      setScheduleDateTime(null);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && scheduleDate) {
      // Preserve the existing time when changing date
      const newDate = new Date(date);
      newDate.setHours(scheduleDate.getHours());
      newDate.setMinutes(scheduleDate.getMinutes());
      setScheduleDateTime(newDate);
    } else if (date) {
      setScheduleDateTime(date);
    }
  };

  const handleTimeSelect = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const newDateTime = new Date(selectedDateTime ?? new Date());
    newDateTime.setHours(hours);
    newDateTime.setMinutes(minutes);
    setScheduleDateTime(newDateTime);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-medium">When do you want to send it?</h1>
        <p className="text-gray-600 mb-4 pt-1 text-sm">
          Choose whether to send your campaign immediately or schedule it for a
          specific date and time. This helps you optimize the timing for maximum
          engagement.
        </p>
      </div>

      <div>
        {/* Only show schedule type selection if not editing an active campaign */}
        {!isEditingActiveCampaign && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Immediate Send Option */}
            <button
              className={`p-4 border rounded-xl text-center transition-all duration-300 ${
                scheduleType === EmailCampaignScheduleTypes.Now
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() =>
                handleScheduleTypeChange(EmailCampaignScheduleTypes.Now)
              }
            >
              <h3 className="font-bold mb-2">Send Now</h3>
              <p className="text-sm text-gray-500">
                Dispatch your campaign immediately to your audience
              </p>
            </button>

            {/* Scheduled Send Option */}
            <button
              className={`p-4 border rounded-xl text-center transition-all duration-300 ${
                scheduleType === EmailCampaignScheduleTypes.Later
                  ? "border-primary bg-primary-light ring-2 ring-primary"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() =>
                handleScheduleTypeChange(EmailCampaignScheduleTypes.Later)
              }
            >
              <h3 className="font-bold mb-2">Schedule Campaign</h3>
              <p className="text-sm text-gray-500">
                Plan your campaign for optimal timing
              </p>
            </button>
          </div>
        )}

        {/* Show date/time picker for scheduled campaigns OR when editing active campaigns */}
        {(scheduleType === EmailCampaignScheduleTypes.Later ||
          isEditingActiveCampaign) && (
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isEditingActiveCampaign
                ? "Update Campaign Date & Time"
                : "Select Campaign Date & Time"}
            </h3>
            <p className="text-gray-600 mb-3">
              {isEditingActiveCampaign
                ? "Choose a new date and time for your scheduled campaign."
                : "Choose when you want your campaign to be sent."}
            </p>
            <div className="flex gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full bg-white border border-gray-300 pl-3 text-left font-normal",
                      !scheduleDate && "text-muted-foreground"
                    )}
                  >
                    {scheduleDate && selectedDateTime
                      ? format(selectedDateTime, "PPP")
                      : "Pick date & time"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDateTime ?? undefined}
                    fromDate={DateTime.now()
                      // .setZone(hostTz)
                      .startOf("day")
                      .toJSDate()}
                    toDate={addDays(
                      DateTime.now()
                        // .setZone(hostTz)
                        .startOf("day")
                        .toJSDate(),
                      30
                    )}
                    onSelect={handleDateSelect}
                    showOutsideDays={false}
                  />
                  <div className="p-3 border-t border-border">
                    <TimePicker
                      setDate={(d: Date | undefined) => {
                        if (d) {
                          setScheduleDateTime(d);
                        }
                      }}
                      date={selectedDateTime ?? undefined}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {timezone.length > 0 &&
            selectedDateTime &&
            timezone.split(" ")[0] !==
              Intl.DateTimeFormat().resolvedOptions().timeZone ? (
              <p className="my-2 text-sm font-normal text-left text-black/70 flex flex-col">
                <span>{`Date & time according to your host timezone`}</span>
                <span>
                  {DateTime.fromISO(selectedDateTime.toISOString(), {
                    zone: timezone.split(" ")[0],
                  }).toFormat("MM/dd/yyyy, hh:mm a")}
                </span>
              </p>
            ) : null}
          </div>
        )}

        {/* Warning message - only show for new campaigns, not when editing active ones */}
        {!isEditingActiveCampaign &&
          scheduleType === EmailCampaignScheduleTypes.Later &&
          targetType !== CustomEmailTargetType.Csv && (
            <div className="mt-4 bg-yellow-50 border border-red-500 px-4 py-2 rounded-xl">
              <h3 className="text-md font-semibold text-red-500">
                Important Note
              </h3>
              <p className="text-red-500 text-xs">
                Please note that the target count may change by the time of the
                scheduled campaign.
              </p>
            </div>
          )}

        {!isEditingActiveCampaign && estimatedRecipients > 0 && (
          <MarketingCreditWarning
            estimatedCost={estimatedRecipients}
            audienceCount={estimatedRecipients}
            label="this email campaign"
            className="mt-4"
          />
        )}
      </div>
    </div>
  );
};

export default CampaignSchedule;
