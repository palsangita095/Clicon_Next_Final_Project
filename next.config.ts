import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    dangerouslyAllowLocalIP: true,
    imageSizes: [16, 32, 40, 48, 55, 64, 70, 80, 96, 120, 128, 160, 240, 256, 288, 384, 600],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;