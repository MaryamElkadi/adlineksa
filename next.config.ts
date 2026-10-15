// next.config.ts – add allowedDevOrigins for dev server
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow remote development hosts (e.g., your LAN IP)
  allowedDevOrigins: ["192.168.1.7"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "media.istockphoto.com" },
    ],
    localPatterns: [
      { pathname: "/**" },
      { pathname: "/api/homepage-image/**", search: "?:v=*" },
    ],
    qualities: [72, 75],
  },
};

export default nextConfig;
