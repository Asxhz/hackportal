import type { NextConfig } from "next";

/**
 * Static security headers. The Content-Security-Policy is set per-request in
 * `src/proxy.ts` because it carries a fresh nonce; everything else lives here.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    // Enables forbidden()/unauthorized() + the forbidden.tsx convention.
    authInterrupts: true,
    serverActions: {
      // Server Actions already reject cross-origin POSTs; keep the body small so
      // nobody can use an action as a data sink.
      bodySizeLimit: "256kb",
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
