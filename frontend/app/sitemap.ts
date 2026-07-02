import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/chat", "/about", "/architecture", "/evaluation"];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/chat" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
