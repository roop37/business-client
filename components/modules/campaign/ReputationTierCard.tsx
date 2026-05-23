"use client";

import { sdk } from "@/utils/graphqlClient";
import { Bell, Lock, Mail, MessageCircle, Send, Zap } from "lucide-react";
import { useEffect, useState } from "react";

type ChannelStatus = "AVAILABLE" | "COMING_SOON" | "LOCKED";

type ChannelLimit = {
  channel: "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";
  maxRecipients: number;
  unlimited: boolean;
  status: ChannelStatus;
};

type ReputationData = {
  maxRecipients: number;
  unlimited: boolean;
  source: "AUTO_TIER" | "ADMIN_TIER_OVERRIDE" | "ADMIN_MAX_OVERRIDE";
  lifetimeRecipientsSent: number;
  verifiedCustomerCount: number;
  lifetimeCampaignCount: number;
  channels: ChannelLimit[];
};

const CHANNEL_META: Record<
  ChannelLimit["channel"],
  { label: string; Icon: any; bg: string; fg: string }
> = {
  EMAIL: {
    label: "Email",
    Icon: Mail,
    bg: "var(--owner-blue-050)",
    fg: "var(--owner-blue-500)",
  },
  WHATSAPP: {
    label: "WhatsApp",
    Icon: MessageCircle,
    bg: "var(--owner-success-bg)",
    fg: "var(--owner-success-text)",
  },
  SMS: {
    label: "SMS",
    Icon: Zap,
    bg: "var(--owner-warning-bg)",
    fg: "var(--owner-warning-text)",
  },
  PUSH: {
    label: "Push",
    Icon: Bell,
    bg: "var(--owner-bg-subtle)",
    fg: "var(--owner-fg-2)",
  },
};

const formatRecipients = (n: number, unlimited: boolean): string =>
  unlimited ? "Unlimited" : n.toLocaleString("en-IN");

/**
 * Host-facing campaign limits card. Shows the current per-campaign
 * recipient cap (set by the platform's anti-abuse / deliverability /
 * DPDP-consent layer) and a per-channel availability strip. No tier
 * gamification — limits are flat. Hosts who need more reach contact us.
 */
const ReputationTierCard = () => {
  const [data, setData] = useState<ReputationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await (sdk as any).myMarketingReputation();
        if (cancelled) return;
        if (res?.myMarketingReputation) {
          setData(res.myMarketingReputation as ReputationData);
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message ?? "Could not load limits");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error || !data) {
    return (
      <div className="owner-card overflow-hidden" style={{ padding: 0 }}>
        <div
          style={{
            background: "var(--owner-bg-subtle)",
            padding: "20px 24px",
            color: "var(--owner-fg-2)",
            fontSize: 13,
          }}
        >
          Loading campaign limits…
        </div>
      </div>
    );
  }

  return (
    <div className="owner-card overflow-hidden" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--owner-border-soft)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                background: "var(--owner-blue-050)",
                color: "var(--owner-blue-500)",
                borderRadius: 12,
                padding: 10,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Send size={18} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--owner-fg-3)",
                }}
              >
                Your campaign limits
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, color: "var(--owner-fg-1)" }}>
                {formatRecipients(data.maxRecipients, data.unlimited)} recipients per campaign
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginTop: 18,
            paddingTop: 14,
            borderTop: "1px solid var(--owner-border-soft)",
            fontSize: 12,
            color: "var(--owner-fg-3)",
          }}
        >
          <div>
            <div style={{ color: "var(--owner-fg-3)", fontSize: 11 }}>Verified audience</div>
            <div style={{ color: "var(--owner-fg-1)", fontWeight: 600, fontSize: 15, marginTop: 2 }}>
              {data.verifiedCustomerCount.toLocaleString("en-IN")}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--owner-fg-3)", fontSize: 11 }}>Campaigns sent</div>
            <div style={{ color: "var(--owner-fg-1)", fontWeight: 600, fontSize: 15, marginTop: 2 }}>
              {data.lifetimeCampaignCount.toLocaleString("en-IN")}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--owner-fg-3)", fontSize: 11 }}>Lifetime recipients</div>
            <div style={{ color: "var(--owner-fg-1)", fontWeight: 600, fontSize: 15, marginTop: 2 }}>
              {data.lifetimeRecipientsSent.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Channels */}
      <div style={{ padding: "16px 24px 16px" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--owner-fg-3)",
            marginBottom: 12,
          }}
        >
          Channels
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: 10,
          }}
        >
          {data.channels.map((ch) => {
            const meta = CHANNEL_META[ch.channel];
            const Icon = meta.Icon;
            const isAvailable = ch.status === "AVAILABLE";
            const isComingSoon = ch.status === "COMING_SOON";
            return (
              <div
                key={ch.channel}
                style={{
                  borderRadius: 12,
                  border: "1px solid var(--owner-border)",
                  padding: "12px 14px",
                  background: isAvailable ? "var(--owner-bg)" : "var(--owner-bg-subtle)",
                  opacity: isAvailable ? 1 : 0.78,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      background: meta.bg,
                      color: meta.fg,
                      borderRadius: 8,
                      padding: 6,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--owner-fg-1)" }}>
                    {meta.label}
                  </div>
                  {!isAvailable ? (
                    <Lock size={12} color="var(--owner-fg-4)" style={{ marginLeft: "auto" }} />
                  ) : null}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--owner-fg-3)" }}>
                  {isAvailable
                    ? `Up to ${formatRecipients(ch.maxRecipients, ch.unlimited)}`
                    : isComingSoon
                    ? "Coming soon"
                    : "Locked"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact for higher limits */}
      <div
        style={{
          padding: "14px 24px 20px",
          borderTop: "1px solid var(--owner-border-soft)",
          background: "var(--owner-bg-subtle)",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 280px", fontSize: 12.5, color: "var(--owner-fg-2)", lineHeight: 1.55 }}>
            Need to send to a larger audience than your current cap? Write to us with your campaign
            volume and use case — we&apos;ll review and lift your limit per host.
          </div>
          <a
            href="mailto:contact@hoizr.com?subject=Raise%20campaign%20recipient%20limit"
            className="btn btn-outlined"
            style={{ fontSize: 13, padding: "8px 14px", height: 36 }}
          >
            contact@hoizr.com
          </a>
        </div>
        {data.source !== "AUTO_TIER" ? (
          <div
            style={{
              marginTop: 12,
              padding: "8px 12px",
              background: "var(--owner-info-bg, #eef5ff)",
              color: "var(--owner-info-text, #234a8a)",
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            Hoizr support has set a custom limit on your account.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ReputationTierCard;
