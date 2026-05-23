import useCampaignStore from "@/store/customCampaignStore";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { CircleCheckIcon } from "lucide-react";
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

const TemplateCard = ({
  template,
  handleSelect,
  selectedTemplateName,
}: {
  template: ITemplate;
  handleSelect: (template: ITemplate) => void;
  selectedTemplateName: string;
}) => {
  return (
    <button
      key={template.name}
      onClick={() => handleSelect(template)}
      className={`p-4 border border-gray-300 shadow-sm col-span-1 h-22 rounded-xl text-left transition-all duration-300 hover:bg-black/5 relative ${
        selectedTemplateName === template.name ? "!bg-black/5 text-black" : ""
      }`}
    >
      <div
        className={`absolute top-2 right-3 rounded-full w-5 h-5 transition-all ${
          selectedTemplateName === template.name ? "opacity-100" : "opacity-0"
        }`}
      >
        <CircleCheckIcon className="text-primary" />
      </div>

      <h3 className="font-medium mb-2 line-clamp-1">{template.name}</h3>
      <p className="text-xs text-gray-400 line-clamp-2">
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

  const handleSelectTemplate = (template: ITemplate) => {
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
    const eventLinkUrl = selectedEventId
      ? `${hostOnlineOrderingLink || ""}/events/${selectedEventId}`
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

    // Call setTemplate with processed HTML
    setTemplate(name, JSON.parse(processedJson), processedHtml, content);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 h-full overflow-y-hidden">
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

          <div className="grid grid-cols-1 gap-4 sm:max-h-[calc(100vh-28rem)] xl:max-h-[calc(100vh-27rem)] overflow-y-scroll pr-2">
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
    </div>
  );
};

export default CampaignSetup;
