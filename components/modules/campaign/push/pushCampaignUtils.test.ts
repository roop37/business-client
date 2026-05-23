import assert from "node:assert/strict";
import test from "node:test";
// Explicit `.ts` so Node's `--test` runner (with built-in type
// stripping in Node 22+) can resolve the module from source without
// a build step. tsc accepts this because the project sets
// `allowImportingTsExtensions: true` (noEmit project, so it's safe).
import {
  buildPushCampaignInput,
  validatePushCampaignDraft,
} from "./pushCampaignUtils.ts";

test("validatePushCampaignDraft accepts a complete immediate push draft", () => {
  const errors = validatePushCampaignDraft({
    campaignName: "Weekend reminder",
    pushTitle: "Tonight at 8",
    pushBody: "Your passes are almost gone. Book before doors open.",
    deepLink: "/events/weekend-reminder",
    target: "AllCustomer",
    scheduleType: "now",
  });

  assert.deepEqual(errors, []);
});

test("validatePushCampaignDraft catches payload and deep-link problems", () => {
  const errors = validatePushCampaignDraft({
    campaignName: "",
    pushTitle: "x".repeat(66),
    pushBody: "x".repeat(241),
    deepLink: "events/bad",
    target: "CustomCustomer",
    filters: [],
    scheduleType: "later",
  });

  assert.deepEqual(errors, [
    "Campaign name is required.",
    "Title must be 65 characters or fewer.",
    "Body must be 240 characters or fewer.",
    "Deep link must start with https:// or /.",
    "Pick at least one audience filter for a custom audience.",
    "Choose a future schedule time.",
  ]);
});

test("validatePushCampaignDraft flags EventSpecific target without an event", () => {
  const errors = validatePushCampaignDraft({
    campaignName: "Pre-show ping",
    pushTitle: "Doors at 9",
    pushBody: "Last call before doors. Tap to view your QR.",
    target: "EventSpecific",
    eventId: "  ",
    scheduleType: "now",
  });

  assert.ok(
    errors.includes("Pick an event for an event-specific audience."),
    "expected event-specific guard to fire"
  );
});

test("validatePushCampaignDraft flags CSV target without a URL", () => {
  const errors = validatePushCampaignDraft({
    campaignName: "Newsletter blast",
    pushTitle: "Hello",
    pushBody: "Body copy here.",
    target: "CSV",
    csvDataUrl: "",
    scheduleType: "now",
  });

  assert.ok(
    errors.includes("Paste a CSV URL for a CSV audience."),
    "expected CSV-URL guard to fire on blank URL"
  );
});

test("validatePushCampaignDraft flags malformed CSV URLs", () => {
  const errors = validatePushCampaignDraft({
    campaignName: "Newsletter blast",
    pushTitle: "Hello",
    pushBody: "Body copy here.",
    target: "CSV",
    csvDataUrl: "drive.example.com/list.csv",
    scheduleType: "now",
  });

  assert.ok(
    errors.includes("CSV URL must start with http:// or https://."),
    "expected CSV-URL shape guard to fire"
  );
});

test("buildPushCampaignInput trims optional fields and omits blanks", () => {
  assert.deepEqual(
    buildPushCampaignInput({
      campaignName: " Launch ",
      pushTitle: " New show ",
      pushBody: " Tickets are live. ",
      deepLink: " /events/show ",
      imageUrl: " ",
      target: "AllCustomer",
      filters: [],
      scheduleType: "now",
      scheduleTime: null,
      csvDataUrl: "",
    }),
    {
      campaignName: "Launch",
      pushTitle: "New show",
      pushBody: "Tickets are live.",
      deepLink: "/events/show",
      target: "AllCustomer",
      filters: [],
      scheduleType: "now",
    }
  );
});
