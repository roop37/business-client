// Pure, React-free. Single source of truth for field metadata +
// validation. Imported by the client engine AND the server API route.

export type FormType = "onboarding" | "partner";

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "choice"
  | "multi-choice";

export type FieldMeta = {
  key: string;
  label: string; // human-readable — also used in the internal email Q→A table
  type: FieldType;
  required?: boolean;
};

export type FormAnswers = Record<string, string | string[]>;

// Mirrors the regexes in app/api/contact/route.ts so behaviour matches.
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RX = /^[+\d][\d\s().-]{6,}$/;
const URL_RX = /^https?:\/\/.+|^[\w-]+\.[\w.-]+/;

export const FORM_SCHEMAS: Record<FormType, FieldMeta[]> = {
  onboarding: [
    { key: "role", label: "Who they are", type: "choice", required: true },
    { key: "createsWhat", label: "What they create", type: "choice", required: true },
    { key: "city", label: "City", type: "text", required: true },
    { key: "frequency", label: "How often they host", type: "choice", required: true },
    { key: "crowdSize", label: "Usual crowd size", type: "choice", required: true },
    { key: "pain", label: "Biggest pain", type: "choice", required: true },
    { key: "name", label: "Name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "instagram", label: "Instagram", type: "text" },
  ],
  partner: [
    { key: "fixFirst", label: "What they want to fix first", type: "choice", required: true },
    { key: "eventScale", label: "Event scale", type: "choice", required: true },
    { key: "name", label: "Name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "company", label: "Brand / company", type: "text" },
    { key: "message", label: "Message", type: "textarea" },
  ],
};

export const getField = (formType: FormType, key: string): FieldMeta | undefined =>
  FORM_SCHEMAS[formType].find((f) => f.key === key);

const asString = (value: unknown): string =>
  Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value.trim() : "";

// Returns an error message, or null when valid.
export const validateField = (meta: FieldMeta, value: unknown): string | null => {
  const v = asString(value);
  if (!v) {
    if (!meta.required) return null;
    if (meta.type === "email") return "Add your email so we can reach you.";
    if (meta.type === "choice" || meta.type === "multi-choice") return "Pick an option to continue.";
    return `Add your ${meta.label.toLowerCase()} to continue.`;
  }
  if (meta.type === "email" && !EMAIL_RX.test(v)) return "That email doesn't look right.";
  if (meta.type === "tel" && !PHONE_RX.test(v)) return "That phone number doesn't look right.";
  if (meta.type === "url" && !URL_RX.test(v)) return "That link doesn't look right.";
  if (meta.key === "name" && v.length < 2) return "Please share your name.";
  return null;
};

// Server-side trust boundary: validate the entire submitted answer set
// against the schema, independent of whatever the client sent.
export const validateAnswers = (
  formType: FormType,
  answers: FormAnswers,
): { ok: boolean; error?: string } => {
  for (const meta of FORM_SCHEMAS[formType]) {
    const err = validateField(meta, answers[meta.key]);
    if (err) return { ok: false, error: err };
  }
  return { ok: true };
};
