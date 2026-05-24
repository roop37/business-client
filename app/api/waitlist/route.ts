import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Pre-launch waitlist endpoint. Posts from the WaitlistModal,
 * fires two transactional emails via Resend:
 *
 *   1. Confirmation to the lead.
 *   2. Internal notification to WAITLIST_NOTIFY_EMAIL.
 *
 * Self-contained — runs without the main API server. Reads keys from
 * .env (recoverable values committed there for now while the team is
 * pre-launch). Move to Vercel env + secret rotation before any
 * external traffic.
 */

export const runtime = "nodejs";

type Role = "host" | "event-org" | "promoter" | "other";

interface WaitlistBody {
  name?: string;
  email?: string;
  phone?: string;
  role?: Role;
}

const ROLE_LABEL: Record<Role, string> = {
  host: "Venue / Host",
  "event-org": "Event organiser",
  promoter: "Promoter",
  other: "Other",
};

const FROM_ADDRESS =
  process.env.WAITLIST_FROM_ADDRESS ?? "Hoizr <onboarding@resend.dev>";

const NOTIFY_TO = process.env.WAITLIST_NOTIFY_EMAIL ?? "sanbedan9989@gmail.com";

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
  const internalHtml = renderInternalEmail({ name, email, phone, roleLabel });

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: "You're on the Hoizr waitlist",
        html: userHtml,
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: NOTIFY_TO,
        replyTo: email,
        subject: `New waitlist signup · ${name} (${roleLabel})`,
        html: internalHtml,
      }),
    ]);
  } catch (err) {
    console.error("[waitlist] resend send failed", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We saved your details but couldn't send the confirmation. The team will reach out shortly.",
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
  return `<!doctype html>
<html><body style="margin:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0e0f0c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f4;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #ececea;">
        <tr><td style="background:#050504;padding:28px 32px;color:#ffffff;">
          <div style="font-family:Georgia,serif;font-weight:700;letter-spacing:0.18em;font-size:18px;">HOIZR</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 14px;font-size:22px;font-weight:700;letter-spacing:-0.01em;">You're on the list, ${escape(name)}.</h1>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3b3f38;">
            Thank you for joining the Hoizr waitlist as a <strong>${escape(roleLabel)}</strong>.
            We're building the operating system for India's live-music nights —
            ticketing, marketing, door ops, and AI-priced commissions — and you'll
            be among the first in.
          </p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3b3f38;">
            The team will reach out personally to set up your account and walk
            you through onboarding. In the meantime, reply to this email if you
            have an event coming up soon — we'll prioritise the queue.
          </p>
          <p style="margin:28px 0 0;font-size:14px;color:#6b6f67;">
            — The Hoizr team<br/>
            Mumbai · Bengaluru · Delhi NCR
          </p>
        </td></tr>
        <tr><td style="background:#fafaf8;padding:18px 32px;border-top:1px solid #ececea;font-size:12px;color:#7a7e75;">
          You're receiving this because you joined the Hoizr waitlist at
          business.hoizr.com. If this wasn't you, you can safely ignore this email.
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
}: {
  name: string;
  email: string;
  phone: string;
  roleLabel: string;
}) {
  return `<!doctype html>
<html><body style="margin:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0e0f0c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:14px;border:1px solid #ececea;">
        <tr><td style="padding:24px 28px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5a5e55;">New waitlist signup</div>
          <h1 style="margin:6px 0 18px;font-size:20px;font-weight:700;">${escape(name)} · ${escape(roleLabel)}</h1>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #ececea;">
            <tr><td style="padding:10px 0;width:90px;color:#7a7e75;">Email</td><td style="padding:10px 0;"><a href="mailto:${escape(email)}" style="color:#0e0f0c;">${escape(email)}</a></td></tr>
            <tr><td style="padding:10px 0;color:#7a7e75;border-top:1px solid #f1f1ee;">Phone</td><td style="padding:10px 0;border-top:1px solid #f1f1ee;">${escape(phone)}</td></tr>
            <tr><td style="padding:10px 0;color:#7a7e75;border-top:1px solid #f1f1ee;">Role</td><td style="padding:10px 0;border-top:1px solid #f1f1ee;">${escape(roleLabel)}</td></tr>
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
