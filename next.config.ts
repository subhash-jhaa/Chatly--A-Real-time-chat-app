import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from Clerk's CDN for the Next.js <Image> component.
  // Without this, Next.js would block external image URLs for security reasons.
  // Clerk hosts user profile photos on img.clerk.com.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
