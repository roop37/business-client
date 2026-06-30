import ConfirmModal from "@/components/common/confirm-modal";
import CustomerEventCard from "@/components/common/event/CustomerEventCard";
import { PreviewNoise } from "@/components/common/PreviewNoise";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import AdditionalDetailsCards, {
  type AdditionalDetailsState,
  type EventGuideValue,
} from "@/components/modules/events/AdditionalDetailsCards";
import ToggleSettingRow from "@/components/modules/events/ToggleSettingRow";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useHostTypeLabel } from "@/hooks/useHostTypeLabel";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import { uploadHostAsset } from "@/utils/cloudinaryUpload";
import {
  AiBoostCard,
  AiBoostGeneration,
  generateAiBoostsForEvent,
  selectAiBoost,
} from "@/utils/eventOfferOps";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  hasAnyPayoutAccount,
  hasVerifiedPrimaryPayout,
  isRejectedOnlyPayout,
} from "@/utils/payout-eligibility";

const AI_OFFER_PREFIX = "ai:";

const aiBoostToPricingOption = (boost: AiBoostCard): PricingOption => ({
  optionId: `${AI_OFFER_PREFIX}${boost.offerCode}`,
  plan: boost.offerCode,
  label: boost.label,
  commissionRate: boost.commissionPct,
  customerPlatformFeeRate: 0,
  upfrontFee: boost.extraAmount,
  expectedPaidTickets: 0,
  expectedGrossSales: boost.computed?.expectedGrossSales ?? 0,
  hostPayout: boost.computed?.hostPayout ?? 0,
  hoizrNetContribution: boost.computed?.hoizrNetContribution ?? 0,
  payoutCycleDaysMin: 0,
  payoutCycleDaysMax: 0,
  badge:
    boost.confidenceScore >= 0.85
      ? "AI Recommended"
      : boost.label.toUpperCase(),
});

const formatIndianRupees = (n: number): string => {
  if (!Number.isFinite(n) || n <= 0) return "₹0";
  // Approximate Indian-format grouping (lakhs/crores) using locale.
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
};

const aiBoostSavingsValue = (boost: AiBoostCard) =>
  Math.max(0, Number(boost.totalSavingsForHosts?.value ?? 0));

const aiBoostFallbackBenefitValue = (boost: AiBoostCard) =>
  Math.max(0, Number(boost.marketingCreditAmount ?? 0)) +
  Math.max(0, Number(boost.marketingCreditDiscountPct ?? 0)) * 100 +
  Math.max(0, Number(boost.howMuchDifferentFromBasicOffer?.deltaPct ?? 0)) *
    1000;

const compareAiBoostBenefit = (a: AiBoostCard, b: AiBoostCard) => {
  const savingsDelta = aiBoostSavingsValue(b) - aiBoostSavingsValue(a);
  if (savingsDelta !== 0) return savingsDelta;
  return aiBoostFallbackBenefitValue(b) - aiBoostFallbackBenefitValue(a);
};

const isHostVerificationBlockMessage = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("host account") &&
    normalized.includes("verified")
  );
};
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  ClockIcon,
  CopyIcon,
  DoorOpenIcon,
  Edit3Icon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  ImagePlusIcon,
  type LucideIcon,
  MapPinIcon,
  Music2Icon,
  PlusIcon,
  SparklesIcon,
  TicketIcon,
  UploadCloudIcon,
  UsersRoundIcon,
  XIcon,
} from "lucide-react";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import AsyncSelect from "react-select/async";

// Platform timezone. Hosts enter event wall-clock times in IST and we store true
// UTC instants; every interpret/display goes through this single zone (India has
// no DST). See toDateTimeInput / fromZonedTime usages below.
const IST_TZ = "Asia/Kolkata";

// Per-user purchase cap defaults. RSVP/Guestlist entries are gated tighter (a
// couple at most) than paid tiers; both stay editable in the ticket form.
const DEFAULT_MAX_PER_USER = 10;
const RSVP_MAX_PER_USER = 2;
const defaultMaxPerUser = (category: TicketCategoryValue) =>
  category === "GUESTLIST" ? RSVP_MAX_PER_USER : DEFAULT_MAX_PER_USER;

type EventJourneyMode = "create" | "update";
type EventTypeValue = "FREE" | "EXCLUSIVE" | "NON_EXCLUSIVE";
type TicketCategoryValue = "GUESTLIST" | "NORMAL" | "TABLE" | "GROUP";
type TicketTypeValue = "SINGLE" | "COUPLE";
type CoverTypeValue =
  | "FULL_COVER"
  | "FOOD_COVER"
  | "DRINK_COVER"
  | "FOOD_AND_DRINK_COVER"
  | "NO_COVER";
type GstValue = "NONE" | "ZERO" | "CGST_SGST_18" | "IGST_18" | "OTHER";

const DEFAULT_TICKETING_TERMS = `<p>Tickets are valid only for the event, date, and time shown on this listing. Entry is subject to venue security, age restrictions, and the organizer's right of admission.</p><ul><li>Carry a valid government ID and the QR ticket at entry.</li><li>Damaged, duplicated, or resold tickets may be rejected.</li><li>Lineup, set times, and entry rules may change for operational or safety reasons.</li></ul>`;

const DEFAULT_REFUND_POLICY = `<p>Refunds are handled by the event organizer according to the policy shown at checkout.</p><ul><li>Organizer-approved refunds are returned to the original payment method.</li><li>Payment-provider charges and already used tickets may be non-refundable where applicable.</li><li>If an event is cancelled by the organizer, eligible ticket holders will be notified with the next steps.</li></ul>`;

const richTextToPlainText = (value: string) =>
  value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const shouldReplaceRichDefault = (current: string, fallback: string) => {
  const currentText = richTextToPlainText(current);
  return !currentText || currentText === richTextToPlainText(fallback);
};

type PricingOption = {
  optionId: string;
  plan: string;
  label: string;
  commissionRate: number;
  customerPlatformFeeRate: number;
  upfrontFee: number;
  expectedPaidTickets: number;
  expectedGrossSales: number;
  hostPayout: number;
  hoizrNetContribution: number;
  payoutCycleDaysMin: number;
  payoutCycleDaysMax: number;
  badge: string;
};

type PlacesType = {
  label: string;
  value: string;
};

type TicketDraft = {
  _id?: string;
  ticketCategory: TicketCategoryValue;
  ticketName: string;
  // Multi-day: the EventDay.dayId this ticket admits, the "ALL_DAYS" sentinel
  // (festival pass), or undefined on a single-day event.
  dayId?: string;
  ticketType: TicketTypeValue;
  ticketCapacity: number;
  ticketSold?: number;
  ticketPrice: number;
  ticketInfo?: string;
  coverType: CoverTypeValue;
  ticketGST: GstValue;
  gstRate: number;
  groupCapacity: number;
  maxTicketPerUser: number;
  ticketExpiryDateTime?: string;
  markAsComingSoon: boolean;
  markAsOnGroundOnly: boolean;
  ticketVisible: boolean;
  description?: string;
};

// Festival-pass sentinel — mirrors ALL_DAYS_TICKET in @hoizr-technology/shared.
const ALL_DAYS_TICKET = "ALL_DAYS";

type EventDayCityDraft = {
  addressLine1: string;
  city: string;
  state?: string;
  pincode?: string;
};

type EventDayDraft = {
  dayId: string;
  title: string;
  startDate: string; // datetime-local string (IST wall-clock, like toDateTimeInput)
  endDate: string;
  // Per-day venue for a multi-city event. Undefined ⇒ uses the event's single
  // top-level location.
  location?: EventDayCityDraft;
};

type HoizrExtraTypeValue =
  | "VIP_UPGRADE"
  | "MEET_AND_GREET"
  | "MERCH"
  | "FOOD_DRINK"
  | "OTHER";

type ExtraDraft = {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold?: number;
  image?: string;
  type: HoizrExtraTypeValue;
  linkedTicketTypes?: string[];
};

type EventGalleryItemTypeValue = "IMAGE" | "VIDEO";

type EventGalleryItemDraft = {
  url: string;
  type: EventGalleryItemTypeValue;
};

type ArtistSearchResult = {
  id?: string;
  source?: "ARTIST" | "PHANTOM" | string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  picture?: string | null;
  artistLinkId?: string | null;
  tempArtistId?: string | null;
  instagramLink?: string | null;
  spotifyLink?: string | null;
  youtubeLink?: string | null;
};

type CollaboratorSearchResult = {
  _id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  logo?: string | null;
};

// Saved-to-server shape for one collaborator host on the event. Hosts must
// be on-platform — businessLinkId is the host._id from searchCollaboratorHosts.
type CollaboratorEntry = {
  name: string;
  businessLinkId: string;
  logo?: string | null;
  requestCustomerListAccess: boolean;
  hideOnEventPage: boolean;
  allowIssuingOfflineTickets: boolean;
  sendTransactionalMails: boolean;
  canSeeMetrics: boolean;
  canRunCampaigns: boolean;
  canCreateOffers: boolean;
};

// Saved-to-server shape for one lineup artist. artistLinkId is set when the
// artist is on-platform; tempArtistId is set when the host attached an
// off-platform name via search; otherwise both are blank and the entry is
// a manual addition.
type ArtistEntry = {
  name: string;
  actualName?: string;
  picture: string;
  artistLinkId?: string;
  tempArtistId?: string;
  instagramLink?: string;
  spotifyLink?: string;
  youtubeLink?: string;
};

type ConfirmAction = {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "default" | "danger" | "warning";
  onConfirm: () => void | Promise<void>;
};

type CityOption = {
  _id: string;
  value: string;
  state?: string | null;
};

const emptyAdditionalDetails = (): AdditionalDetailsState => ({
  eventGuide: {},
  faqs: [],
  eventInstructions: [],
  prohibitedItems: [],
});

const optionalString = (value: unknown): string | undefined => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || undefined;
};

const optionalNumber = (value: unknown): number | undefined => {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const uniqueNonEmptyStrings = (items: unknown): string[] =>
  Array.from(
    new Set(
      (Array.isArray(items) ? items : [])
        .map((item) => optionalString(item))
        .filter((item): item is string => Boolean(item)),
    ),
  );

const normalizeAdditionalDetails = (
  value: AdditionalDetailsState,
): AdditionalDetailsState => {
  const guide = value.eventGuide ?? {};
  const gatesOpenBeforeEvent = Boolean(guide.gatesOpenBeforeEvent);
  const eventGuide: EventGuideValue = {
    languageIds: uniqueNonEmptyStrings(guide.languageIds),
    gatesOpenBeforeEvent,
  };

  if (guide.minimumEntryAge) eventGuide.minimumEntryAge = guide.minimumEntryAge;
  if (guide.paidEntryAge) eventGuide.paidEntryAge = guide.paidEntryAge;
  if (guide.venueLayout) eventGuide.venueLayout = guide.venueLayout;
  if (guide.seatingArrangement) {
    eventGuide.seatingArrangement = guide.seatingArrangement;
  }
  if (guide.kidFriendly) eventGuide.kidFriendly = guide.kidFriendly;
  if (guide.petFriendly) eventGuide.petFriendly = guide.petFriendly;

  if (gatesOpenBeforeEvent) {
    const hours = optionalNumber(guide.gatesOpenLeadHours);
    const minutes = optionalNumber(guide.gatesOpenLeadMinutes);
    if (hours !== undefined) {
      eventGuide.gatesOpenLeadHours = Math.max(0, Math.min(23, hours));
    }
    if (minutes !== undefined) {
      eventGuide.gatesOpenLeadMinutes = Math.max(0, Math.min(59, minutes));
    }
  }

  const youtubeLink = optionalString(guide.youtubeLink);
  if (youtubeLink) eventGuide.youtubeLink = youtubeLink;

  return {
    eventGuide,
    faqs: value.faqs
      .map((faq) => ({
        question: faq.question.trim(),
        answer: faq.answer.trim(),
      }))
      .filter((faq) => faq.question && faq.answer),
    eventInstructions: uniqueNonEmptyStrings(value.eventInstructions),
    prohibitedItems: uniqueNonEmptyStrings(value.prohibitedItems),
  };
};

const additionalDetailsFromEvent = (event: any): AdditionalDetailsState =>
  normalizeAdditionalDetails({
    eventGuide: {
      languageIds: uniqueNonEmptyStrings(event?.eventGuide?.languageIds),
      minimumEntryAge: optionalString(event?.eventGuide?.minimumEntryAge),
      paidEntryAge: optionalString(event?.eventGuide?.paidEntryAge),
      venueLayout: optionalString(event?.eventGuide?.venueLayout),
      seatingArrangement: optionalString(
        event?.eventGuide?.seatingArrangement,
      ),
      kidFriendly: optionalString(event?.eventGuide?.kidFriendly),
      petFriendly: optionalString(event?.eventGuide?.petFriendly),
      gatesOpenBeforeEvent: Boolean(event?.eventGuide?.gatesOpenBeforeEvent),
      gatesOpenLeadHours: optionalNumber(event?.eventGuide?.gatesOpenLeadHours),
      gatesOpenLeadMinutes: optionalNumber(
        event?.eventGuide?.gatesOpenLeadMinutes,
      ),
      youtubeLink: optionalString(event?.eventGuide?.youtubeLink),
    },
    faqs: (Array.isArray(event?.faqs) ? event.faqs : []).map((faq: any) => ({
      question: faq?.question ?? "",
      answer: faq?.answer ?? "",
    })),
    eventInstructions: uniqueNonEmptyStrings(event?.eventInstructions),
    prohibitedItems: uniqueNonEmptyStrings(event?.prohibitedItems),
  });

const steps = [
  "Event Category",
  "Basic Details",
  "Location",
  "Tickets",
  "Lineup",
  "Additional",
];
const lastStepIndex = steps.length - 1;

const eventTypeCards: {
  value: EventTypeValue;
  title: string;
  description: string;
  meta: string[];
  recommended?: boolean;
}[] = [
  {
    value: "FREE",
    title: "RSVP Event",
    description:
      "Free RSVP entry, such as couple before 10 PM, controlled by your terms.",
    meta: ["Recommended", "Free entry", "No card required"],
    recommended: true,
  },
  {
    value: "EXCLUSIVE",
    title: "Exclusive Event",
    description:
      "Tickets are available only on Hoizr. AI studies the event before publish.",
    meta: ["Direct checkout", "Payout 5-7 working days"],
  },
  {
    value: "NON_EXCLUSIVE",
    title: "Non-Exclusive Event",
    description:
      "Tickets are available on Hoizr and other platforms. Built for multi-channel sales.",
    meta: ["Multi-channel", "Payout 8-10 working days"],
  },
];

// Aspect ratios updated 2026-06-04 per docs/EVENT_FIELDS_SPEC.md —
// portrait moves from 4:5 → 3:4 (900×1200) to match the rest of the
// market, and the historically-named "horizontal flyer" is now the
// "landscape image" in all UI copy. The DB field name stays
// `horizontalFlyer` for back-compat.
const flyerCropTargets = {
  event: {
    width: 900,
    height: 1200,
    title: "Crop event flyer",
    description:
      "Fixed 3:4 crop (900×1200). Drag on the image to position the crop and use zoom to adjust the selected area.",
    uploadKind: "event-flyer" as const,
    fileName: "event-flyer.jpg",
    successMessage: "Event flyer uploaded",
  },
  horizontal: {
    width: 1600,
    height: 900,
    title: "Crop landscape image",
    description:
      "Fixed 16:9 crop (1600×900). Drag on the image to position the crop and use zoom to adjust the selected area.",
    uploadKind: "event-horizontal-flyer" as const,
    fileName: "landscape-image.jpg",
    successMessage: "Landscape image uploaded",
  },
};
type FlyerCropMode = keyof typeof flyerCropTargets;
const eventImageMaxFileSizeBytes = Math.round(1.5 * 1024 * 1024);
const eventVideoMaxFileSizeBytes = 5 * 1024 * 1024;
const eventVideoMinDurationSeconds = 10;
const eventVideoMaxDurationSeconds = 60;
const maxEventGalleryItems = 8;
const verticalMediaRatio = 3 / 4;
const aspectRatioTolerance = 0.025;
const flyerMaxFileSizeBytes = eventImageMaxFileSizeBytes;
const flyerCropScaleFromPercent = (zoomPercent: number) => 1 + zoomPercent / 50;

const imageMimeTypes = new Set(["image/jpeg", "image/png"]);
const videoMimeTypes = new Set(["video/mp4", "video/quicktime"]);

const isWithinAspectRatio = (
  width: number,
  height: number,
  targetRatio: number,
) => {
  if (!width || !height) return false;
  return Math.abs(width / height - targetRatio) <= aspectRatioTolerance;
};

const readVideoMetadata = async (file: File) => {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Unable to read video metadata"));
    });
    return {
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
};

const normalizeGalleryType = (value: unknown): EventGalleryItemTypeValue =>
  String(value).toUpperCase() === "VIDEO" ? "VIDEO" : "IMAGE";

const galleryFromEvent = (items: unknown): EventGalleryItemDraft[] =>
  (Array.isArray(items) ? items : [])
    .map((item: any) => ({
      url: optionalString(item?.url) ?? "",
      type: normalizeGalleryType(item?.type),
    }))
    .filter((item) => item.url)
    .slice(0, maxEventGalleryItems);

// MainBodyLayout hydrates `selectedHostId` asynchronously after the page mounts.
// If the user opens the upload tile before that finishes, the prop reads as ""
// and we used to fire a toast. Instead we subscribe and wait briefly so the
// upload just works once the store hydrates. Falls back to a one-shot
// `restaurantDetails` lookup so a slow store fetch still doesn't strand the user.
const awaitSelectedHostId = async (timeoutMs = 4000): Promise<string> => {
  const immediate = useHostsStore.getState().selectedHostId;
  if (immediate) return immediate;
  const fromStore = await new Promise<string>((resolve) => {
    const timer = setTimeout(() => {
      unsub();
      resolve("");
    }, timeoutMs);
    const unsub = useHostsStore.subscribe((state) => {
      if (state.selectedHostId) {
        clearTimeout(timer);
        unsub();
        resolve(state.selectedHostId);
      }
    });
  });
  if (fromStore) return fromStore;
  try {
    const res = await sdk.restaurantDetails();
    const hostId = res?.restaurantDetails?._id ?? "";
    if (hostId) {
      useHostsStore.getState().setSelectedHostId(hostId);
    }
    return hostId;
  } catch {
    return "";
  }
};
const timePickerOptions = Array.from({ length: 24 * 12 }, (_, index) => {
  const minutes = index * 5;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return {
    value,
    label: `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`,
  };
});

const ticketCategories: { value: TicketCategoryValue; label: string }[] = [
  { value: "GUESTLIST", label: "RSVP" },
  { value: "NORMAL", label: "Normal" },
  { value: "TABLE", label: "Table" },
  { value: "GROUP", label: "Group" },
];

const rupee = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatPercentDelta = (value: number) =>
  value.toFixed(2).replace(/\.?0+$/, "");

const formatDate = (value?: string) => {
  if (!value) return "Date pending";
  // `value` is an IST wall-clock string ("YYYY-MM-DDTHH:mm") from the picker /
  // toDateTimeInput — NOT a UTC instant. Parse it AS IST (a bare `new Date()`
  // would read it in the browser's tz) and render it in IST so the preview
  // matches the picker on every browser, regardless of the viewer's timezone.
  const date = fromZonedTime(value, IST_TZ);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: IST_TZ,
  }).format(date);
};

// Convert a stored UTC instant into the "YYYY-MM-DDTHH:mm" wall-clock string the
// datetime pickers expect, rendered in IST. Pairs with the fromZonedTime(...,IST)
// conversions on save: an instant of 2026-06-26T13:15Z reads back as the IST
// wall-clock "2026-06-26T18:45" — matching what the customer site shows.
const toDateTimeInput = (value?: string | Date | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatInTimeZone(date, IST_TZ, "yyyy-MM-dd'T'HH:mm");
};

// Stable client-side id for a new day. The server keeps any dayId we send
// (assignDayIds only mints one when absent), so generating it here lets a
// ticket reference its day before the event is saved.
const genDayId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return `${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
};

const DT_PARTS_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
const pad2 = (n: number) => String(n).padStart(2, "0");

// Split an event date range into Day 1…N — one calendar day each, with the same
// daily time window taken from the overall start/end. Operates PURELY on the
// "YYYY-MM-DDTHH:MM" wall-clock strings (no `new Date()` / UTC conversion) so
// Day 1's start equals the event start string exactly and the last day's end
// equals the event end string exactly — the auto-fill is valid by construction
// and representation-agnostic (works whether the strings are local wall-clock
// from the picker or UTC-sliced from a loaded event). The earlier version mixed
// local parsing with UTC field reads, which shifted every day by the timezone
// offset (e.g. a 5:00 PM IST start became an 11:30 "Day 1", tripping the
// "starts before the event start" check). Days are editable after generation.
const buildDaysFromRange = (start: string, end: string): EventDayDraft[] => {
  const ms = DT_PARTS_RE.exec(start);
  const me = DT_PARTS_RE.exec(end);
  if (!ms || !me) return [];
  const startTime = `${ms[4]}:${ms[5]}`;
  const endTime = `${me[4]}:${me[5]}`;
  const DAY_MS = 24 * 60 * 60 * 1000;
  // Calendar-day span only — date components via UTC midnight is tz-agnostic.
  const startMid = Date.UTC(+ms[1], +ms[2] - 1, +ms[3]);
  const endMid = Date.UTC(+me[1], +me[2] - 1, +me[3]);
  if (endMid < startMid) return [];
  // Overnight window (end time-of-day not after start, e.g. 9pm→2am) → each
  // day's end falls on the NEXT calendar date, so the number of nights is the
  // calendar-date difference; a same-day window spans dateDiff+1 days. Zero-
  // padded HH:MM compares safely as strings.
  const overnight = endTime <= startTime;
  const dateDiff = Math.round((endMid - startMid) / DAY_MS);
  const n = overnight ? dateDiff : dateDiff + 1;
  if (n < 2) return [];
  const dateStr = (mid: number) => {
    const d = new Date(mid);
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(
      d.getUTCDate()
    )}`;
  };
  const out: EventDayDraft[] = [];
  for (let i = 0; i < n; i++) {
    const dayMid = startMid + i * DAY_MS;
    const endDayMid = overnight ? dayMid + DAY_MS : dayMid;
    out.push({
      dayId: genDayId(),
      title: `Day ${i + 1}`,
      startDate: `${dateStr(dayMid)}T${startTime}`,
      endDate: `${dateStr(endDayMid)}T${endTime}`,
    });
  }
  return out;
};

// Mirrors validateEventDays on the server (spec §5) for instant feedback.
// Returns an error message, or null when the days are valid.
const validateEventDaysClient = (
  days: EventDayDraft[],
  eventStart: string,
  eventEnd: string
): string | null => {
  if (!days.length) return null;
  if (days.length < 2) return "A multi-day event needs at least 2 days.";
  const ms = (v: string) => new Date(v).getTime();
  const sorted = [...days].sort((a, b) => ms(a.startDate) - ms(b.startDate));
  const evStart = eventStart ? ms(eventStart) : null;
  const evEnd = eventEnd ? ms(eventEnd) : null;
  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i];
    if (!d.title?.trim()) return "Each day needs a title.";
    const s = ms(d.startDate);
    const en = ms(d.endDate);
    if (Number.isNaN(s) || Number.isNaN(en) || !(s < en)) {
      return `${d.title}: start must be before end.`;
    }
    if (evStart != null && s < evStart) return `${d.title} starts before the event start.`;
    if (evEnd != null && en > evEnd) return `${d.title} ends after the event end.`;
    if (i > 0 && s < ms(sorted[i - 1].endDate)) return "Days overlap — adjust the times.";
  }
  return null;
};

const normalizeEnum = <T extends string>(value: any, fallback: T): T => {
  if (!value) return fallback;
  const raw = String(value);
  if (raw.includes("_")) return raw as T;
  return raw.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase() as T;
};

