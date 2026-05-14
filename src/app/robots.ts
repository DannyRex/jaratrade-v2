import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://jaratrade.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/categories", "/sellers", "/about", "/faq", "/services"],
        disallow: ["/admin/", "/exporter/", "/importer/", "/auth/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
