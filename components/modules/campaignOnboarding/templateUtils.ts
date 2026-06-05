// Header / footer stripping for email-builder templates.
//
// The host-campaigns worker always prepends the Hoizr brand header
// and appends the standard footer (unsubscribe, address, legal).
// Templates therefore ship body-only — these helpers run at apply
// time to drop any logo image, social icons, address block, or
// unsubscribe text that a default template might still contain. The
// SAME helpers run from both the template-select step and the Run
// Campaign quick-launcher so a draft created either way looks
// identical to the worker.

const LOGO_TAG_REGEX = /\{\{(business|host|restaurant)Logo\}\}/i;
const UNSUBSCRIBE_REGEX = /emailUnsubscribeLink|\bunsubscribe\b/i;
const HELP_REGEX = /need help.*contact@hoizr/i;
const ADDRESS_BLOCK_REGEX =
  /\{\{(business|host|restaurant)Name\}\}[\s\S]{0,40}\{\{(business|host|restaurant)Address\}\}/i;

const shouldDropContent = (content: any): boolean => {
  const type = content?.type;
  const values = content?.values ?? {};
  if (type === "image") {
    const url = values?.src?.url ?? "";
    return LOGO_TAG_REGEX.test(url);
  }
  if (type === "social") return true;
  if (type === "text") {
    const text: string = values?.text ?? "";
    return (
      UNSUBSCRIBE_REGEX.test(text) ||
      HELP_REGEX.test(text) ||
      ADDRESS_BLOCK_REGEX.test(text)
    );
  }
  return false;
};

export const stripHeaderFooterFromJson = (designJson: any): any => {
  if (!designJson || typeof designJson !== "object") return designJson;
  const json = JSON.parse(JSON.stringify(designJson));
  const rows = json.body?.rows ?? [];
  for (const row of rows) {
    for (const col of row.columns ?? []) {
      col.contents = (col.contents ?? []).filter(
        (c: any) => !shouldDropContent(c)
      );
    }
  }
  json.body.rows = rows.filter((row: any) =>
    (row.columns ?? []).some((col: any) => (col.contents?.length ?? 0) > 0)
  );
  return json;
};

const findMatchingTableClose = (html: string, startIdx: number): number => {
  const tagEnd = html.indexOf(">", startIdx);
  if (tagEnd === -1) return -1;
  let pos = tagEnd + 1;
  let depth = 1;
  while (pos < html.length && depth > 0) {
    const nextOpen = html.indexOf("<table", pos);
    const nextClose = html.indexOf("</table>", pos);
    if (nextClose === -1) return -1;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      pos = nextOpen + 6;
    } else {
      depth -= 1;
      pos = nextClose + 8;
    }
  }
  return depth === 0 ? pos : -1;
};

const HTML_MARKERS: RegExp[] = [
  /src="\{\{(business|host|restaurant)Logo\}\}"/i,
  /\{\{emailUnsubscribeLink\}\}/i,
  /href="mailto:contact@hoizr\.com"/i,
  /Need help\?.*contact@hoizr\.com/i,
  /cdn\.tools\.unlayer\.com\/social\/icons/i,
  /\{\{(business|host|restaurant)Name\}\}<br\s*\/?>\s*\{\{(business|host|restaurant)Address\}\}/i,
];

const CONTENT_WRAPPER_OPEN = /<table style="font-family:[^"]+;" role="presentation"/g;

export const stripHeaderFooterFromHtml = (html: string): string => {
  if (!html) return html;
  let result = html;
  let cursor = 0;
  let iterations = 0;
  while (iterations++ < 500) {
    CONTENT_WRAPPER_OPEN.lastIndex = cursor;
    const match = CONTENT_WRAPPER_OPEN.exec(result);
    if (!match) break;
    const startIdx = match.index;
    const endIdx = findMatchingTableClose(result, startIdx);
    if (endIdx === -1) break;
    const block = result.substring(startIdx, endIdx);
    if (HTML_MARKERS.some((m) => m.test(block))) {
      result =
        result.substring(0, startIdx) +
        result.substring(endIdx).replace(/^\s+/, "");
      cursor = startIdx;
    } else {
      cursor = endIdx;
    }
  }
  return result;
};

// Substitute the non-recipient merge tags that the editor preview
// renders. Customer-name / unsubscribe / button link stay as merge
// tags because they need recipient context at send time — the
// host-campaigns worker fills those in per-recipient.
export type TemplateMergeContext = {
  hostName?: string;
  hostLogo?: string;
  hostAddress?: string;
  hostWebsite?: string;
  primaryColor?: string;
  backgroundColor?: string;
  eventTitle?: string;
  eventName?: string;
  eventDate?: string;
  eventAbout?: string;
  eventFlyer?: string;
  eventUrl?: string;
};

const applyMergeTagsToString = (
  input: string,
  ctx: TemplateMergeContext
): string =>
  input
    .replace(/{{hostName}}/g, ctx.hostName ?? "")
    .replace(/{{hostLogo}}/g, ctx.hostLogo ?? "")
    .replace(/{{hostAddress}}/g, ctx.hostAddress ?? "")
    .replace(/{{hostWebsite}}/g, ctx.hostWebsite ?? "")
    .replace(/{{restaurantName}}/g, ctx.hostName ?? "")
    .replace(/{{restaurantLogo}}/g, ctx.hostLogo ?? "")
    .replace(/{{restaurantAddress}}/g, ctx.hostAddress ?? "")
    .replace(/{{restaurantWebsite}}/g, ctx.hostWebsite ?? "")
    .replace(/{{businessName}}/g, ctx.hostName ?? "")
    .replace(/{{businessLogo}}/g, ctx.hostLogo ?? "")
    .replace(/{{businessAddress}}/g, ctx.hostAddress ?? "")
    .replace(/{{businessWebsite}}/g, ctx.hostWebsite ?? "")
    .replace(/{{primaryColor}}/g, ctx.primaryColor ?? "")
    .replace(/{{backgroundColor}}/g, ctx.backgroundColor ?? "")
    .replace(/{{eventFlyer}}/g, ctx.eventFlyer ?? "")
    .replace(/{{eventUrl}}/g, ctx.eventUrl ?? "")
    // {{eventName}} is the canonical token; {{eventTitle}} is kept as a
    // synonym so any older drafts still substitute. The two render with
    // the same value — there's no rationale for two names for one field.
    .replace(/{{eventName}}/g, ctx.eventName ?? ctx.eventTitle ?? "")
    .replace(/{{eventTitle}}/g, ctx.eventTitle ?? ctx.eventName ?? "")
    .replace(/{{eventDate}}/g, ctx.eventDate ?? "")
    .replace(/{{eventAbout}}/g, ctx.eventAbout ?? "");

export const applyTemplateMergeTags = (
  html: string,
  designJson: any,
  ctx: TemplateMergeContext
): { html: string; designJson: any } => ({
  html: html ? applyMergeTagsToString(html, ctx) : html,
  designJson: designJson
    ? JSON.parse(applyMergeTagsToString(JSON.stringify(designJson), ctx))
    : designJson,
});
