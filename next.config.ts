import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "connect-src 'self' https:",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      { source: "/control", destination: "/admin/login" },
      { source: "/control/orders", destination: "/admin/orders" },
      { source: "/control/quotations", destination: "/admin/quotations" },
      { source: "/control/customers", destination: "/admin/customers" },
      { source: "/control/products", destination: "/admin/products" },
      { source: "/control/settings", destination: "/admin/settings" },
    ];
  },
};

export default nextConfig;
