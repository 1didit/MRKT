import type { MetadataRoute } from "next";

// Indexing is blocked until the real launch sets ALLOW_INDEXING=true.
// Until then this is a dev/preview deployment and must stay out of search.
export default function robots(): MetadataRoute.Robots {
  const allowIndex = process.env.ALLOW_INDEXING === "true";
  return {
    rules: allowIndex
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
  };
}
