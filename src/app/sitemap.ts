import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL?.trim() || "http://localhost:3000";
  return ["/", "/products", "/enquire", "/contact"].map((path) => ({
    url: new URL(path, base).toString(),
    lastModified: new Date(),
  }));
}
