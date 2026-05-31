import useCampaignStore from "@/store/customCampaignStore";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import ReusableModal from "@/components/common/modal/modal";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  Calendar,
  CircleCheckIcon,
  Clock,
  FileEdit,
  Mail,
  Music,
  RefreshCw,
  Sparkles,
  Tag,
  Ticket,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { defaultTemplates } from "./defaultTemplates/defaultTemplate";

type TemplateVisual = {
  Icon: LucideIcon;
  // Solid hex stops for a linear-gradient header. Each pair is picked
  // to match the template's mood — pink/magenta for Bollywood, urgent
  // red for last-call, etc. — so the card grid reads varied without
  // pulling external imagery.
  from: string;
  to: string;
};

const FALLBACK_VISUAL: TemplateVisual = {
  Icon: Mail,
  from: "#1B5C3A",
  to: "#0F8842",
};

const TEMPLATE_VISUALS: Record<string, TemplateVisual> = {
  "clean slate": { Icon: FileEdit, from: "#5A554A", to: "#2E2B24" },
  "reward top spender": { Icon: Trophy, from: "#B89236", to: "#E2B266" },
  "offer promo code": { Icon: Tag, from: "#0F8842", to: "#16A150" },
  "last-call ticket drop": { Icon: Clock, from: "#C0382B", to: "#EA5949" },
  "weekend ticket rush": { Icon: Ticket, from: "#5B2EA8", to: "#8A4FE0" },
  "bollywood night drop": { Icon: Music, from: "#9A2A6F", to: "#E08AB2" },
  "campus crew guestlist": { Icon: Users, from: "#0E7A3D", to: "#16A150" },
  "event promotion": { Icon: Sparkles, from: "#151412", to: "#3F3A2E" },
  "engage active customers": { Icon: RefreshCw, from: "#1F5C8A", to: "#3F8AD0" },
  "send event invitation": { Icon: Calendar, from: "#0F8842", to: "#0B6B33" },
};

const visualFor = (name: string): TemplateVisual =>
  TEMPLATE_VISUALS[name.toLowerCase()] ?? FALLBACK_VISUAL;

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

