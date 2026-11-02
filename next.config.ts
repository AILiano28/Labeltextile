import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "back.testwebapp.space",
      },
      {
        protocol: "https",
        hostname: "www.facebook.com",
      },
    ],
    // unoptimized: true,
  },
  experimental: {
    // Embed the CSS in the HTML <head> instead of 5–7 separate render-blocking files: on slow mobile
    // networks they competed with the JavaScript and the hero image (perf plan, 1 Nov 2026).
    inlineCss: true,
  },
};

export default withBundleAnalyzer(nextConfig);
