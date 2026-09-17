import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Tauri — no Node.js server at runtime
  output: 'export',

  // Disable server-side image optimization (incompatible with static export)
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for Tauri file:// protocol compatibility
  trailingSlash: true,
};

export default nextConfig;