const TemplateCard = ({
  template,
  handleSelect,
  selectedTemplateName,
}: {
  template: ITemplate;
  handleSelect: (template: ITemplate) => void;
  selectedTemplateName: string;
}) => {
  const visual = visualFor(template.name);
  const selected = selectedTemplateName === template.name;
  return (
    <button
      key={template.name}
      type="button"
      onClick={() => handleSelect(template)}
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? "border-owner-blue-500 ring-2 ring-owner-blue-200"
          : "border-gray-200"
      }`}
    >
      <div
        aria-hidden
        className="relative flex h-32 items-end justify-between overflow-hidden px-4 py-3 text-white"
        style={{
          background: `linear-gradient(135deg, ${visual.from} 0%, ${visual.to} 100%)`,
        }}
      >
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-sm">
          {template.name === "Clean Slate" ? "Start blank" : "Template"}
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
          <visual.Icon size={22} strokeWidth={1.8} />
        </span>
        {selected ? (
          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-owner-blue-500 shadow-md">
            <CircleCheckIcon size={16} />
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 px-4 py-3">
        <h3 className="text-[14.5px] font-semibold text-owner-fg-1">
          {template.name}
        </h3>
        <p className="text-xs leading-5 text-owner-fg-3">
          {template.description}
        </p>
      </div>
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

  const { selectedHost, hostLogo, hostAddress } =
    useHostsStore();
  const { setToastData } = useGlobalStore();
  const businessAddress = hostAddress?.addressLine1 || "";

  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [pendingTemplateSwitch, setPendingTemplateSwitch] =
    useState<ITemplate | null>(null);
  const templatePreviewFallbackImage =
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80";

  // Auto-pick the Clean Slate template on first arrival so the preview
  // pane shows a starting point immediately instead of "No template
  // selected", and so step 2 always opens with a real designJson to
  // edit. Skip when the host is editing an existing campaign that
  // already has a template loaded into the store.
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.trim().length > 0) return;
    const cleanSlate = defaultTemplates.find(
      (t) => t.name.toLowerCase() === "clean slate"
    );
    if (cleanSlate) {
      handleSelectTemplate(cleanSlate);
    }
    // We only ever want this to run once per mount of the Setup step —
    // re-running on prop changes would clobber a user's intentional
    // template switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      setEventsLoading(true);
      try {
        const response = await sdk.getMyEventsForSelector();
        setEventOptions(
          (response?.getMyEvents ?? []).map((event) => ({
            _id: event._id,
            title: event.title,
            eventFlyer: event.eventFlyer,
            startDate: event.startDate ? String(event.startDate) : null,
            slug: event.slug,
          }))
        );
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
  }, [setToastData]);

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
    // Pre-fill the campaign title with the event title if the user
    // hasn't typed one yet — saves a step on the most common flow.
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

    // If templateHtml is a string, parse and replace merge tags
    let processedHtml = html;
    let processedJson = designJson;

    // Event Promotion templates carry an {{eventFlyer}} / {{eventUrl}} pair
    // — fall back to the host logo + ordering link when the user hasn't
    // attached an event so the preview never renders a broken image.
    const eventFlyerUrl =
      selectedEventFlyer || hostLogo || templatePreviewFallbackImage;
    const eventPathId = selectedEventSlug || selectedEventId;
    const eventLinkUrl = eventPathId
      ? `${hostOnlineOrderingLink || "https://hoizr.com"}/events/${eventPathId}`
      : hostOnlineOrderingLink || "";

    // Check if templateHtml is a string and not empty
    if (html.trim() !== "") {
      // Replace merge tags with actual values
      processedHtml = html
        .replace(
          /{{hostWebsite}}/g,
          hostOnlineOrderingLink || ""
        )
        .replace(
          /{{businessWebsite}}/g,
          hostOnlineOrderingLink || ""
        )
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

      processedJson = JSON.stringify(designJson)
        .replace(
          /{{businessWebsite}}/g,
          hostOnlineOrderingLink || ""
        )
        .replace(/{{businessLogo}}/g, hostLogo || "")
        .replace(/{{businessAddress}}/g, businessAddress)
        .replace(/{{primaryColor}}/g, hostPrimaryColor)
        .replace(/{{backgroundColor}}/g, hostBackgroundColor)
        .replace(/{{eventFlyer}}/g, eventFlyerUrl)
        .replace(/{{eventUrl}}/g, eventLinkUrl)
        .replace(/{{eventTitle}}/g, selectedEventTitle || "");
    }

    // Inject the host's logo into the first image slot of the
    // template when that slot is still the placeholder `src.url: ""`
    // baked into defaultTemplates. The Unlayer designJson keeps the
    // image at body.rows[0] → columns[0] → contents[0] for every
    // template we ship, so this drops the host's brand mark at the
    // top of the email without needing a {{hostLogo}} merge tag on
    // each individual template.
    try {
      const parsedJson = JSON.parse(processedJson);
      const firstRow = parsedJson?.body?.rows?.[0];
      const firstColumn = firstRow?.columns?.[0];
      const firstContent = firstColumn?.contents?.[0];
      if (
        firstContent &&
        firstContent.type === "image" &&
        hostLogo &&
        (!firstContent.values?.src?.url ||
          firstContent.values.src.url.trim() === "")
      ) {
        firstContent.values = {
          ...(firstContent.values ?? {}),
          src: {
            ...(firstContent.values?.src ?? {}),
            url: hostLogo,
          },
          altText:
            firstContent.values?.altText && firstContent.values.altText.trim()
              ? firstContent.values.altText
              : selectedHost || "Host logo",
        };
        processedJson = JSON.stringify(parsedJson);
      }
    } catch {
      // If the designJson can't be parsed for any reason, fall
      // through with whatever the template + merge-tag pass produced.
    }

    // Call setTemplate with processed HTML
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
    // Let the parent column (campaign onboarding's overflow-y-auto
    // children pane) handle scroll. The earlier `h-full
    // overflow-y-hidden` + an inner `max-h + overflow-y-scroll` was a
    // double-scroll trap that hid templates past the visible band.
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

      <div className="space-y-6 bg-white">
        <div>
          <p className="text-gray-600 mb-4 text-sm">
            {
              "Select a base template that aligns with your campaign's purpose. You can customize it further in the next step."
            }
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
              className="rounded-lg bg-[var(--owner-blue-500,#2947c2)] px-4 py-2 text-sm font-semibold text-white"
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
