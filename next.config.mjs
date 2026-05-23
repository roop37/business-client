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
