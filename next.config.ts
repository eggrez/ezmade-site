import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/project-images/:path*", headers: [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ] }];
  },
  images: {
    deviceSizes: [640, 1280, 2200],
    qualities: [95, 100],
  },
};

export default nextConfig;
