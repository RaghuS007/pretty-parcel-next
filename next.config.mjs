import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Cloudflare Pages — no standalone Node.js server
  // OpenNext wraps the app for the Workers runtime automatically
};

// Enables Cloudflare bindings (KV, D1 etc.) in `next dev`
initOpenNextCloudflareForDev();

export default nextConfig;
