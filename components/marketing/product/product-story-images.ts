export const PRODUCT_STORY_IMAGES: Record<string, string> = {
  "event-marketplace": "/marketing/product/EventMarketplaceInsta.png",
  "event-seo": "/marketing/product/AISEOnewinsta.png",
  "organisation-page": "/marketing/product/organisationpagenew.png",
  "reviews-engine": "/marketing/product/event-review-platform.png",
  "listings-management": "/marketing/product/ listingsmanagementnew.png",
  "event-listing": "/marketing/product/eventListingnew.png",
  "smart-upsells": "/marketing/product/Add-onsnew.png",
  "find-best-promoters": "/marketing/product/Promoternew.png",
  "find-trending-artists": "/marketing/product/TrendingArtistsnew.png",
  "marketing-campaigns": "/images/hero/Marketing-Campaigns-home-Grow-repeat-fans.png",
  "email-sms-marketing": "/images/hero/Email-SMS-Marketing-home-Grow-repeat-fans.png",
  "push-notifications": "/images/hero/Push-Notifications-Home-Grow-repeat-fans.png",
  "conversation-marketing": "/images/hero/Conversation-Marketing-home-Grow-repeat-fans.png",
  "loyalty-rewards": "/images/hero/Loyalty-Rewards-home-Grow-repeat-fans.png",
  "reporting-analytics": "/images/hero/Reporting-Analytics-Home-run-your-events.png",
  "door-scanning": "/images/hero/Door-Scanning-hero-run-your-event.png",
  automations: "/images/hero/Automations-home-Run-your-events.png",
  "ai-event-assistant": "/images/hero/AI-Event-Assistant-home-Run-your-events.png",
  // The new AI/intelligence pages reuse the AI Event Assistant 4:5
  // hero (claude × hoizr) until dedicated artwork ships.
  "ai-marketing-intelligence": "/images/hero/AI-Event-Assistant-home-Run-your-events.png",
  "competitive-analysis": "/images/hero/AI-Event-Assistant-home-Run-your-events.png",
  "guestlist-management": "/images/hero/%20Guestlist-Management-home-Run-your-events.png",
};

export const getProductStoryImageSrc = (slug: string) =>
  PRODUCT_STORY_IMAGES[slug] ?? null;