const EventJourney = ({
  eventId,
  mode,
}: {
  eventId: string;
  mode: EventJourneyMode;
}) => {
  const router = useRouter();
  const {
    setToastData,
    showPayoutPromptModal,
    showPayoutFormModal,
    setPayoutFormIsUpdate,
    showPayoutPendingVerificationModal,
    showHostUnderReviewModal,
    setPayoutModalSaveDraftHandler,
  } = useGlobalStore();
  const { selectedHostId } = useHostsStore();
  const hostLabel = useHostTypeLabel();
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(
    mode === "update" ? steps.length - 1 : 0,
  );
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState("DRAFT");
  const [firstStepCompleted, setFirstStepCompleted] = useState(false);

  const [eventType, setEventType] = useState<EventTypeValue>("FREE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // TASK-043 sub-item 10: genre chips (e.g. Comedy, Bollywood, EDM).
  // Drives discoverability filters on the customer site.
  const [allGenres, setAllGenres] = useState<{ _id: string; value: string }[]>(
    [],
  );
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [genreFilter, setGenreFilter] = useState("");
  const [eventFlyer, setEventFlyer] = useState("");
  const [flyerPreview, setFlyerPreview] = useState("");
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerCropOpen, setFlyerCropOpen] = useState(false);
  const [flyerCropMode, setFlyerCropMode] =
    useState<FlyerCropMode>("event");
  const [cropZoom, setCropZoom] = useState(0);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [uploadingFlyer, setUploadingFlyer] = useState(false);
  const flyerImgRef = useRef<HTMLImageElement | null>(null);
  const [flyerNaturalRatio, setFlyerNaturalRatio] = useState<number | null>(
    null,
  );
  const flyerCropTarget = flyerCropTargets[flyerCropMode];
  const flyerCropScale = useMemo(
    () => flyerCropScaleFromPercent(cropZoom),
    [cropZoom],
  );
  // Largest 3:4 crop window that fits inside the displayed source image,
  // expressed as a % of the displayed image's own dimensions. Multiplied by
  // 1/cropScale so zoom shrinks the window (tighter crop). Both numbers are
  // shared by the preview overlay and the canvas-cut math below.
  const flyerCropWindow = useMemo(() => {
    if (!flyerNaturalRatio || flyerCropScale <= 0) {
      return { widthPct: 0, heightPct: 0 };
    }
    const targetRatio = flyerCropTarget.width / flyerCropTarget.height;
    const widthOfImg =
      flyerNaturalRatio >= targetRatio
        ? (targetRatio / flyerNaturalRatio) * 100
        : 100;
    const heightOfImg =
      flyerNaturalRatio >= targetRatio
        ? 100
        : (flyerNaturalRatio / targetRatio) * 100;
    return {
      widthPct: widthOfImg / flyerCropScale,
      heightPct: heightOfImg / flyerCropScale,
    };
  }, [flyerNaturalRatio, flyerCropScale, flyerCropTarget]);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [markSeparateDays, setMarkSeparateDays] = useState(false);
  // Multi-city: each day has its own venue (only offered when multi-day).
  const [multiCity, setMultiCity] = useState(false);
  // Per-day segments for a multi-day event (Day 1…N). Empty = single-day.
  const [eventDays, setEventDays] = useState<EventDayDraft[]>([]);
  // Day validation is surfaced inline only AFTER a Next/Update attempt — never
  // live while the host is still entering/editing the days.
  const [daysSaveAttempted, setDaysSaveAttempted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const [city, setCity] = useState("");
  const [eventLocationDecided, setEventLocationDecided] = useState(true);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlacesType | null>(null);
  const [coords, setCoords] = useState<number[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [manualLocationOpen, setManualLocationOpen] = useState(false);
  const [ticketingEnabled, setTicketingEnabled] = useState(true);
  const [ticketTab, setTicketTab] = useState<"tickets" | "advanced">("tickets");
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketEditIndex, setTicketEditIndex] = useState<number | null>(null);
  // Advanced settings stays expanded by default. Earlier the modal
  // opened with the panel collapsed and the toggle below the visible
  // viewport — hosts on short laptops couldn't scroll past the always-
  // expanded basic-info block to reach the toggle, so the settings
  // were effectively unreachable. Opening by default trades a slightly
  // taller initial modal for actual discoverability.
  const [ticketAdvancedOpen, setTicketAdvancedOpen] = useState(true);
  const [ticketCategory, setTicketCategory] =
    useState<TicketCategoryValue>("GUESTLIST");
  const [ticketName, setTicketName] = useState("General Entry");
  const [ticketType, setTicketType] = useState<TicketTypeValue>("SINGLE");
  const [ticketPrice, setTicketPrice] = useState(0);
  const [ticketCapacity, setTicketCapacity] = useState(100);
  const [coverType, setCoverType] = useState<CoverTypeValue>("NO_COVER");
  // GST eligibility flag — only REGULAR / CASUAL_TAXABLE_PERSON hosts can
  // collect ticket GST from customers (SoT §4). Fetched once after mount
  // from the primary Payout. While loading we assume INELIGIBLE so the
  // selector stays hidden and we don't accidentally show a host an option
  // they aren't allowed to use.
  const [hostGstEligible, setHostGstEligible] = useState(false);
  // Default GST stays "NONE" until eligibility comes back true; matches
  // server-side enforceTicketGstEligibility() which would force this to
  // NONE on save anyway.
  const [ticketGST, setTicketGST] = useState<GstValue>("NONE");
  const [gstRate, setGstRate] = useState(0);
  const [groupCapacity, setGroupCapacity] = useState(4);
  const [maxTicketPerUser, setMaxTicketPerUser] = useState(10);
  const [ticketExpiryDateTime, setTicketExpiryDateTime] = useState("");
  const [ticketComingSoon, setTicketComingSoon] = useState(false);
  const [ticketOnGroundOnly, setTicketOnGroundOnly] = useState(false);
  const [ticketVisible, setTicketVisible] = useState(true);
  // Multi-day "Valid for" picker value: "" (single-day), ALL_DAYS, or a dayId.
  const [ticketDayId, setTicketDayId] = useState<string>("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [allowWalkIns, setAllowWalkIns] = useState(false);
  const [requiresIDVerification, setRequiresIDVerification] = useState(false);
  const [ticketSalesStartDate, setTicketSalesStartDate] = useState("");
  const [ticketSalesEndDate, setTicketSalesEndDate] = useState("");
  const [ticketingTerms, setTicketingTerms] = useState(DEFAULT_TICKETING_TERMS);
  const [refundPolicy, setRefundPolicy] = useState(DEFAULT_REFUND_POLICY);
  const [hostDefaultsLoaded, setHostDefaultsLoaded] = useState(false);
  const hostDefaultsRef = useRef<{
    ticketingTerms: string;
    refundPolicy: string;
  }>({
    ticketingTerms: "",
    refundPolicy: "",
  });
  const [tickets, setTickets] = useState<TicketDraft[]>([]);
  const [extras, setExtras] = useState<ExtraDraft[]>([]);
  const [extraModalOpen, setExtraModalOpen] = useState(false);
  const [extraEditIndex, setExtraEditIndex] = useState<number | null>(null);
  const [extraName, setExtraName] = useState("");
  const [extraDescription, setExtraDescription] = useState("");
  const [extraPrice, setExtraPrice] = useState(0);
  const [extraQuantity, setExtraQuantity] = useState(50);
  const [extraImage, setExtraImage] = useState("");
  const [extraType, setExtraType] = useState<HoizrExtraTypeValue>("OTHER");

  const [peopleTab, setPeopleTab] = useState<"collaborators" | "artists">(
    "collaborators",
  );
  const [lineupEnabled, setLineupEnabled] = useState(true);
  const [lineUpToBeAnnounced, setLineUpToBeAnnounced] = useState(false);
  const [artistQuery, setArtistQuery] = useState("");
  const [artistSearchResults, setArtistSearchResults] = useState<
    ArtistSearchResult[]
  >([]);
  const [artistSearchAttempted, setArtistSearchAttempted] = useState(false);
  const [artistLinkId, setArtistLinkId] = useState("");
  const [tempArtistId, setTempArtistId] = useState("");
  const [artistActualName, setArtistActualName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [artistPicture, setArtistPicture] = useState("");
  const [pendingArtistFile, setPendingArtistFile] = useState<File | null>(null);
  const [artistInstagram, setArtistInstagram] = useState("");
  const [artistSpotify, setArtistSpotify] = useState("");
  const [artistYoutube, setArtistYoutube] = useState("");
  const [collaboratorQuery, setCollaboratorQuery] = useState("");
  const [collaboratorSearchResults, setCollaboratorSearchResults] = useState<
    CollaboratorSearchResult[]
  >([]);
  const [collaboratorLinkId, setCollaboratorLinkId] = useState("");
  const [collaboratorName, setCollaboratorName] = useState("");
  const [requestCustomerListAccess, setRequestCustomerListAccess] =
    useState(true);
  const [hideOnEventPage, setHideOnEventPage] = useState(false);
  // Default ON — most collaborators are co-hosts who help work the door, so
  // door/offline ticket issuing is allowed unless the inviting host turns it off.
  const [allowIssuingOfflineTickets, setAllowIssuingOfflineTickets] =
    useState(true);
  const [sendTransactionalMails, setSendTransactionalMails] = useState(false);
  const [canSeeMetrics, setCanSeeMetrics] = useState(true);
  const [canRunCampaigns, setCanRunCampaigns] = useState(true);
  const [canCreateOffers, setCanCreateOffers] = useState(true);

  // Multi-entry collaborator + artist state. The single-field state above
  // (collaboratorName, artistName, etc.) is the in-modal draft; commits go
  // into these arrays. Persisted to event.eventCollaborationBusiness[] and
  // event.lineup[] respectively — both arrays are already supported by the
  // schema, so this is purely a UI/UX upgrade.
  const [collaborators, setCollaborators] = useState<CollaboratorEntry[]>([]);
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [collabEditIndex, setCollabEditIndex] = useState<number | null>(null);
  const [artists, setArtists] = useState<ArtistEntry[]>([]);
  const [artistModalOpen, setArtistModalOpen] = useState(false);
  const [artistEditIndex, setArtistEditIndex] = useState<number | null>(null);

  // Referral capture modal. Opens when collaborator search returns no
  // results — instead of letting the host add an off-platform "phantom"
  // collaborator (the old behavior), we capture the missing host's contact
  // so platform ops can invite them. Credit-rules math is a separate task.
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralHostName, setReferralHostName] = useState("");
  const [referralHostContact, setReferralHostContact] = useState("");

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );

  const [instagramPost, setInstagramPost] = useState("");
  const [instagramStory, setInstagramStory] = useState("");
  const [tableLayoutImage, setTableLayoutImage] = useState("");
  const [horizontalFlyer, setHorizontalFlyer] = useState("");
  const [videoSneakPeek, setVideoSneakPeek] = useState("");
  const [uploadingSneakPeek, setUploadingSneakPeek] = useState(false);
  const [galleryItems, setGalleryItems] = useState<EventGalleryItemDraft[]>(
    [],
  );
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [verticalVideo, setVerticalVideo] = useState("");
  const [horizontalVideo, setHorizontalVideo] = useState("");
  const [contactForQueriesTables, setContactForQueriesTables] = useState("");
  const [additionalDetails, setAdditionalDetails] =
    useState<AdditionalDetailsState>(emptyAdditionalDetails);
  // expectedEventsDoneTillNow input was removed per Roop — the server still
  // accepts the field for backwards compat (pricing calc + AI Boost
  // generator read it), so we send 0 from the client now and a follow-up
  // task will switch those consumers to a real-time per-host event count.
  const [feeSettlementMode, setFeeSettlementMode] = useState<
    "DEDUCT_FROM_PAYOUT" | "PAY_AFTER_EVENT"
  >("DEDUCT_FROM_PAYOUT");
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  // AI Boost generation is the source of truth for the publish modal's
  // "smart offers" — see main-server/src/modules/eventOffer. The legacy
  // eventPricingOptions fallback still feeds the modal when the AI
  // pipeline is unconfigured or returns nothing usable.
  const [aiBoostGeneration, setAiBoostGeneration] =
    useState<AiBoostGeneration | null>(null);
  const aiBoostOffersByCode = useMemo<Map<string, AiBoostCard>>(() => {
    const map = new Map<string, AiBoostCard>();
    for (const o of aiBoostGeneration?.offers ?? []) map.set(o.offerCode, o);
    return map;
  }, [aiBoostGeneration]);
  const [selectedPricingOptionId, setSelectedPricingOptionId] = useState("");
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  // Public live link shown in the post-publish success modal (null = closed).
  const [publishedLiveUrl, setPublishedLiveUrl] = useState<string | null>(null);
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const formScrollRef = useRef<HTMLElement | null>(null);

  const isPaid = eventType !== "FREE";
  // Offer selection moved off the wizard onto a publish-time modal,
  // so the visible steps list now matches `steps` 1:1 for every event
  // type. Kept as a memoised value for the call-sites that referenced it.
  const visibleSteps = steps;
  const isPublished = status === "PUBLISHED" || status === "Published";
  const eventStarted = Boolean(
    isPublished && startDate && new Date(startDate) <= new Date(),
  );
  const canEditEventCategory =
    mode === "create" && !isPublished && !firstStepCompleted;

  const fetchHostPayoutAccounts = async () => {
    const { hostPayoutAccounts } = await sdk.hostPayoutAccounts();
    return hostPayoutAccounts ?? [];
  };

  const ensurePaidDraftHasPayoutAccount = async () => {
    if (!isPaid || isPublished) return true;

    try {
      const accounts = await fetchHostPayoutAccounts();
      // Only a REJECTED payout → open the form to fix it (Update), not "Add".
      if (isRejectedOnlyPayout(accounts)) {
        setPayoutFormIsUpdate(true);
        showPayoutFormModal(true);
        return false;
      }
      if (!hasAnyPayoutAccount(accounts)) {
        setPayoutFormIsUpdate(false);
        showPayoutPromptModal(true);
        return false;
      }
      return true;
    } catch {
      // Drafting should not be blocked by a transient payout lookup.
      // Publishing still verifies the payout requirement server-side.
      return true;
    }
  };

  const ensurePaidPublishPayoutReady = async () => {
    if (!isPaid || isPublished) return true;

    try {
      const accounts = await fetchHostPayoutAccounts();
      // Their only payout was DECLINED → send them to fix/replace it (the form
      // opens as "Update payout"), NOT the misleading "pending verification"
      // modal (which only makes sense for a PENDING payout).
      if (isRejectedOnlyPayout(accounts)) {
        setPayoutFormIsUpdate(true);
        showPayoutFormModal(true);
        return false;
      }
      if (!hasAnyPayoutAccount(accounts)) {
        setPayoutFormIsUpdate(false);
        showPayoutPromptModal(true);
        return false;
      }
      if (!hasVerifiedPrimaryPayout(accounts)) {
        // A usable (PENDING) payout exists but isn't verified yet — correct.
        showPayoutPendingVerificationModal(true);
        return false;
      }
      return true;
    } catch (error) {
      setToastData({
        type: "error",
        message:
          extractErrorMessage(error) ||
          "Unable to confirm payout verification. Please try again.",
      });
      return false;
    }
  };

  const ensureHostAccountPublishReady = async () => {
    if (isPublished) return true;

    try {
      const response = await sdk.getHost();
      const host = response?.getHost;
      if (!host) return true;
      if (host.status !== "ACTIVE" || host.isAdminVerified !== true) {
        showHostUnderReviewModal(true);
        return false;
      }
      return true;
    } catch (error) {
      setToastData({
        type: "error",
        message:
          extractErrorMessage(error) ||
          "Unable to confirm account verification. Please try again.",
      });
      return false;
    }
  };

  const multiDayEligible = useMemo(() => {
    if (!startDate || !endDate) return false;
    return (
      new Date(endDate).getTime() - new Date(startDate).getTime() >
      24 * 60 * 60 * 1000
    );
  }, [endDate, startDate]);

  // Auto-split: when the range spans >1 day and "separate days" is on, generate
  // Day 1…N once (functional setState preserves rehydrated/edited days — never
  // re-mints their dayIds). Toggling off / becoming ineligible collapses to a
  // single continuous event.
  useEffect(() => {
    if (!multiDayEligible || !markSeparateDays) {
      setEventDays((prev) => (prev.length ? [] : prev));
      return;
    }
    if (startDate && endDate) {
      setEventDays((prev) =>
        prev.length ? prev : buildDaysFromRange(startDate, endDate)
      );
    }
  }, [multiDayEligible, markSeparateDays, startDate, endDate]);

  // Inline validation for the day editor (also gates save in step 1).
  const daysError = useMemo(
    () =>
      multiDayEligible && markSeparateDays
        ? validateEventDaysClient(eventDays, startDate, endDate)
        : null,
    [multiDayEligible, markSeparateDays, eventDays, startDate, endDate]
  );

  const updateEventDay = (index: number, patch: Partial<EventDayDraft>) => {
    // The host is actively fixing the days — drop the post-attempt error until
    // they try to proceed again.
    setDaysSaveAttempted(false);
    setEventDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d))
    );
  };

  // Patch a single day's per-city venue (multi-city events).
  const updateEventDayCity = (
    index: number,
    patch: Partial<EventDayCityDraft>
  ) =>
    setEventDays((prev) =>
      prev.map((d, i) =>
        i === index
          ? {
              ...d,
              location: {
                addressLine1: d.location?.addressLine1 ?? "",
                city: d.location?.city ?? "",
                state: d.location?.state,
                pincode: d.location?.pincode,
                ...patch,
              },
            }
          : d
      )
    );

  // Multi-city is only meaningful for an eligible multi-day event.
  const multiCityEligible = multiDayEligible && markSeparateDays;

  // Human label for a ticket's day tag on the list rows (multi-day events).
  // Empty for single-day / untagged so the badge is hidden.
  const ticketDayLabel = (dayId?: string): string => {
    if (!markSeparateDays || !multiDayEligible || eventDays.length < 2) return "";
    if (!dayId) return "";
    if (dayId === ALL_DAYS_TICKET) return "All days";
    const idx = eventDays.findIndex((d) => d.dayId === dayId);
    if (idx < 0) return "";
    return eventDays[idx].title || `Day ${idx + 1}`;
  };

  // M4: duplicate a ticket → open the modal prefilled with a fresh copy
  // (new id, "(Copy)" suffix, zero sold) so the host can tweak + save.
  const duplicateTicket = (index: number) => {
    const src = tickets[index];
    if (!src) return;
    setTicketEditIndex(null); // brand-new ticket, not an edit
    setTicketCategory(src.ticketCategory);
    setTicketName(`${src.ticketName} (Copy)`);
    setTicketDayId(src.dayId ?? (multiCityEligible ? ALL_DAYS_TICKET : ""));
    setTicketType(src.ticketType);
    setTicketPrice(src.ticketPrice);
    setTicketCapacity(src.ticketCapacity);
    setCoverType(src.coverType);
    setTicketGST(src.ticketGST);
    setGstRate(src.gstRate);
    setGroupCapacity(src.groupCapacity);
    setMaxTicketPerUser(src.maxTicketPerUser);
    setTicketExpiryDateTime(src.ticketExpiryDateTime ?? "");
    setTicketComingSoon(src.markAsComingSoon);
    setTicketOnGroundOnly(src.markAsOnGroundOnly);
    setTicketVisible(src.ticketVisible);
    setTicketDescription(src.description ?? "");
    setTicketAdvancedOpen(true);
    setTicketModalOpen(true);
  };

  const stateOptions = useMemo(
    () =>
      Array.from(
        new Set(cityOptions.map((option) => option.state).filter(Boolean)),
      ).sort() as string[],
    [cityOptions],
  );

  const loadPlaceOptions = async (
    inputValue: string,
  ): Promise<PlacesType[]> => {
    if (!inputValue || inputValue.trim().length < 2) {
      return [];
    }
    try {
      const response = await sdk.AllPlaces({ input: inputValue });
      return (response.getPlacesList ?? []).map((place: any) => ({
        label: place.displayName,
        value: place.placeId,
      }));
    } catch {
      return [];
    }
  };

  const applyPlace = async (option: PlacesType | null) => {
    setSelectedPlace(option);
    if (!option?.value) {
      setCoords([]);
      return;
    }
    setManualLocationOpen(true);
    setSearchLoading(true);
    try {
      const response = await sdk.PlaceDetails({ placeId: option.value });
      const details = response.getPlaceDetails;
      if (!details) return;
      setCoords([details.latitude, details.longitude]);
      setAddressLine1(details.address ?? "");
      setAddressLine2("");
      setCity(details.city ?? city);
      setStateName(details.state ?? "");
      setPincode(details.zipcode ?? "");
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setSearchLoading(false);
    }
  };

  const selectCity = (value: string) => {
    setCity(value);
    const selected = cityOptions.find(
      (option) => option.value.toLowerCase() === value.toLowerCase(),
    );
    if (selected?.state) {
      setStateName(selected.state);
    }
  };

  const currentTicketDraft = (): TicketDraft => ({
    ticketCategory,
    ticketName,
    dayId:
      markSeparateDays && multiDayEligible && ticketDayId
        ? ticketDayId
        : undefined,
    ticketType,
    ticketCapacity: Number(ticketCapacity) || 0,
    ticketPrice: ticketCategory === "GUESTLIST" ? 0 : Number(ticketPrice) || 0,
    coverType,
    ticketGST,
    gstRate: Number(gstRate) || 0,
    groupCapacity: Number(groupCapacity) || 0,
    maxTicketPerUser: Number(maxTicketPerUser) || 10,
    ticketExpiryDateTime: ticketExpiryDateTime || undefined,
    markAsComingSoon: ticketComingSoon,
    markAsOnGroundOnly: ticketOnGroundOnly,
    ticketVisible,
    description: ticketDescription.trim() || undefined,
  });

  const ticketInputs = () => {
    if (!ticketingEnabled) return [];
    return tickets;
  };

  const resetTicketDraft = () => {
    const nextCategory: TicketCategoryValue =
      eventType === "FREE" ? "GUESTLIST" : "NORMAL";
    setTicketCategory(nextCategory);
    setTicketName("");
    setTicketType("SINGLE");
    setTicketPrice(0);
    setTicketCapacity(100);
    setCoverType("NO_COVER");
    // Default GST depends on host eligibility — eligible hosts get the
    // standard 18% pre-selected; everyone else stays at NONE (the only
    // legal option for them per SoT §4).
    setTicketGST(hostGstEligible ? "CGST_SGST_18" : "NONE");
    setGstRate(0);
    setGroupCapacity(4);
    // RSVP/Guestlist tickets default to a tight 2-per-user cap; paid tiers to
    // 10. Either default stays editable in the ticket form.
    setMaxTicketPerUser(defaultMaxPerUser(nextCategory));
    setTicketExpiryDateTime("");
    setTicketComingSoon(false);
    setTicketOnGroundOnly(false);
    setTicketVisible(true);
    setTicketDescription("");
    // Default a new ticket to "All days" (the festival pass) on a multi-day
    // event so it's valid across every day unless the host narrows it;
    // single-day events keep it empty.
    setTicketDayId(
      markSeparateDays && multiDayEligible && eventDays.length >= 2
        ? ALL_DAYS_TICKET
        : ""
    );
    setTicketAdvancedOpen(true);
  };

  const openTicketModal = (index?: number) => {
    if (typeof index === "number") {
      const ticket = tickets[index];
      if (!ticket) return;
      setTicketEditIndex(index);
      setTicketCategory(ticket.ticketCategory);
      setTicketName(ticket.ticketName);
      setTicketDayId(ticket.dayId ?? "");
      setTicketType(ticket.ticketType);
      setTicketPrice(ticket.ticketPrice);
      setTicketCapacity(ticket.ticketCapacity);
      setCoverType(ticket.coverType);
      setTicketGST(ticket.ticketGST);
      setGstRate(ticket.gstRate);
      setGroupCapacity(ticket.groupCapacity);
      setMaxTicketPerUser(ticket.maxTicketPerUser);
      setTicketExpiryDateTime(ticket.ticketExpiryDateTime ?? "");
      setTicketComingSoon(ticket.markAsComingSoon);
      setTicketOnGroundOnly(ticket.markAsOnGroundOnly);
      setTicketVisible(ticket.ticketVisible);
      setTicketDescription(ticket.description ?? "");
      setTicketAdvancedOpen(true);
    } else {
      setTicketEditIndex(null);
      resetTicketDraft();
    }
    setTicketModalOpen(true);
  };

  const closeTicketModal = () => {
    setTicketModalOpen(false);
    setTicketEditIndex(null);
    resetTicketDraft();
  };

  const saveTicketDraft = () => {
    const draft = currentTicketDraft();
    if (!draft.ticketName.trim()) {
      setToastData({ type: "error", message: "Ticket name is required." });
      return;
    }
    if (draft.ticketCapacity <= 0) {
      setToastData({
        type: "error",
        message: "Ticket capacity must be greater than 0.",
      });
      return;
    }
    if (draft.ticketCategory !== "GUESTLIST" && draft.ticketPrice <= 0) {
      setToastData({
        type: "error",
        message: "Paid tickets need a ticket price.",
      });
      return;
    }
    setTickets((current) => {
      if (ticketEditIndex === null) {
        return [...current, draft];
      }
      return current.map((ticket, index) =>
        index === ticketEditIndex
          ? { ...draft, _id: ticket._id, ticketSold: ticket.ticketSold }
          : ticket,
      );
    });
    closeTicketModal();
  };

  const toggleTicketVisibility = (index: number) => {
    setTickets((current) =>
      current.map((ticket, itemIndex) =>
        itemIndex === index
          ? { ...ticket, ticketVisible: !ticket.ticketVisible }
          : ticket,
      ),
    );
  };

  const requestTicketVisibilityToggle = (index: number) => {
    const ticket = tickets[index];
    if (!ticket) return;
    const nextVisible = !ticket.ticketVisible;
    setConfirmAction({
      title: nextVisible ? "Show ticket?" : "Hide ticket?",
      description: (
        <>
          {nextVisible ? "Show" : "Hide"} <strong>{ticket.ticketName}</strong>{" "}
          on the event page. This only changes availability in the draft; you
          can switch it back before saving.
        </>
      ),
      confirmLabel: nextVisible ? "Show ticket" : "Hide ticket",
      tone: nextVisible ? "default" : "warning",
      onConfirm: () => toggleTicketVisibility(index),
    });
  };

  const requestTicketDraftVisibilityChange = (checked: boolean) => {
    if (checked === ticketVisible) return;
    setConfirmAction({
      title: checked ? "Show this ticket?" : "Hide this ticket?",
      description: checked
        ? "This ticket will be visible once the ticket is saved. You can hide it again later."
        : "This ticket will stay hidden from customers once saved. You can show it again later.",
      confirmLabel: checked ? "Show ticket" : "Hide ticket",
      tone: checked ? "default" : "warning",
      onConfirm: () => setTicketVisible(checked),
    });
  };

  const requestTicketingChange = (checked: boolean) => {
    if (checked === ticketingEnabled) return;
    setConfirmAction({
      title: checked ? "Enable ticketing?" : "Disable ticketing?",
      description: checked
        ? "Customers will be able to claim or purchase tickets after this event is saved and published."
        : "Ticket sales and RSVP claims will be turned off for this event. Existing ticket drafts remain here if you enable ticketing again before saving.",
      confirmLabel: checked ? "Enable ticketing" : "Disable ticketing",
      tone: checked ? "default" : "warning",
      onConfirm: () => setTicketingEnabled(checked),
    });
  };

  const requestEventVisibilityChange = (checked: boolean) => {
    if (checked === isVisible) return;
    setConfirmAction({
      title: checked ? "Make event visible?" : "Hide event?",
      description: checked
        ? "The event will be visible to customers when it is saved. Drafts still need publishing before checkout opens."
        : "The event will be hidden from customers when it is saved. You can make it visible again later.",
      confirmLabel: checked ? "Make visible" : "Hide event",
      tone: checked ? "default" : "warning",
      onConfirm: () => setIsVisible(checked),
    });
  };

  const requestRemoveTicket = (index: number) => {
    const ticket = tickets[index];
    if (!ticket) return;
    setConfirmAction({
      title: "Remove ticket?",
      description: (
        <>
          Remove <strong>{ticket.ticketName}</strong> from this event. This is
          reversible only until you save the event.
        </>
      ),
      confirmLabel: "Remove ticket",
      tone: "danger",
      onConfirm: () =>
        setTickets((current) =>
          current.filter((_, itemIndex) => itemIndex !== index),
        ),
    });
  };

  const resetExtraDraft = () => {
    setExtraName("");
    setExtraDescription("");
    setExtraPrice(0);
    setExtraQuantity(50);
    setExtraImage("");
    setExtraType("OTHER");
  };

  const openExtraModal = (index?: number) => {
    if (typeof index === "number") {
      const extra = extras[index];
      if (!extra) return;
      setExtraEditIndex(index);
      setExtraName(extra.name);
      setExtraDescription(extra.description ?? "");
      setExtraPrice(extra.price);
      setExtraQuantity(extra.quantity);
      setExtraImage(extra.image ?? "");
      setExtraType(extra.type);
    } else {
      setExtraEditIndex(null);
      resetExtraDraft();
    }
    setExtraModalOpen(true);
  };

  const closeExtraModal = () => {
    setExtraModalOpen(false);
    setExtraEditIndex(null);
    resetExtraDraft();
  };

  const saveExtraDraft = () => {
    if (!extraName.trim()) {
      setToastData({ type: "error", message: "Extra name is required." });
      return;
    }
    if (extraPrice < 0) {
      setToastData({
        type: "error",
        message: "Extra price cannot be negative.",
      });
      return;
    }
    if (extraQuantity <= 0) {
      setToastData({
        type: "error",
        message: "Extra quantity must be greater than 0.",
      });
      return;
    }
    const draft: ExtraDraft = {
      name: extraName.trim(),
      description: extraDescription || undefined,
      price: Number(extraPrice),
      quantity: Number(extraQuantity),
      image: extraImage || undefined,
      type: extraType,
    };
    setExtras((current) => {
      if (extraEditIndex === null) {
        return [...current, draft];
      }
      return current.map((extra, index) =>
        index === extraEditIndex
          ? { ...draft, _id: extra._id, sold: extra.sold }
          : extra,
      );
    });
    closeExtraModal();
  };

  const requestRemoveExtra = (index: number) => {
    const extra = extras[index];
    if (!extra) return;
    setConfirmAction({
      title: "Remove add-on?",
      description: (
        <>
          Remove <strong>{extra.name}</strong> from this event. This is
          reversible only until you save the event.
        </>
      ),
      confirmLabel: "Remove add-on",
      tone: "danger",
      onConfirm: () =>
        setExtras((current) => current.filter((_, i) => i !== index)),
    });
  };

  const validateStep = (targetStep: number) => {
    if (targetStep === 0 && !eventType) return "Choose an event category.";
    if (targetStep === 1) {
      if (!eventFlyer) return "Event flyer is required.";
      if (!title.trim()) return "Event name is required.";
      if (description.length > 3800) {
        return "Event description must be 3800 characters or fewer.";
      }
      if (!isComingSoon && (!startDate || !endDate)) {
        return "Event start and end date are required.";
      }
      if (!isComingSoon && new Date(endDate) <= new Date(startDate)) {
        return "Event end must be after event start.";
      }
      if (markSeparateDays && multiDayEligible && daysError) {
        return daysError;
      }
    }
    if (targetStep === 2) {
      if (!city.trim()) return "City is required.";
      if (eventLocationDecided && !addressLine1.trim()) {
        return "Event address is required when venue is finalized.";
      }
    }
    if (targetStep === 3 && ticketingEnabled) {
      const variations = ticketInputs();
      if (!variations.length) return "Add at least one ticket variation.";
    }
    if (targetStep === 4 && lineupEnabled && !lineUpToBeAnnounced) {
      if (artists.length === 0) {
        return "Add at least one artist or enable “Lineup to be announced.”";
      }
      const incomplete = artists.find(
        (artist) => !artist.name.trim() || !artist.picture.trim(),
      );
      if (incomplete) {
        return "Every artist needs a stage name and a picture.";
      }
    }
    if (targetStep === 5) {
      if (!richTextToPlainText(ticketingTerms)) {
        return "Ticketing Terms & Conditions are required.";
      }
      if (!richTextToPlainText(refundPolicy)) {
        return "Refund Policy is required.";
      }
    }
    return null;
  };

  // ---- Collaborator modal helpers ---------------------------------------
  const resetCollabDraftFields = () => {
    setCollaboratorName("");
    setCollaboratorLinkId("");
    setCollaboratorQuery("");
    setCollaboratorSearchResults([]);
    setRequestCustomerListAccess(true);
    setHideOnEventPage(false);
    setAllowIssuingOfflineTickets(true);
    setSendTransactionalMails(false);
    setCanSeeMetrics(true);
    setCanRunCampaigns(true);
    setCanCreateOffers(true);
  };

  const openAddCollaboratorModal = () => {
    setCollabEditIndex(null);
    resetCollabDraftFields();
    setCollabModalOpen(true);
  };

  const openEditCollaboratorModal = (index: number) => {
    const entry = collaborators[index];
    if (!entry) return;
    setCollabEditIndex(index);
    setCollaboratorName(entry.name);
    setCollaboratorLinkId(entry.businessLinkId);
    setCollaboratorQuery("");
    setCollaboratorSearchResults([]);
    setRequestCustomerListAccess(entry.requestCustomerListAccess);
    setHideOnEventPage(entry.hideOnEventPage);
    setAllowIssuingOfflineTickets(entry.allowIssuingOfflineTickets);
    setSendTransactionalMails(entry.sendTransactionalMails);
    setCanSeeMetrics(entry.canSeeMetrics);
    setCanRunCampaigns(entry.canRunCampaigns);
    setCanCreateOffers(entry.canCreateOffers);
    setCollabModalOpen(true);
  };

  const closeCollabModal = () => {
    setCollabModalOpen(false);
    setCollabEditIndex(null);
    resetCollabDraftFields();
  };

  const saveCollaboratorDraft = () => {
    // Only enforce on-platform host for NEW additions. Legacy phantom
    // entries (loaded with no businessLinkId) can still be edited and
    // saved as long as they were already on the event — we don't want to
    // force the host to delete legacy data.
    const isLegacyEdit =
      collabEditIndex !== null &&
      collaborators[collabEditIndex] &&
      !collaborators[collabEditIndex].businessLinkId;

    if (!collaboratorLinkId && !isLegacyEdit) {
      setToastData({
        type: "error",
        message:
          "Pick an organizer from search. If they aren’t on Hoizr yet, use “Refer this organizer” instead.",
      });
      return;
    }
    if (!collaboratorName.trim()) {
      setToastData({
        type: "error",
        message: "Collaborator name is required.",
      });
      return;
    }
    const collabKey = collaboratorLinkId
      ? `id:${collaboratorLinkId}`
      : `name:${collaboratorName.trim().toLowerCase()}`;
    const duplicate = collaborators.some((entry, index) => {
      if (index === collabEditIndex) return false;
      const entryKey = entry.businessLinkId
        ? `id:${entry.businessLinkId}`
        : `name:${entry.name.trim().toLowerCase()}`;
      return entryKey === collabKey;
    });
    if (duplicate) {
      setToastData({
        type: "error",
        message: "This collaborator is already on the event.",
      });
      return;
    }
    const draft: CollaboratorEntry = {
      name: collaboratorName.trim(),
      businessLinkId: collaboratorLinkId,
      logo:
        collaboratorSearchResults.find(
          (host) => host._id === collaboratorLinkId,
        )?.logo ??
        (collabEditIndex !== null
          ? (collaborators[collabEditIndex]?.logo ?? null)
          : null),
      requestCustomerListAccess,
      hideOnEventPage,
      allowIssuingOfflineTickets,
      sendTransactionalMails,
      canSeeMetrics,
      canRunCampaigns,
      canCreateOffers,
    };
    setCollaborators((current) => {
      if (collabEditIndex === null) return [...current, draft];
      return current.map((existing, index) =>
        index === collabEditIndex ? draft : existing,
      );
    });
    closeCollabModal();
  };

  const requestRemoveCollaborator = (index: number) => {
    const target = collaborators[index];
    if (!target) return;
    setConfirmAction({
      title: "Remove collaborator?",
      description: (
        <>
          Remove <strong>{target.name || "this collaborator"}</strong> from this
          event. You can add them back later if they should co-run the event.
        </>
      ),
      confirmLabel: "Remove collaborator",
      tone: "danger",
      onConfirm: () =>
        setCollaborators((current) =>
          current.filter((_, itemIndex) => itemIndex !== index),
        ),
    });
  };

  const openReferralModalFromCollab = () => {
    setReferralHostName(collaboratorQuery.trim());
    setReferralHostContact("");
    setReferralModalOpen(true);
  };

  const closeReferralModal = () => {
    setReferralModalOpen(false);
    setReferralHostName("");
    setReferralHostContact("");
  };

  const submitReferral = () => {
    if (!referralHostName.trim()) {
      setToastData({ type: "error", message: "Organizer name is required." });
      return;
    }
    if (!referralHostContact.trim()) {
      setToastData({
        type: "error",
        message: "Add an email or phone so the team can reach this organizer.",
      });
      return;
    }
    // Capture-only for now. Backend referral endpoint + credit math lives
    // in a follow-up task — see AI_TASKS.csv TASK-006 ai_handoff_context.
    // eslint-disable-next-line no-console
    console.info("[referral capture]", {
      hostName: referralHostName.trim(),
      hostContact: referralHostContact.trim(),
      referringHostId: selectedHostId,
      eventId,
    });
    setToastData({
      type: "success",
      message: `We’ll invite ${referralHostName.trim()} to Hoizr. You can collaborate with them once they join.`,
    });
    closeReferralModal();
  };

  // ---- Artist modal helpers ---------------------------------------------
  const resetArtistDraftFields = () => {
    setArtistQuery("");
    setArtistSearchResults([]);
    setArtistSearchAttempted(false);
    setArtistLinkId("");
    setTempArtistId("");
    setArtistActualName("");
    setArtistName("");
    setArtistPicture("");
    setPendingArtistFile(null);
    setArtistInstagram("");
    setArtistSpotify("");
    setArtistYoutube("");
  };

  const openAddArtistModal = () => {
    setArtistEditIndex(null);
    resetArtistDraftFields();
    setArtistModalOpen(true);
  };

  const openEditArtistModal = (index: number) => {
    const entry = artists[index];
    if (!entry) return;
    setArtistEditIndex(index);
    setArtistQuery("");
    setArtistSearchResults([]);
    setArtistSearchAttempted(true);
    setArtistName(entry.name);
    setArtistActualName(entry.actualName ?? entry.name);
    setArtistPicture(entry.picture);
    setArtistLinkId(entry.artistLinkId ?? "");
    setTempArtistId(entry.tempArtistId ?? "");
    setArtistInstagram(entry.instagramLink ?? "");
    setArtistSpotify(entry.spotifyLink ?? "");
    setArtistYoutube(entry.youtubeLink ?? "");
    setArtistModalOpen(true);
  };

  const closeArtistModal = () => {
    setArtistModalOpen(false);
    setArtistEditIndex(null);
    resetArtistDraftFields();
  };

  const [artistSaving, setArtistSaving] = useState(false);
  const saveArtistDraft = async () => {
    if (!artistName.trim()) {
      setToastData({ type: "error", message: "Stage name is required." });
      return;
    }
    if (!artistPicture.trim() && !pendingArtistFile) {
      setToastData({ type: "error", message: "Artist picture is required." });
      return;
    }
    const artistKey = artistLinkId
      ? `artist:${artistLinkId}`
      : tempArtistId
        ? `temp:${tempArtistId}`
        : `name:${artistName.trim().toLowerCase()}`;
    const duplicate = artists.some((entry, index) => {
      if (index === artistEditIndex) return false;
      const entryKey = entry.artistLinkId
        ? `artist:${entry.artistLinkId}`
        : entry.tempArtistId
          ? `temp:${entry.tempArtistId}`
          : `name:${entry.name.trim().toLowerCase()}`;
      return entryKey === artistKey;
    });
    if (duplicate) {
      setToastData({
        type: "error",
        message: "This artist is already in the lineup.",
      });
      return;
    }

    // Deferred upload: ImageUrlInput captured a File but left it pending so
    // we don't burn Cloudinary requests on every drop. Push it up now,
    // right before the artist row gets committed.
    let resolvedPicture = artistPicture;
    if (pendingArtistFile) {
      setArtistSaving(true);
      try {
        const resolvedHostId =
          selectedHostId || (await awaitSelectedHostId());
        if (!resolvedHostId) {
          setToastData({
            type: "error",
            message: `We couldn't load your ${hostLabel.lower} context. Refresh and try again.`,
          });
          setArtistSaving(false);
          return;
        }
        const result = await uploadHostAsset({
          kind: "event-extra",
          hostId: resolvedHostId,
          eventId,
          file: pendingArtistFile,
        });
        resolvedPicture = result.secureUrl;
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
        setArtistSaving(false);
        return;
      } finally {
        setArtistSaving(false);
      }
    }

    const draft: ArtistEntry = {
      name: artistName.trim(),
      actualName: artistActualName.trim() || undefined,
      picture: resolvedPicture,
      artistLinkId: artistLinkId || undefined,
      tempArtistId: tempArtistId || undefined,
      instagramLink: artistInstagram || undefined,
      spotifyLink: artistSpotify || undefined,
      youtubeLink: artistYoutube || undefined,
    };
    setArtists((current) => {
      if (artistEditIndex === null) return [...current, draft];
      return current.map((existing, index) =>
        index === artistEditIndex ? draft : existing,
      );
    });
    closeArtistModal();
  };

  const requestRemoveArtist = (index: number) => {
    const target = artists[index];
    if (!target) return;
    setConfirmAction({
      title: "Remove artist?",
      description: (
        <>
          Remove <strong>{target.name || "this artist"}</strong> from the
          lineup. You can add them back later if they should appear on the event
          page.
        </>
      ),
      confirmLabel: "Remove artist",
      tone: "danger",
      onConfirm: () =>
        setArtists((current) =>
          current.filter((_, itemIndex) => itemIndex !== index),
        ),
    });
  };

  const searchArtists = async () => {
    if (artistQuery.trim().length < 2) {
      setArtistSearchResults([]);
      setArtistSearchAttempted(false);
      return;
    }
    try {
      const response = await sdk.searchEventArtists({
        search: artistQuery.trim(),
      });
      setArtistSearchResults(response.searchEventArtists ?? []);
      setArtistSearchAttempted(true);
    } catch (error) {
      setArtistSearchAttempted(true);
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  const selectArtist = (artist: ArtistSearchResult) => {
    setArtistName(artist.name ?? "");
    setArtistActualName(
      [artist.firstName, artist.lastName].filter(Boolean).join(" ") ||
        artist.name ||
        "",
    );
    setArtistPicture(artist.picture ?? "");
    setArtistInstagram(artist.instagramLink ?? "");
    setArtistSpotify(artist.spotifyLink ?? "");
    setArtistYoutube(artist.youtubeLink ?? "");
    setArtistLinkId(artist.artistLinkId ?? "");
    setTempArtistId(artist.tempArtistId ?? "");
    setArtistSearchAttempted(true);
  };

  const searchCollaborators = async () => {
    if (collaboratorQuery.trim().length < 2) {
      setCollaboratorSearchResults([]);
      return;
    }
    try {
      const response = await sdk.searchCollaboratorHosts({
        search: collaboratorQuery.trim(),
      });
      setCollaboratorSearchResults(response.searchCollaboratorHosts ?? []);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  const selectCollaborator = (host: CollaboratorSearchResult) => {
    setCollaboratorName(host.name ?? "");
    setCollaboratorLinkId(host._id);
  };

  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await sdk.getActiveIndianCities();
        setCityOptions(response?.getActiveIndianCities ?? []);
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      }
    };

    loadCities();
  }, [setToastData]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res: any = await sdk.getActiveGenreTags();
        if (!cancelled && Array.isArray(res?.getActiveGenreTags)) {
          setAllGenres(
            res.getActiveGenreTags.map((g: any) => ({
              _id: String(g._id),
              value: String(g.value),
            })),
          );
        }
      } catch {
        // genre list is optional UX — silent fail.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Determine host GST eligibility once on mount. Only REGULAR /
  // CASUAL_TAXABLE_PERSON hosts may charge ticket GST per SoT §4 — every
  // other host gets the GST Type selector hidden + ticket GST forced to
  // NONE. Server enforces the same rule so even if a stale UI sends a
  // GST value, the save is force-corrected.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res: any = await sdk.hostPayoutAccounts();
        if (cancelled) return;
        const accounts: any[] = Array.isArray(res?.hostPayoutAccounts)
          ? res.hostPayoutAccounts
          : [];
        const primary =
          accounts.find((a) => a?.isPrimary && a?.isActive !== false) ??
          accounts.find((a) => a?.isActive !== false);
        const type = primary?.gstRegistrationType;
        const eligible =
          !!primary?.isGstRegistered &&
          !!primary?.gstin &&
          (type === "Regular" || type === "CasualTaxablePerson");
        setHostGstEligible(eligible);
      } catch {
        setHostGstEligible(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      searchArtists();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [artistQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      searchCollaborators();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [collaboratorQuery]);

  // Pricing/offer selection no longer lives in the wizard; the publish
  // modal handles it inline.

  const handleCropImageFile = (file: File | undefined, mode: FlyerCropMode) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToastData({ type: "error", message: "Please upload an image file." });
      return;
    }
    if (file.size > flyerMaxFileSizeBytes) {
      setToastData({
        type: "error",
        message: "Event image must be 1.5 MB or smaller.",
      });
      return;
    }
    if (flyerPreview) {
      URL.revokeObjectURL(flyerPreview);
    }
    setFlyerCropMode(mode);
    setFlyerFile(file);
    setFlyerPreview(URL.createObjectURL(file));
    setFlyerNaturalRatio(null);
    setCropZoom(0);
    setCropX(50);
    setCropY(50);
    setFlyerCropOpen(true);
  };

  const handleFlyerFile = (file?: File) => {
    handleCropImageFile(file, "event");
  };

  const handleHorizontalFlyerFile = (file?: File) => {
    handleCropImageFile(file, "horizontal");
  };

  const clearFlyerSelection = () => {
    if (flyerPreview) {
      URL.revokeObjectURL(flyerPreview);
    }
    setFlyerFile(null);
    setFlyerPreview("");
    setFlyerNaturalRatio(null);
    setFlyerCropOpen(false);
    setCropZoom(0);
    setCropX(50);
    setCropY(50);
  };

  const removeEventFlyer = () => {
    clearFlyerSelection();
    setEventFlyer("");
  };

  const removeHorizontalFlyer = () => {
    clearFlyerSelection();
    setHorizontalFlyer("");
  };

  const validateVerticalVideoFile = async (file: File, label: string) => {
    if (!videoMimeTypes.has(file.type)) {
      throw new Error(`${label} must be an MP4 or MOV file.`);
    }
    if (file.size > eventVideoMaxFileSizeBytes) {
      throw new Error(`${label} must be 5 MB or smaller.`);
    }
    const meta = await readVideoMetadata(file);
    if (
      !isWithinAspectRatio(meta.width, meta.height, verticalMediaRatio)
    ) {
      throw new Error(`${label} must be a vertical 3:4 video.`);
    }
    if (
      meta.duration < eventVideoMinDurationSeconds ||
      meta.duration > eventVideoMaxDurationSeconds
    ) {
      throw new Error(`${label} must be 10 to 60 seconds long.`);
    }
  };

  const validateGalleryImageFile = (file: File) => {
    if (!imageMimeTypes.has(file.type)) {
      throw new Error("Gallery images must be JPG or PNG files.");
    }
    if (file.size > eventImageMaxFileSizeBytes) {
      throw new Error("Gallery images must be 1.5 MB or smaller.");
    }
  };

  const uploadSneakPeekFile = async (file?: File) => {
    if (!file || uploadingSneakPeek) return;
    setUploadingSneakPeek(true);
    try {
      await validateVerticalVideoFile(file, "Sneak peek video");
      const hostId = selectedHostId || (await awaitSelectedHostId());
      if (!hostId) {
        throw new Error(
          `We couldn't load your ${hostLabel.lower} context. Refresh the page and try again.`,
        );
      }
      const result = await uploadHostAsset({
        kind: "event-sneak-peek",
        hostId,
        eventId,
        file,
        previousUrl: videoSneakPeek,
        resourceType: "video",
      });
      setVideoSneakPeek(result.secureUrl);
      setToastData({ type: "success", message: "Sneak peek video uploaded" });
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setUploadingSneakPeek(false);
    }
  };

  const uploadGalleryFiles = async (files?: FileList | File[]) => {
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length || uploadingGallery) return;
    const remainingSlots = maxEventGalleryItems - galleryItems.length;
    if (selectedFiles.length > remainingSlots) {
      setToastData({
        type: "error",
        message: `Gallery can include up to ${maxEventGalleryItems} items.`,
      });
      return;
    }

    setUploadingGallery(true);
    try {
      const hostId = selectedHostId || (await awaitSelectedHostId());
      if (!hostId) {
        throw new Error(
          `We couldn't load your ${hostLabel.lower} context. Refresh the page and try again.`,
        );
      }

      const uploaded: EventGalleryItemDraft[] = [];
      for (const file of selectedFiles) {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) {
          throw new Error("Gallery items must be image, MP4, or MOV files.");
        }
        if (isImage) validateGalleryImageFile(file);
        if (isVideo) await validateVerticalVideoFile(file, "Gallery video");

        const result = await uploadHostAsset({
          kind: "event-gallery",
          hostId,
          eventId,
          file,
          resourceType: isVideo ? "video" : "image",
        });
        uploaded.push({
          url: result.secureUrl,
          type: isVideo ? "VIDEO" : "IMAGE",
        });
      }
      setGalleryItems((current) => [...current, ...uploaded]);
      setToastData({
        type: "success",
        message:
          uploaded.length === 1
            ? "Gallery item uploaded"
            : `${uploaded.length} gallery items uploaded`,
      });
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setUploadingGallery(false);
    }
  };

  const cropFlyerToBlob = async (file: File): Promise<Blob> => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    // Use the same crop-window math as the preview overlay. The overlay
    // sits over the displayed image with width/height expressed in % of
    // image bounds and left/top in % of available offset — mapping those
    // % values straight onto natural pixel space gives a canvas cut that
    // matches exactly what the user saw in the preview.
    const naturalRatio = image.width / image.height;
    const target = flyerCropTargets[flyerCropMode];
    const targetRatio = target.width / target.height;
    const cropScale = flyerCropScaleFromPercent(cropZoom);
    const widthPctOfImg =
      (naturalRatio >= targetRatio ? (targetRatio / naturalRatio) * 100 : 100) /
      cropScale;
    const heightPctOfImg =
      (naturalRatio >= targetRatio ? 100 : (naturalRatio / targetRatio) * 100) /
      cropScale;
    const sourceWidth = image.width * (widthPctOfImg / 100);
    const sourceHeight = image.height * (heightPctOfImg / 100);
    const maxX = Math.max(0, image.width - sourceWidth);
    const maxY = Math.max(0, image.height - sourceHeight);
    const sourceX = maxX * (cropX / 100);
    const sourceY = maxY * (cropY / 100);
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to crop event flyer");
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      target.width,
      target.height,
    );
    URL.revokeObjectURL(imageUrl);

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("Unable to crop event flyer")),
        "image/jpeg",
        0.9,
      );
    });
  };

  const saveFlyerCrop = async () => {
    if (!flyerFile) return;
    setUploadingFlyer(true);
    try {
      const hostId = await awaitSelectedHostId();
      const target = flyerCropTargets[flyerCropMode];
      if (!hostId) {
        setToastData({
          type: "error",
          message:
            `We couldn't load your ${hostLabel.lower} context. Refresh the page and try again.`,
        });
        setUploadingFlyer(false);
        return;
      }
      const croppedBlob = await cropFlyerToBlob(flyerFile);
      const file = new File([croppedBlob], target.fileName, {
        type: "image/jpeg",
      });
      const result = await uploadHostAsset({
        kind: target.uploadKind,
        hostId,
        eventId,
        file,
        previousUrl:
          flyerCropMode === "event" ? eventFlyer : horizontalFlyer,
      });
      if (flyerCropMode === "event") {
        setEventFlyer(result.secureUrl);
      } else {
        setHorizontalFlyer(result.secureUrl);
      }
      clearFlyerSelection();
      setToastData({ type: "success", message: target.successMessage });
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setUploadingFlyer(false);
    }
  };

  const copyHostAddress = async () => {
    try {
      const response = await sdk.restaurantDetails();
      const host = response.restaurantDetails;
      if (!host?.address) {
        setToastData({
          type: "error",
          message: "Venue address is not available",
        });
        return;
      }
      setSelectedPlace(
        host.address.place?.placeId
          ? {
              label:
                host.address.place.displayName ??
                host.address.addressLine1 ??
                "",
              value: host.address.place.placeId,
            }
          : null,
      );
      setAddressLine1(host.address.addressLine1 ?? "");
      setAddressLine2(host.address.addressLine2 ?? "");
      setCity(host.address.city ?? city);
      setStateName(host.address.state ?? "");
      setPincode(host.address.pincode ?? "");
      setCoords(host.address.coordinate?.coordinates ?? []);
      setEventLocationDecided(true);
      setManualLocationOpen(true);
      setToastData({ type: "success", message: "Venue address copied" });
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    }
  };

  useEffect(() => {
    const loadEvent = async () => {
      setFetching(true);
      try {
        const response = await sdk.getEvent({ id: eventId });
        const event = response?.getEvent;
        if (!event) {
          setToastData({ type: "error", message: "Event not found" });
          router.replace("/events");
          return;
        }

        setStatus(event.status ?? "DRAFT");
        setFirstStepCompleted(Boolean(event.firstStepCompleted));
        setTitle(event.title ?? "");
        setDescription(event.description ?? "");
        setSelectedGenreIds(
          Array.isArray(event.genreTagIds) ? event.genreTagIds.map(String) : [],
        );
        setEventFlyer(event.eventFlyer ?? "");
        setEventType(
          normalizeEnum<EventTypeValue>(event.eventType?.[0], "FREE"),
        );
        setIsComingSoon(Boolean(event.isComingSoon));
        setStartDate(toDateTimeInput(event.startDate));
        setEndDate(toDateTimeInput(event.endDate));
        setMarkSeparateDays(Boolean(event.markSeparateDays));
        setMultiCity(Boolean((event as any).multiCity));
        // Rehydrate days WITH their server dayIds so the ticket "Valid for"
        // picker keeps matching them (re-minting would orphan ticket dayIds).
        setEventDays(
          Array.isArray((event as any).days)
            ? (event as any).days.map((d: any) => ({
                dayId: d.dayId,
                title: d.title ?? "",
                startDate: toDateTimeInput(d.startDate),
                endDate: toDateTimeInput(d.endDate),
                location: d.location?.addressLine1
                  ? {
                      addressLine1: d.location.addressLine1 ?? "",
                      city: d.location.city ?? "",
                      state: d.location.state ?? undefined,
                      pincode: d.location.pincode ?? undefined,
                    }
                  : undefined,
              }))
            : []
        );
        setIsVisible(event.isVisible !== false);
        setCity(event.city ?? "");
        setEventLocationDecided(event.eventLocationDecided !== false);
        setAddressLine1(event.location?.addressLine1 ?? "");
        setAddressLine2(event.location?.addressLine2 ?? "");
        setStateName(event.location?.state ?? "");
        setPincode(event.location?.pincode ?? "");
        setCoords(event.location?.coordinate?.coordinates ?? []);
        setManualLocationOpen(
          Boolean(
            event.location?.place?.placeId ||
            event.location?.addressLine1 ||
            event.city,
          ),
        );
        setSelectedPlace(
          event.location?.place?.placeId
            ? {
                label:
                  event.location.place.displayName ??
                  event.location.addressLine1 ??
                  "",
                value: event.location.place.placeId,
              }
            : null,
        );
        setTicketingEnabled(event.ticketingEnabled !== false);
        setAllowWalkIns(Boolean(event.allowWalkIns));
        setRequiresIDVerification(Boolean(event.requiresIDVerification));
        setTicketSalesStartDate(toDateTimeInput(event.ticketSalesStartDate));
        setTicketSalesEndDate(toDateTimeInput(event.ticketSalesEndDate));
        setTicketingTerms(
          richTextToPlainText(event.ticketingTerms ?? "")
            ? (event.ticketingTerms ?? DEFAULT_TICKETING_TERMS)
            : DEFAULT_TICKETING_TERMS,
        );
        setRefundPolicy(
          richTextToPlainText(event.refundPolicy ?? "")
            ? (event.refundPolicy ?? DEFAULT_REFUND_POLICY)
            : DEFAULT_REFUND_POLICY,
        );
        setSelectedPricingOptionId(event.pricingSnapshot?.optionId ?? "");
        if (event.feeSettlementMode) {
          setFeeSettlementMode(
            normalizeEnum<"DEDUCT_FROM_PAYOUT" | "PAY_AFTER_EVENT">(
              event.feeSettlementMode,
              "DEDUCT_FROM_PAYOUT",
            ),
          );
        }
        setContactForQueriesTables(event.contactForQueriesTables ?? "");
        setInstagramPost(event.instagramPost ?? "");
        setInstagramStory(event.instagramStory ?? "");
        setTableLayoutImage(event.tableLayoutImage ?? "");
        setHorizontalFlyer((event as any).horizontalFlyer ?? "");
        setVideoSneakPeek((event as any).videoSneakPeek ?? "");
        setGalleryItems(galleryFromEvent((event as any).gallery));
        setVerticalVideo(event.verticalVideo ?? "");
        setHorizontalVideo(event.horizontalVideo ?? "");
        setAdditionalDetails(additionalDetailsFromEvent(event));

        const mappedTickets =
          event.tickets?.map((ticket: any) => ({
            _id: ticket._id,
            ticketCategory: normalizeEnum<TicketCategoryValue>(
              ticket.ticketCategory,
              "GUESTLIST",
            ),
            ticketName: ticket.ticketName ?? "General Entry",
            dayId: ticket.dayId ?? undefined,
            ticketType: normalizeEnum<TicketTypeValue>(
              ticket.ticketType,
              "SINGLE",
            ),
            ticketCapacity: Number(ticket.ticketCapacity ?? 100),
            ticketPrice: Number(ticket.ticketPrice ?? 0),
            ticketInfo: ticket.ticketInfo ?? "",
            coverType: normalizeEnum<CoverTypeValue>(
              ticket.coverType,
              "NO_COVER",
            ),
            ticketGST: normalizeEnum<GstValue>(ticket.ticketGST, "NONE"),
            gstRate: Number(ticket.gstRate ?? 0),
            groupCapacity: Number(ticket.groupCapacity ?? 4),
            maxTicketPerUser: Number(ticket.maxTicketPerUser ?? 10),
            ticketExpiryDateTime: toDateTimeInput(ticket.ticketExpiryDateTime),
            markAsComingSoon: Boolean(ticket.markAsComingSoon),
            markAsOnGroundOnly: Boolean(ticket.markAsOnGroundOnly),
            ticketVisible: ticket.ticketVisible !== false,
            ticketSold: Number(ticket.ticketSold ?? 0),
            description: (ticket as any).description ?? undefined,
          })) ?? [];
        setTickets(mappedTickets);

        const mappedExtras =
          event.extras?.map((extra: any) => ({
            _id: extra._id,
            name: extra.name ?? "",
            description: extra.description ?? "",
            price: Number(extra.price ?? 0),
            quantity: Number(extra.quantity ?? 0),
            sold: Number(extra.sold ?? 0),
            image: extra.image ?? "",
            type: (extra.type ?? "OTHER") as HoizrExtraTypeValue,
            linkedTicketTypes: extra.linkedTicketTypes ?? [],
          })) ?? [];
        setExtras(mappedExtras);

        const ticket = mappedTickets[0];
        if (ticket) {
          resetTicketDraft();
        }

        const loadedArtists: ArtistEntry[] = (event.lineup ?? []).map(
          (artist: any) => ({
            name: artist?.name ?? "",
            picture: artist?.picture ?? "",
            artistLinkId: artist?.artistLinkId ?? "",
            tempArtistId: artist?.tempArtistId ?? "",
            instagramLink: artist?.instagramLink ?? "",
            spotifyLink: artist?.spotifyLink ?? "",
            youtubeLink: artist?.youtubeLink ?? "",
          }),
        );
        setArtists(loadedArtists);
        if (loadedArtists.length > 0) setLineupEnabled(true);
        setLineUpToBeAnnounced(Boolean(event.lineUpToBeAnnounced));

        // Load all collaborators. Legacy off-platform "phantom" collabs
        // (no businessLinkId) are kept on edit so we don't silently drop
        // legacy data; the modal blocks adding new ones without a host
        // selection.
        const loadedCollabs: CollaboratorEntry[] = (
          event.eventCollaborationBusiness ?? []
        ).map((collab: any) => ({
          name: collab?.name ?? "",
          businessLinkId: collab?.businessLinkId ?? "",
          logo: collab?.logo ?? null,
          requestCustomerListAccess:
            collab?.requestCustomerListAccess !== false,
          hideOnEventPage: Boolean(collab?.hideOnEventPage),
          allowIssuingOfflineTickets: Boolean(
            collab?.allowIssuingOfflineTickets,
          ),
          sendTransactionalMails: Boolean(collab?.sendTransactionalMails),
          canSeeMetrics: collab?.canSeeMetrics !== false,
          canRunCampaigns: collab?.canRunCampaigns !== false,
          canCreateOffers: collab?.canCreateOffers !== false,
        }));
        setCollaborators(loadedCollabs);

        // Resume the wizard at the furthest step the user has reached.
        // Without this, re-mounting (e.g. after the host adds a payout
        // and returns to /events/[id]) drops the user back to step 0
        // ("Event Category"), making it feel like the wizard "keeps
        // redirecting to the event type page".
        if (mode === "create") {
          const hasTickets = (event.tickets?.length ?? 0) > 0;
          const hasLineupOrCollab =
            (event.lineup?.length ?? 0) > 0 ||
            (event.eventCollaborationBusiness?.length ?? 0) > 0 ||
            Boolean(event.lineUpToBeAnnounced);
          const hasLocation = Boolean(
            event.city ||
            event.location?.addressLine1 ||
            event.location?.place?.placeId,
          );
          // Only treat Basic Details as done when the server-managed
          // firstStepCompleted flag is true. Previously a pre-filled
          // placeholder title ("Untitled Event" written at createEvent
          // time) made hasBasics truthy, so brand-new drafts jumped
          // straight to step 1 instead of step 0 (Event Category).
          const basicDetailsCompleted = Boolean(event.firstStepCompleted);

          let resumeStep = 0;
          if (hasTickets) resumeStep = 3;
          else if (hasLocation) resumeStep = 2;
          else if (basicDetailsCompleted) resumeStep = 1;
          if (hasLineupOrCollab) resumeStep = Math.max(resumeStep, 4);

          if (resumeStep > 0) {
            setStep(resumeStep);
            setMaxStep((current) => Math.max(current, resumeStep));
          }
        }
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        setFetching(false);
      }
    };

    if (eventId) loadEvent();
  }, [eventId, router, setToastData]);

  // Load host's saved defaults for Ticketing Terms + Refund Policy and
  // prefill them on create mode if the event itself hasn't set them.
  // Update mode never overwrites existing event content — we only fill
  // empty fields.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await sdk.getMyHostContentDefaults();
        if (cancelled) return;
        const defaults = res?.getMyHostContentDefaults;
        if (!defaults) {
          setHostDefaultsLoaded(true);
          return;
        }
        hostDefaultsRef.current = {
          ticketingTerms: defaults.ticketingTerms ?? "",
          refundPolicy: defaults.refundPolicy ?? "",
        };
        setTicketingTerms((current) =>
          shouldReplaceRichDefault(current, DEFAULT_TICKETING_TERMS)
            ? defaults.ticketingTerms || DEFAULT_TICKETING_TERMS
            : current,
        );
        setRefundPolicy((current) =>
          shouldReplaceRichDefault(current, DEFAULT_REFUND_POLICY)
            ? defaults.refundPolicy || DEFAULT_REFUND_POLICY
            : current,
        );
        setHostDefaultsLoaded(true);
      } catch {
        // No defaults yet (first event) or transient failure — host
        // simply types their first version; we save it on publish.
        if (!cancelled) setHostDefaultsLoaded(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    formScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  const buildEventInput = (
    details: AdditionalDetailsState = additionalDetails,
  ) => {
    const normalizedAdditionalDetails = normalizeAdditionalDetails(details);

    return {
      title: title || undefined,
      description: description || undefined,
      eventFlyer: eventFlyer || undefined,
      eventType: [eventType],
      isComingSoon,
      startDate:
        !isComingSoon && startDate ? fromZonedTime(startDate, IST_TZ) : undefined,
      endDate:
        !isComingSoon && endDate ? fromZonedTime(endDate, IST_TZ) : undefined,
      markSeparateDays: multiDayEligible ? markSeparateDays : false,
      // Multi-city: each day carries its own venue (only when multi-day).
      multiCity: multiCityEligible ? multiCity : false,
      // Send days[] only for an eligible multi-day event; otherwise [] so the
      // server collapses to single-day and strips ticket dayIds.
      days:
        multiDayEligible && markSeparateDays
          ? eventDays.map((d) => ({
              dayId: d.dayId,
              title: d.title,
              startDate: fromZonedTime(d.startDate, IST_TZ),
              endDate: fromZonedTime(d.endDate, IST_TZ),
              // Per-day venue only when multi-city is on AND the day has one.
              location:
                multiCity && d.location?.addressLine1?.trim()
                  ? {
                      addressLine1: d.location.addressLine1.trim(),
                      city: d.location.city?.trim() || undefined,
                      state: d.location.state?.trim() || undefined,
                      pincode: d.location.pincode?.trim() || undefined,
                      formattedAddress: d.location.addressLine1.trim(),
                    }
                  : undefined,
            }))
          : [],
      isVisible,
      city: city || undefined,
      eventLocationDecided,
      location: eventLocationDecided
        ? {
            addressLine1: addressLine1 || undefined,
            addressLine2: addressLine2 || undefined,
            city: city || undefined,
            state: stateName || undefined,
            pincode: pincode || undefined,
            formattedAddress: addressLine1 || undefined,
            coordinate: coords.length
              ? {
                  type: "Point",
                  coordinates: coords,
                }
              : undefined,
            place: selectedPlace
              ? {
                  displayName: selectedPlace.label,
                  placeId: selectedPlace.value,
                }
              : undefined,
          }
        : undefined,
      ticketingEnabled,
      allowWalkIns,
      requiresIDVerification,
      ticketSalesStartDate: ticketSalesStartDate
        ? fromZonedTime(ticketSalesStartDate, IST_TZ)
        : undefined,
      ticketSalesEndDate: ticketSalesEndDate
        ? fromZonedTime(ticketSalesEndDate, IST_TZ)
        : undefined,
      ticketingTerms: ticketingTerms || undefined,
      refundPolicy: refundPolicy || undefined,
      instagramPost: instagramPost || null,
      instagramStory: instagramStory || null,
      tableLayoutImage: tableLayoutImage || null,
      // `|| null` (not undefined) so the server actually clears the
      // field — buildEventUpdateFromInput drops keys with `undefined`
      // values, which silently no-ops a "host removed the image"
      // edit. videoSneakPeek already does this; the others matched.
      horizontalFlyer: horizontalFlyer || null,
      videoSneakPeek: videoSneakPeek || null,
      gallery: galleryItems.map((item) => ({
        url: item.url,
        type: item.type,
      })),
      verticalVideo: verticalVideo || undefined,
      horizontalVideo: horizontalVideo || undefined,
      contactForQueriesTables: contactForQueriesTables || undefined,
      expectedEventsDoneTillNow: 0,
      genreTagIds: selectedGenreIds.length ? selectedGenreIds : undefined,
      tickets: ticketingEnabled
        ? ticketInputs().map((ticket) => ({
            _id: ticket._id,
            ticketCategory: ticket.ticketCategory,
            ticketName: ticket.ticketName,
            // Per-day tag only on a multi-day event; cleared otherwise.
            dayId:
              multiDayEligible && markSeparateDays
                ? ticket.dayId || undefined
                : undefined,
            ticketType: ticket.ticketType,
            ticketCapacity: Number(ticket.ticketCapacity),
            ticketPrice:
              ticket.ticketCategory === "GUESTLIST"
                ? 0
                : Number(ticket.ticketPrice),
            ticketInfo: ticket.ticketInfo || undefined,
            maxTicketPerUser: Number(ticket.maxTicketPerUser) || 10,
            ticketExpiryDateTime: ticket.ticketExpiryDateTime
              ? fromZonedTime(ticket.ticketExpiryDateTime, IST_TZ)
              : undefined,
            coverType:
              ticket.ticketCategory === "GUESTLIST"
                ? undefined
                : ticket.coverType,
            ticketGST:
              ticket.ticketCategory === "GUESTLIST"
                ? undefined
                : ticket.ticketGST,
            gstRate:
              ticket.ticketGST === "OTHER"
                ? Number(ticket.gstRate)
                : undefined,
            markAsComingSoon: ticket.markAsComingSoon,
            markAsOnGroundOnly: ticket.markAsOnGroundOnly,
            groupCapacity:
              ticket.ticketCategory === "GROUP"
                ? Number(ticket.groupCapacity)
                : undefined,
            ticketVisible: ticket.ticketVisible,
            description: ticket.description?.trim() || undefined,
          }))
        : undefined,
      lineup:
        lineupEnabled && artists.length > 0
          ? artists.map((artist) => ({
              name: artist.name,
              picture: artist.picture || undefined,
              artistLinkId: artist.artistLinkId || undefined,
              tempArtistId: artist.tempArtistId || undefined,
              instagramLink: artist.instagramLink || undefined,
              spotifyLink: artist.spotifyLink || undefined,
              youtubeLink: artist.youtubeLink || undefined,
            }))
          : undefined,
      lineUpToBeAnnounced,
      eventCollaborationBusiness:
        collaborators.length > 0
          ? collaborators.map((collab) => ({
              name: collab.name,
              businessLinkId: collab.businessLinkId || undefined,
              logo: collab.logo || undefined,
              requestCustomerListAccess: collab.requestCustomerListAccess,
              hideOnEventPage: collab.hideOnEventPage,
              allowIssuingOfflineTickets: collab.allowIssuingOfflineTickets,
              sendTransactionalMails: collab.sendTransactionalMails,
              canSeeMetrics: collab.canSeeMetrics,
              canRunCampaigns: collab.canRunCampaigns,
              canCreateOffers: collab.canCreateOffers,
            }))
          : undefined,
      extras: extras.map((extra) => ({
        _id: extra._id,
        name: extra.name,
        description: extra.description || undefined,
        price: Number(extra.price),
        quantity: Number(extra.quantity),
        image: extra.image || undefined,
        type: extra.type,
      })),
      eventGuide: normalizedAdditionalDetails.eventGuide,
      faqs: normalizedAdditionalDetails.faqs,
      eventInstructions: normalizedAdditionalDetails.eventInstructions,
      prohibitedItems: normalizedAdditionalDetails.prohibitedItems,
    };
  };

  const saveCurrentStep = async (nextStep = step + 1) => {
    // Surface day-level validation inline once the host actually tries to
    // proceed from the basic-details step (the dates + day editor live there).
    if (step === 1) setDaysSaveAttempted(true);
    const error = validateStep(step);
    if (error) {
      setToastData({ type: "error", message: error });
      return;
    }

    // Paid event drafts can continue once the host has submitted at
    // least one payout account. Admin verification is enforced only at
    // publish time, matching main-server's publish precondition.
    if (step === 0 && isPaid && !isPublished) {
      const canContinue = await ensurePaidDraftHasPayoutAccount();
      if (!canContinue) return;
    }

    setLoading(true);
    try {
      await sdk.updateEventStep({
        id: eventId,
        step: Math.min(step + 1, 6),
        stepInput: buildEventInput(),
      });
      setToastData({
        type: "success",
        message: mode === "update" ? "Event updated" : "Event draft saved",
      });
      if (mode === "update") {
        return;
      }
      setMaxStep((current) => Math.max(current, nextStep));
      if (nextStep < steps.length) {
        setStep(nextStep);
      }
    } catch (error) {
      const message = extractErrorMessage(error);
      setToastData({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const persistAdditionalDetails = async (next: AdditionalDetailsState) => {
    setLoading(true);
    try {
      await sdk.updateEventStep({
        id: eventId,
        step: 6,
        stepInput: buildEventInput(next),
      });
      setToastData({
        type: "success",
        message: "Additional details saved",
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      setToastData({ type: "error", message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveDraftAndExit = async () => {
    if (isPublished) return;
    setLoading(true);
    try {
      await sdk.updateEventStep({
        id: eventId,
        step: Math.min(step + 1, 6),
        stepInput: { ...buildEventInput(), status: "DRAFT" as any },
      });
      setStatus("DRAFT");
      router.push("/events");
    } catch (error) {
      const message = extractErrorMessage(error);
      if (isHostVerificationBlockMessage(message)) {
        showHostUnderReviewModal(true);
      } else {
        setToastData({ type: "error", message });
      }
    } finally {
      setLoading(false);
    }
  };

  // Keep a ref so the global PayoutModals' Save-as-draft button always
  // calls the freshest closure (with the current step, eventId, inputs)
  // rather than a stale capture from mount-time.
  const saveDraftAndExitRef = useRef(saveDraftAndExit);
  saveDraftAndExitRef.current = saveDraftAndExit;

  useEffect(() => {
    setPayoutModalSaveDraftHandler(() => {
      void saveDraftAndExitRef.current();
    });
    return () => setPayoutModalSaveDraftHandler(null);
  }, [setPayoutModalSaveDraftHandler]);

  // Triggered by the "Publish" button on the final wizard step. For free
  // events we just save + publish. For paid events we save, fetch the
  // available offers, and open the publish modal so the host can pick
  // one (or the "No offer" basic option) before the event goes live.
  const openPublishFlow = async () => {
    const error = validateStep(lastStepIndex);
    if (error) {
      setToastData({ type: "error", message: error });
      return;
    }

    setLoading(true);
    try {
      await sdk.updateEventStep({
        id: eventId,
        step: 6,
        stepInput: buildEventInput(),
      });

      const hostReady = await ensureHostAccountPublishReady();
      if (!hostReady) return;

      if (!isPaid) {
        await sdk.publishEvent({ id: eventId });
        setStatus("PUBLISHED");
        setToastData({ type: "success", message: "Event published" });
        try {
          await sdk.saveMyHostContentDefaults({
            input: {
              ticketingTerms: ticketingTerms.trim() || undefined,
              refundPolicy: refundPolicy.trim() || undefined,
            },
          });
          hostDefaultsRef.current = {
            ticketingTerms: ticketingTerms.trim(),
            refundPolicy: refundPolicy.trim(),
          };
        } catch {
          // ignore — defaults persist on next publish
        }
        router.push(`/events/${eventId}/manage`);
        return;
      }

      const payoutReady = await ensurePaidPublishPayoutReady();
      if (!payoutReady) return;

      const response = await sdk.eventPricingOptions({
        input: {
          eventTypes: [eventType],
          expectedEventsDoneTillNow: 0,
          tickets: ticketInputs().map((ticket) => ({
            ticketPrice:
              ticket.ticketCategory === "GUESTLIST"
                ? 0
                : Number(ticket.ticketPrice),
            ticketCapacity: Number(ticket.ticketCapacity),
          })),
        },
      });
      const legacyOptions = response?.eventPricingOptions ?? [];

      // Fetch the AI-generated offer set. The mutation is idempotent
      // server-side: a fresh generation runs only on the first publish,
      // subsequent opens of this modal return the same generation. We
      // prepend AI offers above the legacy pricing plans so smart
      // offers are the host's first choice while the basic plan stays
      // visible as a fallback.
      let aiOptions: PricingOption[] = [];
      try {
        const generation = await generateAiBoostsForEvent(eventId);
        setAiBoostGeneration(generation);
        aiOptions = generation.offers
          .filter(
            (boost) =>
              (boost.confidenceScore ?? 0) >= 0.78 &&
              Number(boost.totalSavingsForHosts?.value ?? 0) > 0,
          )
          .map(aiBoostToPricingOption);
      } catch (err) {
        // AI pipeline down / not configured → silently fall back to the
        // legacy pricing plans. Log but never block the publish flow.
        console.warn(
          "AI offer generation unavailable; falling back to legacy plans",
          err,
        );
        setAiBoostGeneration(null);
      }

      const options = [...aiOptions, ...legacyOptions];
      setPricingOptions(options);
      if (options.length) {
        // Always default to the basic (zero-upfront) legacy option so the
        // host can publish immediately even when AI offers don't return.
        const basicOption =
          legacyOptions.find((o) => (o.upfrontFee ?? 0) === 0) ??
          legacyOptions[0] ??
          options[0];
        setSelectedPricingOptionId(basicOption.optionId);
      }
      setPublishModalOpen(true);
    } catch (error) {
      const message = extractErrorMessage(error);
      if (isHostVerificationBlockMessage(message)) {
        showHostUnderReviewModal(true);
      } else {
        setToastData({ type: "error", message });
      }
    } finally {
      setLoading(false);
    }
  };

  const requestPublishFlow = () => {
    const error = validateStep(lastStepIndex);
    if (error) {
      setToastData({ type: "error", message: error });
      return;
    }

    if (isPaid) {
      void openPublishFlow();
      return;
    }

    setConfirmAction({
      title: "Publish event?",
      description:
        "This will save the event and publish it for customers. You can hide or update the event later, but customers may see it immediately after publishing.",
      confirmLabel: "Publish event",
      tone: "warning",
      onConfirm: openPublishFlow,
    });
  };

  // Called from the publish modal once the host has picked an offer
  // (or accepted the no-offer basic option). Persists the offer choice
  // then flips the event to PUBLISHED.
  const publishEvent = async () => {
    if (isPaid && !selectedPricingOptionId) {
      setToastData({
        type: "error",
        message: "Select an offer to publish, or choose the basic option.",
      });
      return;
    }
    const hostReady = await ensureHostAccountPublishReady();
    if (!hostReady) {
      setPublishModalOpen(false);
      return;
    }
    const payoutReady = await ensurePaidPublishPayoutReady();
    if (!payoutReady) {
      setPublishModalOpen(false);
      return;
    }
    setPublishing(true);
    try {
      if (isPaid && selectedPricingOptionId) {
        const isAiOffer = selectedPricingOptionId.startsWith(AI_OFFER_PREFIX);
        if (isAiOffer && aiBoostGeneration?._id) {
          const offerCode = selectedPricingOptionId.slice(
            AI_OFFER_PREFIX.length,
          );
          await selectAiBoost({
            generationId: aiBoostGeneration._id,
            offerCode,
            feeSettlementMode,
          });
        } else {
          await sdk.selectEventPricingOption({
            input: {
              eventId,
              optionId: selectedPricingOptionId,
              feeSettlementMode,
            },
          });
        }
      }
      await sdk.publishEvent({ id: eventId });
      setStatus("PUBLISHED");
      setPublishModalOpen(false);
      // Save the latest Terms & Refund Policy as the host's defaults
      // so the next event prefills with them. Best-effort — a failure
      // here must not block the publish that just succeeded.
      try {
        await sdk.saveMyHostContentDefaults({
          input: {
            ticketingTerms: ticketingTerms.trim() || undefined,
            refundPolicy: refundPolicy.trim() || undefined,
          },
        });
        hostDefaultsRef.current = {
          ticketingTerms: ticketingTerms.trim(),
          refundPolicy: refundPolicy.trim(),
        };
      } catch {
        // ignore — host defaults will retry next publish
      }

      // Surface a success MODAL with the public live link (instead of a bare
      // toast + silent redirect). Slug lookup is best-effort — fall back to the
      // id-based public URL so the modal always has a working link.
      let liveUrl = `https://hoizr.com/events/${eventId}`;
      try {
        const evt = (await sdk.getEventForManage({ id: eventId }))?.getEvent;
        if (evt?.slug) liveUrl = `https://hoizr.com/events/${evt.slug}`;
      } catch {
        // keep the id-based fallback
      }
      setPublishedLiveUrl(liveUrl);
    } catch (error) {
      const message = extractErrorMessage(error);
      if (isHostVerificationBlockMessage(message)) {
        showHostUnderReviewModal(true);
      } else {
        setToastData({ type: "error", message });
      }
    } finally {
      setPublishing(false);
    }
  };

  const requestPublishEvent = () => {
    if (isPaid && !selectedPricingOptionId) {
      setToastData({
        type: "error",
        message: "Select an offer to publish, or choose the basic option.",
      });
      return;
    }
    const selectedOption = pricingOptions.find(
      (option) => option.optionId === selectedPricingOptionId,
    );
    setConfirmAction({
      title: "Publish event?",
      description: (
        <>
          Publish this event with{" "}
          <strong>{selectedOption?.label ?? "the selected offer"}</strong>.
          Customers may see and book the event immediately after it goes live.
        </>
      ),
      confirmLabel: "Publish event",
      tone: "warning",
      onConfirm: publishEvent,
    });
  };

  const requestFeeSettlementModeChange = (
    mode: "DEDUCT_FROM_PAYOUT" | "PAY_AFTER_EVENT",
  ) => {
    if (mode === feeSettlementMode) return;
    setConfirmAction({
      title: "Switch upfront collection?",
      description:
        mode === "DEDUCT_FROM_PAYOUT"
          ? "If this offer's upfront condition is met, Hoizr will deduct the upfront amount from the event payout. No separate payment is due before payout release."
          : "If this offer's upfront condition is met, you will pay the upfront amount separately through Hoizr/Razorpay after the event and before payout release.",
      confirmLabel: "Switch collection",
      tone: "warning",
      onConfirm: () => setFeeSettlementMode(mode),
    });
  };

  const getPricingOptionInsight = (option: PricingOption) => {
    const commission = Number(option.commissionRate) || 0;
    const upfrontFee = Number(option.upfrontFee) || 0;

    // AI offers carry an absolute ₹ savings number computed server-side
    // against the host's baseline + projected GTV. Prefer that over the
    // relative-percent-points hint we use for legacy plans.
    if (option.optionId.startsWith(AI_OFFER_PREFIX)) {
      const boost = aiBoostOffersByCode.get(
        option.optionId.slice(AI_OFFER_PREFIX.length),
      );
      const savingsValue = boost?.totalSavingsForHosts?.value;
      const customerMessage = boost?.customerViewingMessage;
      return {
        savings:
          savingsValue && savingsValue > 0
            ? `AI found ${formatIndianRupees(savingsValue)} in host-side savings`
            : "Smart offer — baseline event context",
        hostRecommendation:
          customerMessage ??
          "AI-tuned offer for this event. Confirm before publishing.",
      };
    }

    const highestCommission = pricingOptions.reduce(
      (highest, current) =>
        Math.max(highest, Number(current.commissionRate) || 0),
      commission,
    );
    const lowestUpfront = pricingOptions.reduce(
      (lowest, current) => Math.min(lowest, Number(current.upfrontFee) || 0),
      upfrontFee,
    );
    const fastestSettlement = pricingOptions.reduce(
      (fastest, current) =>
        Math.min(fastest, Number(current.payoutCycleDaysMax) || fastest),
      Number(option.payoutCycleDaysMax) || 0,
    );
    const commissionSavings = Math.max(0, highestCommission - commission);
    const isLowestUpfront = upfrontFee <= lowestUpfront;
    const isFastestSettlement =
      (Number(option.payoutCycleDaysMax) || 0) <= fastestSettlement;

    return {
      savings:
        commissionSavings > 0
          ? `${formatPercentDelta(commissionSavings)} pts lower commission than the highest offer`
          : "Best-reach offer for this event",
      hostRecommendation: upfrontFee
        ? "AI read: choose this when the offer is strong enough to lift conversion and you are comfortable reconciling it through settlement or after the event."
        : isLowestUpfront
          ? "AI read: lowest-friction option for publishing quickly."
          : `AI read: balanced plan for ${hostLabel.plural.toLowerCase()} that want a stronger offer without overcomplicating settlement.`,
      customerRecommendation: isFastestSettlement
        ? "Customer angle: simple ticket decision, clear offer, and fast event momentum."
        : `Customer angle: clear value message in the ${hostLabel.lower} publish flow.`,
    };
  };

  const artistManualEntryEnabled =
    artistEditIndex !== null ||
    Boolean(artistLinkId || tempArtistId) ||
    (artistSearchAttempted &&
      artistQuery.trim().length >= 2 &&
      (artistSearchResults.length === 0 || Boolean(artistName.trim())));

  if (fetching) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--owner-bg-sidebar)] text-sm text-[var(--owner-fg-3)]">
        Loading event...
      </div>
    );
  }

  return (
    <div
      className="flex h-[100dvh] min-h-screen flex-col overflow-hidden bg-[var(--owner-bg-sidebar)] text-[var(--owner-fg-1)]"
      style={{ height: "100dvh" }}
    >
      <header className="flex h-16 min-h-16 shrink-0 items-center justify-between border-b border-[var(--owner-border)] px-4 md:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--owner-blue-500)]">
            Event {mode === "create" ? "Creation" : "Update"}
          </p>
          <h1 className="truncate text-lg font-semibold">
            {title || "Untitled Event"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-md border border-[var(--owner-border)] bg-[var(--owner-bg)] px-3 py-1.5 text-xs font-semibold sm:inline-flex">
            {status}
          </span>
          {/* Save draft is now available on every step (per Roop) so a
              host can park work mid-wizard without losing progress.
              Hidden once the event is published — at that point edits
              go through Update, not draft save. */}
          {!isPublished ? (
            <button
              type="button"
              disabled={loading}
              onClick={saveDraftAndExit}
              className="inline-flex rounded-lg border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Save draft
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] px-3 py-2 text-sm font-semibold"
          >
            <DoorOpenIcon size={16} />
            Exit
          </button>
        </div>
      </header>

      <main className="grid h-[calc(100dvh-64px)] min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        <aside className="hidden min-h-0 flex-col border-r border-[var(--owner-border)] p-4 lg:flex">
          <nav className="space-y-2">
            {visibleSteps.map((label) => {
              const index = steps.indexOf(label);
              const stepLocked = mode === "create" && index > maxStep;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={stepLocked}
                  onClick={() => setStep(index)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    step === index
                      ? "bg-[var(--owner-fg-1)] text-[var(--owner-bg)]"
                      : stepLocked
                        ? "cursor-not-allowed text-[var(--owner-fg-4)] opacity-50"
                        : "text-[var(--owner-fg-3)] hover:bg-[var(--owner-bg-subtle)]"
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/20 text-xs font-semibold">
                    {index + 1}
                  </span>
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Help/contact callout — moved here from the right preview
              aside so it lives in the same column as the step nav and
              isn't competing for attention with the Live Preview card.
              Same warm copy as the host-onboarding layout to keep one
              voice across the dashboard. */}
          <div className="mt-6 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4 text-xs leading-5 text-[var(--owner-fg-3)]">
            <p className="font-semibold text-[var(--owner-fg-1)]">
              We&apos;d love to help.
            </p>
            <p className="mt-1">
              Anything tricky here? Reach out — our team can hop on a call,
              fix it with you, or even onboard your event for you. We&apos;re
              genuinely happy to roll up our sleeves.
            </p>
            <a
              href="mailto:contact@hoizr.com"
              className="mt-3 inline-flex font-semibold text-[var(--owner-fg-1)] underline-offset-4 hover:underline"
            >
              contact@hoizr.com →
            </a>
            <a
              href="https://wa.me/918910385523"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 font-semibold text-[var(--owner-blue-500)] underline-offset-4 hover:underline"
            >
              WhatsApp us — we usually reply in minutes →
            </a>
          </div>
        </aside>

        {/* Middle column is a flex column: scrolling form on top, action bar
            pinned to its bottom. The bar is a flex sibling (not a sticky
            child of the scrolling section) so it touches the viewport bottom
            regardless of section padding — previous sticky-inside-padded-
            scroll-container placed the bar 24px above the viewport bottom.
            Inner wrapper uses min-h-full so short steps fill the viewport
            instead of leaving a large empty band below the form (Phase 4
            polish). */}
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <section
            ref={formScrollRef}
            className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pb-3 md:p-6 md:pb-4"
          >
            <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-5">
              <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {visibleSteps.map((label) => {
                  const index = steps.indexOf(label);
                  const stepLocked = mode === "create" && index > maxStep;
                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={stepLocked}
                      onClick={() => setStep(index)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        step === index
                          ? "bg-[var(--owner-fg-1)] text-[var(--owner-bg)]"
                          : stepLocked
                            ? "cursor-not-allowed bg-[var(--owner-bg-subtle)] text-[var(--owner-fg-4)] opacity-50"
                            : "bg-[var(--owner-bg-subtle)] text-[var(--owner-fg-3)]"
                      }`}
                    >
                      {index + 1}. {label}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4 md:p-5">
                {step === 0 ? (
                  <StepSection
                    title="Choose event category"
                    subtitle="This controls ticketing rules, payout cycle, and whether Hoizr can offer smart event context."
                  >
                    {/* TASK-043 / TASK-011 sub-item: hover blocker overlay
                      when the category cannot be changed (update mode +
                      first step already completed). Tells the user
                      *why* the cards are inert. */}
                    <div className="relative">
                      {!canEditEventCategory ? (
                        <div
                          className="absolute inset-0 z-10 flex cursor-not-allowed items-center justify-center rounded-lg bg-white/70 opacity-0 transition-opacity hover:opacity-100"
                          title="Category cannot be changed after Basic Details are saved."
                          aria-hidden="true"
                        >
                          <span className="rounded-full bg-[var(--owner-fg-1)] px-3 py-1 text-xs font-semibold text-white">
                            Category locked — can&apos;t change after Basic
                            Details
                          </span>
                        </div>
                      ) : null}
                      <div
                        className={`grid gap-4 xl:grid-cols-3 ${!canEditEventCategory ? "pointer-events-none opacity-80" : ""}`}
                      >
                        {eventTypeCards.map((card) => (
                          <button
                            key={card.value}
                            type="button"
                            disabled={!canEditEventCategory}
                            onClick={() => {
                              if (!canEditEventCategory) return;
                              if (eventType === card.value) return;

                              // Switching paid ↔ free changes which ticket
                              // categories are legal. Ask before nuking the
                              // host's draft tickets — only when there's at
                              // least one ticket configured.
                              const wouldRequireClear =
                                tickets.length > 0 &&
                                ((eventType === "FREE" &&
                                  card.value !== "FREE") ||
                                  (eventType !== "FREE" &&
                                    card.value === "FREE"));

                              const applyChange = () => {
                                setEventType(card.value);
                                if (card.value === "FREE") {
                                  setTicketCategory("GUESTLIST");
                                  setTicketPrice(0);
                                } else if (ticketCategory === "GUESTLIST") {
                                  setTicketCategory("NORMAL");
                                }
                                if (wouldRequireClear) {
                                  setTickets([]);
                                  setToastData({
                                    type: "warning",
                                    message:
                                      "Existing ticket variants were cleared to match the new event type. Add fresh tickets in step 4.",
                                  });
                                }
                              };

                              if (wouldRequireClear) {
                                setConfirmAction({
                                  title: "Switch event type and clear tickets?",
                                  description: (
                                    <>
                                      You have <strong>{tickets.length}</strong>{" "}
                                      ticket variant
                                      {tickets.length === 1 ? "" : "s"}{" "}
                                      configured. Switching to{" "}
                                      <strong>{card.title}</strong> will remove
                                      them — you&apos;ll need to add fresh
                                      tickets that match the new event type.
                                    </>
                                  ),
                                  confirmLabel: "Switch and clear",
                                  tone: "danger",
                                  onConfirm: () => {
                                    applyChange();
                                    setConfirmAction(null);
                                  },
                                });
                                return;
                              }
                              applyChange();
                            }}
                            className={`rounded-lg border p-4 text-left transition ${
                              eventType === card.value
                                ? "border-[var(--owner-blue-500)] bg-white shadow-sm"
                                : "border-[var(--owner-border)] bg-[var(--owner-bg)]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="font-semibold">{card.title}</h3>
                              {eventType === card.value ? (
                                <CheckCircle2Icon className="text-[var(--owner-blue-500)]" />
                              ) : (
                                <CircleDashedIcon className="text-gray-400" />
                              )}
                            </div>
                            <p className="mt-3 text-sm leading-6 text-[var(--owner-fg-3)]">
                              {card.description}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {card.meta.map((item) => (
                                <span
                                  key={item}
                                  className="rounded-md bg-[var(--owner-bg-subtle)] px-2.5 py-1 text-xs font-medium"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    {!canEditEventCategory ? (
                      <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4 text-sm text-[var(--owner-fg-3)]">
                        Event category is locked after the event is created.
                      </div>
                    ) : null}
                    <div className="rounded-lg border border-[var(--owner-border)] bg-white p-4 text-sm leading-6 text-[var(--owner-fg-3)]">
                      Hoizr host accounts are free to create and publish from.
                      No subscription, setup fee, listing fee, or card details
                      are required before publishing. Incorrect category
                      information can lead to review or listing restrictions.
                    </div>
                  </StepSection>
                ) : null}

                {step === 1 ? (
                  <StepSection
                    title="Basic details"
                    subtitle="Keep this tight. The preview updates as details are saved."
                  >
                    <div className="grid gap-5">
                      <div className="rounded-lg border border-[var(--owner-border)] bg-white p-3 shadow-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
                          <label
                            className="flex min-h-[118px] flex-1 cursor-pointer items-center gap-4 rounded-lg border border-dashed border-[var(--owner-border)] bg-[var(--owner-bg)] px-4 py-4 text-sm transition hover:border-[var(--owner-blue-500)] hover:bg-[var(--owner-bg-subtle)]"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              handleFlyerFile(event.dataTransfer.files?.[0]);
                            }}
                          >
                            {eventFlyer ? (
                              <span
                                className="h-24 w-20 shrink-0 rounded-lg bg-cover bg-center shadow-sm"
                                style={{
                                  backgroundImage: `url(${eventFlyer})`,
                                }}
                              />
                            ) : (
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[var(--owner-fg-3)] shadow-sm">
                                <UploadCloudIcon size={22} />
                              </span>
                            )}
                            <span className="min-w-0 text-left">
                              <span className="block font-semibold text-[var(--owner-fg-1)]">
                                Event Flyer *
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-[var(--owner-fg-3)]">
                                Drop a 900×1200 (3:4) event poster or click
                                to crop one. JPG, PNG, or WebP up to 1.5 MB.
                              </span>
                              {eventFlyer ? (
                                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--owner-blue-500)]">
                                  <ImagePlusIcon size={14} />
                                  Replace image
                                </span>
                              ) : null}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(event) => {
                                handleFlyerFile(event.target.files?.[0]);
                                event.currentTarget.value = "";
                              }}
                            />
                          </label>
                          {eventFlyer ? (
                            <div className="flex shrink-0 gap-2 md:w-36 md:flex-col">
                              <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--owner-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--owner-fg-1)] transition hover:border-[var(--owner-blue-500)] md:flex-none">
                                <ImagePlusIcon size={15} />
                                Replace
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(event) => {
                                    handleFlyerFile(event.target.files?.[0]);
                                    event.currentTarget.value = "";
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={removeEventFlyer}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 md:flex-none"
                              >
                                <XIcon size={15} />
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <Input
                            label="Event Name *"
                            value={title}
                            onChange={setTitle}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <RichTextEditor
                            label="Event Description (optional)"
                            value={description}
                            onChange={setDescription}
                          />
                          <p
                            className={`mt-1 text-right text-xs ${
                              description.length > 3800
                                ? "text-[var(--owner-danger-text)]"
                                : "text-[var(--owner-fg-4)]"
                            }`}
                          >
                            {description.length} / 3800
                          </p>
                        </div>
                        {/* Genres — selected chips on top, searchable
                            scrollable list below. Tags drive discoverability
                            filters on the customer site. */}
                        {allGenres.length > 0 ? (
                          <div className="md:col-span-2">
                            <p className="mb-2 text-sm font-medium">
                              Genres
                              <span className="ml-2 text-xs font-normal text-[var(--owner-fg-3)]">
                                — pick what fits this event
                              </span>
                            </p>
                            {selectedGenreIds.length > 0 ? (
                              <div className="mb-2 flex flex-wrap gap-1.5 rounded-md border border-[var(--owner-border-soft)] bg-[var(--owner-bg-subtle)] p-2">
                                {allGenres
                                  .filter((g) =>
                                    selectedGenreIds.includes(g._id),
                                  )
                                  .map((g) => (
                                    <button
                                      key={g._id}
                                      type="button"
                                      onClick={() =>
                                        setSelectedGenreIds((prev) =>
                                          prev.filter((id) => id !== g._id),
                                        )
                                      }
                                      className="inline-flex items-center gap-1 rounded-full border border-[var(--owner-blue-500)] bg-[var(--owner-blue-050)] px-2.5 py-1 text-xs font-semibold text-[var(--owner-blue-500)] hover:bg-[var(--owner-blue-100)]"
                                    >
                                      {g.value}
                                      <span aria-hidden>×</span>
                                    </button>
                                  ))}
                              </div>
                            ) : null}
                            <input
                              type="text"
                              value={genreFilter}
                              onChange={(e) => setGenreFilter(e.target.value)}
                              placeholder="Search genres…"
                              className="mb-2 w-full rounded-md border border-[var(--owner-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--owner-blue-500)]"
                            />
                            <div className="flex max-h-[180px] flex-wrap gap-1.5 overflow-y-auto rounded-md border border-[var(--owner-border-soft)] p-2">
                              {allGenres
                                .filter((g) => {
                                  const q = genreFilter.trim().toLowerCase();
                                  if (!q) return true;
                                  return g.value.toLowerCase().includes(q);
                                })
                                .map((g) => {
                                  const selected = selectedGenreIds.includes(
                                    g._id,
                                  );
                                  return (
                                    <button
                                      key={g._id}
                                      type="button"
                                      onClick={() =>
                                        setSelectedGenreIds((prev) =>
                                          prev.includes(g._id)
                                            ? prev.filter((id) => id !== g._id)
                                            : [...prev, g._id],
                                        )
                                      }
                                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                        selected
                                          ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-050)] text-[var(--owner-blue-500)]"
                                          : "border-[var(--owner-border)] bg-white text-[var(--owner-fg-3)] hover:border-[var(--owner-blue-500)] hover:text-[var(--owner-fg-1)]"
                                      }`}
                                    >
                                      {g.value}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        ) : null}
                        <ToggleSettingRow
                          title="Coming Soon"
                          subtitle="Start and end dates are not required while this is on."
                          checked={isComingSoon}
                          onCheckedChange={setIsComingSoon}
                        />
                        <ToggleSettingRow
                          title="Show on customer site"
                          subtitle="When on, customers can find this event once it's published. Turn off to hide it without unpublishing."
                          checked={isVisible}
                          onCheckedChange={requestEventVisibilityChange}
                        />
                        {!isComingSoon ? (
                          <>
                            <DateTimeInput
                              label="Event Start *"
                              value={startDate}
                              onChange={setStartDate}
                              disabled={eventStarted}
                              minDate={new Date()}
                            />
                            <DateTimeInput
                              label="Event End *"
                              value={endDate}
                              onChange={setEndDate}
                              disabled={eventStarted}
                              minDate={
                                startDate ? new Date(startDate) : new Date()
                              }
                            />
                          </>
                        ) : null}
                        {multiDayEligible ? (
                          <div className="md:col-span-2">
                            <ToggleSettingRow
                              title="Mark as separate dated events"
                              subtitle="Customers must select which day they want to attend, and each day's tickets stop selling when that day starts."
                              checked={markSeparateDays}
                              onCheckedChange={setMarkSeparateDays}
                            />
                            {markSeparateDays ? (
                              <div className="mt-3 space-y-3 rounded-xl border border-border bg-gray-50 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-semibold">
                                    Event days
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      // Re-derive the times from the range but
                                      // KEEP existing dayIds positionally so a
                                      // host fixing day times never orphans
                                      // already-tagged tickets. Newly-added days
                                      // get fresh ids; removed days orphan
                                      // correctly (server flags it).
                                      setEventDays((prev) =>
                                        buildDaysFromRange(startDate, endDate).map(
                                          (d, i) =>
                                            prev[i]
                                              ? { ...d, dayId: prev[i].dayId }
                                              : d
                                        )
                                      )
                                    }
                                    disabled={eventStarted}
                                    className="text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-40"
                                  >
                                    Auto-fill from range
                                  </button>
                                </div>
                                {eventDays.map((day, i) => (
                                  <div
                                    key={day.dayId}
                                    className="grid gap-2 rounded-lg border border-border bg-background p-3 md:grid-cols-3"
                                  >
                                    <input
                                      value={day.title}
                                      onChange={(e) =>
                                        updateEventDay(i, {
                                          title: e.target.value,
                                        })
                                      }
                                      disabled={eventStarted}
                                      placeholder={`Day ${i + 1}`}
                                      className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-3"
                                    />
                                    <DateTimeInput
                                      label="Starts"
                                      value={day.startDate}
                                      onChange={(v: string) =>
                                        updateEventDay(i, { startDate: v })
                                      }
                                      disabled={eventStarted}
                                    />
                                    <DateTimeInput
                                      label="Ends"
                                      value={day.endDate}
                                      onChange={(v: string) =>
                                        updateEventDay(i, { endDate: v })
                                      }
                                      disabled={eventStarted}
                                    />
                                  </div>
                                ))}
                                {daysSaveAttempted && daysError ? (
                                  <div className="text-xs font-medium text-red-600">
                                    {daysError}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-600">
                                    Tag each ticket to a day (or “All days”) in
                                    the Ticketing step.
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </StepSection>
                ) : null}
                {step === 2 ? (
                  <StepSection
                    title="Location"
                    subtitle={
                      eventStarted
                        ? "Location is locked because this event has already started."
                        : "Confirm whether the venue is finalized, then add the city or full address."
                    }
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <ToggleSettingRow
                          title="Event Location Decided"
                          subtitle="Turn this on when the venue address is finalized. Turn it off if only the city is confirmed."
                          checked={eventLocationDecided}
                          onCheckedChange={setEventLocationDecided}
                          disabled={eventStarted}
                        />
                      </div>
                      {eventLocationDecided ? (
                        <>
                          <div className="md:col-span-2">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <div className="text-sm font-semibold">
                                Event address
                              </div>
                              <button
                                type="button"
                                disabled={eventStarted}
                                onClick={copyHostAddress}
                                className="text-xs font-semibold text-[var(--owner-blue-500)] hover:underline disabled:text-[var(--owner-fg-4)]"
                              >
                                Copy host address
                              </button>
                            </div>
                            <label className="block min-w-0 text-sm font-medium">
                              Search Address
                              <AsyncSelect
                                isDisabled={eventStarted}
                                className="mt-1 text-sm text-left"
                                classNamePrefix="react-select"
                                placeholder="Search venue or area"
                                value={selectedPlace}
                                isClearable
                                noOptionsMessage={() =>
                                  "Search for the event location"
                                }
                                onChange={(option) =>
                                  applyPlace(option as PlacesType | null)
                                }
                                loadOptions={loadPlaceOptions}
                              />
                              {searchLoading ? (
                                <span className="mt-1 block text-xs text-[var(--owner-fg-3)]">
                                  Fetching address details...
                                </span>
                              ) : null}
                            </label>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs text-[var(--owner-fg-3)]">
                                Search first. If the venue is not listed, enter
                                the address manually.
                              </p>
                              <button
                                type="button"
                                disabled={eventStarted}
                                onClick={() => setManualLocationOpen(true)}
                                className="rounded-md border border-[var(--owner-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--owner-fg-2)] hover:bg-[var(--owner-bg-subtle)] disabled:opacity-50"
                              >
                                Enter manually
                              </button>
                            </div>
                          </div>
                          {manualLocationOpen ? (
                            <>
                              <Input
                                label="Address Line 1 *"
                                value={addressLine1}
                                onChange={setAddressLine1}
                                disabled={eventStarted}
                              />
                              <Input
                                label="Address Line 2 (optional)"
                                value={addressLine2}
                                onChange={setAddressLine2}
                                disabled={eventStarted}
                              />
                              <CityInput
                                label="City *"
                                value={city}
                                onChange={selectCity}
                                options={cityOptions}
                                disabled={eventStarted}
                              />
                              <StateInput
                                label="State (optional)"
                                value={stateName}
                                onChange={setStateName}
                                options={stateOptions}
                                disabled={eventStarted}
                              />
                              <Input
                                label="Pincode (optional)"
                                value={pincode}
                                onChange={setPincode}
                                disabled={eventStarted}
                              />
                            </>
                          ) : (
                            <div className="md:col-span-2 rounded-lg border border-dashed border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] px-4 py-5 text-sm text-[var(--owner-fg-3)]">
                              Pick a search result to prefill the address, or
                              use manual entry when the place is not found.
                            </div>
                          )}
                        </>
                      ) : (
                        <CityInput
                          label="City *"
                          value={city}
                          onChange={selectCity}
                          options={cityOptions}
                          disabled={eventStarted}
                        />
                      )}
                      {/* Map preview — shown once coords are set (host
                        picked from Places autocomplete). Iframe avoids
                        loading the full Google Maps JS bundle just for
                        a static preview. */}
                      {eventLocationDecided && coords.length === 2 ? (
                        <div className="md:col-span-2 overflow-hidden rounded-lg border border-[var(--owner-border)]">
                          <iframe
                            title="Event location preview"
                            src={`https://www.google.com/maps?q=${coords[0]},${coords[1]}&hl=en&z=16&output=embed`}
                            className="h-56 w-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      ) : null}

                      {/* Multi-city — only for an eligible multi-day event. When
                          on, each day gets its own venue; the address above is
                          the default/single venue used by any day left blank. */}
                      {multiCityEligible ? (
                        <div className="md:col-span-2">
                          <ToggleSettingRow
                            title="Multi-city event"
                            subtitle="Different city each day? Give each day its own venue. Days left blank use the address above."
                            checked={multiCity}
                            onCheckedChange={setMultiCity}
                            disabled={eventStarted}
                          />
                          {multiCity ? (
                            <div className="mt-3 space-y-3 rounded-xl border border-border bg-gray-50 p-3">
                              {eventDays.map((day, i) => (
                                <div
                                  key={day.dayId}
                                  className="rounded-lg border border-border bg-background p-3"
                                >
                                  <div className="mb-2 text-sm font-semibold">
                                    {day.title || `Day ${i + 1}`}
                                  </div>
                                  <div className="grid gap-2 md:grid-cols-2">
                                    <input
                                      value={day.location?.addressLine1 ?? ""}
                                      onChange={(e) =>
                                        updateEventDayCity(i, {
                                          addressLine1: e.target.value,
                                        })
                                      }
                                      disabled={eventStarted}
                                      placeholder="Venue / address"
                                      className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                                    />
                                    <input
                                      value={day.location?.city ?? ""}
                                      onChange={(e) =>
                                        updateEventDayCity(i, {
                                          city: e.target.value,
                                        })
                                      }
                                      disabled={eventStarted}
                                      placeholder="City"
                                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                                    />
                                    <input
                                      value={day.location?.state ?? ""}
                                      onChange={(e) =>
                                        updateEventDayCity(i, {
                                          state: e.target.value,
                                        })
                                      }
                                      disabled={eventStarted}
                                      placeholder="State (optional)"
                                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </StepSection>
                ) : null}

                {step === 3 ? (
                  <StepSection
                    title="Tickets"
                    subtitle="Create one clean ticket variation at a time. Master ticket settings are separate below."
                  >
                    <ToggleSettingRow
                      title="Enable Ticketing"
                      subtitle="Allow attendees to purchase or claim tickets for this event."
                      checked={ticketingEnabled}
                      onCheckedChange={requestTicketingChange}
                    />
                    <div
                      className={`space-y-5 ${
                        ticketingEnabled ? "" : "pointer-events-none opacity-45"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-1">
                          {[
                            { id: "tickets", label: "Tickets" },
                            {
                              id: "advanced",
                              label: "Advance Ticket Settings",
                            },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              disabled={!ticketingEnabled}
                              onClick={() =>
                                setTicketTab(tab.id as "tickets" | "advanced")
                              }
                              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                                ticketTab === tab.id
                                  ? "bg-[var(--owner-fg-1)] text-[var(--owner-bg)]"
                                  : "text-[var(--owner-fg-3)]"
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                        {ticketTab === "tickets" ? (
                          <button
                            type="button"
                            disabled={!ticketingEnabled}
                            onClick={() => openTicketModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--owner-fg-1)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)] disabled:opacity-60"
                          >
                            <PlusIcon size={16} />
                            Add Ticket
                          </button>
                        ) : null}
                      </div>

                      {ticketTab === "tickets" ? (
                        <>
                          <div className="rounded-lg border border-[var(--owner-border)] bg-white">
                            <div className="grid grid-cols-[minmax(0,1.4fr)_120px_150px] gap-3 border-b border-[var(--owner-border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--owner-fg-3)] max-md:hidden">
                              <span>Ticket</span>
                              <span>Status</span>
                              <span className="text-right">Actions</span>
                            </div>
                            {tickets.length ? (
                              tickets.map((ticket, index) => {
                                const hasSales =
                                  Number(ticket.ticketSold ?? 0) > 0;
                                return (
                                  <div
                                    key={
                                      ticket._id ??
                                      `${ticket.ticketName}-${index}`
                                    }
                                    className="grid gap-3 border-b border-[var(--owner-bg-subtle)] px-4 py-3 text-sm last:border-b-0 md:grid-cols-[minmax(0,1.4fr)_120px_150px] md:items-center"
                                  >
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="truncate font-semibold">
                                          {ticket.ticketName}
                                        </span>
                                        {ticketDayLabel(ticket.dayId) ? (
                                          <span className="shrink-0 rounded-full bg-[var(--owner-blue-050)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--owner-blue-500)]">
                                            {ticketDayLabel(ticket.dayId)}
                                          </span>
                                        ) : null}
                                      </div>
                                      <div className="mt-1 text-xs text-[var(--owner-fg-3)]">
                                        {ticket.ticketCategory} ·{" "}
                                        {ticket.ticketCapacity} capacity ·{" "}
                                        {ticket.ticketCategory === "GUESTLIST"
                                          ? "Free"
                                          : rupee(ticket.ticketPrice)}
                                      </div>
                                    </div>
                                    <span
                                      className={`w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${
                                        ticket.ticketVisible
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {ticket.ticketVisible
                                        ? "Visible"
                                        : "Hidden"}
                                    </span>
                                    <div className="flex justify-start gap-2 md:justify-end">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          requestTicketVisibilityToggle(index)
                                        }
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--owner-border)]"
                                        title={
                                          ticket.ticketVisible
                                            ? "Hide ticket"
                                            : "Show ticket"
                                        }
                                      >
                                        {ticket.ticketVisible ? (
                                          <EyeOffIcon size={15} />
                                        ) : (
                                          <EyeIcon size={15} />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => duplicateTicket(index)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--owner-border)]"
                                        title="Duplicate ticket"
                                      >
                                        <CopyIcon size={15} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={hasSales}
                                        onClick={() => openTicketModal(index)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--owner-border)] disabled:cursor-not-allowed disabled:opacity-40"
                                        title={
                                          hasSales
                                            ? "Tickets with sales cannot be edited"
                                            : "Edit ticket"
                                        }
                                      >
                                        <Edit3Icon size={15} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={hasSales}
                                        onClick={() =>
                                          requestRemoveTicket(index)
                                        }
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                        title={
                                          hasSales
                                            ? "Tickets with sales cannot be removed"
                                            : "Remove ticket"
                                        }
                                      >
                                        <XIcon size={15} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="px-4 py-8 text-center text-sm text-[var(--owner-fg-3)]">
                                No ticket variations added yet.
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold">
                                  Event Add-ons (optional)
                                </div>
                                <p className="mt-0.5 text-xs text-[var(--owner-fg-3)]">
                                  Sell upgrades, merch, or food add-ons
                                  alongside tickets.
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={!ticketingEnabled}
                                onClick={() => openExtraModal()}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] px-4 py-2 text-sm font-semibold disabled:opacity-60"
                              >
                                <PlusIcon size={16} />
                                Add Add-on
                              </button>
                            </div>
                            {extras.length ? (
                              <div className="rounded-lg border border-[var(--owner-border)] bg-white">
                                <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3 border-b border-[var(--owner-border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--owner-fg-3)] max-md:hidden">
                                  <span>Add-on</span>
                                  <span className="text-right">Actions</span>
                                </div>
                                {extras.map((extra, index) => (
                                  <div
                                    key={extra._id ?? `${extra.name}-${index}`}
                                    className="grid gap-3 border-b border-[var(--owner-bg-subtle)] px-4 py-3 text-sm last:border-b-0 md:grid-cols-[minmax(0,1fr)_120px] md:items-center"
                                  >
                                    <div className="min-w-0">
                                      <div className="truncate font-semibold">
                                        {extra.name}
                                      </div>
                                      <div className="mt-1 text-xs text-[var(--owner-fg-3)]">
                                        {extra.type.replace(/_/g, " ")} ·{" "}
                                        {extra.quantity} qty ·{" "}
                                        {rupee(extra.price)}
                                        {extra.sold
                                          ? ` · ${extra.sold} sold`
                                          : ""}
                                      </div>
                                    </div>
                                    <div className="flex justify-start gap-2 md:justify-end">
                                      <button
                                        type="button"
                                        onClick={() => openExtraModal(index)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--owner-border)]"
                                        title="Edit add-on"
                                      >
                                        <Edit3Icon size={15} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          requestRemoveExtra(index)
                                        }
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700"
                                        title="Remove add-on"
                                      >
                                        <XIcon size={15} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </>
                      ) : null}

                      {ticketTab === "advanced" ? (
                        <div className="rounded-lg border border-[var(--owner-border)] bg-white p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <DateTimeInput
                              label="Ticket Sales Start Date (optional)"
                              value={ticketSalesStartDate}
                              onChange={setTicketSalesStartDate}
                              minDate={new Date()}
                              maxDate={endDate ? new Date(endDate) : undefined}
                            />
                            <DateTimeInput
                              label="Ticket Sales End Date (optional)"
                              value={ticketSalesEndDate}
                              onChange={setTicketSalesEndDate}
                              minDate={
                                ticketSalesStartDate
                                  ? new Date(ticketSalesStartDate)
                                  : new Date()
                              }
                              maxDate={endDate ? new Date(endDate) : undefined}
                            />
                            <ToggleSettingRow
                              title="Allow Walk-ins"
                              checked={allowWalkIns}
                              onCheckedChange={setAllowWalkIns}
                            />
                            <ToggleSettingRow
                              title="ID Verification Required"
                              checked={requiresIDVerification}
                              onCheckedChange={setRequiresIDVerification}
                            />
                          </div>
                          <p className="mt-3 text-xs text-[var(--owner-fg-3)]">
                            Ticketing Terms &amp; Conditions and Refund Policy
                            are now required — and live on the final{" "}
                            <strong>Additional</strong> step.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </StepSection>
                ) : null}

                {step === 4 ? (
                  <StepSection
                    title="Lineup and collaborators"
                    subtitle="Manual artists are saved as phantom artists and can be reused from search later."
                  >
                    <div className="inline-flex rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-1">
                      {[
                        {
                          id: "collaborators",
                          label: "Event Collaborators",
                          Icon: UsersRoundIcon,
                        },
                        {
                          id: "artists",
                          label: "Artist Lineup",
                          Icon: Music2Icon,
                        },
                      ].map(({ id, label, Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() =>
                            setPeopleTab(id as "collaborators" | "artists")
                          }
                          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                            peopleTab === id
                              ? "bg-[var(--owner-fg-1)] text-[var(--owner-bg)]"
                              : "text-[var(--owner-fg-3)]"
                          }`}
                        >
                          <Icon size={15} />
                          {label}
                        </button>
                      ))}
                    </div>

                    {peopleTab === "collaborators" ? (
                      <div className="grid gap-3">
                        {/* Collaborator promise card — sits at the top of the
                          tab to explain the "why" before the host adds
                          someone. Mirrors the dashboard PromoCard. */}
                        <div
                          className="relative overflow-hidden rounded-lg p-4 text-white shadow-owner-sm"
                          style={{
                            background:
                              "linear-gradient(135deg,#1B0B3D 0%,#3B1E73 60%,#7E2BD6 100%)",
                          }}
                        >
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 opacity-[0.10]"
                            style={{
                              backgroundImage:
                                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                              mixBlendMode: "overlay",
                            }}
                          />
                          <div className="relative text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">
                            Collaborate to grow
                          </div>
                          <div className="relative mt-2 text-[16px] font-semibold leading-tight">
                            Pool audiences. Boost sales together.
                          </div>
                          <p className="relative mt-1.5 text-[12.5px] text-white/82">
                            Add another organizer as a collaborator and you can
                            both market this event to your combined customer
                            base. They get the event on their dashboard, you
                            choose exactly what they can see and do.
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-[var(--owner-fg-3)]">
                            Collaborators must be Hoizr organizers or venues. If
                            they aren&apos;t on Hoizr yet, refer them — once
                            they join you can add them as a collaborator.
                          </p>
                          <button
                            type="button"
                            onClick={openAddCollaboratorModal}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--owner-blue-500)] px-3 py-2 text-sm font-semibold text-[var(--owner-bg)]"
                          >
                            <PlusIcon size={14} />
                            Add collaborator
                          </button>
                        </div>
                        {collaborators.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-[var(--owner-border)] bg-white p-6 text-center text-sm text-[var(--owner-fg-3)]">
                            No collaborators yet. Click{" "}
                            <strong>Add collaborator</strong> to invite a
                            business to co-run this event.
                          </div>
                        ) : (
                          <ul className="grid gap-2">
                            {collaborators.map((collab, index) => (
                              <li
                                key={`collab-${index}`}
                                className="flex flex-col gap-3 rounded-lg border border-[var(--owner-border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="flex min-w-0 items-start gap-3">
                                  <span
                                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--owner-bg-subtle)] bg-cover bg-center text-xs font-semibold uppercase text-[var(--owner-fg-3)]"
                                    style={
                                      collab.logo
                                        ? {
                                            backgroundImage: `url(${collab.logo})`,
                                          }
                                        : undefined
                                    }
                                  >
                                    {!collab.logo
                                      ? (collab.name || "?").slice(0, 1)
                                      : null}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-semibold">
                                      {collab.name || "Untitled business"}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[var(--owner-fg-3)]">
                                      {collab.businessLinkId
                                        ? "On Hoizr"
                                        : "Legacy entry — organizer not linked to Hoizr"}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {collab.requestCustomerListAccess ? (
                                        <span className="rounded-full bg-[var(--owner-bg-subtle)] px-2 py-0.5 text-[11px] font-semibold text-[var(--owner-fg-3)]">
                                          Customer list
                                        </span>
                                      ) : null}
                                      {collab.hideOnEventPage ? (
                                        <span className="rounded-full bg-[var(--owner-bg-subtle)] px-2 py-0.5 text-[11px] font-semibold text-[var(--owner-fg-3)]">
                                          Hidden on page
                                        </span>
                                      ) : null}
                                      {collab.allowIssuingOfflineTickets ? (
                                        <span className="rounded-full bg-[var(--owner-bg-subtle)] px-2 py-0.5 text-[11px] font-semibold text-[var(--owner-fg-3)]">
                                          Offline tickets
                                        </span>
                                      ) : null}
                                      {collab.sendTransactionalMails ? (
                                        <span className="rounded-full bg-[var(--owner-bg-subtle)] px-2 py-0.5 text-[11px] font-semibold text-[var(--owner-fg-3)]">
                                          Transactional emails
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 sm:shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditCollaboratorModal(index)
                                    }
                                    className="rounded-md border border-[var(--owner-border-strong)] bg-white px-3 py-1.5 text-xs font-semibold"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      requestRemoveCollaborator(index)
                                    }
                                    className="rounded-md border border-[var(--owner-border-strong)] bg-white px-3 py-1.5 text-xs font-semibold text-red-600"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}

                    {peopleTab === "artists" ? (
                      <div className="grid gap-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <ToggleSettingRow
                            title="Enable Artist Lineup"
                            subtitle="Display artist lineup on the event page."
                            checked={lineupEnabled}
                            onCheckedChange={setLineupEnabled}
                          />
                          <ToggleSettingRow
                            title="Lineup to be announced"
                            checked={lineUpToBeAnnounced}
                            onCheckedChange={setLineUpToBeAnnounced}
                          />
                        </div>
                        {lineupEnabled && !lineUpToBeAnnounced ? (
                          <>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm text-[var(--owner-fg-3)]">
                                Add every artist on the lineup. Each appears as
                                a separate card on the event page.
                              </p>
                              <button
                                type="button"
                                onClick={openAddArtistModal}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--owner-blue-500)] px-3 py-2 text-sm font-semibold text-[var(--owner-bg)]"
                              >
                                <PlusIcon size={14} />
                                Add artist
                              </button>
                            </div>
                            {artists.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-[var(--owner-border)] bg-white p-6 text-center text-sm text-[var(--owner-fg-3)]">
                                No artists yet. Click{" "}
                                <strong>Add artist</strong> to start the lineup.
                              </div>
                            ) : (
                              <ul className="grid gap-2">
                                {artists.map((artist, index) => (
                                  <li
                                    key={`artist-${index}`}
                                    className="flex flex-col gap-3 rounded-lg border border-[var(--owner-border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div className="flex min-w-0 items-center gap-3">
                                      <span
                                        className="h-12 w-12 shrink-0 rounded-md bg-[var(--owner-bg-subtle)] bg-cover bg-center"
                                        style={
                                          artist.picture
                                            ? {
                                                backgroundImage: `url(${artist.picture})`,
                                              }
                                            : undefined
                                        }
                                      />
                                      <div className="min-w-0">
                                        <p className="font-semibold">
                                          {artist.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-[var(--owner-fg-3)]">
                                          {artist.actualName ||
                                            "Stage name only"}
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-[var(--owner-fg-3)]">
                                          {artist.instagramLink ? (
                                            <span>Instagram</span>
                                          ) : null}
                                          {artist.spotifyLink ? (
                                            <span>· Spotify</span>
                                          ) : null}
                                          {artist.youtubeLink ? (
                                            <span>· YouTube</span>
                                          ) : null}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 sm:shrink-0">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openEditArtistModal(index)
                                        }
                                        className="rounded-md border border-[var(--owner-border-strong)] bg-white px-3 py-1.5 text-xs font-semibold"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          requestRemoveArtist(index)
                                        }
                                        className="rounded-md border border-[var(--owner-border-strong)] bg-white px-3 py-1.5 text-xs font-semibold text-red-600"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </StepSection>
                ) : null}

                {step === 5 ? (
                  <StepSection
                    title="Additional information"
                    subtitle="Final details before publish. Required policies are saved as your defaults so the next event is prefilled."
                  >
                    {/* Group 1 — Required legal copy */}
                    <section className="rounded-xl border border-[var(--owner-border)] bg-white p-5">
                      <header className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                            Required
                          </div>
                          <h3 className="mt-2 text-base font-semibold text-[var(--owner-fg-1)]">
                            Ticket policies
                          </h3>
                          <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
                            Shown on the customer ticket page and the order
                            confirmation email.
                          </p>
                        </div>
                        {hostDefaultsLoaded &&
                        (hostDefaultsRef.current.ticketingTerms ||
                          hostDefaultsRef.current.refundPolicy) ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (hostDefaultsRef.current.ticketingTerms)
                                setTicketingTerms(
                                  hostDefaultsRef.current.ticketingTerms,
                                );
                              if (hostDefaultsRef.current.refundPolicy)
                                setRefundPolicy(
                                  hostDefaultsRef.current.refundPolicy,
                                );
                            }}
                            className="shrink-0 rounded-md border border-[var(--owner-border)] px-3 py-1.5 text-xs font-semibold text-[var(--owner-fg-2)] hover:bg-[var(--owner-bg-subtle)]"
                          >
                            Reset to my defaults
                          </button>
                        ) : null}
                      </header>
                      <div className="grid gap-5 lg:grid-cols-2">
                        <RichTextEditor
                          label="Ticketing terms & conditions *"
                          value={ticketingTerms}
                          onChange={setTicketingTerms}
                        />
                        <RichTextEditor
                          label="Refund policy *"
                          value={refundPolicy}
                          onChange={setRefundPolicy}
                        />
                      </div>
                    </section>

                    <div className="mt-5">
                      <AdditionalDetailsCards
                        value={additionalDetails}
                        onChange={setAdditionalDetails}
                        onPersist={persistAdditionalDetails}
                        saving={loading}
                      />
                    </div>

                    {/* Group 2 — Promotional assets */}
                    <section className="mt-5 rounded-xl border border-[var(--owner-border)] bg-white p-5">
                      <header className="mb-4">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--owner-fg-3)]">
                          Optional
                        </div>
                        <h3 className="mt-1.5 text-base font-semibold text-[var(--owner-fg-1)]">
                          Promotional assets
                        </h3>
                        <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
                          Drop an image into any slot — uploads go straight to
                          Cloudinary under your event folder.
                        </p>
                      </header>

                      {/* Featured: landscape image (DB field: horizontalFlyer) */}
                      <div className="rounded-lg border border-[var(--owner-blue-200)] bg-[var(--owner-blue-050)] p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full bg-[var(--owner-blue-500)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                            Recommended
                          </span>
                          <span className="text-xs font-medium text-[var(--owner-fg-2)]">
                            Lifts social CTR — used on event hero + OG previews
                          </span>
                        </div>
                        <div className="rounded-lg border border-[var(--owner-border)] bg-white p-3 shadow-sm">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                            <label
                              className="flex min-h-[126px] flex-1 cursor-pointer items-center gap-4 rounded-lg border border-dashed border-[var(--owner-border)] bg-[var(--owner-bg)] px-4 py-4 text-sm transition hover:border-[var(--owner-blue-500)] hover:bg-[var(--owner-bg-subtle)]"
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => {
                                event.preventDefault();
                                handleHorizontalFlyerFile(
                                  event.dataTransfer.files?.[0],
                                );
                              }}
                            >
                              {horizontalFlyer ? (
                                <span
                                  className="aspect-video h-24 shrink-0 rounded-lg bg-cover bg-center shadow-sm"
                                  style={{
                                    backgroundImage: `url(${horizontalFlyer})`,
                                  }}
                                />
                              ) : (
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[var(--owner-fg-3)] shadow-sm">
                                  <UploadCloudIcon size={22} />
                                </span>
                              )}
                              <span className="min-w-0 text-left">
                                <span className="block font-semibold text-[var(--owner-fg-1)]">
                                  Landscape image (16:9)
                                </span>
                                <span className="mt-1 block text-xs leading-5 text-[var(--owner-fg-3)]">
                                  Drop a 1600×900 image or click to crop one.
                                  JPG, PNG, or WebP up to 1.5 MB.
                                </span>
                                {horizontalFlyer ? (
                                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--owner-blue-500)]">
                                    <ImagePlusIcon size={14} />
                                    Replace image
                                  </span>
                                ) : null}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(event) => {
                                  handleHorizontalFlyerFile(
                                    event.target.files?.[0],
                                  );
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                            {horizontalFlyer ? (
                              <div className="flex shrink-0 gap-2 md:w-36 md:flex-col">
                                <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--owner-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--owner-fg-1)] transition hover:border-[var(--owner-blue-500)] md:flex-none">
                                  <ImagePlusIcon size={15} />
                                  Replace
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(event) => {
                                      handleHorizontalFlyerFile(
                                        event.target.files?.[0],
                                      );
                                      event.currentTarget.value = "";
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={removeHorizontalFlyer}
                                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 md:flex-none"
                                >
                                  <XIcon size={15} />
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Social */}
                      <div className="mt-5">
                        <div className="mb-2 text-xs font-semibold text-[var(--owner-fg-2)]">
                          Social previews
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <ImageUrlInput
                            label="Instagram post"
                            value={instagramPost}
                            onChange={setInstagramPost}
                            uploadKind="event-instagram"
                            hostId={selectedHostId}
                            eventId={eventId}
                          />
                          <ImageUrlInput
                            label="Instagram story"
                            value={instagramStory}
                            onChange={setInstagramStory}
                            uploadKind="event-instagram"
                            hostId={selectedHostId}
                            eventId={eventId}
                          />
                        </div>
                      </div>

                      {/* Venue */}
                      <div className="mt-5">
                        <div className="mb-2 text-xs font-semibold text-[var(--owner-fg-2)]">
                          Venue
                        </div>
                        <ImageUrlInput
                          label="Table arrangement image"
                          value={tableLayoutImage}
                          onChange={setTableLayoutImage}
                          uploadKind="event-table-layout"
                          hostId={selectedHostId}
                          eventId={eventId}
                        />
                      </div>

                      {/* Video sneak peek */}
                      <div className="mt-5 rounded-lg border border-[var(--owner-border)] bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                          <label
                            className="flex min-h-[140px] flex-1 cursor-pointer items-center gap-4 rounded-lg border border-dashed border-[var(--owner-border)] bg-[var(--owner-bg)] px-4 py-4 text-sm transition hover:border-[var(--owner-blue-500)] hover:bg-[var(--owner-bg-subtle)]"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              uploadSneakPeekFile(
                                event.dataTransfer.files?.[0],
                              );
                            }}
                          >
                            {videoSneakPeek ? (
                              <video
                                className="h-28 w-20 shrink-0 rounded-lg bg-black object-cover shadow-sm"
                                src={videoSneakPeek}
                                muted
                                playsInline
                                loop
                              />
                            ) : (
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[var(--owner-fg-3)] shadow-sm">
                                <UploadCloudIcon size={22} />
                              </span>
                            )}
                            <span className="min-w-0 text-left">
                              <span className="block font-semibold text-[var(--owner-fg-1)]">
                                Sneak peek video
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-[var(--owner-fg-3)]">
                                Vertical 3:4 MP4 or MOV, 10-60 seconds, up
                                to 5 MB.
                              </span>
                              {videoSneakPeek ? (
                                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--owner-blue-500)]">
                                  <ImagePlusIcon size={14} />
                                  Replace video
                                </span>
                              ) : null}
                            </span>
                            <input
                              type="file"
                              accept=".mp4,.mov,video/mp4,video/quicktime"
                              className="sr-only"
                              disabled={uploadingSneakPeek}
                              onChange={(event) => {
                                uploadSneakPeekFile(
                                  event.target.files?.[0],
                                );
                                event.currentTarget.value = "";
                              }}
                            />
                          </label>
                          {videoSneakPeek ? (
                            <button
                              type="button"
                              onClick={() => setVideoSneakPeek("")}
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 sm:w-28"
                            >
                              <XIcon size={14} />
                              Remove
                            </button>
                          ) : null}
                        </div>
                        {uploadingSneakPeek ? (
                          <p className="mt-2 text-xs text-[var(--owner-fg-3)]">
                            Uploading sneak peek...
                          </p>
                        ) : null}
                      </div>

                      {/* Gallery */}
                      <div className="mt-5 rounded-lg border border-[var(--owner-border)] bg-white p-4 shadow-sm">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-[var(--owner-fg-2)]">
                              Gallery
                            </div>
                            <p className="mt-0.5 text-xs text-[var(--owner-fg-3)]">
                              Up to 8 images or vertical videos. Images: JPG/PNG
                              up to 1.5 MB. Videos: 3:4 MP4/MOV, 10-60 seconds,
                              up to 5 MB.
                            </p>
                          </div>
                          <span className="rounded-md bg-[var(--owner-bg-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--owner-fg-3)]">
                            {galleryItems.length}/{maxEventGalleryItems}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {galleryItems.map((item) => (
                            <div
                              key={item.url}
                              className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)]"
                            >
                              {item.type === "VIDEO" ? (
                                <video
                                  src={item.url}
                                  className="h-full w-full object-cover"
                                  muted
                                  playsInline
                                  loop
                                />
                              ) : (
                                <span
                                  className="block h-full w-full bg-cover bg-center"
                                  style={{ backgroundImage: `url(${item.url})` }}
                                />
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setGalleryItems((current) =>
                                    current.filter(
                                      (entry) => entry.url !== item.url,
                                    ),
                                  )
                                }
                                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-100 transition hover:bg-black sm:opacity-0 sm:group-hover:opacity-100"
                                aria-label="Remove gallery item"
                              >
                                <XIcon size={14} />
                              </button>
                            </div>
                          ))}
                          {galleryItems.length < maxEventGalleryItems ? (
                            <label
                              className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--owner-border)] bg-[var(--owner-bg)] text-center text-xs font-semibold text-[var(--owner-fg-3)] transition hover:border-[var(--owner-blue-500)] hover:bg-[var(--owner-bg-subtle)]"
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => {
                                event.preventDefault();
                                uploadGalleryFiles(event.dataTransfer.files);
                              }}
                            >
                              <UploadCloudIcon size={22} />
                              <span>
                                {uploadingGallery
                                  ? "Uploading..."
                                  : "Add media"}
                              </span>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.mp4,.mov,image/jpeg,image/png,video/mp4,video/quicktime"
                                className="sr-only"
                                multiple
                                disabled={uploadingGallery}
                                onChange={(event) => {
                                  uploadGalleryFiles(
                                    event.target.files ?? undefined,
                                  );
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                          ) : null}
                        </div>
                      </div>
                    </section>

                    {/* Group 3 — Event behaviour */}
                    <section className="mt-5 rounded-xl border border-[var(--owner-border)] bg-white p-5">
                      <header className="mb-4">
                        <h3 className="text-base font-semibold text-[var(--owner-fg-1)]">
                          Event settings
                        </h3>
                        <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
                          Visibility and contact settings — change these any
                          time after publishing.
                        </p>
                      </header>
                      <div className="space-y-3">
                        <ToggleSettingRow
                          title="Event is visible to public"
                          subtitle="Off keeps the event off the public site and search results."
                          checked={isVisible}
                          onCheckedChange={requestEventVisibilityChange}
                        />
                        <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] p-3">
                          <Input
                            label="Contact for table queries (optional)"
                            value={contactForQueriesTables}
                            onChange={setContactForQueriesTables}
                          />
                          <p className="mt-1.5 text-[11px] text-[var(--owner-fg-3)]">
                            Phone or email shown to guests asking about table
                            bookings or seating.
                          </p>
                        </div>
                      </div>
                    </section>
                  </StepSection>
                ) : null}
              </div>
            </div>
          </section>
          {/* Action bar sits OUTSIDE the scrolling section as a flex sibling
            so it naturally pins to the bottom of the middle column and
            touches the viewport bottom regardless of section padding. */}
          <div className="shrink-0 border-t border-[var(--owner-border)] bg-[var(--owner-bg)]">
            <div className="mx-auto flex max-w-5xl flex-col justify-between gap-3 px-4 py-3 sm:flex-row md:px-6">
              <button
                type="button"
                disabled={step === 0 || loading}
                onClick={() => setStep(step - 1)}
                className="rounded-lg border border-[var(--owner-border)] px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Back
              </button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={loading}
                  onClick={
                    step === lastStepIndex && !isPublished
                      ? requestPublishFlow
                      : () => saveCurrentStep()
                  }
                  className="rounded-lg bg-[var(--owner-blue-500)] px-5 py-2 text-sm font-semibold text-[var(--owner-bg)] disabled:opacity-60"
                >
                  {loading
                    ? "Saving..."
                    : step === lastStepIndex
                      ? isPublished
                        ? "Save changes"
                        : isPaid
                          ? "Review & publish"
                          : "Publish free event"
                      : mode === "update"
                        ? "Update"
                        : "Save and continue"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="relative hidden min-h-0 overflow-hidden border-l border-[var(--owner-border)] bg-[var(--owner-fg-1)] text-[var(--owner-bg)] xl:block">
          {/* Animated film-grain — anchored to the aside frame (not to
              the scroll content) so it stays visible while the host
              scrolls through the preview body. Putting overflow:hidden
              on the aside and moving the scroll into the inner div
              prevents the absolute-positioned canvas from being clipped
              past the first viewport. */}
          <PreviewNoise opacity={0.4} patternAlpha={14} />
          <div className="relative z-10 flex h-full flex-col overflow-y-auto p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--owner-blue-100)]">
            <SparklesIcon size={16} />
            Live Event Preview
          </div>
          <div className="mt-4">
            <CustomerEventCard
              flyer={eventFlyer || undefined}
              dateLine={formatDate(startDate)}
              title={title || "Untitled Event"}
              venueLine={(() => {
                const venue = selectedPlace?.label || addressLine1;
                const cityLabel = city || "City pending";
                return venue ? `${venue} | ${cityLabel}` : cityLabel;
              })()}
              priceLine={(() => {
                // Cheapest visible PAID ticket. "0 onwards" used to leak
                // through when only the draft `ticketPrice` was checked.
                if (eventType === "FREE") return "RSVP";
                const paid = (tickets ?? [])
                  .filter(
                    (t) =>
                      t.ticketCategory !== "GUESTLIST" &&
                      Number(t.ticketPrice ?? 0) > 0 &&
                      (t.ticketVisible ?? true),
                  )
                  .map((t) => Number(t.ticketPrice ?? 0));
                if (paid.length === 0) return "RSVP";
                const cheapest = Math.min(...paid);
                return `${rupee(cheapest)} onwards`;
              })()}
            />
          </div>

          </div>
        </aside>
        {ticketModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
            <div className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-[var(--owner-bg)] shadow-2xl">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--owner-border)] px-5 py-4">
                <div>
                  <div className="text-sm font-semibold">
                    {ticketEditIndex === null ? "Add Ticket" : "Edit Ticket"}
                  </div>
                  <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
                    Ticket-level advanced settings stay collapsed until needed.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeTicketModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--owner-border)]"
                >
                  <XIcon size={16} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {ticketCategories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      disabled={
                        eventType === "FREE" && category.value !== "GUESTLIST"
                      }
                      title={
                        eventType === "FREE" && category.value !== "GUESTLIST"
                          ? "Select Exclusive or Non-Exclusive event category to create ticketed entries."
                          : undefined
                      }
                      onClick={() => {
                        // On a fresh ticket where the host hasn't touched the
                        // per-user cap (it still equals the current category's
                        // default), move it to the new category's default so an
                        // RSVP/Guestlist tier lands on 2 and a paid tier on 10.
                        // Never overwrite a value the host has customized.
                        if (
                          ticketEditIndex === null &&
                          maxTicketPerUser === defaultMaxPerUser(ticketCategory)
                        ) {
                          setMaxTicketPerUser(defaultMaxPerUser(category.value));
                        }
                        setTicketCategory(category.value);
                      }}
                      className={`rounded-lg border px-3 py-3 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45 ${
                        ticketCategory === category.value
                          ? "border-[var(--owner-blue-500)] bg-white"
                          : "border-[var(--owner-border)] bg-[var(--owner-bg)]"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Ticket Name *"
                    value={ticketName}
                    onChange={setTicketName}
                  />
                  {/* Multi-day "Valid for" picker — tags the ticket to a day or
                      makes it an all-days festival pass. Hidden for single-day. */}
                  {markSeparateDays &&
                  multiDayEligible &&
                  eventDays.length >= 2 ? (
                    <Select
                      label="Valid for *"
                      value={ticketDayId || ALL_DAYS_TICKET}
                      onChange={(value) => setTicketDayId(value)}
                      options={[
                        {
                          value: ALL_DAYS_TICKET,
                          label: "All days (festival pass)",
                        },
                        ...eventDays.map((d, i) => ({
                          value: d.dayId,
                          label: d.title || `Day ${i + 1}`,
                        })),
                      ]}
                    />
                  ) : null}
                  {/* Single/Couple distinction is irrelevant for table
                      and group bookings — the capacity field already
                      describes the seating unit. */}
                  {ticketCategory === "TABLE" ||
                  ticketCategory === "GROUP" ? null : (
                    <Select
                      label="Ticket Type *"
                      value={ticketType}
                      onChange={(value) =>
                        setTicketType(value as TicketTypeValue)
                      }
                      options={[
                        { value: "SINGLE", label: "Single Entry" },
                        { value: "COUPLE", label: "Couple Entry" },
                      ]}
                    />
                  )}
                  <div className="md:col-span-2">
                    <RichTextEditor
                      label="Ticket Description (optional)"
                      value={ticketDescription}
                      onChange={setTicketDescription}
                    />
                  </div>
                  <Input
                    label="Ticket Capacity *"
                    type="number"
                    value={ticketCapacity > 0 ? String(ticketCapacity) : ""}
                    onChange={(value) =>
                      setTicketCapacity(
                        value === "" ? 0 : Math.max(0, Number(value) || 0),
                      )
                    }
                  />
                  {ticketCategory !== "GUESTLIST" ? (
                    <Input
                      label="Ticket Price (INR) *"
                      type="number"
                      value={ticketPrice > 0 ? String(ticketPrice) : ""}
                      onChange={(value) =>
                        setTicketPrice(
                          value === "" ? 0 : Math.max(0, Number(value) || 0),
                        )
                      }
                    />
                  ) : null}
                  {ticketCategory !== "GUESTLIST" ? (
                    <>
                      <Select
                        label="Cover Type"
                        value={coverType}
                        onChange={(value) =>
                          setCoverType(value as CoverTypeValue)
                        }
                        options={[
                          { value: "FULL_COVER", label: "Full Cover" },
                          { value: "FOOD_COVER", label: "Food Cover" },
                          { value: "DRINK_COVER", label: "Drink Cover" },
                          {
                            value: "FOOD_AND_DRINK_COVER",
                            label: "Food and Drink Cover",
                          },
                          { value: "NO_COVER", label: "No Cover" },
                        ]}
                      />
                      {hostGstEligible ? (
                        <Select
                          label="GST Type"
                          value={ticketGST}
                          onChange={(value) => setTicketGST(value as GstValue)}
                          options={[
                            {
                              value: "CGST_SGST_18",
                              label:
                                "GST 18% — CGST 9% + SGST/UTGST 9% (recommended)",
                            },
                            { value: "IGST_18", label: "IGST 18%" },
                            { value: "ZERO", label: "No GST (0%)" },
                            { value: "OTHER", label: "Custom rate" },
                            {
                              value: "NONE",
                              label: "No GST line on customer invoice",
                            },
                          ]}
                        />
                      ) : (
                        <div className="rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] p-3 text-xs text-[var(--owner-fg-3)]">
                          <div className="font-semibold text-[var(--owner-fg-2)]">
                            Ticket GST not applicable
                          </div>
                          <div className="mt-1 leading-5">
                            Hoizr collects ticket GST from customers only when
                            your payout profile is GST-registered as{" "}
                            <em>Regular</em> or <em>Casual Taxable Person</em>.
                            Add or update your GST details under Settings →
                            Payouts to enable this.
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                  {hostGstEligible && ticketGST === "OTHER" ? (
                    <Input
                      label="Custom GST Rate (%)"
                      type="number"
                      value={gstRate > 0 ? String(gstRate) : ""}
                      onChange={(value) =>
                        setGstRate(
                          value === "" ? 0 : Math.max(0, Number(value) || 0),
                        )
                      }
                    />
                  ) : null}
                  {ticketCategory === "GROUP" ? (
                    <Input
                      label="Group Capacity *"
                      type="number"
                      value={groupCapacity > 0 ? String(groupCapacity) : ""}
                      onChange={(value) =>
                        setGroupCapacity(
                          value === "" ? 0 : Math.max(0, Number(value) || 0),
                        )
                      }
                    />
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setTicketAdvancedOpen((open) => !open)}
                  className="mt-5 flex w-full items-center justify-between rounded-lg border border-[var(--owner-border)] bg-white px-4 py-3 text-left text-sm font-semibold"
                >
                  Advanced settings
                  <ChevronDownIcon
                    size={16}
                    className={`transition ${
                      ticketAdvancedOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {ticketAdvancedOpen ? (
                  <div className="mt-3 grid gap-4 rounded-lg border border-[var(--owner-border)] bg-white p-4 md:grid-cols-2">
                    <Input
                      label="Max Tickets Per User (optional)"
                      type="number"
                      value={
                        maxTicketPerUser > 0 ? String(maxTicketPerUser) : ""
                      }
                      onChange={(value) =>
                        setMaxTicketPerUser(
                          value === "" ? 0 : Math.max(0, Number(value) || 0),
                        )
                      }
                    />
                    <DateTimeInput
                      label="Set Purchase Expiry (optional)"
                      value={ticketExpiryDateTime}
                      onChange={setTicketExpiryDateTime}
                    />
                    <ToggleSettingRow
                      title="Coming Soon"
                      subtitle="Show this ticket without allowing checkout yet."
                      checked={ticketComingSoon}
                      onCheckedChange={setTicketComingSoon}
                    />
                    <ToggleSettingRow
                      title="On-Ground Only"
                      subtitle="Hide online checkout for this ticket."
                      checked={ticketOnGroundOnly}
                      onCheckedChange={setTicketOnGroundOnly}
                    />
                    <ToggleSettingRow
                      title="Ticket Visible"
                      subtitle="Use this to pause a ticket without deleting it."
                      checked={ticketVisible}
                      onCheckedChange={requestTicketDraftVisibilityChange}
                    />
                  </div>
                ) : null}
              </div>
              <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--owner-border)] px-5 py-4">
                <button
                  type="button"
                  onClick={closeTicketModal}
                  className="rounded-lg border border-[var(--owner-border)] px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveTicketDraft}
                  className="rounded-lg bg-[var(--owner-blue-500)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)]"
                >
                  {ticketEditIndex === null ? "Add Ticket" : "Save Ticket"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {extraModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
            <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-[var(--owner-bg)] shadow-2xl">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--owner-border)] px-5 py-4">
                <div className="text-sm font-semibold">
                  {extraEditIndex === null ? "Add Add-on" : "Edit Add-on"}
                </div>
                <button
                  type="button"
                  onClick={closeExtraModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--owner-border)]"
                >
                  <XIcon size={16} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Add-on Name *"
                    value={extraName}
                    onChange={setExtraName}
                  />
                  <Select
                    label="Type *"
                    value={extraType}
                    onChange={(value) =>
                      setExtraType(value as HoizrExtraTypeValue)
                    }
                    options={[
                      { value: "VIP_UPGRADE", label: "VIP Upgrade" },
                      { value: "MEET_AND_GREET", label: "Meet & Greet" },
                      { value: "MERCH", label: "Merchandise" },
                      { value: "FOOD_DRINK", label: "Food & Drink" },
                      { value: "OTHER", label: "Other" },
                    ]}
                  />
                  <Input
                    label="Price (INR) *"
                    type="number"
                    value={extraPrice > 0 ? String(extraPrice) : ""}
                    onChange={(value) =>
                      setExtraPrice(
                        value === "" ? 0 : Math.max(0, Number(value) || 0),
                      )
                    }
                  />
                  <Input
                    label="Quantity *"
                    type="number"
                    value={extraQuantity > 0 ? String(extraQuantity) : ""}
                    onChange={(value) =>
                      setExtraQuantity(
                        value === "" ? 0 : Math.max(0, Number(value) || 0),
                      )
                    }
                  />
                  <div className="md:col-span-2">
                    <RichTextEditor
                      label="Description (optional)"
                      value={extraDescription}
                      onChange={setExtraDescription}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUrlInput
                      label="Add-on Image (optional)"
                      value={extraImage}
                      onChange={setExtraImage}
                      hostId={selectedHostId}
                      eventId={eventId}
                      uploadKind="event-extra"
                    />
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--owner-border)] px-5 py-4">
                <button
                  type="button"
                  onClick={closeExtraModal}
                  className="rounded-lg border border-[var(--owner-border)] px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveExtraDraft}
                  className="rounded-lg bg-[var(--owner-blue-500)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)]"
                >
                  {extraEditIndex === null ? "Add Add-on" : "Save Add-on"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {collabModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
            <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-[var(--owner-bg)] shadow-2xl">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--owner-border)] px-5 py-4">
                <div>
                  <div className="text-sm font-semibold">
                    {collabEditIndex === null
                      ? "Add Collaborator"
                      : "Edit Collaborator"}
                  </div>
                  <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
                    Collaborators must be on Hoizr. We&apos;ll email them when
                    you add them — the event appears on their dashboard as{" "}
                    <strong>Collaborator</strong> right away. They can leave
                    anytime.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCollabModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--owner-border)]"
                >
                  <XIcon size={16} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Search collaborator organizer
                      <div className="mt-1">
                        <input
                          value={collaboratorQuery}
                          onChange={(event) =>
                            setCollaboratorQuery(event.target.value)
                          }
                          className="input input-primary h-10 w-full px-3 text-sm"
                          placeholder="Organizer name, email or phone"
                        />
                      </div>
                    </label>
                    {collaboratorSearchResults.length ? (
                      <div className="mt-3 grid gap-2">
                        {collaboratorSearchResults.map((host) => (
                          <button
                            key={host._id}
                            type="button"
                            onClick={() => selectCollaborator(host)}
                            className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition ${
                              collaboratorLinkId === host._id
                                ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-050)]"
                                : "border-[var(--owner-border)] bg-[var(--owner-bg)] hover:bg-[var(--owner-bg-subtle)]"
                            }`}
                          >
                            <span
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[var(--owner-bg-subtle)] bg-cover bg-center text-xs font-semibold uppercase text-[var(--owner-fg-3)]"
                              style={
                                host.logo
                                  ? { backgroundImage: `url(${host.logo})` }
                                  : undefined
                              }
                            >
                              {!host.logo
                                ? (host.name ?? "?").slice(0, 1)
                                : null}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-semibold">
                                {host.name ?? "Unnamed organizer"}
                              </span>
                              <span className="block truncate text-xs text-[var(--owner-fg-3)]">
                                {host.email ?? host.phone ?? "Organizer"}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : collaboratorQuery.trim().length >= 2 ? (
                      <div className="mt-3 rounded-md border border-dashed border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] p-3 text-sm">
                        <p className="font-semibold">
                          No match for “{collaboratorQuery.trim()}” on Hoizr.
                        </p>
                        <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
                          Please onboard {collaboratorQuery.trim()} to Hoizr to
                          maximize event sales and event performance — once
                          they join, you can add them as a collaborator here.
                        </p>
                        <button
                          type="button"
                          onClick={openReferralModalFromCollab}
                          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[var(--owner-blue-500)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--owner-blue-500)]"
                        >
                          Refer them to Hoizr
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {collaboratorLinkId ? (
                    <>
                      <Input
                        label="Collaborator display name"
                        value={collaboratorName}
                        onChange={setCollaboratorName}
                      />
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--owner-fg-3)]">
                          What this collaborator can do
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <ToggleSettingRow
                            title="See event metrics"
                            subtitle="Sales, attendance, conversion."
                            checked={canSeeMetrics}
                            onCheckedChange={setCanSeeMetrics}
                          />
                          <ToggleSettingRow
                            title="Run campaigns for this event"
                            subtitle="Email blasts targeting attendees."
                            checked={canRunCampaigns}
                            onCheckedChange={setCanRunCampaigns}
                          />
                          <ToggleSettingRow
                            title="Create offers / discount codes"
                            subtitle="Promo codes that apply at checkout."
                            checked={canCreateOffers}
                            onCheckedChange={setCanCreateOffers}
                          />
                          <ToggleSettingRow
                            title="Access customer list"
                            subtitle="Download buyer contact details."
                            checked={requestCustomerListAccess}
                            onCheckedChange={setRequestCustomerListAccess}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--owner-fg-3)]">
                          Display &amp; operations
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <ToggleSettingRow
                            title="Hide on Event Page"
                            subtitle="Don't show as a co-organizer publicly."
                            checked={hideOnEventPage}
                            onCheckedChange={setHideOnEventPage}
                          />
                          <ToggleSettingRow
                            title="Allow Offline Tickets"
                            subtitle="Can issue tickets at the door."
                            checked={allowIssuingOfflineTickets}
                            onCheckedChange={setAllowIssuingOfflineTickets}
                          />
                          <ToggleSettingRow
                            title="Send Transactional Emails"
                            subtitle="Cc'd on ticket purchase emails."
                            checked={sendTransactionalMails}
                            onCheckedChange={setSendTransactionalMails}
                          />
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--owner-border)] px-5 py-3">
                <button
                  type="button"
                  onClick={closeCollabModal}
                  className="rounded-lg border border-[var(--owner-border-strong)] bg-white px-3 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveCollaboratorDraft}
                  className="rounded-lg bg-[var(--owner-blue-500)] px-3 py-2 text-sm font-semibold text-[var(--owner-bg)]"
                >
                  {collabEditIndex === null
                    ? "Add Collaborator"
                    : "Save Collaborator"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {artistModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
            <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-[var(--owner-bg)] shadow-2xl">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--owner-border)] px-5 py-4">
                <div>
                  <div className="text-sm font-semibold">
                    {artistEditIndex === null ? "Add Artist" : "Edit Artist"}
                  </div>
                  <p className="mt-1 text-xs text-[var(--owner-fg-3)]">
                    Search by stage or real name first. If there is no match,
                    add the artist manually.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeArtistModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--owner-border)]"
                >
                  <XIcon size={16} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Search Artist
                      <input
                        value={artistQuery}
                        onChange={(event) => setArtistQuery(event.target.value)}
                        className="input input-primary mt-1 h-10 w-full px-3 text-sm"
                        placeholder="Type stage name or real name"
                      />
                    </label>
                    {artistSearchResults.length ? (
                      <div className="mt-3 grid gap-2">
                        {artistSearchResults.map((artist) => (
                          <button
                            key={`${artist.source}-${artist.id ?? artist.name}`}
                            type="button"
                            onClick={() => selectArtist(artist)}
                            className="flex items-center gap-3 rounded-md border border-[var(--owner-border)] bg-[var(--owner-bg)] px-3 py-2 text-left text-sm hover:bg-[var(--owner-bg-subtle)]"
                          >
                            <span
                              className="h-10 w-10 shrink-0 rounded-md bg-[var(--owner-bg-subtle)] bg-cover bg-center"
                              style={
                                artist.picture
                                  ? {
                                      backgroundImage: `url(${artist.picture})`,
                                    }
                                  : undefined
                              }
                            />
                            <span className="min-w-0">
                              <span className="block truncate font-semibold">
                                {artist.name}
                              </span>
                              <span className="block truncate text-xs text-[var(--owner-fg-3)]">
                                {[artist.firstName, artist.lastName]
                                  .filter(Boolean)
                                  .join(" ") ||
                                  (artist.source === "ARTIST"
                                    ? "Verified artist"
                                    : "Suggested match")}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : artistQuery.trim().length >= 2 &&
                      artistSearchAttempted ? (
                      <p className="mt-2 text-xs text-[var(--owner-fg-3)]">
                        No artist found. Continue with the manual fields below.
                      </p>
                    ) : artistEditIndex === null ? (
                      <p className="mt-2 text-xs text-[var(--owner-fg-3)]">
                        Manual fields unlock after a search returns no artist.
                      </p>
                    ) : null}
                  </div>
                  {artistManualEntryEnabled ? (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          label="Stage Name *"
                          value={artistName}
                          onChange={setArtistName}
                        />
                        <Input
                          label="Real Name"
                          value={artistActualName}
                          onChange={setArtistActualName}
                        />
                      </div>
                      <ImageUrlInput
                        label="Artist Picture *"
                        value={artistPicture}
                        onChange={setArtistPicture}
                        onFileChange={setPendingArtistFile}
                        hostId={selectedHostId}
                        eventId={eventId}
                        uploadKind="event-extra"
                      />
                      <div className="grid gap-3 md:grid-cols-3">
                        <Input
                          label="Instagram Link"
                          value={artistInstagram}
                          onChange={setArtistInstagram}
                        />
                        <Input
                          label="Spotify Link"
                          value={artistSpotify}
                          onChange={setArtistSpotify}
                        />
                        <Input
                          label="YouTube Link"
                          value={artistYoutube}
                          onChange={setArtistYoutube}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="rounded-md border border-dashed border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] px-4 py-5 text-sm text-[var(--owner-fg-3)]">
                      Search for the artist first. Manual entry is available
                      only when no existing artist is found.
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--owner-border)] px-5 py-3">
                <button
                  type="button"
                  onClick={closeArtistModal}
                  className="rounded-lg border border-[var(--owner-border-strong)] bg-white px-3 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveArtistDraft}
                  disabled={!artistManualEntryEnabled || artistSaving}
                  className="rounded-lg bg-[var(--owner-blue-500)] px-3 py-2 text-sm font-semibold text-[var(--owner-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {artistSaving
                    ? "Uploading..."
                    : artistEditIndex === null
                      ? "Add Artist"
                      : "Save Artist"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {referralModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
            <div className="w-full max-w-md rounded-lg bg-[var(--owner-bg)] p-5 shadow-2xl">
              <div className="text-sm font-semibold">
                Refer an organizer to Hoizr
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--owner-fg-3)]">
                We’ll reach out and invite this organizer. Once they accept and
                onboard, you can add them as a collaborator on this and future
                events.
              </p>
              <div className="mt-4 grid gap-3">
                <Input
                  label="Organizer or venue name *"
                  value={referralHostName}
                  onChange={setReferralHostName}
                />
                <Input
                  label="Email or phone *"
                  value={referralHostContact}
                  onChange={setReferralHostContact}
                />
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeReferralModal}
                  className="rounded-lg border border-[var(--owner-border-strong)] bg-white px-3 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReferral}
                  className="rounded-lg bg-[var(--owner-blue-500)] px-3 py-2 text-sm font-semibold text-[var(--owner-bg)]"
                >
                  Send referral
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {flyerCropOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
            <div className="w-full max-w-md rounded-lg bg-[var(--owner-bg)] p-5 shadow-2xl">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon size={18} />
                {flyerCropTarget.title}
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--owner-fg-3)]">
                {flyerCropTarget.description}
              </p>
              <div className="mt-4 flex justify-center">
                <div
                  className="relative inline-block touch-none cursor-grab overflow-hidden rounded-lg bg-[var(--owner-bg-subtle)] active:cursor-grabbing"
                  onPointerDown={(event) => {
                    if (!flyerNaturalRatio) return;
                    const target = event.currentTarget;
                    event.preventDefault();
                    target.setPointerCapture(event.pointerId);
                    const updatePosition = (
                      clientX: number,
                      clientY: number,
                    ) => {
                      const rect = target.getBoundingClientRect();
                      const pctX = ((clientX - rect.left) / rect.width) * 100;
                      const pctY = ((clientY - rect.top) / rect.height) * 100;
                      const wRange = 100 - flyerCropWindow.widthPct;
                      const hRange = 100 - flyerCropWindow.heightPct;
                      setCropX(
                        wRange > 0
                          ? Math.max(
                              0,
                              Math.min(
                                100,
                                ((pctX - flyerCropWindow.widthPct / 2) /
                                  wRange) *
                                  100,
                              ),
                            )
                          : 50,
                      );
                      setCropY(
                        hRange > 0
                          ? Math.max(
                              0,
                              Math.min(
                                100,
                                ((pctY - flyerCropWindow.heightPct / 2) /
                                  hRange) *
                                  100,
                              ),
                            )
                          : 50,
                      );
                    };
                    updatePosition(event.clientX, event.clientY);
                    const move = (moveEvent: PointerEvent) => {
                      updatePosition(moveEvent.clientX, moveEvent.clientY);
                    };
                    const up = () => {
                      target.removeEventListener("pointermove", move);
                      target.removeEventListener("pointerup", up);
                      target.releasePointerCapture(event.pointerId);
                    };
                    target.addEventListener("pointermove", move);
                    target.addEventListener("pointerup", up);
                  }}
                >
                  {flyerPreview ? (
                    <img
                      ref={flyerImgRef}
                      src={flyerPreview}
                      alt=""
                      draggable={false}
                      onLoad={(event) => {
                        const img = event.currentTarget;
                        if (img.naturalWidth && img.naturalHeight) {
                          setFlyerNaturalRatio(
                            img.naturalWidth / img.naturalHeight,
                          );
                        }
                      }}
                      className={`pointer-events-none block h-auto max-h-[60vh] w-auto select-none ${
                        flyerCropMode === "horizontal"
                          ? "max-w-[32rem]"
                          : "max-w-[20rem]"
                      }`}
                    />
                  ) : null}
                  {flyerNaturalRatio ? (
                    <div
                      className="pointer-events-none absolute rounded-md border-2 border-white shadow-[0_0_0_999px_rgba(0,0,0,0.45)]"
                      style={{
                        width: `${flyerCropWindow.widthPct}%`,
                        height: `${flyerCropWindow.heightPct}%`,
                        left: `${
                          (100 - flyerCropWindow.widthPct) * (cropX / 100)
                        }%`,
                        top: `${
                          (100 - flyerCropWindow.heightPct) * (cropY / 100)
                        }%`,
                      }}
                    />
                  ) : null}
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <label className="block text-xs font-semibold text-[var(--owner-fg-3)]">
                  Zoom {Math.round(cropZoom)}%
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={cropZoom}
                    onChange={(event) =>
                      setCropZoom(Number(event.target.value))
                    }
                    className="mt-1 w-full accent-[var(--owner-blue-500)]"
                  />
                </label>
                <label className="block text-xs font-semibold text-[var(--owner-fg-3)]">
                  Horizontal position
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropX}
                    onChange={(event) => setCropX(Number(event.target.value))}
                    className="mt-1 w-full accent-[var(--owner-blue-500)]"
                  />
                </label>
                <label className="block text-xs font-semibold text-[var(--owner-fg-3)]">
                  Vertical position
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropY}
                    onChange={(event) => setCropY(Number(event.target.value))}
                    className="mt-1 w-full accent-[var(--owner-blue-500)]"
                  />
                </label>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={uploadingFlyer}
                  onClick={() => setFlyerCropOpen(false)}
                  className="rounded-lg border border-[var(--owner-border)] px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={uploadingFlyer}
                  onClick={saveFlyerCrop}
                  className="rounded-lg bg-[var(--owner-blue-500)] px-4 py-2 text-sm font-semibold text-[var(--owner-bg)] disabled:opacity-60"
                >
                  {uploadingFlyer ? "Uploading..." : "Save flyer"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {publishedLiveUrl ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="px-6 pb-6 pt-7 text-center">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#E9F7EF] text-3xl">
                  🎉
                </div>
                <h2 className="text-xl font-semibold text-[var(--owner-fg-1)]">
                  Your event is live!
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--owner-fg-3)]">
                  Customers can now discover it and book tickets on Hoizr. Share
                  your link to start driving early sales.
                </p>
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg-subtle)] px-3 py-2 text-left">
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--owner-fg-2)]">
                    {publishedLiveUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard
                        ?.writeText(publishedLiveUrl)
                        .catch(() => {});
                      setToastData({ type: "success", message: "Link copied" });
                    }}
                    className="shrink-0 rounded-md px-2 py-1 text-[12px] font-semibold text-[#0F8842] hover:bg-[#E9F7EF]"
                  >
                    Copy
                  </button>
                </div>
                <div className="mt-5 grid gap-2">
                  <a
                    href={publishedLiveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0F8842] text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    View live page
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setPublishedLiveUrl(null);
                      router.push(`/events/${eventId}/manage`);
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--owner-border)] text-sm font-semibold text-[var(--owner-fg-1)] transition hover:bg-[var(--owner-bg-subtle)]"
                  >
                    Go to event dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {publishModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex h-[96dvh] max-h-[96dvh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 px-6 pt-6">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--owner-fg-1)]">
                    Confirm your publish offer
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--owner-fg-3)]">
                    Basic Hoizr commission stays first. Smart offers are shown
                    after it by highest projected savings and benefit. The
                    strongest offer is marked recommended, with commission and
                    upfront amount separated before you publish.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPublishModalOpen(false)}
                  disabled={publishing}
                  className="rounded-md p-1 text-[var(--owner-fg-3)] hover:bg-[var(--owner-bg-subtle)]"
                  aria-label="Close"
                >
                  <XIcon size={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                {(() => {
                  const selectedOption = pricingOptions.find(
                    (o) => o.optionId === selectedPricingOptionId,
                  );
                  const upfrontFee = Number(selectedOption?.upfrontFee ?? 0);
                  if (upfrontFee <= 0) return null;
                  const selectedAmount = formatIndianRupees(upfrontFee);
                  return (
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-amber-800">
                            Selected upfront amount
                          </p>
                          <p className="mt-1 text-sm leading-6 text-amber-900">
                            This amount applies only if the offer&apos;s
                            sell-through condition is met. Choose how it should
                            be collected before payout release.
                          </p>
                        </div>
                        <div className="rounded-lg bg-white px-4 py-3 text-right shadow-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                            Upfront
                          </p>
                          <p className="text-2xl font-bold tabular-nums text-amber-950">
                            {selectedAmount}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() =>
                            requestFeeSettlementModeChange(
                              "DEDUCT_FROM_PAYOUT",
                            )
                          }
                          className={`rounded-lg border p-3 text-left text-xs transition ${
                            feeSettlementMode === "DEDUCT_FROM_PAYOUT"
                              ? "border-[var(--owner-blue-500)] bg-white shadow-sm"
                              : "border-amber-200 bg-white/65 hover:bg-white"
                          }`}
                        >
                          <div className="font-semibold text-[var(--owner-fg-1)]">
                            Auto-deduct from payout
                          </div>
                          <div className="mt-1 leading-5 text-[var(--owner-fg-3)]">
                            If triggered, Hoizr withholds {selectedAmount} from
                            the event settlement. No separate payment link is
                            needed.
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            requestFeeSettlementModeChange("PAY_AFTER_EVENT")
                          }
                          className={`rounded-lg border p-3 text-left text-xs transition ${
                            feeSettlementMode === "PAY_AFTER_EVENT"
                              ? "border-[var(--owner-blue-500)] bg-white shadow-sm"
                              : "border-amber-200 bg-white/65 hover:bg-white"
                          }`}
                        >
                          <div className="font-semibold text-[var(--owner-fg-1)]">
                            Organizer-paid payment link
                          </div>
                          <div className="mt-1 leading-5 text-[var(--owner-fg-3)]">
                            If triggered, Hoizr collects {selectedAmount} plus
                            GST through a Razorpay payment link/order after the
                            event. Your payout is not reduced by this fee.
                          </div>
                        </button>
                      </div>
                      <p className="mt-3 text-[11.5px] leading-5 text-amber-900">
                        If the sell-through condition is not met, the upfront
                        amount is waived or refunded according to the selected
                        collection path.
                      </p>
                    </div>
                  );
                })()}

                {(() => {
                  const aiOptionIds = new Set(
                    (aiBoostGeneration?.offers ?? []).map(
                      (o) => `${AI_OFFER_PREFIX}${o.offerCode}`,
                    ),
                  );
                  const legacyOptions = pricingOptions.filter(
                    (p) => !aiOptionIds.has(p.optionId),
                  );
                  // Basic = the legacy option with no upfront fee (typically
                  // "Zero Upfront"). Falls back to the first legacy option so
                  // there is always exactly one "basic" card to anchor the
                  // selection.
                  const basicOption =
                    legacyOptions.find((o) => (o.upfrontFee ?? 0) === 0) ??
                    legacyOptions[0] ??
                    null;

                  const aiCards = (aiBoostGeneration?.offers ?? [])
                    .map((boost) => {
                      const optionId = `${AI_OFFER_PREFIX}${boost.offerCode}`;
                      const option = pricingOptions.find(
                        (o) => o.optionId === optionId,
                      );
                      if (!option) return null;
                      return { boost, option };
                    })
                    .filter(
                      (
                        entry,
                      ): entry is {
                        boost: NonNullable<
                          typeof aiBoostGeneration
                        >["offers"][number];
                        option: PricingOption;
                      } => entry !== null,
                    )
                    // Order: largest absolute savings first, then marketing /
                    // commission benefit as a tie-breaker. The first smart card
                    // is also the recommended one.
                    .sort((a, b) =>
                      compareAiBoostBenefit(a.boost, b.boost),
                    );
                  const recommendedOfferCode =
                    aiCards[0]?.boost.offerCode ?? "";

                  if (!pricingOptions.length) {
                    return (
                      <div className="mt-5 rounded-lg border border-[var(--owner-border)] bg-[var(--owner-bg)] p-4 text-sm text-[var(--owner-fg-3)]">
                        No offers calculated yet. Close this modal and reopen it
                        after saving the last step.
                      </div>
                    );
                  }

                  return (
                    <div className="-mx-6 mt-5 overflow-x-auto px-6 pb-1">
                      <div className="flex min-w-min items-stretch gap-4">
                        {basicOption ? (
                          <button
                            key={basicOption.optionId}
                            type="button"
                            onClick={() =>
                              setSelectedPricingOptionId(basicOption.optionId)
                            }
                            className={`flex min-h-[540px] w-[300px] shrink-0 self-stretch flex-col gap-3 rounded-2xl border p-4 text-left transition ${
                              selectedPricingOptionId === basicOption.optionId
                                ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-050)] shadow-sm"
                                : "border-[var(--owner-border)] bg-[var(--owner-bg)] hover:border-[var(--owner-blue-400)]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-[var(--owner-fg-1)]">
                                  Basic Hoizr commission
                                </h3>
                                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--owner-bg-subtle)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--owner-fg-2)]">
                                  Default
                                </span>
                              </div>
                              {selectedPricingOptionId === basicOption.optionId ? (
                                <CheckCircle2Icon
                                  size={18}
                                  className="shrink-0 text-[var(--owner-blue-500)]"
                                />
                              ) : null}
                            </div>

                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--owner-fg-4)]">
                                Commission
                              </div>
                              <div className="mt-0.5 flex items-baseline gap-2">
                                <span className="text-3xl font-bold tabular-nums text-[var(--owner-fg-1)]">
                                  {`${Number(
                                    basicOption.commissionRate,
                                  ).toFixed(2)}%`}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--owner-border-soft)] bg-[var(--owner-bg-subtle)] p-3">
                              <div>
                                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--owner-fg-4)]">
                                  Upfront amount
                                </div>
                                <div className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--owner-fg-1)]">
                                  {(basicOption.upfrontFee ?? 0) > 0
                                    ? formatIndianRupees(
                                        basicOption.upfrontFee,
                                      )
                                    : "No upfront"}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--owner-fg-4)]">
                                  Savings
                                </div>
                                <div className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--owner-fg-3)]">
                                  Standard
                                </div>
                              </div>
                            </div>

                            <p className="text-xs leading-relaxed text-[var(--owner-fg-3)]">
                              Publish at the standard Hoizr commission. No
                              performance-based upfront amount is attached.
                            </p>
                          </button>
                        ) : null}

                        {aiCards.map(({ boost, option }) => {
                          const selected =
                            selectedPricingOptionId === option.optionId;
                          const recommended =
                            recommendedOfferCode === boost.offerCode;
                          const delta =
                            boost.howMuchDifferentFromBasicOffer?.deltaPct ?? 0;
                          const savings =
                            boost.totalSavingsForHosts?.value ?? 0;
                          const marketingCredit = Math.max(
                            0,
                            Number(boost.marketingCreditAmount ?? 0),
                          );
                          const creditDiscount = Math.max(
                            0,
                            Number(boost.marketingCreditDiscountPct ?? 0),
                          );
                          const message =
                            boost.customerViewingMessage || boost.shortReason;

                          return (
                            <button
                              key={option.optionId}
                              type="button"
                              onClick={() =>
                                setSelectedPricingOptionId(option.optionId)
                              }
                              className={`flex min-h-[540px] w-[300px] shrink-0 self-stretch flex-col gap-3 rounded-2xl border p-4 text-left transition ${
                                selected
                                  ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-050)] shadow-sm"
                                  : "border-[var(--owner-border)] bg-[var(--owner-bg)] hover:border-[var(--owner-blue-400)]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="text-sm font-semibold text-[var(--owner-fg-1)]">
                                    {boost.label}
                                  </h3>
                                  {recommended ? (
                                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--owner-accent-acid)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--owner-fg-1)]">
                                      <SparklesIcon size={10} />
                                      Recommended
                                    </span>
                                  ) : null}
                                </div>
                                {selected ? (
                                  <CheckCircle2Icon
                                    size={18}
                                    className="shrink-0 text-[var(--owner-blue-500)]"
                                  />
                                ) : null}
                              </div>

                              <div>
                                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--owner-fg-4)]">
                                  Commission
                                </div>
                                <div className="mt-0.5 flex items-baseline gap-2">
                                  <span className="text-3xl font-bold tabular-nums text-[var(--owner-blue-500)]">
                                    {boost.commissionPct.toFixed(2)}%
                                  </span>
                                </div>
                                {delta > 0 ? (
                                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--owner-blue-050)] px-2 py-0.5 text-[11px] font-semibold text-[var(--owner-blue-500)]">
                                    {delta.toFixed(2)}% below basic
                                  </div>
                                ) : null}
                              </div>

                              <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--owner-border-soft)] bg-[var(--owner-bg-subtle)] p-3">
                                <div
                                  className={
                                    boost.extraAmount > 0
                                      ? "rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5"
                                      : ""
                                  }
                                >
                                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--owner-fg-4)]">
                                    Upfront amount
                                  </div>
                                  <div className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--owner-fg-1)]">
                                    {boost.extraAmount > 0
                                      ? formatIndianRupees(boost.extraAmount)
                                      : "No upfront"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--owner-fg-4)]">
                                    Savings
                                  </div>
                                  <div
                                    className={`mt-0.5 text-sm font-semibold tabular-nums ${
                                      savings > 0
                                        ? "text-[var(--owner-success-text)]"
                                        : savings < 0
                                          ? "text-[var(--owner-fg-1)]"
                                          : "text-[var(--owner-fg-3)]"
                                    }`}
                                  >
                                    {savings > 0
                                      ? `You save ${formatIndianRupees(savings)}`
                                      : "Standard"}
                                  </div>
                                </div>
                              </div>

                              {boost.extraAmount > 0
                                ? (() => {
                                    // Sell-through gate disclosure. INCL_TO_EXCL flips
                                    // the event to exclusive on selection so it uses
                                    // the EXCLUSIVE threshold (60%); plain exclusive
                                    // events are 60% too. Non-exclusive bar is 40%
                                    // because the host can't drive rival-platform
                                    // sales. Defaults match the config fallbacks in
                                    // offer-context.service.ts.
                                    const flipsToExcl =
                                      boost.offerCode === "INCL_TO_EXCL_OFFER";
                                    const effectivelyExclusive =
                                      flipsToExcl || eventType === "EXCLUSIVE";
                                    const thresholdPct = effectivelyExclusive
                                      ? 60
                                      : 40;
                                    return (
                                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                                        <div className="flex items-start gap-1.5">
                                          <span
                                            aria-hidden
                                            className="mt-0.5 text-amber-700"
                                          >
                                            ⓵
                                          </span>
                                          <div className="text-[11px] leading-relaxed text-amber-900">
                                            <span className="font-semibold">
                                              Upfront charged only if you sell{" "}
                                              {thresholdPct}%+ of paid-ticket
                                              capacity.
                                            </span>{" "}
                                            Below that, the upfront is waived
                                            (or refunded if pre-paid) and your
                                            offer commission (
                                            {boost.commissionPct.toFixed(2)}%)
                                            still applies. Choose how you&apos;d
                                            like to handle it below.
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()
                                : null}

                              {marketingCredit > 0 || creditDiscount > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {marketingCredit > 0 ? (
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                      Includes{" "}
                                      {formatIndianRupees(marketingCredit)}{" "}
                                      marketing credit
                                    </span>
                                  ) : null}
                                  {creditDiscount > 0 ? (
                                    <span className="rounded-full bg-[var(--owner-blue-050)] px-2 py-0.5 text-[11px] font-semibold text-[var(--owner-blue-600,var(--owner-blue-500))]">
                                      {creditDiscount.toFixed(0)}%
                                      marketing-credit discount
                                    </span>
                                  ) : null}
                                </div>
                              ) : null}

                              {boost.offerCode === "INCL_TO_EXCL_OFFER" ? (
                                <p className="rounded-lg border border-[var(--owner-border-soft)] bg-[var(--owner-bg-subtle)] p-2 text-[11px] leading-relaxed text-[var(--owner-fg-3)]">
                                  Selecting this converts the event to exclusive
                                  on Hoizr.
                                </p>
                              ) : null}

                              {message ? (
                                <p className="text-xs leading-relaxed text-[var(--owner-fg-3)]">
                                  {message}
                                </p>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {pricingOptions.length > 0 ? (
                <div className="shrink-0 px-6 pb-3">
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900">
                    <span className="font-semibold">Important:</span> event
                    listings must be accurate. Misrepresented event details
                    (lineup, venue, start time, ticket inclusions) can result
                    in a fine charged on each wrong ticket sold. Double-check
                    details before publishing.
                  </p>
                </div>
              ) : null}

              <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--owner-border)] bg-white px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={publishing}
                  onClick={() => setPublishModalOpen(false)}
                  className="rounded-lg border border-[var(--owner-border)] px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={publishing || !selectedPricingOptionId}
                  onClick={requestPublishEvent}
                  className="rounded-lg bg-[var(--owner-blue-500)] px-5 py-2 text-sm font-semibold text-[var(--owner-bg)] disabled:opacity-60"
                >
                  {publishing ? "Publishing..." : "Publish event"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <ConfirmModal
          isOpen={Boolean(confirmAction)}
          title={confirmAction?.title ?? ""}
          description={confirmAction?.description ?? null}
          confirmLabel={confirmAction?.confirmLabel}
          tone={confirmAction?.tone}
          onCancel={() => setConfirmAction(null)}
          onConfirm={async () => {
            await confirmAction?.onConfirm();
          }}
        />
      </main>
    </div>
  );
};

const StepSection = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--owner-fg-3)]">
        {subtitle}
      </p>
    </div>
    {children}
  </div>
);

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) => (
  <label className="block min-w-0 text-sm font-medium">
    {label}
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      onWheel={(event) => {
        if (type === "number") event.currentTarget.blur();
      }}
      className="input input-primary mt-1 h-10 w-full px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
    />
  </label>
);

const DateTimeInput = ({
  label,
  value,
  onChange,
  disabled = false,
  minDate,
  maxDate,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  // Inclusive bounds for the date portion. Used to gray out past dates
  // for the event start/end pickers and to clamp ticket-sale windows
  // to the selected event timing. Time-of-day is ignored on both ends
  // so the bounds compare day-vs-day, not minute-vs-minute.
  minDate?: Date;
  maxDate?: Date;
}) => {
  const [date = "", time = ""] = value ? value.split("T") : ["", ""];
  const [pendingTime, setPendingTime] = useState(time);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  useEffect(() => {
    if (time) {
      setPendingTime(time);
    } else if (!value) {
      setPendingTime("");
    }
  }, [time, value]);

  const update = (nextDate: string, nextTime: string) => {
    const resolvedDate = nextDate || date;
    const resolvedTime = nextTime || time || pendingTime || "00:00";

    if (!resolvedDate) {
      setPendingTime(resolvedTime);
      onChange("");
      return;
    }

    onChange(`${resolvedDate}T${resolvedTime}`);
  };

  const dateAsDate = date ? new Date(`${date}T00:00:00`) : undefined;
  const formatDate = (d?: Date) =>
    d
      ? new Intl.DateTimeFormat("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(d)
      : "Pick a date";
  const selectedTimeLabel =
    timePickerOptions.find((option) => option.value === (time || pendingTime))
      ?.label ||
    time ||
    pendingTime ||
    "Pick a time";

  return (
    <label className="block min-w-0 text-sm font-medium">
      {label}
      <div className="mt-1 rounded-lg border border-[var(--owner-border)] bg-white p-2 shadow-sm focus-within:border-[var(--owner-blue-500)]">
        <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className="flex h-10 items-center gap-2 rounded-md bg-[var(--owner-bg)] px-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CalendarDaysIcon
                  size={16}
                  className="shrink-0 text-[var(--owner-blue-500)]"
                />
                <span
                  className={`min-w-0 flex-1 truncate ${!date ? "text-[var(--owner-fg-4)]" : ""}`}
                >
                  {date ? formatDate(dateAsDate) : "Pick a date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-auto bg-white p-0 shadow-lg"
            >
              <Calendar
                mode="single"
                selected={dateAsDate}
                disabled={(d) => {
                  if (minDate) {
                    const min = new Date(minDate);
                    min.setHours(0, 0, 0, 0);
                    if (d < min) return true;
                  }
                  if (maxDate) {
                    const max = new Date(maxDate);
                    max.setHours(23, 59, 59, 999);
                    if (d > max) return true;
                  }
                  return false;
                }}
                onSelect={(d) => {
                  if (!d) return;
                  const iso = `${d.getFullYear()}-${String(
                    d.getMonth() + 1,
                  ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  update(iso, time);
                  setPickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className="flex h-10 items-center gap-2 rounded-md bg-[var(--owner-bg)] px-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ClockIcon
                  size={15}
                  className="shrink-0 text-[var(--owner-blue-500)]"
                />
                <span
                  className={`min-w-0 flex-1 truncate ${!(time || pendingTime) ? "text-[var(--owner-fg-4)]" : ""}`}
                >
                  {selectedTimeLabel}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="max-h-72 w-56 overflow-y-auto bg-white p-2 shadow-lg"
            >
              <div className="grid grid-cols-2 gap-1">
                {timePickerOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      update(date, option.value);
                      setTimePickerOpen(false);
                    }}
                    className={`rounded-md px-2 py-1.5 text-left text-xs transition ${
                      option.value === (time || pendingTime)
                        ? "bg-[var(--owner-blue-500)] font-semibold text-white"
                        : "text-[var(--owner-fg-2)] hover:bg-[var(--owner-bg-subtle)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </label>
  );
};

const CityInput = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: CityOption[];
  disabled?: boolean;
}) => {
  const hasCurrentValue =
    value && !options.some((option) => option.value === value);
  return (
    <label className="block min-w-0 text-sm font-medium">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="input input-primary mt-1 h-10 w-full px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">Select city</option>
        {hasCurrentValue ? <option value={value}>{value}</option> : null}
        {options.map((option) => (
          <option key={option._id} value={option.value}>
            {option.value}
            {option.state ? `, ${option.state}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
};

const StateInput = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) => {
  const listId = "event-state-options";
  return (
    <label className="block min-w-0 text-sm font-medium">
      {label}
      <input
        list={listId}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="input input-primary mt-1 h-10 w-full px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        placeholder="Select state"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </label>
  );
};

const ImageUrlInput = ({
  label,
  value,
  onChange,
  uploadKind = "event-extra",
  hostId,
  eventId,
  onFileChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  // Defaults to event-extra (lineup pictures, add-on images, etc).
  // Pass an explicit kind when the asset belongs in a different
  // subfolder so it lands in `hoizr/{env}/hosts/{hostId}/events/{eventId}/{kind}/`.
  uploadKind?: "event-extra" | "event-instagram" | "event-table-layout";
  hostId?: string;
  eventId?: string;
  // When provided, switches to deferred mode: the picker holds the File in
  // memory and reports it via this callback instead of uploading on drop.
  // The parent is responsible for running the actual Cloudinary upload at
  // form-save time. `onChange(blobUrl)` is still called so the preview
  // works while the file is pending.
  onFileChange?: (file: File | null) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const { setToastData } = useGlobalStore();
  const hostLabel = useHostTypeLabel();
  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToastData({ type: "error", message: "Please upload an image file." });
      return;
    }
    if (file.size > flyerMaxFileSizeBytes) {
      setToastData({
        type: "error",
        message: "Image must be 1.5 MB or smaller.",
      });
      return;
    }
    if (onFileChange) {
      // Deferred mode: preview via blob URL, defer Cloudinary upload to the
      // parent's save action.
      const blobUrl = URL.createObjectURL(file);
      onChange(blobUrl);
      onFileChange(file);
      return;
    }
    setUploading(true);
    try {
      const resolvedHostId = hostId || (await awaitSelectedHostId());
      if (!resolvedHostId) {
        setToastData({
          type: "error",
          message:
            `We couldn't load your ${hostLabel.lower} context. Refresh the page and try again.`,
        });
        setUploading(false);
        return;
      }
      const result = await uploadHostAsset({
        kind: uploadKind,
        hostId: resolvedHostId,
        eventId,
        file,
        previousUrl: value,
      });
      onChange(result.secureUrl);
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setUploading(false);
    }
  };

  // True drag-drop zone (TASK-004) — visual matches the Event Flyer
  // uploader so Artist / Add-on / Extras all feel like the same primitive.
  const [dragOver, setDragOver] = useState(false);
  return (
    <div className="block min-w-0 text-sm font-medium">
      <span className="block">{label}</span>
      <div className="mt-1 rounded-lg border border-[var(--owner-border)] bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              handleFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex min-h-[118px] flex-1 cursor-pointer items-center gap-4 rounded-lg border border-dashed px-4 py-4 text-sm transition ${
              dragOver
                ? "border-[var(--owner-blue-500)] bg-[var(--owner-blue-050)]"
                : "border-[var(--owner-border)] bg-[var(--owner-bg)] hover:border-[var(--owner-blue-500)] hover:bg-[var(--owner-bg-subtle)]"
            }`}
          >
            {value ? (
              <span
                className="h-24 w-20 shrink-0 rounded-lg bg-cover bg-center shadow-sm"
                style={{ backgroundImage: `url(${value})` }}
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[var(--owner-fg-3)] shadow-sm">
                <UploadCloudIcon size={22} />
              </span>
            )}
            <span className="min-w-0 text-left">
              <span className="block font-semibold text-[var(--owner-fg-1)]">
                {value ? "Replace image" : "Drop or click to upload"}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[var(--owner-fg-3)]">
                {uploading
                  ? "Uploading..."
                  : "Drag an image here, or click to choose. JPG, PNG, or WebP."}
              </span>
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(event) => {
                handleFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 sm:w-28"
            >
              <XIcon size={14} />
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Select = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) => (
  <label className="block min-w-0 text-sm font-medium">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="input input-primary mt-1 h-10 w-full px-3 text-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const Textarea = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="block min-w-0 text-sm font-medium md:col-span-2">
    {label}
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      className="input input-primary mt-1 w-full px-3 py-2 text-sm"
    />
  </label>
);

const PreviewRow = ({ Icon, text }: { Icon: LucideIcon; text: string }) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon size={16} />
    <span className="truncate">{text}</span>
  </div>
);

export default EventJourney;
