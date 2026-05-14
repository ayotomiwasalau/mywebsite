import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Enable static export
  distDir: 'out', // Optional: Custom output directory
  images: {
    unoptimized: true, // <--- Disable built-in image optimization
  }
};

export default nextConfig;
