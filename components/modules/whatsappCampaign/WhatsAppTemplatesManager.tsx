"use client";

import { Badge, type BadgeTone, OwnerButton } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import { extractErrorMessage } from "@/utils/utilFUncs";
import {
  fetchMyWhatsAppTemplates,
  type WhatsAppMessageTemplate,
} from "@/utils/whatsappTemplateClient";
import { PencilLine, Plus, RefreshCcw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import WhatsAppTemplateAuthorForm from "../whatsappCampaignOnboarding/WhatsAppTemplateAuthorForm";
import WhatsAppTemplateRequestForm from "../whatsappCampaignOnboarding/WhatsAppTemplateRequestForm";

type Mode = "list" | "author" | "request";

// What the host sees: a single human status combining the internal review
// gate and Meta's approval. Sendable only when Meta has APPROVED it.
const statusLabel = (t: WhatsAppMessageTemplate): { text: string; tone: BadgeTone } => {
  if (t.metaStatus === "APPROVED") return { text: "Live", tone: "success" };
  if (t.reviewStatus === "REJECTED_INTERNAL")
    return { text: "Needs changes", tone: "danger" };
  if (t.reviewStatus === "PENDING_REVIEW")
    return { text: "In review", tone: "warning" };
  if (t.reviewStatus === "APPROVED_INTERNAL")
    return { text: "Sent to WhatsApp", tone: "info" };
  if (t.metaStatus === "REJECTED") return { text: "Rejected", tone: "danger" };
  return { text: "Draft", tone: "neutral" };
};

const WhatsAppTemplatesManager = () => {
  const { setToastData } = useGlobalStore();
  const [mode, setMode] = useState<Mode>("list");
  const [items, setItems] = useState<WhatsAppMessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMyWhatsAppTemplates();
      setItems(res.items ?? []);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [setToastData]);

  useEffect(() => {
    if (mode === "list") load();
  }, [mode, load]);

  if (mode === "author") {
    return (
      <div className="font-owner">
        <WhatsAppTemplateAuthorForm
          onCancel={() => setMode("list")}
          onDone={() => setMode("list")}
        />
      </div>
    );
  }
  if (mode === "request") {
    return (
      <div className="font-owner">
        <WhatsAppTemplateRequestForm
          onCancel={() => setMode("list")}
          onDone={() => setMode("list")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 font-owner">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[15px] font-semibold text-owner-fg-1">
            Your WhatsApp templates
          </div>
          <div className="text-[12.5px] text-owner-fg-3">
            Templates you create are reviewed by Hoizr, then sent to WhatsApp for
            approval before they can be used in a campaign.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <OwnerButton
            variant="secondary"
            size="sm"
            leadingIcon={<RefreshCcw size={13} />}
            onClick={load}
          >
            Refresh
          </OwnerButton>
          <OwnerButton
            variant="secondary"
            size="sm"
            leadingIcon={<Sparkles size={13} />}
            onClick={() => setMode("request")}
          >
            Request a template
          </OwnerButton>
          <OwnerButton
            variant="primary"
            size="sm"
            leadingIcon={<Plus size={13} />}
            onClick={() => setMode("author")}
          >
            Create your own
          </OwnerButton>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[13px] text-owner-fg-4">
          Loading templates…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-owner-md border border-dashed border-owner-border py-10 text-center">
          <PencilLine size={20} className="mx-auto text-owner-fg-4" />
          <div className="mt-2 text-[13px] font-medium text-owner-fg-2">
            No templates yet
          </div>
          <div className="text-[12px] text-owner-fg-4">
            Create your own or request one — we&apos;ll handle WhatsApp approval.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((t) => {
            const s = statusLabel(t);
            return (
              <div
                key={t._id}
                className="flex items-start gap-3 rounded-owner-md border border-owner-border bg-owner-bg p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-owner-fg-1">
                      {t.name}
                    </span>
                    <Badge tone="neutral">{t.category.toLowerCase()}</Badge>
                    <Badge tone={s.tone}>{s.text}</Badge>
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[12px] text-owner-fg-3">
                    {t.requestNote
                      ? `Requested: ${t.requestNote}`
                      : t.bodyText}
                  </div>
                  {t.reviewStatus === "REJECTED_INTERNAL" &&
                  t.reviewRejectionReason ? (
                    <div className="mt-1 text-[11px] text-owner-danger-text">
                      Reviewer note: {t.reviewRejectionReason}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplatesManager;
