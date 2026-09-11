import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove the default "Powered by Next.js" header.
  poweredByHeader: false,

  // Allow optimized images (next/image) from the WordPress media library
  // and the Unsplash CDN once you swap placeholder images for real ones.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cms.codexmattrix.com" },
      { protocol: "https", hostname: "**.codexmattrix.com" },
      { protocol: "https", hostname: "**.wp.com" },
    ],
  },

  // Standards-compliant, cache-friendly headers are configured in vercel.json.
};

export default nextConfig;
