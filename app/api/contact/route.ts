import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

interface ContactBody {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  city?: string;
  format?: string;
  message?: string;
}

type ContactLead = {
  name: string;
  role: string;
  email: string;
  phone: string;
  city: string;
  format: string;
  message: string;
};

const FROM_ADDRESS = "Sanbedan Paul <contact@hoizr.com>";
const REPLY_TO = "contact@hoizr.com";
const NOTIFY_TO =
  process.env.CONTACT_NOTIFY_EMAIL ??
  process.env.WAITLIST_NOTIFY_EMAIL ??
  "sanbedan9989@gmail.com";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://business.hoizr.com";
const LOGO_URL = `${SITE_URL}/logo/logoDark.png`;

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

  let body: ContactBody;
  try {
    body = (await req.json()) as ContactBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const lead = {
    name: normalize(body.name, 120),
    role: normalize(body.role, 120),
    email: normalize(body.email, 180).toLowerCase(),
    phone: normalize(body.phone, 40),
    city: normalize(body.city, 120),
    format: normalize(body.format, 120),
    message: normalize(body.message, 1200),
  };

  if (lead.name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Please share your name." },
      { status: 400 },
    );
  }
  if (!EMAIL_RX.test(lead.email)) {
    return NextResponse.json(
      { ok: false, error: "That email doesn't look right." },
      { status: 400 },
    );
  }
  if (lead.phone && !PHONE_RX.test(lead.phone)) {
    return NextResponse.json(
      { ok: false, error: "That phone number doesn't look right." },
      { status: 400 },
    );
  }

  const resend = new Resend(apiKey);
  const userHtml = renderUserEmail({ name: lead.name });
  const internalHtml = renderInternalEmail(lead);

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: lead.email,
        replyTo: REPLY_TO,
        subject: "We received your Hoizr enquiry",
        html: userHtml,
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: NOTIFY_TO,
        replyTo: lead.email,
        subject: `New Hoizr contact enquiry - ${lead.name}`,
        html: internalHtml,
      }),
    ]);
  } catch (err) {
    console.error("[contact] resend send failed", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We couldn't send that right now. Try emailing contact@hoizr.com directly.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

const normalize = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function renderUserEmail({ name }: { name: string }) {
  const firstName = (name.split(" ")[0] ?? name).trim() || name;
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:48px 16px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;">
        <tr><td style="padding-bottom:36px;">
          <img src="${LOGO_URL}" alt="Hoizr" width="92" height="28" style="display:block;height:28px;width:auto;border:0;outline:0;text-decoration:none;" />
        </td></tr>
        <tr><td style="font-size:17px;line-height:1.55;color:#1d1d1f;">
          <p style="margin:0 0 18px;">Hey ${escape(firstName)},</p>
          <p style="margin:0 0 18px;">
            Thanks for reaching out to Hoizr. I&rsquo;ve received your details and will review the event context personally.
          </p>
          <p style="margin:0 0 18px;">
            If this is for a time-sensitive event night, reply to this email with your date, venue, and expected capacity so we can move faster.
          </p>
          <p style="margin:0 0 28px;">&mdash; Sanbedan</p>
        </td></tr>
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
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderInternalEmail(lead: ContactLead) {
  const rows = ([
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Role", lead.role],
    ["City / market", lead.city],
    ["Event format", lead.format],
    ["Message", lead.message],
  ] as [string, string][]).filter(([, value]) => Boolean(value));

  return `<!doctype html>
<html><body style="margin:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0e0f0c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:14px;border:1px solid #ececea;">
        <tr><td style="padding:24px 28px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5a5e55;">New contact enquiry</div>
          <h1 style="margin:6px 0 18px;font-size:20px;font-weight:700;">${escape(lead.name)}</h1>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #ececea;">
            ${rows
              .map(
                ([label, value], index) => `
            <tr>
              <td style="padding:10px 0;width:118px;color:#7a7e75;${index ? "border-top:1px solid #f1f1ee;" : ""}vertical-align:top;">${escape(label)}</td>
              <td style="padding:10px 0;${index ? "border-top:1px solid #f1f1ee;" : ""}white-space:pre-wrap;">${
                label === "Email"
                  ? `<a href="mailto:${escape(value)}" style="color:#0e0f0c;">${escape(value)}</a>`
                  : escape(value)
              }</td>
            </tr>`,
              )
              .join("")}
          </table>
          <p style="margin:20px 0 0;font-size:13px;color:#7a7e75;">
            Reply to this email to reach ${escape(lead.name)} directly.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
