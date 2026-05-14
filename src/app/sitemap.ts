import type { MetadataRoute } from "next";

const BASE = "https://jaratrade.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/auth/register/importer`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE}/auth/register/exporter`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
  ];
}
