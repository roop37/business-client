import useCampaignStore from "@/store/customCampaignStore";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import ReusableModal from "@/components/common/modal/modal";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { CircleCheckIcon } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { defaultTemplates } from "./defaultTemplates/defaultTemplate";

type EventOption = {
  _id: string;
  title?: string | null;
  eventFlyer?: string | null;
  startDate?: string | null;
  slug?: string | null;
};

interface ITemplate {
  name: string;
  description: string;
  template: {
    content: string;
    designJson: any;
    html: string;
  };
}

// ───────────────────────────────────────────────────────────────────
// Header / footer stripping
//
// Every default template ships with its own logo header and
// unsubscribe / address / social footer baked in. The host-campaigns
// worker (hoizr-workers) now ALWAYS wraps outbound campaign HTML with
// the Hoizr brand header + standard footer, so keeping that chrome in
// the template duplicates it inside the sent email. Strip both layers
// at apply time — the host's editor opens on body-only content and the
// worker owns the chrome at send time.
// ───────────────────────────────────────────────────────────────────

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

const stripHeaderFooterFromJson = (designJson: any): any => {
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

// Surgical HTML strip. Unlayer emits each content cell (image, divider,
// social, text…) as its own `<table style="font-family:..." role="presentation">`
// wrapper inside the row container. We walk these wrappers and drop only
// the ones whose markup matches a header/footer marker — body cells
// (greeting text, CTA button, body copy) sharing the same row are kept.
//
// This mirrors `stripHeaderFooterFromJson`, which is also surgical
// (filters individual `contents[]` items). Aligning both keeps the
// preview HTML in sync with the JSON Unlayer loads into the editor;
// otherwise the host sees one layout in the right-pane preview and a
// different one the moment they open the editor.
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

// Unlayer content-wrapper tables have a stable signature: `<table style="font-family:'...'"`
// followed soon by `role="presentation"`. Match the opening tag with a
// regex so we don't depend on the specific font (templates ship with
// Source Sans Pro today but Unlayer can swap that per-design).
const CONTENT_WRAPPER_OPEN = /<table style="font-family:[^"]+;" role="presentation"/g;

