import { sdk } from "@/utils/graphqlClient";

/**
 * Single source of truth for browser → Cloudinary uploads.
 *
 * Why this file exists
 * --------------------
 * Every "host changes their logo" / "host changes the event flyer"
 * flow used to inline `formData.append("upload_preset", ...)` calls
 * with hardcoded preset names and no folder discipline. The result
 * was that:
 *   - dev and prod assets sat in the same flat folder
 *   - every replace left the old asset orphaned in Cloudinary
 *   - there was no way to scope a host's assets when off-boarding
 *
 * The helper here owns three jobs:
 *   1. Build the env-prefixed folder path so dev/prod stay separated
 *      under one Cloudinary cloud (hoizr/{env}/hosts/{hostId}/...).
 *   2. POST the file to the right preset with the dynamic folder.
 *   3. If the caller passes `previousUrl`, fire the server-side
 *      deleteHostCloudinaryAsset mutation after a successful upload
 *      so old assets get cleaned up instead of piling up forever.
 *
 * The preset itself does NOT pin the folder — it allows the folder
 * parameter to override. See docs/cloudinary-setup.md for the preset
 * config the dashboard needs to match.
 */

const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "choose-pos";

// Default to "dev" so a missing env var never silently writes into
// the prod folder. Vercel/CI must set NEXT_PUBLIC_HOIZR_ENV=prod for
// production deploys.
const APP_ENV = (
  process.env.NEXT_PUBLIC_HOIZR_ENV ?? "dev"
).toLowerCase();
const ENV_SAFE = APP_ENV.replace(/[^a-z0-9_-]/g, "") || "dev";

// One unsigned preset handles every image upload from this client.
// The dashboard preset must:
//   - be Unsigned
//   - have "Use filename or externally defined Public ID" = OFF
//   - leave the folder field BLANK and allow folder overrides
const IMAGE_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_PRESET ?? "hoizr-uploads";

// Raw uploads (CSV target lists, etc) use a separate preset because
// the resource type and validation rules differ.
const RAW_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_RAW_PRESET ?? "hoizr-uploads-raw";

export type HostAssetKind =
  | "host-logo"
  | "host-settings"
  | "event-flyer"
  | "event-horizontal-flyer"
  | "event-sneak-peek"
  | "event-gallery"
  | "event-table-layout"
  | "event-instagram"
  | "event-extra"
  | "campaign-csv";

type FolderArgs = {
  kind: HostAssetKind;
  hostId: string;
  eventId?: string;
};

const sanitiseId = (value?: string) =>
  (value ?? "").replace(/[^a-zA-Z0-9_-]/g, "");

/**
 * Mirror of the backend's `cloudinaryFolder` builder. Keeping the
 * two in sync is the single most important invariant for the
 * delete-on-replace flow: the server-side authorisation gate checks
 * that an asset's public_id starts with `hoizr/{env}/hosts/{hostId}/`.
 */
export const buildHostAssetFolder = ({
  kind,
  hostId,
  eventId,
}: FolderArgs): string => {
  const host = sanitiseId(hostId);
  const event = sanitiseId(eventId);
  const root = `hoizr/${ENV_SAFE}/hosts/${host}`;
  switch (kind) {
    case "host-logo":
      return `${root}/logo`;
    case "host-settings":
      return `${root}/settings`;
    case "event-flyer":
      return `${root}/events/${event}/flyer`;
    case "event-horizontal-flyer":
      return `${root}/events/${event}/horizontal-flyer`;
    case "event-sneak-peek":
      return `${root}/events/${event}/sneak-peek`;
    case "event-gallery":
      return `${root}/events/${event}/gallery`;
    case "event-table-layout":
      return `${root}/events/${event}/table-layout`;
    case "event-instagram":
      return `${root}/events/${event}/instagram`;
    case "event-extra":
      return `${root}/events/${event}/extras`;
    case "campaign-csv":
      return `${root}/campaigns/csv`;
    default:
      return `${root}/misc`;
  }
};

type UploadResult = {
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  duration?: number;
};

type UploadArgs = FolderArgs & {
  file: File | Blob;
  // When the user is REPLACING an existing image, pass its URL so we
  // can destroy the old asset server-side once the new one lands.
  // Skip when this is the first upload (no previous asset to clean).
  previousUrl?: string | null;
  resourceType?: "image" | "video" | "raw";
};

const isSameAsset = (newUrl: string, oldUrl?: string | null) => {
  if (!oldUrl) return false;
  return newUrl === oldUrl;
};

/**
 * Uploads an image to Cloudinary, then (best-effort) deletes the
 * previous asset if `previousUrl` was provided. Old-asset cleanup is
 * intentionally fire-and-tolerate — if the delete fails (network blip,
 * stale auth) the new upload still succeeds and ops can sweep orphans
 * later via the Cloudinary admin. The reverse failure mode (deleting
 * the old asset before the new one is safe) would actively lose data,
 * so we never do that.
 */
export const uploadHostAsset = async ({
  file,
  previousUrl,
  resourceType = "image",
  ...folder
}: UploadArgs): Promise<UploadResult> => {
  const preset = resourceType === "raw" ? RAW_PRESET : IMAGE_PRESET;
  const folderPath = buildHostAssetFolder(folder);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);
  formData.append("folder", folderPath);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${
    resourceType === "raw"
      ? "raw"
      : resourceType === "video"
        ? "video"
        : "image"
  }/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = "";
    try {
      const payload = await response.json();
      detail = payload?.error?.message ? `: ${payload.error.message}` : "";
    } catch {
      // ignore body parse failures
    }
    throw new Error(`Cloudinary upload failed (${response.status})${detail}`);
  }

  const json = (await response.json()) as {
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
    duration?: number;
  };

  // Best-effort cleanup of the previous asset. We don't await throwing
  // here because the new upload already succeeded and the user is past
  // the point of seeing an error.
  if (previousUrl && !isSameAsset(json.secure_url, previousUrl)) {
    sdk
      .deleteHostCloudinaryAsset({ assetUrl: previousUrl })
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.warn(
          "Old Cloudinary asset cleanup failed",
          previousUrl,
          error
        );
      });
  }

  return {
    secureUrl: json.secure_url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
    duration: json.duration,
  };
};
