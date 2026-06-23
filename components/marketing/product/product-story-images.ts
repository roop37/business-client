export const PRODUCT_STORY_IMAGES: Record<string, string> = {
  "event-discovery": "/marketing/product/EventMarketplaceInsta.png",
  "event-ticketing": "/marketing/product/eventListingnew.png",
  "offline-ticketing": "/marketing/brand/hoizr-product-growth-control.png",
  "audience-management": "/marketing/brand/light-fan-network.png",
  "marketing-campaigns": "/marketing/product/Owned-channel-outreach-campaign.png",
  "guestlists-collaboration":
    "/images/hero/%20Guestlist-Management-home-Run-your-events.png",
  "door-scanning": "/images/hero/Door-Scanning-hero-run-your-event.png",
  "reports-settlements": "/marketing/brand/hoizr-product-operations-door.png",
};

export const getProductStoryImageSrc = (slug: string) =>
  PRODUCT_STORY_IMAGES[slug] ?? null;