const stripHeaderFooterFromHtml = (html: string): string => {
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

const TemplateCard = ({
  template,
  handleSelect,
  selectedTemplateName,
}: {
  template: ITemplate;
  handleSelect: (template: ITemplate) => void;
  selectedTemplateName: string;
}) => {
  const selected = selectedTemplateName === template.name;
  const isBlank = template.name.toLowerCase() === "clean slate";
  return (
    <button
      key={template.name}
      type="button"
      onClick={() => handleSelect(template)}
      className={`group flex flex-col items-start gap-2 rounded-xl border bg-white p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-owner-blue-200 hover:shadow-sm ${
        selected
          ? "border-owner-blue-500 ring-2 ring-owner-blue-050 shadow-sm"
          : "border-owner-border"
      }`}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-owner-fg-3">
          {isBlank ? "Start blank" : "Template"}
        </span>
        {selected ? (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-owner-blue-500 text-white">
            <CircleCheckIcon size={14} />
          </span>
        ) : null}
      </div>
      <h3 className="text-[15px] font-semibold leading-tight text-owner-fg-1">
        {template.name}
      </h3>
      <p className="text-[12.5px] leading-5 text-owner-fg-3">
        {template.description}
      </p>
    </button>
  );
};

const CampaignSetup = () => {
  const {
    selectedTemplate,
    setTemplate,
    campaignTitle,
    campaignSubject,
    setCampaignDetails,
    hostOnlineOrderingLink,
    hostPrimaryColor,
    hostBackgroundColor,
    selectedEventId,
    selectedEventFlyer,
    selectedEventSlug,
    selectedEventTitle,
    setSelectedEvent,
    clearSelectedEvent,
  } = useCampaignStore();

  const { selectedHost, hostLogo, hostAddress } = useHostsStore();
  const { setToastData } = useGlobalStore();
  const businessAddress = hostAddress?.addressLine1 || "";

  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [pendingTemplateSwitch, setPendingTemplateSwitch] =
    useState<ITemplate | null>(null);
  const templatePreviewFallbackImage =
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80";

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.trim().length > 0) return;
    const cleanSlate = defaultTemplates.find(
      (t) => t.name.toLowerCase() === "clean slate"
    );
    if (cleanSlate) {
      handleSelectTemplate(cleanSlate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const router = useRouter();

  useEffect(() => {
    const loadEvents = async () => {
      setEventsLoading(true);
      try {
        const response = await sdk.getMyEventsForSelector();
        const opts: EventOption[] = (response?.getMyEvents ?? []).map(
          (event) => ({
            _id: event._id,
            title: event.title,
            eventFlyer: event.eventFlyer,
            startDate: event.startDate ? String(event.startDate) : null,
            slug: event.slug,
          })
        );
        setEventOptions(opts);

        // Pre-select the event + title when the launcher passes them
        // in via query params (Run Campaign modal → ?eventId&title).
        // Skip if the campaign store already has them — editing an
        // existing draft owns its own state.
        const qEventId =
          typeof router.query.eventId === "string"
            ? router.query.eventId
            : undefined;
        const qTitle =
          typeof router.query.title === "string" ? router.query.title : undefined;
        if (qEventId && !selectedEventId) {
          const match = opts.find((option) => option._id === qEventId);
          if (match) {
            setSelectedEvent({
              id: match._id,
              title: match.title ?? "",
              flyer: match.eventFlyer ?? "",
              date: match.startDate ?? "",
              slug: match.slug ?? "",
            });
          }
        }
        if (qTitle && !campaignTitle.trim()) {
          setCampaignDetails({ title: qTitle });
        }
      } catch (error) {
        setToastData({
          type: "error",
          message: extractErrorMessage(error),
        });
      } finally {
        setEventsLoading(false);
      }
    };
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.eventId, router.query.title, setToastData]);

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      clearSelectedEvent();
      return;
    }
    const event = eventOptions.find((option) => option._id === value);
    if (!event) {
      clearSelectedEvent();
      return;
    }
    setSelectedEvent({
      id: event._id,
      title: event.title ?? "",
      flyer: event.eventFlyer ?? "",
      date: event.startDate ?? "",
      slug: event.slug ?? "",
    });
    if (!campaignTitle.trim() && event.title) {
      setCampaignDetails({ title: event.title });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCampaignDetails({ title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCampaignDetails({ description: e.target.value });
  };

  const applyTemplate = (template: ITemplate) => {
    const { name, template: templ } = template;
    const { content, designJson, html } = templ;

    // Strip header / footer BEFORE merge-tag replacement so we can
    // match the raw `{{businessLogo}}` / `{{emailUnsubscribeLink}}`
    // tags. Worker re-injects Hoizr's standard chrome at send time.
    const strippedJson = stripHeaderFooterFromJson(designJson);
    const strippedHtml = stripHeaderFooterFromHtml(html ?? "");

    const eventFlyerUrl =
      selectedEventFlyer || hostLogo || templatePreviewFallbackImage;
    const eventPathId = selectedEventSlug || selectedEventId;
    const eventLinkUrl = eventPathId
      ? `${hostOnlineOrderingLink || "https://hoizr.com"}/events/${eventPathId}`
      : hostOnlineOrderingLink || "";

    let processedHtml = strippedHtml;
    let processedJson = JSON.stringify(strippedJson);

    if (strippedHtml.trim() !== "") {
      processedHtml = strippedHtml
        .replace(/{{hostWebsite}}/g, hostOnlineOrderingLink || "")
        .replace(/{{businessWebsite}}/g, hostOnlineOrderingLink || "")
        .replace(/{{hostLogo}}/g, hostLogo || "")
        .replace(/{{businessLogo}}/g, hostLogo || "")
        .replace(/{{restaurantName}}/g, selectedHost || "")
        .replace(/{{businessName}}/g, selectedHost || "")
        .replace(/{{hostAddress}}/g, businessAddress)
        .replace(/{{businessAddress}}/g, businessAddress)
        .replace(/{{primaryColor}}/g, hostPrimaryColor)
        .replace(/{{backgroundColor}}/g, hostBackgroundColor)
        .replace(/{{eventFlyer}}/g, eventFlyerUrl)
        .replace(/{{eventUrl}}/g, eventLinkUrl)
        .replace(/{{eventTitle}}/g, selectedEventTitle || "");

      processedJson = processedJson
        .replace(/{{businessWebsite}}/g, hostOnlineOrderingLink || "")
        .replace(/{{businessLogo}}/g, hostLogo || "")
        .replace(/{{businessAddress}}/g, businessAddress)
        .replace(/{{primaryColor}}/g, hostPrimaryColor)
        .replace(/{{backgroundColor}}/g, hostBackgroundColor)
        .replace(/{{eventFlyer}}/g, eventFlyerUrl)
        .replace(/{{eventUrl}}/g, eventLinkUrl)
        .replace(/{{eventTitle}}/g, selectedEventTitle || "");
    }

    setTemplate(name, JSON.parse(processedJson), processedHtml, content);
  };

  const handleSelectTemplate = (template: ITemplate) => {
    const hasSavedCampaign =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("editId");
    if (
      hasSavedCampaign &&
      selectedTemplate &&
      selectedTemplate.trim().length > 0 &&
      selectedTemplate !== template.name
    ) {
      setPendingTemplateSwitch(template);
      return;
    }

    applyTemplate(template);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-medium">Set Up Your Campaign</h1>
        <p className="text-gray-600 mb-4 pt-1 text-sm">
          {
            "Define your campaign's title, email subject and choose a starting template."
          }
        </p>
      </div>

      <div className="space-y-6 bg-white rounded-xl">
        <div>
          <div className="mb-4">
            <label
              htmlFor="campaign-event"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Event{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <select
              id="campaign-event"
              value={selectedEventId}
              onChange={handleEventChange}
              disabled={eventsLoading}
              className="input input-primary"
            >
              <option value="">
                {eventsLoading
                  ? "Loading events…"
                  : "No event — generic campaign"}
              </option>
              {eventOptions.map((option) => (
                <option key={option._id} value={option._id}>
                  {option.title || "Untitled event"}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Picking an event auto-fills the title and lets the Event
              Promotion template use the actual flyer.
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="campaign-title"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              id="campaign-title"
              type="text"
              value={campaignTitle}
              onChange={handleTitleChange}
              placeholder="Enter a title for your campaign"
              className="input input-primary"
              required
            />
          </div>

          <div>
            <label
              htmlFor="campaign-description"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Email Subject
            </label>
            <input
              id="campaign-description"
              type="text"
              value={campaignSubject}
              onChange={handleDescriptionChange}
              placeholder="Enter the email subject for your campaign"
              className="input input-primary"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 bg-white">
        <div>
          <p className="text-gray-600 mb-1 text-sm">
            Pick a starting template. You can customize it in the next step.
          </p>
          <p className="mb-4 text-[12.5px] text-gray-500">
            Don&apos;t worry about the brand header or unsubscribe footer —
            Hoizr adds them automatically when the campaign sends.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {defaultTemplates.map((template) => (
              <TemplateCard
                key={template.name}
                template={template}
                handleSelect={handleSelectTemplate}
                selectedTemplateName={selectedTemplate}
              />
            ))}
          </div>
        </div>
      </div>
      <ReusableModal
        isOpen={Boolean(pendingTemplateSwitch)}
        onClose={() => setPendingTemplateSwitch(null)}
        title="Switch template?"
      >
        <div className="mt-2 space-y-4">
          <p className="text-sm text-gray-600">
            Switching templates will discard edits already made in the email
            builder.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPendingTemplateSwitch(null)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (pendingTemplateSwitch) applyTemplate(pendingTemplateSwitch);
                setPendingTemplateSwitch(null);
              }}
              className="rounded-lg bg-owner-blue-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Switch template
            </button>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default CampaignSetup;
