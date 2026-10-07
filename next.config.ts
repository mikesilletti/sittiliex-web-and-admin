import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Image uploads go through the uploadMedia Server Action, which caps
      // files at 5MB — the default 1MB body limit rejected real photos
      // before that check could run. 6mb leaves room for multipart overhead.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // 75 is the default for every image; 90 is used for the full-screen hero
    // and the large founder portraits, where 75 visibly softens them.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qomizjeefzyrfmwnxhgz.supabase.co",
        pathname: "/storage/v1/object/public/site-media/**",
      },
    ],
  },
};

export default nextConfig;
