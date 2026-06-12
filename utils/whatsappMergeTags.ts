/**
 * Fixed catalog of "merge tags" a host can drop into a WhatsApp template
 * variable, so non-technical hosts pick from a clear list instead of typing
 * raw values.
 *
 * Two kinds:
 *  - EVENT-scoped tags resolve to a literal NOW (from the event the host
 *    selected), because they're constant for the whole campaign.
 *  - CUSTOMER-scoped tags store a token string that the hoizr-workers WhatsApp
 *    sender resolves PER RECIPIENT at send time. Keep these token strings in
 *    sync with `resolveMergeTokens` in
 *    hoizr-workers/src/workers/host-whatsapp-campaigns/host-whatsapp-campaigns.process.ts.
 */

export type PrefillEvent = {
  _id: string;
  title?: string | null;
  slug?: string | null;
  status?: string | null;
  startDate?: string | null;
  city?: string | null;
  location?: { formattedAddress?: string | null; city?: string | null } | null;
};

export type MergeTagScope = "customer" | "event" | "custom";

export type MergeTag = {
  key: string;
  label: string;
  scope: MergeTagScope;
  token?: string; // customer scope: resolved per-recipient by the worker
  resolve?: (e: PrefillEvent | null) => string; // event scope: literal now
};

export const CUSTOM_TAG_KEY = "custom";

const fmtDate = (iso?: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

export const MERGE_TAGS: MergeTag[] = [
  {
    key: "customer.firstName",
    label: "Customer first name",
    scope: "customer",
    token: "{{customer.firstName}}",
  },
  {
    key: "customer.fullName",
    label: "Customer full name",
    scope: "customer",
    token: "{{customer.fullName}}",
  },
  {
    key: "event.title",
    label: "Event name",
    scope: "event",
    resolve: (e) => e?.title ?? "",
  },
  {
    key: "event.address",
    label: "Event address",
    scope: "event",
    resolve: (e) => e?.location?.formattedAddress ?? e?.city ?? "",
  },
  {
    key: "event.city",
    label: "Event city",
    scope: "event",
    resolve: (e) => e?.location?.city ?? e?.city ?? "",
  },
  {
    key: "event.date",
    label: "Event date",
    scope: "event",
    resolve: (e) => fmtDate(e?.startDate),
  },
  { key: CUSTOM_TAG_KEY, label: "Custom text", scope: "custom" },
];

export const findTag = (key: string): MergeTag | undefined =>
  MERGE_TAGS.find((t) => t.key === key);

/** Stored value for a chosen tag (literal for event, token for customer). */
export const resolveTagValue = (
  key: string,
  event: PrefillEvent | null,
  customText: string
): string => {
  const tag = findTag(key);
  if (!tag || tag.scope === "custom") return customText;
  if (tag.scope === "customer") return tag.token ?? "";
  return tag.resolve ? tag.resolve(event) : "";
};

/** Reverse-map a stored value back to a tag key (for edit rehydrate). */
export const tagKeyForValue = (value: string): string => {
  const byToken = MERGE_TAGS.find((t) => t.token && t.token === value);
  return byToken?.key ?? CUSTOM_TAG_KEY;
};

/** Human label for a stored value (used in the live preview placeholder). */
export const previewLabelForValue = (value: string): string => {
  const byToken = MERGE_TAGS.find((t) => t.token && t.token === value);
  return byToken ? byToken.label : value;
};
