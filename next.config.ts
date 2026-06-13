import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Optimized images keep a long cache so back/forward navigation is instant.
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.tildacdn.com" },
      { protocol: "https", hostname: "static.tildacdn.com" },
    ],
  },
  async headers() {
    const immutable = {
      key: "Cache-Control",
      value: "public, max-age=31536000, immutable",
    };
    const isProd = process.env.NODE_ENV === "production";
    // Indexing stays OFF everywhere until the real launch flips ALLOW_INDEXING=true.
    const allowIndex = process.env.ALLOW_INDEXING === "true";
    const securityHeaders = [
      // Block indexing on dev/preview (belt-and-suspenders with robots.ts).
      ...(allowIndex
        ? []
        : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
      // Anti-clickjacking (legacy + modern). The app is never framed.
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      // Block MIME-sniffing and limit referrer leakage.
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // We don't use these powerful features anywhere.
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
      // HSTS only in production builds — never on localhost (would force https://localhost).
      ...(isProd
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains",
            },
          ]
        : []),
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      // Hashed media filenames never change → cache forever (no revalidation).
      { source: "/assets/:path*", headers: [immutable] },
      { source: "/uploads/:path*", headers: [immutable] },
    ];
  },
};

export default withNextIntl(nextConfig);
