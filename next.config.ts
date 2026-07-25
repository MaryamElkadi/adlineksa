// next.config.ts – add allowedDevOrigins for dev server
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow remote development hosts (e.g., your LAN IP)
  allowedDevOrigins: ["192.168.1.7"],
  // You can add other Next.js options here
};

export default nextConfig;
