"use client";

import { ExternalLink, Phone, Reply } from "lucide-react";
import React, { useMemo } from "react";
import type {
  WhatsAppCampaignVariable,
  WhatsAppTemplate,
} from "@/utils/whatsappCampaignClient";

/**
 * Live preview of exactly how a WhatsApp template message will look to the
 * customer — a chat bubble on the WhatsApp chat canvas. Mirrors the
 * right-side preview the email campaign editor gives, but renders the
 * WhatsApp shape (header media/text → body → footer → button) instead of
 * an HTML email.
 *
 * Pure presentational: give it a template + the host's filled-in variable
 * values; it substitutes `{{n}}` and applies WhatsApp text formatting
 * (*bold*, _italic_, ~strike~). Unfilled variables render as faded
 * `‹label›` placeholders so the host can see what each slot is.
 */

type Props = {
  template: WhatsAppTemplate | null;
  variables: WhatsAppCampaignVariable[];
  /** Live override for an IMAGE/VIDEO header (the host's uploaded media). */
  headerMediaUrl?: string;
};

const now = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Apply WhatsApp inline formatting to a plain string → React nodes.
const formatWhatsApp = (text: string, keyBase: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  // Split on *bold* _italic_ ~strike~ ```mono``` while keeping delimiters.
  const re = /(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|```[^`]+```)/g;
  const parts = text.split(re);
  parts.forEach((part, i) => {
    const key = `${keyBase}-${i}`;
    if (/^\*[^*\n]+\*$/.test(part)) {
      nodes.push(<strong key={key}>{part.slice(1, -1)}</strong>);
    } else if (/^_[^_\n]+_$/.test(part)) {
      nodes.push(<em key={key}>{part.slice(1, -1)}</em>);
    } else if (/^~[^~\n]+~$/.test(part)) {
      nodes.push(<s key={key}>{part.slice(1, -1)}</s>);
    } else if (/^```[^`]+```$/.test(part)) {
      nodes.push(
        <code key={key} className="font-mono text-[12px]">
          {part.slice(3, -3)}
        </code>
      );
    } else if (part) {
      // Preserve newlines.
      part.split("\n").forEach((line, j, arr) => {
        nodes.push(<React.Fragment key={`${key}-l${j}`}>{line}</React.Fragment>);
        if (j < arr.length - 1) nodes.push(<br key={`${key}-br${j}`} />);
      });
    }
  });
  return nodes;
};

// Substitute {{n}} with the filled value, or a faded placeholder node.
const renderBody = (
  body: string,
  template: WhatsAppTemplate,
  variables: WhatsAppCampaignVariable[]
): React.ReactNode[] => {
  const valueByPos = new Map(variables.map((v) => [v.position, v.value]));
  const labelByPos = new Map(
    (template.variables ?? []).map((v) => [
      v.position,
      v.label || v.example || `Variable ${v.position}`,
    ])
  );
  const segments = body.split(/(\{\{\d+\}\})/g);
  const out: React.ReactNode[] = [];
  segments.forEach((seg, i) => {
    const m = seg.match(/^\{\{(\d+)\}\}$/);
    if (m) {
      const pos = Number(m[1]);
      const val = (valueByPos.get(pos) ?? "").trim();
      if (val) {
        out.push(
          <React.Fragment key={`v${i}`}>
            {formatWhatsApp(val, `v${i}`)}
          </React.Fragment>
        );
      } else {
        out.push(
          <span key={`p${i}`} className="text-[#667781] italic opacity-70">
            ‹{labelByPos.get(pos) ?? `var ${pos}`}›
          </span>
        );
      }
    } else if (seg) {
      out.push(
        <React.Fragment key={`t${i}`}>
          {formatWhatsApp(seg, `t${i}`)}
        </React.Fragment>
      );
    }
  });
  return out;
};

export const WhatsAppTemplatePreview = ({
  template,
  variables,
  headerMediaUrl,
}: Props) => {
  const bodyNodes = useMemo(
    () => (template ? renderBody(template.bodyText ?? "", template, variables) : []),
    [template, variables]
  );

  return (
    <div className="flex flex-col">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-owner-fg-4">
        Customer preview
      </div>

      {/* WhatsApp chat canvas */}
      <div
        className="relative overflow-hidden rounded-2xl border border-owner-border p-4"
        style={{
          backgroundColor: "#E5DDD5",
          // Subtle WhatsApp-style doodle texture without an asset.
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          minHeight: 260,
        }}
      >
        {!template ? (
          <div className="flex h-[220px] items-center justify-center text-center text-[13px] text-[#667781]">
            Pick an approved template to preview the message your customers
            will receive.
          </div>
        ) : (
          <div className="max-w-[300px]">
            {/* Incoming message bubble */}
            <div
              className="relative rounded-lg rounded-tl-none bg-white px-2 pb-2 pt-2 shadow-sm"
              style={{ boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)" }}
            >
              {/* Header */}
              {template.headerType === "IMAGE" ||
              template.headerType === "VIDEO" ? (
                <div className="mb-1.5 overflow-hidden rounded-md bg-[#cfd8dc]">
                  {headerMediaUrl || template.headerSampleMediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={headerMediaUrl || template.headerSampleMediaUrl || ""}
                      alt=""
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center text-[12px] text-[#5b6b73]">
                      {template.headerType === "VIDEO" ? "▶ Video" : "🖼 Image"}{" "}
                      header
                    </div>
                  )}
                </div>
              ) : null}

              {template.headerType === "TEXT" && template.headerText ? (
                <div className="mb-1 text-[14px] font-semibold text-[#111b21]">
                  {template.headerText}
                </div>
              ) : null}

              {template.headerType === "DOCUMENT" ? (
                <div className="mb-1.5 flex items-center gap-2 rounded-md bg-[#f0f2f5] px-2 py-2 text-[12px] text-[#5b6b73]">
                  📄 Document
                </div>
              ) : null}

              {/* Body */}
              <div className="whitespace-pre-wrap break-words text-[14px] leading-[19px] text-[#111b21]">
                {bodyNodes}
              </div>

              {/* Footer */}
              {template.footerText ? (
                <div className="mt-1.5 text-[12px] text-[#667781]">
                  {template.footerText}
                </div>
              ) : null}

              {/* Timestamp */}
              <div className="mt-0.5 text-right text-[10px] text-[#667781]">
                {now()}
              </div>

              {/* Bubble tail */}
              <span
                className="absolute -left-1.5 top-0 h-0 w-0"
                style={{
                  borderTop: "8px solid white",
                  borderLeft: "8px solid transparent",
                }}
              />
            </div>

            {/* Button row (renders as a separate tappable block in WhatsApp) */}
            {template.buttonType && template.buttonType !== "NONE" ? (
              <div className="mt-0.5 overflow-hidden rounded-lg bg-white shadow-sm">
                <button
                  type="button"
                  disabled
                  className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-[14px] font-medium text-[#00a5f4]"
                >
                  {template.buttonType === "URL" ? (
                    <ExternalLink size={15} />
                  ) : template.buttonType === "PHONE" ? (
                    <Phone size={15} />
                  ) : (
                    <Reply size={15} />
                  )}
                  {template.buttonLabel ||
                    (template.buttonType === "URL" ? "Visit link" : "Reply")}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {template ? (
        <p className="mt-2 text-[11px] leading-4 text-owner-fg-4">
          Exact rendering varies slightly by device. Marketing messages send only
          from Hoizr-approved templates; sending is debited from your marketing
          credit per delivered message.
        </p>
      ) : null}
    </div>
  );
};

export default WhatsAppTemplatePreview;
