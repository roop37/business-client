import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Hoizr Business access endpoint. Posts from the legacy WaitlistModal,
 * fires two transactional emails via Resend:
 *
 *   1. Confirmation to the lead.
 *   2. Internal notification to WAITLIST_NOTIFY_EMAIL.
 *
 * Self-contained — runs without the main API server. Reads keys from
 * .env (recoverable values committed there for now while the team is
 * early access). Move to Vercel env + secret rotation before any
 * external traffic.
 */

export const runtime = "nodejs";

type Role = "host" | "event-org" | "promoter" | "other";

interface WaitlistBody {
  name?: string;
  email?: string;
  phone?: string;
  role?: Role;
  note?: string;
}

const ROLE_LABEL: Record<Role, string> = {
  host: "Venue",
  "event-org": "Event organiser",
  promoter: "Promoter",
  other: "Other",
};

// Apple-style account-request emails are sent from a real person, not a brand
// mailbox — open rates run 30%+ higher. `contact@hoizr.com` is still
// the deliverability address; the display name puts a human face on
// the inbox preview.
const FROM_ADDRESS = "Sanbedan Paul <contact@hoizr.com>";
const REPLY_TO = "contact@hoizr.com";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://business.hoizr.com";
const LOGO_URL = `${SITE_URL}/logo/logoDark.png`;
const UNSUBSCRIBE_MAILTO = `mailto:contact@hoizr.com?subject=${encodeURIComponent(
  "Remove me from Hoizr account updates",
)}`;

