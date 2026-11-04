import prisma from "../prisma";
import { connection } from "next/server";

/**
 * Admin Data Access Queries
 * Live, unfiltered database queries for the Admin CMS.
 * All statistics are calculated directly from PostgreSQL; zero fake numbers.
 */

export async function getAdminOverviewStats() {
  await connection();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    featuredProjects,
    unreadMessages,
    totalMessages,
    totalSkills,
    totalCategories,
    totalServices,
    totalCertifications,
    recentMessages,
    monthlyMessages,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.project.count({ where: { published: false } }),
    prisma.project.count({ where: { featured: true } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.contactMessage.count(),
    prisma.skill.count(),
    prisma.skillCategory.count(),
    prisma.service.count(),
    prisma.certification.count(),
    prisma.contactMessage.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactMessage.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { id: true, createdAt: true },
    }),
  ]);

  return {
    totalProjects,
    publishedProjects,
    draftProjects,
    featuredProjects,
    unreadMessages,
    totalMessages,
    totalSkills,
    totalCategories,
    totalServices,
    totalCertifications,
    recentMessages,
    monthlyMessages,
  };
}

export async function getAdminProjects() {
  return prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getAdminProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getAdminSkillsWithCategories() {
  return prisma.skillCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      skills: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getAdminServices() {
  return prisma.service.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getAdminEducation() {
  return prisma.education.findMany({
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });
}

export async function getAdminCertifications() {
  return prisma.certification.findMany({
    orderBy: [{ order: "asc" }, { issueDate: "desc" }],
  });
}

export async function getAdminMessages() {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminProfile() {
  return prisma.profile.findFirst();
}

export async function getAdminSettings() {
  return prisma.siteSettings.findFirst();
}

export async function getAdminTheme() {
  return prisma.themeSettings.findFirst();
}

export async function getAdminSeo() {
  return prisma.seoSettings.findFirst();
}

export async function getAdminHomepage() {
  return prisma.homepageContent.findFirst();
}

export async function getAdminSocialLinks() {
  return prisma.socialLink.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getAdminStats() {
  return prisma.keyStat.findMany({
    orderBy: { order: "asc" },
  });
}

