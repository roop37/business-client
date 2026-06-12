"use client";

import { Badge, type BadgeTone, OwnerButton } from "@/components/common/owner";
import useWhatsappCampaignStore from "@/store/whatsappCampaignStore";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  bookmarkWhatsAppTemplate,
  fetchMyWhatsAppTemplateBookmarkIds,
  fetchMyWhatsAppTemplateBookmarks,
  fetchMyWhatsAppTemplates,
  fetchSelectableWhatsAppTemplates,
  unbookmarkWhatsAppTemplate,
  type WhatsAppMessageTemplate,
} from "@/utils/whatsappTemplateClient";
import { PencilLine, Sparkles, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import WhatsAppTemplateAuthorForm from "./WhatsAppTemplateAuthorForm";
import WhatsAppTemplateRequestForm from "./WhatsAppTemplateRequestForm";

type Tab = "library" | "mine" | "bookmarked";
type Mode = "picker" | "author" | "request";

const inputCls =
  "h-10 w-full rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[13px] outline-none focus:border-owner-blue-200 focus:ring-2 focus:ring-owner-blue-050";

const reviewTone = (s?: string | null): BadgeTone => {
  switch (s) {
    case "APPROVED_INTERNAL":
      return "success";
    case "PENDING_REVIEW":
      return "warning";
    case "REJECTED_INTERNAL":
      return "danger";
    default:
      return "neutral";
  }
};

const isSendable = (t: WhatsAppMessageTemplate) =>
  t.isActive && t.metaStatus === "APPROVED";

const WhatsAppContent = () => {
  const { setToastData } = useGlobalStore();
  const {
    selectedTemplate,
    setSelectedTemplate,
    templateVariables,
    setTemplateVariables,
    headerMediaUrl,
    setHeaderMediaUrl,
  } = useWhatsappCampaignStore();

  const [mode, setMode] = useState<Mode>("picker");
  const [tab, setTab] = useState<Tab>("library");
  const [items, setItems] = useState<WhatsAppMessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());

  const loadBookmarkIds = useCallback(async () => {
    try {
      setBookmarkIds(new Set(await fetchMyWhatsAppTemplateBookmarkIds()));
    } catch {
      /* non-fatal: stars just won't pre-fill */
    }
  }, []);

  const loadTab = useCallback(
    async (which: Tab) => {
      setLoading(true);
      try {
        const res =
          which === "library"
            ? await fetchSelectableWhatsAppTemplates()
            : which === "mine"
            ? await fetchMyWhatsAppTemplates()
            : await fetchMyWhatsAppTemplateBookmarks();
        setItems(res.items ?? []);
      } catch (err) {
        setToastData({ type: "error", message: extractErrorMessage(err) });
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [setToastData]
  );

  useEffect(() => {
    if (mode === "picker") loadTab(tab);
  }, [tab, mode, loadTab]);

  useEffect(() => {
    loadBookmarkIds();
  }, [loadBookmarkIds]);

  const toggleBookmark = async (t: WhatsAppMessageTemplate) => {
    const has = bookmarkIds.has(t._id);
    // optimistic
    setBookmarkIds((prev) => {
      const next = new Set(prev);
      if (has) next.delete(t._id);
      else next.add(t._id);
      return next;
    });
    try {
      if (has) await unbookmarkWhatsAppTemplate(t._id);
      else await bookmarkWhatsAppTemplate(t._id);
      if (tab === "bookmarked") loadTab("bookmarked");
    } catch (err) {
      // revert
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
    if (!isSendable(t)) {
      setToastData({
        type: "error",
        message:
          t.reviewStatus === "PENDING_REVIEW"
            ? "This template is still in review. You can send it once it's approved."
            : "This template isn't approved for sending yet.",
      });
      return;
    }
    setSelectedTemplate(t);
    setTemplateVariables((t.variables ?? []).map((v) => ({ position: v.position, value: "" })));
    setHeaderMediaUrl("");
  };

  const valueByPos = useMemo(
    () => new Map(templateVariables.map((v) => [v.position, v.value])),
    [templateVariables]
  );
  const setVar = (position: number, value: string) =>
    setTemplateVariables(
      templateVariables.map((v) => (v.position === position ? { ...v, value } : v))
    );

  const needsMedia =
    selectedTemplate &&
    (selectedTemplate.headerType === "IMAGE" ||
      selectedTemplate.headerType === "VIDEO" ||
      selectedTemplate.headerType === "DOCUMENT");

  if (mode === "author") {
    return (
      <WhatsAppTemplateAuthorForm
        onCancel={() => setMode("picker")}
        onDone={() => {
          setMode("picker");
          setTab("mine");
          loadTab("mine");
        }}
      />
    );
  }
  if (mode === "request") {
    return (
      <WhatsAppTemplateRequestForm
        onCancel={() => setMode("picker")}
        onDone={() => setMode("picker")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-semibold text-owner-fg-1">
          Choose your message
        </h1>
        <p className="text-[13px] text-owner-fg-3">
          Pick an approved template, create your own, or ask us to build one.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-owner-border">
        {(
          [
            { id: "library", label: "Template library" },
            { id: "mine", label: "My templates" },
            { id: "bookmarked", label: "★ Bookmarked" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? "border-b-2 border-owner-blue-500 px-1 pb-2 text-[13px] font-semibold text-owner-blue-500"
                : "px-1 pb-2 text-[13px] text-owner-fg-3 hover:text-owner-fg-1"
            }
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pb-1.5">
          <OwnerButton
            variant="secondary"
            size="sm"
            leadingIcon={<PencilLine size={12} />}
            onClick={() => setMode("author")}
          >
            Create your own
          </OwnerButton>
          <OwnerButton
            variant="secondary"
            size="sm"
            leadingIcon={<Sparkles size={12} />}
            onClick={() => setMode("request")}
          >
            Request a template
          </OwnerButton>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="py-8 text-center text-[13px] text-owner-fg-4">
            Loading templates…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-owner-md border border-dashed border-owner-border py-8 text-center text-[13px] text-owner-fg-4">
            {tab === "mine"
              ? "You haven't created any templates yet."
              : tab === "bookmarked"
              ? "No bookmarks yet. Tap the ★ on a template to save it here."
              : "No approved templates yet."}
          </div>
        ) : (
          items.map((t) => {
            const selected = selectedTemplate?._id === t._id;
            const sendable = isSendable(t);
            return (
              <div
                key={t._id}
                className={`flex items-start gap-3 rounded-owner-md border p-3 ${
                  selected
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
                      <Badge tone={reviewTone(t.reviewStatus)}>
                        {t.metaStatus === "APPROVED"
                          ? "approved"
                          : (t.reviewStatus ?? "").toLowerCase().replace("_", " ")}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[12px] text-owner-fg-3">
                    {t.bodyText}
                  </div>
                  {t.reviewStatus === "REJECTED_INTERNAL" &&
                  t.reviewRejectionReason ? (
                    <div className="mt-1 text-[11px] text-owner-danger-text">
                      Rejected: {t.reviewRejectionReason}
                    </div>
                  ) : null}
                </div>
                <OwnerButton
                  variant={selected ? "primary" : "secondary"}
                  size="sm"
                  disabled={!sendable}
                  onClick={() => select(t)}
                >
                  {selected ? "Selected" : sendable ? "Use" : "In review"}
                </OwnerButton>
              </div>
            );
          })
        )}
      </div>

      {/* Selected template — variable fill + media */}
      {selectedTemplate ? (
        <div className="flex flex-col gap-3 rounded-owner-md border border-owner-border-soft bg-owner-bg-subtle p-3">
          <div className="text-[12px] font-semibold text-owner-fg-2">
            Personalise “{selectedTemplate.name}”
          </div>
          {needsMedia ? (
            <label className="block">
              <span className="text-[12px] font-semibold text-owner-fg-2">
                Header {selectedTemplate.headerType.toLowerCase()} URL
              </span>
              <input
                className={`${inputCls} mt-1`}
                value={headerMediaUrl}
                onChange={(e) => setHeaderMediaUrl(e.target.value)}
                placeholder="https://…"
              />
            </label>
          ) : null}
          {(selectedTemplate.variables ?? []).length === 0 ? (
            <div className="text-[12px] text-owner-fg-4">
              This template has no variables — nothing to fill in.
            </div>
          ) : (
            (selectedTemplate.variables ?? [])
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((v) => (
                <label key={v.position} className="block">
                  <span className="text-[12px] font-semibold text-owner-fg-2">
                    {`{{${v.position}}} ${v.label ?? ""}`.trim()}
                  </span>
                  <input
                    className={`${inputCls} mt-1`}
                    value={valueByPos.get(v.position) ?? ""}
                    onChange={(e) => setVar(v.position, e.target.value)}
                    placeholder={v.example ?? `Value for {{${v.position}}}`}
                  />
                  {v.hint ? (
                    <span className="mt-1 block text-[11px] text-owner-fg-4">
                      {v.hint}
                    </span>
                  ) : null}
                </label>
              ))
          )}
        </div>
      ) : null}
    </div>
  );
};

export default WhatsAppContent;
