"use client";

import useGlobalStore from "@/store/global";
import useHostsStore from "@/store/host";
import { uploadHostAsset } from "@/utils/cloudinaryUpload";
import { extractErrorMessage } from "@/utils/utilFUncs";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Image dropzone for a WhatsApp header image — replaces the old "paste a URL"
 * field. Uploads to Cloudinary via the shared host-asset uploader (same flow
 * Event Journey uses), then hands the secure URL back through `onChange`.
 */
const WhatsAppMediaUpload = ({
  value,
  onChange,
  label = "Header image",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}) => {
  const { setToastData } = useGlobalStore();
  const hostId = useHostsStore((s) => s.selectedHostId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToastData({ type: "error", message: "Please choose an image file." });
      return;
    }
    if (!hostId) {
      setToastData({
        type: "error",
        message: "We couldn't load your venue context. Refresh and try again.",
      });
      return;
    }
    setUploading(true);
    try {
      const result = await uploadHostAsset({
        kind: "host-settings",
        hostId,
        file,
        previousUrl: value || null,
      });
      onChange(result.secureUrl);
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="text-[12px] font-semibold text-owner-fg-2">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value ? (
        <div className="mt-1 flex items-center gap-3 rounded-owner-md border border-owner-border bg-owner-bg p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Header"
            className="h-16 w-24 rounded object-cover"
          />
          <div className="flex flex-1 items-center justify-between">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-[12px] font-semibold text-owner-blue-500 hover:underline"
            >
              {uploading ? "Uploading…" : "Replace image"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1 text-[12px] text-owner-fg-4 hover:text-owner-danger-text"
            >
              <X size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`mt-1 flex w-full flex-col items-center justify-center gap-1.5 rounded-owner-md border border-dashed py-6 text-center transition ${
            dragOver
              ? "border-owner-blue-500 bg-owner-blue-050"
              : "border-owner-border bg-owner-bg-subtle hover:border-owner-blue-500"
          }`}
        >
          {uploading ? (
            <Loader2 size={18} className="animate-spin text-owner-fg-3" />
          ) : (
            <ImagePlus size={18} className="text-owner-fg-3" />
          )}
          <span className="text-[12px] font-medium text-owner-fg-2">
            {uploading ? "Uploading…" : "Click or drop an image to upload"}
          </span>
        </button>
      )}
      {hint ? (
        <span className="mt-1 block text-[11px] text-owner-fg-4">{hint}</span>
      ) : null}
    </div>
  );
};

export default WhatsAppMediaUpload;
