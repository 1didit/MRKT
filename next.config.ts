import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Optimized images keep a long cache so back/forward navigation is instant.
  images: { minimumCacheTTL: 31536000 },
  async headers() {
    const immutable = {
      key: "Cache-Control",
      value: "public, max-age=31536000, immutable",
    };
    return [
      // DEV/preview: block indexing at the header level (belt-and-suspenders with robots.ts).
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Hashed media filenames never change → cache forever (no revalidation).
      { source: "/assets/:path*", headers: [immutable] },
      { source: "/uploads/:path*", headers: [immutable] },
    ];
  },
};

export default withNextIntl(nextConfig);
