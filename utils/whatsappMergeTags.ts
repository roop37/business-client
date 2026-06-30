/**
 * Fixed catalog of "merge tags" a host can drop into a WhatsApp template
 * variable. The host always PICKS from this controlled dropdown — they never
 * type a variable name — so there are no merge-variable mistakes. Every tag is
 * sourced from exactly one of three contexts:
 *
 *  - CUSTOMER — differs per recipient; stored as a token string that the
 *    hoizr-workers WhatsApp sender resolves just before send. Keep the token
 *    strings in sync with `resolveMergeTokens` in
 *    hoizr-workers/src/workers/host-whatsapp-campaigns/host-whatsapp-campaigns.process.ts.
 *  - EVENT — constant for the whole campaign; resolved to a literal NOW from
 *    the event the host selected in Step 1.
 *  - HOST / VENUE — constant for the whole campaign; resolved to a literal NOW
 *    from the host's profile (venue name / address).
 *
 * `custom` is the only free-text option — a manual literal for the rare slot
 * that maps to none of the above. It's also how an older saved literal (e.g. a
 * resolved event name) rehydrates for display on edit.
 */

// Public customer storefront base — same origin the email journey uses to build
// event links (templateSelect.tsx). Event pages live at /events/<slug>.
const HOIZR_PUBLIC_BASE = "https://hoizr.com";

export type PrefillEvent = {
  _id: string;
  title?: string | null;
  slug?: string | null;
  status?: string | null;
  startDate?: string | null;
  city?: string | null;
  location?: { formattedAddress?: string | null; city?: string | null } | null;
};

/** Host/venue context for HOST-scoped tags (from the hosts store). */
export type MergeHost = {
  name?: string | null;
  address?: string | null;
  city?: string | null;
};

/** Everything an event/host-scoped tag needs to resolve to a literal. */
export type MergeContext = {
  event: PrefillEvent | null;
  host: MergeHost;
};

export type MergeTagScope = "customer" | "event" | "host" | "custom";

export type MergeTag = {
  key: string;
  label: string;
  scope: MergeTagScope;
  token?: string; // customer scope: resolved per-recipient by the worker
  resolve?: (ctx: MergeContext) => string; // event/host scope: literal now
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

const eventLink = (e: PrefillEvent | null): string =>
  e ? `${HOIZR_PUBLIC_BASE}/events/${e.slug || e._id}` : "";

export const MERGE_TAGS: MergeTag[] = [
  // ── Customer (per-recipient) ──────────────────────────────────────
  {
    key: "customer.firstName",
    label: "Customer first name",
    scope: "customer",
    token: "{{customer.firstName}}",
  },
  {
    key: "customer.lastName",
    label: "Customer last name",
    scope: "customer",
    token: "{{customer.lastName}}",
  },
  {
    key: "customer.fullName",
    label: "Customer full name",
    scope: "customer",
    token: "{{customer.fullName}}",
  },
  // ── Event (literal, from the Step 1 event) ────────────────────────
  {
    key: "event.title",
    label: "Event name",
    scope: "event",
    resolve: (c) => c.event?.title ?? "",
  },
  {
    key: "event.date",
    label: "Event date",
    scope: "event",
    resolve: (c) => fmtDate(c.event?.startDate),
  },
  {
    key: "event.address",
    label: "Event address",
    scope: "event",
    resolve: (c) => c.event?.location?.formattedAddress ?? c.event?.city ?? "",
  },
  {
    key: "event.city",
    label: "Event city",
    scope: "event",
    resolve: (c) => c.event?.location?.city ?? c.event?.city ?? "",
  },
  {
    key: "event.link",
    label: "Event link",
    scope: "event",
    resolve: (c) => eventLink(c.event),
  },
  // ── Host / venue (literal, from the host profile) ─────────────────
  {
    key: "host.name",
    label: "Venue name",
    scope: "host",
    resolve: (c) => c.host?.name ?? "",
  },
  {
    key: "host.address",
    label: "Venue address",
    scope: "host",
    resolve: (c) => c.host?.address ?? "",
  },
  {
    key: "host.city",
    label: "Venue city",
    scope: "host",
    resolve: (c) => c.host?.city ?? "",
  },
  // ── Manual fallback ───────────────────────────────────────────────
  { key: CUSTOM_TAG_KEY, label: "Custom text", scope: "custom" },
];

export const findTag = (key: string): MergeTag | undefined =>
  MERGE_TAGS.find((t) => t.key === key);

/** Stored value for a chosen tag (literal for event/host, token for customer). */
export const resolveTagValue = (
  key: string,
  ctx: MergeContext,
  customText: string
): string => {
  const tag = findTag(key);
  if (!tag || tag.scope === "custom") return customText;
  if (tag.scope === "customer") return tag.token ?? "";
  return tag.resolve ? tag.resolve(ctx) : "";
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
