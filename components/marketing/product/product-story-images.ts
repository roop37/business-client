/**
 * Per-product story image (reuses existing art in /public/marketing and
 * /public/images). Slugs that have no good existing image return null —
 * the gallery and product pages fall back to a brand panel, so a missing
 * entry never breaks a page. Filenames with stray spaces are intentional
 * (that's how the assets are named on disk).
 */
export const PRODUCT_STORY_IMAGES: Record<string, string> = {
  // Sell tickets
  "event-ticketing": "/marketing/product/eventListingnew.png",
  "free-rsvp-events": "/marketing/product/EventMarketplaceInsta.png",
  "smart-upsells": "/marketing/product/Add-onsnew.png",
  "offline-ticketing": "/marketing/product/Door-staff-QR.png",
  // Own your audience
  "fan-crm": "/marketing/product/Owned-channel-outreach-campaign.png",
  "organisation-page": "/marketing/product/organisationpagenew.png",
  "event-discovery": "/marketing/product/AISEOnewinsta.png",
  // Grow repeat fans
  "email-marketing": "/images/hero/Email-SMS-Marketing-home-Grow-repeat-fans.png",
  "whatsapp-marketing": "/marketing/product/Conversation-marketing-UI.png",
  automations: "/marketing/product/Futuristic-automation-UI-design-new  .png",
  // Run the night
  "guestlist-management": "/marketing/product/Guestlist-management-UI.png",
  "door-scanning": "/images/hero/Door-Scanning-hero-run-your-event.png",
  // Get paid & decide
  "reporting-analytics": "/marketing/product/Futuristic-analytics-dashboard.png",
  "ai-event-assistant": "/marketing/product/AI-event-assistant-UI-new .png",
  // For artists
  "artist-vertical": "/marketing/product/TrendingArtistsnew.png",
};

export const getProductStoryImageSrc = (slug: string) =>
  PRODUCT_STORY_IMAGES[slug] ?? null;
