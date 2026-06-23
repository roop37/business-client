import {
  LEGACY_COMING_SOON_REDIRECTS,
  LEGACY_CURRENT_PRODUCT_REDIRECTS,
} from "./components/marketing/data/legacy-product-routes.mjs";

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
    return [
      {
        source: "/pricing",
        destination: "/about",
        permanent: true,
      },
      ...Object.entries(LEGACY_CURRENT_PRODUCT_REDIRECTS).map(
        ([source, destination]) => ({
          source,
          destination,
          permanent: true,
        })
      ),
      ...LEGACY_COMING_SOON_REDIRECTS.map((source) => ({
        source,
        destination: "/product#coming-soon",
        permanent: true,
      })),
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
