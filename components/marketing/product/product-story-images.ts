/**
 * Per-product image. One clean slug-based file per product:
 *   /marketing/product/<slug>.png  —  9:16 portrait (1080×1920 recommended).
 * To update a product's image, just replace the matching <slug>.png file.
 * A missing entry returns null and the UI falls back to a brand panel.
 */
const PRODUCT_SLUGS = [
  // Sell tickets
  "event-ticketing",
  "offline-ticketing",
  "free-rsvp-events",
  "smart-upsells",
  "coupons",
  // Own your audience
  "fan-crm",
  "organisation-page",
  "event-discovery",
  // Grow repeat fans
  "email-marketing",
  "whatsapp-marketing",
  "automations",
  // Run the night
  "guestlist-management",
  "door-scanning",
  "teams-permissions",
  // Get paid & decide
  "reporting-analytics",
  "orders-refunds",
  "payouts-settlements",
  "ai-event-assistant",
  // For artists
  "artist-vertical",
] as const;

export const PRODUCT_STORY_IMAGES: Record<string, string> = Object.fromEntries(
  PRODUCT_SLUGS.map((slug) => [slug, `/marketing/product/${slug}.png`])
);

export const getProductStoryImageSrc = (slug: string) =>
  PRODUCT_STORY_IMAGES[slug] ?? null;
