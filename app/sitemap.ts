import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rohan.dev";

  let projectUrls: MetadataRoute.Sitemap = [];

  try {
    const publishedProjects = await prisma.project.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    projectUrls = publishedProjects.map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    // Graceful fallback if database is not reachable at build time
    projectUrls = [];
  }

  // Strictly exclude /admin and /login routes from sitemap
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...projectUrls,
  ];
}
