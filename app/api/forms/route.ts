import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  FORM_SCHEMAS,
  validateAnswers,
  type FormAnswers,
  type FormType,
} from "@/lib/forms/schema";

export const runtime = "nodejs";

const FROM_ADDRESS = "Sanbedan Paul <contact@hoizr.com>";
const REPLY_TO = "contact@hoizr.com";
const DEFAULT_NOTIFY_TO = "tech@hoizr.com,contact@hoizr.com";
const NOTIFY_TO = (
  process.env.CONTACT_NOTIFY_EMAIL ??
  process.env.WAITLIST_NOTIFY_EMAIL ??
  DEFAULT_NOTIFY_TO
)
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://business.hoizr.com";
const LOGO_URL = `${SITE_URL}/logo/logoDark.png`;
const MIN_ELAPSED_MS = 2000;

const FORM_LABELS: Record<FormType, string> = {
  onboarding: "Organizer onboarding",
  partner: "Partner enquiry",
};

type FormMeta = {
  utm?: Record<string, string>;
  fbclid?: string;
  elapsedMs?: number;
  honeypot?: string;
};

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const asString = (v: unknown): string =>
  Array.isArray(v) ? v.join(", ") : typeof v === "string" ? v.trim() : "";

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Email service is not configured." }, { status: 500 });
  }

  let body: { formType?: string; answers?: FormAnswers; meta?: FormMeta };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const formType = body.formType as FormType;
  if (formType !== "onboarding" && formType !== "partner") {
    return NextResponse.json({ ok: false, error: "Unknown form." }, { status: 400 });
  }

  const meta = body.meta ?? {};
  // Bot defense: honeypot must be empty; humans take >2s to fill a form.
  if (meta.honeypot) return NextResponse.json({ ok: true }); // silently accept-and-drop bots
  if (typeof meta.elapsedMs === "number" && meta.elapsedMs < MIN_ELAPSED_MS) {
    return NextResponse.json({ ok: true });
  }

  const answers = (body.answers ?? {}) as FormAnswers;
  const check = validateAnswers(formType, answers);
  if (!check.ok) {
    return NextResponse.json({ ok: false, error: check.error }, { status: 400 });
  }

  const name = asString(answers.name) || "Someone";
  const email = asString(answers.email).toLowerCase();
  const resend = new Resend(apiKey);

  const FAILED_RESPONSE = NextResponse.json(
    { ok: false, error: "We couldn't send that right now. Try emailing contact@hoizr.com directly." },
    { status: 502 },
  );

  try {
    const [userResult, internalResult] = await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        replyTo: REPLY_TO,
        subject: "We received your Hoizr enquiry",
        html: renderUserEmail(name),
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: NOTIFY_TO,
        replyTo: email,
        subject: `New Hoizr ${FORM_LABELS[formType]} — ${name}`,
        html: renderInternalEmail(formType, answers, meta),
      }),
    ]);

    if (internalResult.error) {
      console.error("[forms] resend internal-notify failed", internalResult.error);
      return FAILED_RESPONSE;
    }
    if (userResult.error) {
      console.error("[forms] resend user-confirmation failed", userResult.error);
    }
  } catch (err) {
    console.error("[forms] resend send failed", err);
    return FAILED_RESPONSE;
  }

  return NextResponse.json({ ok: true });
}

function renderUserEmail(name: string) {
  const firstName = (name.split(" ")[0] ?? name).trim() || name;
  return `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:48px 16px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f;">
    <tr><td align="center"><table role="presentation" width="100%" style="max-width:560px;">
      <tr><td style="padding-bottom:36px;"><img src="${LOGO_URL}" alt="Hoizr" width="92" height="28" style="display:block;height:28px;width:auto;border:0;" /></td></tr>
      <tr><td style="font-size:17px;line-height:1.55;color:#1d1d1f;">
        <p style="margin:0 0 18px;">Hey ${escape(firstName)},</p>
        <p style="margin:0 0 18px;">Thanks for reaching out to Hoizr. I&rsquo;ve received your details and will review the event context personally.</p>
        <p style="margin:0 0 28px;">&mdash; Sanbedan</p>
      </td></tr>
      <tr><td style="font-size:13px;line-height:1.6;color:#86868b;padding-top:18px;border-top:1px solid #e5e5e7;">
        <p style="margin:0 0 4px;font-weight:600;color:#1d1d1f;">Sanbedan Paul</p>
        <p style="margin:0 0 10px;">Founder &amp; CEO · Hoizr Technologies Pvt. Ltd.</p>
        <p style="margin:0;"><a href="mailto:contact@hoizr.com" style="color:#1d1d1f;">contact@hoizr.com</a> · <a href="https://business.hoizr.com" style="color:#1d1d1f;">business.hoizr.com</a></p>
      </td></tr>
    </table></td></tr>
  </table></body></html>`;
}

function renderInternalEmail(formType: FormType, answers: FormAnswers, meta: FormMeta) {
  const rows = FORM_SCHEMAS[formType]
    .map((f) => [f.label, asString(answers[f.key])] as [string, string])
    .filter(([, v]) => Boolean(v));

  const utmPairs = Object.entries(meta.utm ?? {}).filter(([, v]) => Boolean(v));
  if (meta.fbclid) utmPairs.push(["fbclid", meta.fbclid]);
  const attribution = utmPairs.length
    ? `<p style="margin:16px 0 0;font-size:12px;color:#7a7e75;">Attribution: ${utmPairs.map(([k, v]) => `${escape(k)}=${escape(v)}`).join(" · ")}</p>`
    : "";

  return `<!doctype html><html><body style="margin:0;background:#f6f6f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0e0f0c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:14px;border:1px solid #ececea;"><tr><td style="padding:24px 28px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5a5e55;">${escape(FORM_LABELS[formType])}</div>
      <h1 style="margin:6px 0 18px;font-size:20px;font-weight:700;">${escape(asString(answers.name) || "New lead")}</h1>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #ececea;">
        ${rows
          .map(
            ([label, value], i) => `<tr>
          <td style="padding:10px 0;width:140px;color:#7a7e75;${i ? "border-top:1px solid #f1f1ee;" : ""}vertical-align:top;">${escape(label)}</td>
          <td style="padding:10px 0;${i ? "border-top:1px solid #f1f1ee;" : ""}white-space:pre-wrap;">${
            label === "Email" ? `<a href="mailto:${escape(value)}" style="color:#0e0f0c;">${escape(value)}</a>` : escape(value)
          }</td></tr>`,
          )
          .join("")}
      </table>
      ${attribution}
    </td></tr></table>
  </td></tr></table></body></html>`;
}
