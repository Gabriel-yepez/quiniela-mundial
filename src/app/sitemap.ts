import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mundial-2026.vercel.app";

  const matches = await prisma.match.findMany({
    select: { id: true, dateTime: true },
    orderBy: { matchNumber: "asc" },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/matches`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/rules`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const matchPages: MetadataRoute.Sitemap = matches.map((match) => ({
    url: `${siteUrl}/matches/${match.id}`,
    lastModified: match.dateTime,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...matchPages];
}
