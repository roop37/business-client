"use client";

import { OwnerButton, PageHeader } from "@/components/common/owner";
import { RowsPerPageEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import useWhatsAppCampaignStore from "@/store/whatsappCampaignStore";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { CheckCircle2, Image as ImageIcon, MessageCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

const WhatsAppTemplateHeaderType = {
  None: "NONE",
  Text: "TEXT",
  Image: "IMAGE",
  Video: "VIDEO",
  Document: "DOCUMENT",
} as const;

type WhatsAppTemplateHeaderType =
  (typeof WhatsAppTemplateHeaderType)[keyof typeof WhatsAppTemplateHeaderType];

type WhatsAppTemplateCategory =
  | "MARKETING"
  | "UTILITY"
  | "AUTHENTICATION";

type TemplateOption = {
  _id: string;
  slug: string;
  name: string;
  description?: string | null;
  category: WhatsAppTemplateCategory;
  language: string;
  headerType: WhatsAppTemplateHeaderType;
  headerText?: string | null;
  headerSampleMediaUrl?: string | null;
  bodyText: string;
  footerText?: string | null;
  variables: Array<{
    position: number;
    label: string;
    hint?: string | null;
    example?: string | null;
  }>;
};

/**
 * Step 2 — host picks one template from Hoizr's approved library.
 * Showing a live body preview with placeholder labels helps the host
 * visualise the final message without yet filling values.
 */
const WhatsAppTemplateSelect = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const {
    templateId,
    setTemplate,
    campaignName,
    setCampaignName,
  } = useWhatsAppCampaignStore();
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(templateId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await sdk.approvedWhatsAppTemplates({
          pagination: { pageNumber: 1, rowsPerPage: RowsPerPageEnum.Hundred },
        });
        if (cancelled) return;
        setTemplates(
          (res.approvedWhatsAppTemplates?.items ?? []) as TemplateOption[]
        );
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setToastData]);

  const selected = useMemo(
    () => templates.find((t) => t._id === selectedId) ?? null,
    [selectedId, templates]
  );

  const canContinue = Boolean(selectedId) && campaignName.trim().length >= 2;

  const handleContinue = () => {
    if (!selected) return;
    setTemplate({
      templateId: selected._id,
      templateSlug: selected.slug,
      templateBodyPreview: selected.bodyText,
      variables: selected.variables.map((v) => ({
        position: v.position,
        value: v.example ?? "",
      })),
    });
    router.push("/campaigns/whatsapp/onboarding/template-edit");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 font-owner text-owner-fg-1">
      <PageHeader
        title="Choose a template"
        subtitle="Hoizr maintains pre-approved templates so your messages always pass WhatsApp's review. Pick the one closest to your goal — you'll fill in the details next."
      />

      {!campaignName && (
        <div className="rounded-owner-md border border-owner-warning-bg bg-owner-warning-bg/40 p-3 text-[13px] text-owner-warning-text">
          Give your campaign a name first.
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Campaign name"
            className="ml-2 inline-flex h-9 w-64 rounded-owner-sm border border-owner-border bg-owner-bg px-3 text-[13px] font-medium text-owner-fg-1 outline-none focus:border-owner-blue-500"
          />
        </div>
      )}

      {loading && (
        <div className="grid h-40 place-items-center text-owner-fg-3">
          Loading templates…
        </div>
      )}

      {!loading && templates.length === 0 && (
        <div className="rounded-owner-md border border-owner-border bg-owner-bg-subtle p-6 text-center text-owner-fg-3">
          No templates available yet. Hoizr is reviewing the launch templates —
          check back shortly.
        </div>
      )}

      {!loading && templates.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {templates.map((t) => {
            const active = selectedId === t._id;
            return (
              <button
                key={t._id}
                type="button"
                onClick={() => setSelectedId(t._id)}
                className={`flex flex-col items-stretch gap-3 rounded-owner-lg border bg-owner-bg p-5 text-left transition ${
                  active
                    ? "border-owner-blue-500 ring-2 ring-owner-blue-050 shadow-sm"
                    : "border-owner-border hover:border-owner-blue-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-owner-md bg-owner-success-bg text-owner-success-text">
                      <MessageCircle size={16} />
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold text-owner-fg-1">
                        {t.name}
                      </p>
                      <p className="text-[11.5px] uppercase tracking-wider text-owner-fg-4">
                        {t.category} · {t.language}
                      </p>
                    </div>
                  </div>
                  {active && (
                    <CheckCircle2
                      size={18}
                      className="text-owner-blue-500"
                      aria-label="Selected"
                    />
                  )}
                </div>
                {t.description && (
                  <p className="text-[12.5px] text-owner-fg-3">
                    {t.description}
                  </p>
                )}
                <div className="mt-1 rounded-owner-sm bg-owner-bg-subtle p-3 text-[13px] text-owner-fg-2">
                  {t.headerType !== WhatsAppTemplateHeaderType.None && (
                    <div className="mb-2 flex items-center gap-1 text-[11.5px] uppercase tracking-wider text-owner-fg-4">
                      <ImageIcon size={12} /> {t.headerType.toLowerCase()} header
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{t.bodyText}</div>
                  {t.footerText && (
                    <div className="mt-2 text-[11.5px] text-owner-fg-4">
                      {t.footerText}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <OwnerButton
          variant="secondary"
          onClick={() => router.push("/campaigns/whatsapp/onboarding/basic")}
        >
          Back
        </OwnerButton>
        <OwnerButton
          variant="primary"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          Continue
        </OwnerButton>
      </div>
    </div>
  );
};

export default WhatsAppTemplateSelect;
