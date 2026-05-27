"use client";

import DOMPurify from "dompurify";
import { BoldIcon, ItalicIcon, ListIcon } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * Minimal HTML-content editor. Used wherever a description / policy
 * field benefits from bold / italic / bullets (event description,
 * ticketing terms, refund policy, host description, ticket info,
 * etc.) so the output can be rendered into the customer-facing page
 * later without an additional markdown step.
 *
 * The editor relies on `document.execCommand`, which is deprecated
 * but works consistently in every browser we ship to today. When a
 * proper replacement (e.g. Tiptap) lands, swap the implementation
 * here — every consumer reads the same `value` / `onChange` HTML
 * string contract.
 *
 * Incoming `value` is run through DOMPurify before being placed in
 * the contentEditable host. The browser engine is what actually
 * applies the HTML — the sanitiser narrows the field of what survives
 * a paste from an untrusted clipboard, a stored value from older code,
 * or an autosave from another session. Customer-facing surfaces also
 * sanitise on the server before rendering.
 */

const SANITISE_CONFIG = {
  ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "ul", "ol", "li", "p", "br"],
  ALLOWED_ATTR: [],
};

export const RichTextEditor = ({
  label,
  value,
  onChange,
  minHeight = 132,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
  className?: string;
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = editorRef.current;
    if (!node) return;
    const clean = DOMPurify.sanitize(value || "", SANITISE_CONFIG);
    if (node.innerHTML !== clean) {
      node.innerHTML = clean;
    }
  }, [value]);

  const runCommand = (command: "bold" | "italic" | "insertUnorderedList") => {
    editorRef.current?.focus();
    document.execCommand(command);
    const html = editorRef.current?.innerHTML ?? "";
    onChange(DOMPurify.sanitize(html, SANITISE_CONFIG));
  };

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    const html = event.currentTarget.innerHTML;
    onChange(DOMPurify.sanitize(html, SANITISE_CONFIG));
  };

  return (
    <div
      className={`block min-w-0 text-sm font-medium md:col-span-2 ${className}`}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <span>{label}</span>
        <div className="flex items-center gap-1 rounded-md border border-[var(--owner-border)] bg-white p-1">
          <button
            type="button"
            onClick={() => runCommand("bold")}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--owner-fg-2)] hover:bg-[var(--owner-bg-subtle)]"
            title="Bold"
          >
            <BoldIcon size={14} />
          </button>
          <button
            type="button"
            onClick={() => runCommand("italic")}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--owner-fg-2)] hover:bg-[var(--owner-bg-subtle)]"
            title="Italic"
          >
            <ItalicIcon size={14} />
          </button>
          <button
            type="button"
            onClick={() => runCommand("insertUnorderedList")}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--owner-fg-2)] hover:bg-[var(--owner-bg-subtle)]"
            title="Bullet list"
          >
            <ListIcon size={14} />
          </button>
        </div>
      </div>
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        style={{ minHeight }}
        className="w-full rounded-lg border border-[var(--owner-border)] bg-white px-3 py-2 text-sm leading-6 outline-none transition focus:border-[var(--owner-blue-500)] focus:ring-2 focus:ring-[var(--owner-blue-050)] [&_ul]:ml-5 [&_ul]:list-disc"
      />
    </div>
  );
};

export default RichTextEditor;
