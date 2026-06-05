import type { MetadataRoute } from "next";

// DEV/preview deployment — keep it out of search engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
