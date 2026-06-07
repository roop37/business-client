"use client";

import { OwnerButton, PageHeader } from "@/components/common/owner";
import useGlobalStore from "@/store/global";
import useWhatsAppCampaignStore from "@/store/whatsappCampaignStore";
import { sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/utilFUncs";
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

type TemplateDetail = {
  _id: string;
  slug: string;
  name: string;
  bodyText: string;
  headerType: WhatsAppTemplateHeaderType;
  headerText?: string | null;
  headerSampleMediaUrl?: string | null;
  footerText?: string | null;
  buttonType?: string | null;
  buttonUrl?: string | null;
  buttonLabel?: string | null;
  variables: Array<{
    position: number;
    label: string;
    hint?: string | null;
    example?: string | null;
  }>;
};

/**
 * Step 3 — fill in the template variables + optional header media URL +
 * CTA dynamic suffix. Live preview shows the rendered body so the host
 * sees the final message in real time.
 *
 * Variable values can be literal strings ("Sunburn Goa") or placeholder
 * tokens the worker auto-substitutes at send time ("{{eventName}}",
 * "{{customerName}}", "{{hostName}}", "{{eventDate}}"). The wizard
 * surfaces the supported tokens inline.
 */
const PLACEHOLDER_HINTS = [
  { token: "{{customerName}}", desc: "Recipient's first name" },
  { token: "{{hostName}}", desc: "Your venue/org name" },
  { token: "{{eventName}}", desc: "Event title (if event-scoped)" },
  { token: "{{eventDate}}", desc: "Formatted event date" },
];

const WhatsAppContentVariables = () => {
  const router = useRouter();
  const { setToastData } = useGlobalStore();
  const {
    campaignId,
    templateId,
    templateVariables,
    headerMediaUrl,
    ctaSlug,
    setVariableValue,
    setHeaderMediaUrl,
    setCtaSlug,
  } = useWhatsAppCampaignStore();

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!templateId) {
      router.replace("/campaigns/whatsapp/onboarding/template-select");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await sdk.whatsAppTemplateById({ templateId });
        if (cancelled) return;
        setTemplate(res.whatsAppTemplateById as TemplateDetail);
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateId, router, setToastData]);

  const rendered = useMemo(() => {
    if (!template) return "";
    let body = template.bodyText;
    const byPos = new Map(templateVariables.map((v) => [v.position, v.value]));
    body = body.replace(/{{\s*(\d+)\s*}}/g, (_match, num) => {
      const idx = Number(num);
      const v = byPos.get(idx);
      return v?.length ? v : `{{${idx}}}`;
    });
    return body;
  }, [template, templateVariables]);

  const needsMedia =
    template &&
    (template.headerType === WhatsAppTemplateHeaderType.Image ||
      template.headerType === WhatsAppTemplateHeaderType.Video ||
      template.headerType === WhatsAppTemplateHeaderType.Document);

  const needsCta =
    template?.buttonType === "URL" &&
    /{{\s*\d+\s*}}/.test(template?.buttonUrl ?? "");

  const canContinue = useMemo(() => {
    if (!template) return false;
    const allVariablesFilled = template.variables.every((v) => {
      const value = templateVariables.find((tv) => tv.position === v.position);
      return Boolean(value?.value?.trim());
    });
    const mediaOk = needsMedia ? Boolean(headerMediaUrl.trim()) : true;
    const ctaOk = needsCta ? Boolean(ctaSlug.trim()) : true;
    return allVariablesFilled && mediaOk && ctaOk;
  }, [template, templateVariables, needsMedia, headerMediaUrl, needsCta, ctaSlug]);

  const handleContinue = async () => {
    if (!campaignId || !canContinue) return;
    setSubmitting(true);
    try {
      await sdk.updateHostWhatsAppCampaign({
        input: {
          campaignId,
          templateVariables: templateVariables.map((v) => ({
            position: v.position,
            value: v.value,
          })),
          headerMediaUrl: needsMedia ? headerMediaUrl.trim() : undefined,
          ctaSlug: needsCta ? ctaSlug.trim() : undefined,
        },
      });
      router.push("/campaigns/whatsapp/onboarding/template-target");
    } catch (error) {
      setToastData({ type: "error", message: extractErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid h-40 place-items-center text-owner-fg-3">
        Loading template…
      </div>
    );
  }
  if (!template) return null;

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 font-owner text-owner-fg-1 lg:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Fill in your details"
          subtitle="Type the words customers will see, or use a token like {{eventName}} to auto-fill from each event."
          className="!mb-0"
        />

        <div className="flex flex-col gap-4">
          {template.variables.map((v) => {
            const current =
              templateVariables.find((tv) => tv.position === v.position)?.value ?? "";
            return (
              <div key={v.position} className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-owner-fg-2">
                  {v.label}{" "}
                  <span className="ml-1 rounded-full bg-owner-bg-subtle px-2 py-0.5 text-[10px] uppercase tracking-wider text-owner-fg-4">
                    {`{{${v.position}}}`}
                  </span>
                </label>
                <input
                  type="text"
                  value={current}
                  onChange={(e) => setVariableValue(v.position, e.target.value)}
                  placeholder={v.example ?? v.hint ?? ""}
                  className="h-11 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[14px] text-owner-fg-1 outline-none focus:border-owner-blue-500"
                />
                {v.hint && (
                  <p className="text-[12px] text-owner-fg-4">{v.hint}</p>
                )}
              </div>
            );
          })}

          {needsMedia && (
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-owner-fg-2">
                Header media URL *
              </label>
              <input
                type="url"
                value={headerMediaUrl}
                onChange={(e) => setHeaderMediaUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/hoizr/…"
                className="h-11 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[14px] text-owner-fg-1 outline-none focus:border-owner-blue-500"
              />
              <p className="text-[12px] text-owner-fg-4">
                Upload the flyer/poster to Cloudinary and paste the public URL here.
              </p>
            </div>
          )}

          {needsCta && (
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-owner-fg-2">
                Call-to-action destination *
              </label>
              <input
                type="text"
                value={ctaSlug}
                onChange={(e) => setCtaSlug(e.target.value)}
                placeholder="sunburn-goa OR https://hoizr.com/events/sunburn-goa"
                className="h-11 rounded-owner-md border border-owner-border bg-owner-bg px-3 text-[14px] text-owner-fg-1 outline-none focus:border-owner-blue-500"
              />
              <p className="text-[12px] text-owner-fg-4">
                Where the WhatsApp button takes recipients. We append UTM params
                automatically so you can track clicks.
              </p>
            </div>
          )}

          <details className="rounded-owner-md border border-owner-border bg-owner-bg-subtle p-3 text-[12.5px] text-owner-fg-3">
            <summary className="cursor-pointer font-medium">
              Personalisation tokens you can paste into any field
            </summary>
            <ul className="mt-2 flex flex-col gap-1">
              {PLACEHOLDER_HINTS.map((h) => (
                <li key={h.token} className="font-mono">
                  <code>{h.token}</code>{" "}
                  <span className="font-sans text-owner-fg-4">— {h.desc}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>

        <div className="flex justify-between pt-2">
          <OwnerButton
            variant="secondary"
            onClick={() =>
              router.push("/campaigns/whatsapp/onboarding/template-select")
            }
          >
            Back
          </OwnerButton>
          <OwnerButton
            variant="primary"
            disabled={!canContinue || submitting}
            onClick={handleContinue}
          >
            {submitting ? "Saving…" : "Continue to audience"}
          </OwnerButton>
        </div>
      </div>

      {/* Preview pane */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-owner-lg border border-owner-border bg-[#ECE5DD] p-5">
          <div className="text-[11.5px] uppercase tracking-wider text-owner-fg-4">
            Preview
          </div>
          <div className="mt-3 ml-auto max-w-[80%] rounded-owner-md bg-white p-3 shadow-owner-sm">
            {needsMedia && headerMediaUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={headerMediaUrl}
                alt=""
                className="mb-2 max-h-48 w-full rounded-owner-sm object-cover"
              />
            )}
            {template.headerType === WhatsAppTemplateHeaderType.Text &&
              template.headerText && (
                <div className="mb-2 text-[13px] font-semibold text-owner-fg-1">
                  {template.headerText}
                </div>
              )}
            <div className="whitespace-pre-wrap text-[14px] text-owner-fg-1">
              {rendered}
            </div>
            {template.footerText && (
              <div className="mt-2 text-[11.5px] text-owner-fg-4">
                {template.footerText}
              </div>
            )}
            {template.buttonLabel && (
              <div className="mt-3 -mx-3 -mb-3 rounded-b-owner-md border-t border-owner-border bg-owner-bg-subtle p-2 text-center text-[13px] font-semibold text-owner-blue-500">
                {template.buttonLabel}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppContentVariables;
