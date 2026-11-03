import type { MetadataRoute } from "next";
import { pageMeta } from "@/content/pages";
import { siteUrl } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", ...Object.keys(pageMeta)].map((slug) => ({
    url: `${siteUrl}/${slug ? slug + "/" : ""}`,
    changeFrequency: "monthly",
    priority: slug ? 0.7 : 1,
  }));
}
