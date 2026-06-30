"use client";

import { Badge, OwnerButton } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import useWhatsappCampaignStore from "@/store/whatsappCampaignStore";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  bookmarkWhatsAppTemplate,
  fetchMyPublishedEvents,
  fetchMyWhatsAppTemplateBookmarkIds,
  fetchSelectableWhatsAppTemplates,
  unbookmarkWhatsAppTemplate,
  type WhatsAppMessageTemplate,
  type WhatsAppPrefillEvent,
} from "@/utils/whatsappTemplateClient";
import {
  CUSTOM_TAG_KEY,
  MERGE_TAGS,
  resolveTagValue,
  tagKeyForValue,
  type MergeContext,
} from "@/utils/whatsappMergeTags";
import { Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import WhatsAppMediaUpload from "./WhatsAppMediaUpload";

const inputCls =
  "h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] outline-none focus:border-owner-blue-200 focus:ring-2 focus:ring-owner-blue-050";

type VarUi = { tagKey: string; custom: string };

const WhatsAppContent = () => {
  const { setToastData } = useGlobalStore();
  const {
    selectedTemplate,
    setSelectedTemplate,
    templateVariables,
    setTemplateVariables,
    headerMediaUrl,
    setHeaderMediaUrl,
    eventId,
  } = useWhatsappCampaignStore();
  const { selectedHost, hostAddress } = useHostsStore();

  const [items, setItems] = useState<WhatsAppMessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  // The event is chosen in Step 1 (Basics); here we only need its details to
  // resolve event-scoped merge tags. We still fetch the list so we can map the
  // stored eventId → its title/address/date even on a fresh edit-rehydrate.
  const [events, setEvents] = useState<WhatsAppPrefillEvent[]>([]);
  const selectedEvent = useMemo(
    () => events.find((e) => e._id === eventId) ?? null,
    [events, eventId]
  );

  // Event + host/venue context that the merge-tag dropdown resolves against.
  const mergeCtx = useMemo<MergeContext>(
    () => ({
      event: selectedEvent,
      host: {
        name: selectedHost,
        address: hostAddress?.formattedAddress ?? hostAddress?.city ?? null,
        city: hostAddress?.city ?? null,
      },
    }),
    [selectedEvent, selectedHost, hostAddress]
  );

  // Per-variable UI state (tag choice + custom text). Stored campaign value is
  // derived from this + the selected event.
  const [varUi, setVarUi] = useState<Record<number, VarUi>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [res, ids, evs] = await Promise.all([
          fetchSelectableWhatsAppTemplates(),
          fetchMyWhatsAppTemplateBookmarkIds().catch(() => [] as string[]),
          fetchMyPublishedEvents().catch(() => [] as WhatsAppPrefillEvent[]),
        ]);
        setItems(res.items ?? []);
        setBookmarkIds(new Set(ids));
        setEvents(evs);
      } catch (err) {
        setToastData({ type: "error", message: extractErrorMessage(err) });
      } finally {
        setLoading(false);
      }
    })();
  }, [setToastData]);

  // Seed per-variable UI from the store (covers edit rehydrate + reselection).
  useEffect(() => {
    if (!selectedTemplate) {
      setVarUi({});
      return;
    }
    const byPos = new Map(templateVariables.map((v) => [v.position, v.value]));
    const seeded: Record<number, VarUi> = {};
    for (const v of selectedTemplate.variables ?? []) {
      const stored = byPos.get(v.position) ?? "";
      const key = tagKeyForValue(stored);
      seeded[v.position] = {
        tagKey: key,
        custom: key === CUSTOM_TAG_KEY ? stored : "",
      };
    }
    setVarUi(seeded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate?._id]);

  const visible = bookmarkedOnly
    ? items.filter((t) => bookmarkIds.has(t._id))
    : items;

  const toggleBookmark = async (t: WhatsAppMessageTemplate) => {
    const has = bookmarkIds.has(t._id);
    setBookmarkIds((prev) => {
      const next = new Set(prev);
      if (has) next.delete(t._id);
      else next.add(t._id);
      return next;
    });
    try {
      if (has) await unbookmarkWhatsAppTemplate(t._id);
      else await bookmarkWhatsAppTemplate(t._id);
    } catch (err) {
      setBookmarkIds((prev) => {
        const next = new Set(prev);
        if (has) next.add(t._id);
        else next.delete(t._id);
        return next;
      });
      setToastData({ type: "error", message: extractErrorMessage(err) });
    }
  };

  const select = (t: WhatsAppMessageTemplate) => {
    setSelectedTemplate(t);
    setTemplateVariables(
      (t.variables ?? []).map((v) => ({ position: v.position, value: "" }))
    );
    setHeaderMediaUrl("");
  };

  // Write a variable's resolved value into the store.
  const writeVar = useCallback(
    (position: number, value: string) =>
      setTemplateVariables(
        useWhatsappCampaignStore
          .getState()
          .templateVariables.map((v) =>
            v.position === position ? { ...v, value } : v
          )
      ),
    [setTemplateVariables]
  );

  const onTagChange = (position: number, tagKey: string) => {
    const custom = varUi[position]?.custom ?? "";
    setVarUi((prev) => ({ ...prev, [position]: { tagKey, custom } }));
    writeVar(position, resolveTagValue(tagKey, mergeCtx, custom));
  };
  const onCustomChange = (position: number, custom: string) => {
    setVarUi((prev) => ({
      ...prev,
      [position]: { tagKey: CUSTOM_TAG_KEY, custom },
    }));
    writeVar(position, resolveTagValue(CUSTOM_TAG_KEY, mergeCtx, custom));
  };

  // When the Step 1 event or the host/venue context changes, re-resolve any
  // event/host-scoped variable to its new literal value.
  useEffect(() => {
    if (!selectedTemplate) return;
    for (const [posStr, ui] of Object.entries(varUi)) {
      const pos = Number(posStr);
      const tag = MERGE_TAGS.find((t) => t.key === ui.tagKey);
      if (tag?.scope === "event" || tag?.scope === "host") {
        writeVar(pos, resolveTagValue(ui.tagKey, mergeCtx, ui.custom));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergeCtx]);

  const needsMedia =
    selectedTemplate &&
    (selectedTemplate.headerType === "IMAGE" ||
      selectedTemplate.headerType === "VIDEO" ||
      selectedTemplate.headerType === "DOCUMENT");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-semibold text-owner-fg-1">
          Choose your message
        </h1>
        <p className="text-[13px] text-owner-fg-3">
          Pick an approved template, then personalise it. Need a new one? Create
          or request it under the <strong>Templates</strong> tab.
        </p>
      </div>

      {/* Bookmarked filter */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-owner-fg-2">
          Available templates
        </span>
        <label className="flex items-center gap-1.5 text-[12px] text-owner-fg-3">
          <input
            type="checkbox"
            checked={bookmarkedOnly}
            onChange={(e) => setBookmarkedOnly(e.target.checked)}
          />
          Bookmarked only
        </label>
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="py-8 text-center text-[13px] text-owner-fg-4">
            Loading templates…
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-owner-md border border-dashed border-owner-border py-8 text-center text-[13px] text-owner-fg-4">
            {bookmarkedOnly
              ? "No bookmarked templates yet."
              : "No approved templates yet. Create one under the Templates tab."}
          </div>
        ) : (
          visible.map((t) => {
            const isSel = selectedTemplate?._id === t._id;
            return (
              <div
                key={t._id}
                className={`flex items-start gap-3 rounded-owner-md border p-3 ${
                  isSel
                    ? "border-owner-blue-500 bg-owner-blue-050"
                    : "border-owner-border bg-owner-bg"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleBookmark(t)}
                  className="mt-0.5 text-owner-fg-4 hover:text-owner-warning-text"
                  aria-label="Bookmark template"
                >
                  <Star
                    size={16}
                    className={
                      bookmarkIds.has(t._id)
                        ? "fill-owner-warning-text text-owner-warning-text"
                        : ""
                    }
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-owner-fg-1">
                      {t.name}
                    </span>
                    <Badge tone="neutral">{t.category.toLowerCase()}</Badge>
                    {t.source === "HOST" ? (
                      <Badge tone="info">yours</Badge>
                    ) : null}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[12px] text-owner-fg-3">
                    {t.bodyText}
                  </div>
                </div>
                <OwnerButton
                  variant={isSel ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => select(t)}
                >
                  {isSel ? "Selected" : "Use"}
                </OwnerButton>
              </div>
            );
          })
        )}
      </div>

      {/* Personalise the selected template */}
      {selectedTemplate ? (
        <div className="flex flex-col gap-3 rounded-owner-md border border-owner-border-soft bg-owner-bg-subtle p-3">
          <div className="text-[12px] font-semibold text-owner-fg-2">
            Personalise “{selectedTemplate.name}”
          </div>

          {needsMedia ? (
            <WhatsAppMediaUpload
              value={headerMediaUrl}
              onChange={setHeaderMediaUrl}
              label={`Header ${selectedTemplate.headerType.toLowerCase()}`}
              hint="Shown at the top of the message."
            />
          ) : null}

          {(selectedTemplate.variables ?? []).length > 0 ? (
            <>
              {selectedEvent ? (
                <div className="rounded-owner-md border border-owner-border-soft bg-owner-bg px-3 py-2 text-[12px] text-owner-fg-3">
                  Event details prefill from{" "}
                  <span className="font-semibold text-owner-fg-1">
                    {selectedEvent.title}
                  </span>{" "}
                  (chosen in Step 1). Change it from the Basics step.
                </div>
              ) : eventId ? null : (
                <div className="rounded-owner-md border border-dashed border-owner-border px-3 py-2 text-[12px] text-owner-fg-4">
                  No event picked in Step 1, so event-based variables (name,
                  date, link…) will be blank. Go back to Basics to choose one.
                </div>
              )}

              {(selectedTemplate.variables ?? [])
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((v) => {
                  const ui = varUi[v.position] ?? {
                    tagKey: CUSTOM_TAG_KEY,
                    custom: "",
                  };
                  const tag = MERGE_TAGS.find((t) => t.key === ui.tagKey);
                  const needsEvent = tag?.scope === "event" && !selectedEvent;
                  return (
                    <div key={v.position} className="flex flex-col gap-1">
                      <span className="text-[12px] font-semibold text-owner-fg-2">
                        {`{{${v.position}}} ${v.label ?? ""}`.trim()}
                      </span>
                      <select
                        className={inputCls}
                        value={ui.tagKey}
                        onChange={(e) => onTagChange(v.position, e.target.value)}
                      >
                        {MERGE_TAGS.map((t) => (
                          <option key={t.key} value={t.key}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      {ui.tagKey === CUSTOM_TAG_KEY ? (
                        <input
                          className={inputCls}
                          value={ui.custom}
                          onChange={(e) =>
                            onCustomChange(v.position, e.target.value)
                          }
                          placeholder={v.example ?? `Value for {{${v.position}}}`}
                        />
                      ) : null}
                      {needsEvent ? (
                        <span className="text-[11px] text-owner-warning-text">
                          Pick an event in Step 1 to fill this in.
                        </span>
                      ) : null}
                      {v.hint ? (
                        <span className="text-[11px] text-owner-fg-4">
                          {v.hint}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
            </>
          ) : (
            <div className="text-[12px] text-owner-fg-4">
              This template has no variables — nothing to personalise.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default WhatsAppContent;
