const nextConfig = {
  // tsc + ESLint gates re-enabled — current source compiles clean and
  // only emits non-blocking lint *warnings* (no errors). Leaving these
  // off again means a real type/lint failure can hide in a PR build.
  // If a future PR introduces a non-fixable warning, prefer a scoped
  // // eslint-disable-next-line over flipping the global gate off.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async redirects() {
    // Product taxonomy was rebuilt 2026-06-24. Old slugs redirect to the
    // closest live product so inbound links and crawlers don't hit 404s.
    // Non-permanent (307/308 off) while the catalogue is still pre-launch.
    const productSlugRedirects = [
      ["event-marketplace", "event-discovery"],
      ["event-seo", "event-discovery"],
      ["event-listing", "event-ticketing"],
      ["reviews-engine", "event-discovery"],
      ["listings-management", "event-discovery"],
      ["find-best-promoters", "guestlist-management"],
      ["find-trending-artists", "artist-vertical"],
      ["marketing-campaigns", "whatsapp-marketing"],
      ["email-sms-marketing", "email-marketing"],
      ["conversation-marketing", "whatsapp-marketing"],
      ["push-notifications", "whatsapp-marketing"],
      ["loyalty-rewards", "coupons"],
      ["ai-marketing-intelligence", "ai-event-assistant"],
      ["competitive-analysis", "reporting-analytics"],
    ].map(([from, to]) => ({
      source: `/product/${from}`,
      destination: `/product/${to}`,
      permanent: false,
    }));

    return [
      {
        source: "/pricing",
        destination: "/about",
        permanent: true,
      },
      {
        // The artist vertical lives on its own subdomain.
        source: "/product/artist-vertical",
        destination: "https://artist.hoizr.com",
        permanent: false,
      },
      ...productSlugRedirects,
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "www.choosepos.com",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cloverstatic.com",
      },
    ],
  },
};

export default nextConfig;
