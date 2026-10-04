"use client";

import { sdk } from "@/utils/graphqlClient";
import { Check } from "lucide-react";
import React, { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0F8842]/30";
const labelCls = "block text-xs font-medium text-neutral-500 mb-1";

/**
 * Public whitelabel lead form for the marketing site. Submits the PUBLIC
 * `submitWhitelabelRequest` mutation (no auth) — the server rate-limits per IP
 * and emails the sales team + files it in the admin queue.
 */
export const WhitelabelLeadForm: React.FC = () => {
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!orgName.trim() || !contactName.trim() || !email.trim()) {
      setError("Organization, name and email are required.");
      return;
    }
    setSending(true);
    try {
      await sdk.SubmitWhitelabelRequest({
        input: {
          orgName: orgName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
        },
      });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#0F8842]/10">
          <Check size={22} className="text-[#0F8842]" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-neutral-900">Request received</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Thanks — our team will reach out to you at {email} shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Organization</label>
          <input className={inputCls} value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Your company or venue" />
        </div>
        <div>
          <label className={labelCls}>Your name</label>
          <input className={inputCls} value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Work email</label>
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Phone (optional)</label>
          <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>What are you looking to build? (optional)</label>
          <textarea className={inputCls} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#0F8842] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0c6d36] disabled:opacity-60"
      >
        {sending ? "Sending…" : "Request whitelabel"}
      </button>
    </form>
  );
};

export default WhitelabelLeadForm;