const NOTIFY_TO = (process.env.WAITLIST_NOTIFY_EMAIL ?? "tech@hoizr.com,contact@hoizr.com")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RX = /^[+\d][\d\s().-]{6,}$/;

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Email service is not configured." },
      { status: 500 },
    );
  }

  let body: WaitlistBody;
  try {
    body = (await req.json()) as WaitlistBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const phone = body.phone?.trim() ?? "";
  const role = body.role as Role | undefined;
  const note = body.note?.trim().slice(0, 500) ?? "";

  if (name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Please share your name." },
      { status: 400 },
    );
  }
  if (!EMAIL_RX.test(email)) {
    return NextResponse.json(
      { ok: false, error: "That email doesn't look right." },
      { status: 400 },
    );
  }
  if (!PHONE_RX.test(phone)) {
    return NextResponse.json(
      { ok: false, error: "Please share a contactable phone number." },
      { status: 400 },
    );
  }
  if (!role || !ROLE_LABEL[role]) {
    return NextResponse.json(
      { ok: false, error: "Pick the role that fits best." },
      { status: 400 },
    );
  }

  const resend = new Resend(apiKey);
  const roleLabel = ROLE_LABEL[role];

  const userHtml = renderUserEmail({ name, roleLabel });
  const internalHtml = renderInternalEmail({ name, email, phone, roleLabel, note });

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        replyTo: REPLY_TO,
        subject: "We got your Hoizr account request",
        html: userHtml,
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: NOTIFY_TO,
        replyTo: email,
        subject: `New Hoizr account request · ${name} (${roleLabel})`,
        html: internalHtml,
      }),
    ]);
  } catch (err) {
    console.error("[waitlist] resend send failed", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We saved your details but couldn't send the confirmation. Hoizr will reach out shortly.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function renderUserEmail({
  name,
  roleLabel,
}: {
  name: string;
  roleLabel: string;
}) {
  // Apple-style confirmation. Plain-text feel, single CTA
  // (reply with event date), real human signature, original Hoizr
  // logo at the top, explicit unsubscribe path in the footer.
  // Designed to look like a personal note, not a marketing blast.
  const firstName = (name.split(" ")[0] ?? name).trim() || name;
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:48px 16px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;">

        <!-- Hoizr wordmark — original brand asset, kept small to read like a letterhead -->
        <tr><td style="padding-bottom:36px;">
          <img src="${LOGO_URL}" alt="Hoizr" width="92" height="28" style="display:block;height:28px;width:auto;border:0;outline:0;text-decoration:none;" />
        </td></tr>

        <!-- Personal opening — benefit-first sentence per Apple/founder-letter style -->
        <tr><td style="font-size:17px;line-height:1.55;color:#1d1d1f;">
          <p style="margin:0 0 18px;">Hey ${escape(firstName)},</p>
          <p style="margin:0 0 18px;">
            We got your Hoizr Business access request. Event organizers can publish
            directly and start without a subscription wall.
          </p>
          <p style="margin:0 0 18px;">Here&rsquo;s what happens next:</p>
          <ul style="margin:0 0 22px;padding:0 0 0 20px;color:#1d1d1f;">
            <li style="margin:0 0 6px;line-height:1.55;">You can publish directly without a subscription wall, setup fee, listing fee, or starter-tier limitation.</li>
            <li style="margin:0 0 6px;line-height:1.55;">Hoizr AI studies the event and provides the best possible offer, including lowered commission where the event qualifies.</li>
            <li style="margin:0;line-height:1.55;">Verification (KYC / bank / GSTIN, if applicable) runs alongside event setup.</li>
          </ul>
          <p style="margin:0 0 18px;">
            <strong>If you have an event coming up soon, just hit reply with the
            date and city.</strong> We bump those queries to the top of the queue.
          </p>
          <p style="margin:0 0 28px;">— Sanbedan</p>
        </td></tr>

        <!-- Personal signature block — matches the Apple "from a real person" guidance -->
        <tr><td style="font-size:13px;line-height:1.6;color:#86868b;padding-top:18px;border-top:1px solid #e5e5e7;">
          <p style="margin:0 0 4px;font-weight:600;color:#1d1d1f;">Sanbedan Paul</p>
          <p style="margin:0 0 10px;">Founder &amp; CEO · Hoizr Technologies Pvt. Ltd.</p>
          <p style="margin:0;">
            <a href="mailto:contact@hoizr.com" style="color:#1d1d1f;text-decoration:underline;">contact@hoizr.com</a>
            &nbsp;·&nbsp;
            <a href="https://business.hoizr.com" style="color:#1d1d1f;text-decoration:underline;">business.hoizr.com</a>
            &nbsp;·&nbsp;
            <a href="https://www.instagram.com/hoizr.technologies" style="color:#1d1d1f;text-decoration:underline;">Instagram</a>
          </p>
        </td></tr>

        <!-- Footer / unsubscribe — required for deliverability -->
        <tr><td style="padding-top:32px;font-size:11px;line-height:1.55;color:#86868b;">
          You&rsquo;re receiving this because you shared your details with Hoizr at
          business.hoizr.com.
          <br />
          Don&rsquo;t want updates? <a href="${UNSUBSCRIBE_MAILTO}" style="color:#86868b;text-decoration:underline;">Unsubscribe</a> — one click, no hard feelings.
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderInternalEmail({
  name,
  email,
  phone,
  roleLabel,
  note,
}: {
  name: string;
  email: string;
  phone: string;
  roleLabel: string;
  note: string;
}) {
  const noteBlock = note
    ? `<tr><td style="padding:10px 0;color:#7a7e75;border-top:1px solid #f1f1ee;vertical-align:top;">Note</td><td style="padding:10px 0;border-top:1px solid #f1f1ee;white-space:pre-wrap;">${escape(note)}</td></tr>`
    : "";
  return `<!doctype html>
<html><body style="margin:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0e0f0c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:14px;border:1px solid #ececea;">
        <tr><td style="padding:24px 28px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5a5e55;">New Hoizr account request</div>
          <h1 style="margin:6px 0 18px;font-size:20px;font-weight:700;">${escape(name)} · ${escape(roleLabel)}</h1>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #ececea;">
            <tr><td style="padding:10px 0;width:90px;color:#7a7e75;">Email</td><td style="padding:10px 0;"><a href="mailto:${escape(email)}" style="color:#0e0f0c;">${escape(email)}</a></td></tr>
            <tr><td style="padding:10px 0;color:#7a7e75;border-top:1px solid #f1f1ee;">Phone</td><td style="padding:10px 0;border-top:1px solid #f1f1ee;">${escape(phone)}</td></tr>
            <tr><td style="padding:10px 0;color:#7a7e75;border-top:1px solid #f1f1ee;">Role</td><td style="padding:10px 0;border-top:1px solid #f1f1ee;">${escape(roleLabel)}</td></tr>
            ${noteBlock}
          </table>
          <p style="margin:20px 0 0;font-size:13px;color:#7a7e75;">
            Reply to this email to reach ${escape(name)} directly.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
