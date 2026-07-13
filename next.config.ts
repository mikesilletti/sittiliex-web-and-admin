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
