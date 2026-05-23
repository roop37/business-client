export type PushCampaignDraft = {
  campaignName?: string;
  pushTitle?: string;
  pushBody?: string;
  deepLink?: string | null;
  imageUrl?: string | null;
  target?: string | null;
  eventId?: string | null;
  csvDataUrl?: string | null;
  filters?: string[] | null;
  scheduleType?: string | null;
  scheduleTime?: Date | string | null;
};

export const PUSH_TITLE_LIMIT = 65;
export const PUSH_BODY_LIMIT = 240;

const trimOrUndefined = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const validatePushCampaignDraft = (
  draft: PushCampaignDraft,
  now = new Date()
): string[] => {
  const errors: string[] = [];
  const campaignName = draft.campaignName?.trim() ?? "";
  const pushTitle = draft.pushTitle?.trim() ?? "";
  const pushBody = draft.pushBody?.trim() ?? "";
  const deepLink = draft.deepLink?.trim() ?? "";
  const scheduleType = draft.scheduleType ?? "";

  if (!campaignName) errors.push("Campaign name is required.");
  if (!pushTitle) errors.push("Title is required.");
  if (pushTitle.length > PUSH_TITLE_LIMIT) {
    errors.push(`Title must be ${PUSH_TITLE_LIMIT} characters or fewer.`);
  }
  if (!pushBody) errors.push("Body is required.");
  if (pushBody.length > PUSH_BODY_LIMIT) {
    errors.push(`Body must be ${PUSH_BODY_LIMIT} characters or fewer.`);
  }
  if (deepLink && !/^(https:\/\/|\/)/i.test(deepLink)) {
    errors.push("Deep link must start with https:// or /.");
  }
  if (!draft.target) errors.push("Audience target is required.");
  if (
    draft.target === "CustomCustomer" &&
    (!draft.filters || draft.filters.length === 0)
  ) {
    errors.push("Pick at least one audience filter for a custom audience.");
  }
  // Without these two guards a host could publish a campaign that
  // targets "this event" with no event picked, or "CSV list" with no
  // URL — both would silently send to zero recipients. Catch at draft
  // validation, before the backend has to.
  if (draft.target === "EventSpecific" && !trimOrUndefined(draft.eventId)) {
    errors.push("Pick an event for an event-specific audience.");
  }
  if (draft.target === "CSV") {
    const csvUrl = draft.csvDataUrl?.trim() ?? "";
    if (!csvUrl) {
      errors.push("Paste a CSV URL for a CSV audience.");
    } else if (!/^https?:\/\//i.test(csvUrl)) {
      errors.push("CSV URL must start with http:// or https://.");
    }
  }
  if (!scheduleType) errors.push("Schedule type is required.");
  if (scheduleType === "Later" || scheduleType === "later") {
    const scheduleTime = draft.scheduleTime
      ? new Date(draft.scheduleTime)
      : null;
    if (!scheduleTime || Number.isNaN(scheduleTime.getTime()) || scheduleTime <= now) {
      errors.push("Choose a future schedule time.");
    }
  }

  return errors;
};

export const buildPushCampaignInput = (draft: PushCampaignDraft) => {
  const input: Record<string, unknown> = {
    campaignName: draft.campaignName?.trim() ?? "",
    pushTitle: draft.pushTitle?.trim() ?? "",
    pushBody: draft.pushBody?.trim() ?? "",
  };

  const optionalFields = {
    deepLink: trimOrUndefined(draft.deepLink),
    imageUrl: trimOrUndefined(draft.imageUrl),
    target: draft.target ?? undefined,
    eventId: trimOrUndefined(draft.eventId),
    csvDataUrl: trimOrUndefined(draft.csvDataUrl),
    filters: draft.filters ?? undefined,
    scheduleType: draft.scheduleType ?? undefined,
    scheduleTime: draft.scheduleTime
      ? new Date(draft.scheduleTime).toISOString()
      : undefined,
  };

  Object.entries(optionalFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      input[key] = value;
    }
  });

  return input;
};
