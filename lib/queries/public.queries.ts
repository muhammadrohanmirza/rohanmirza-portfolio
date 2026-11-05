import prisma from "../prisma";

/**
 * Public Data Access Queries
 * All queries enforce `published: true` / `visible: true` filters.
 * Sensitive or draft records are never exposed to public consumers.
 */

export async function getPublicProfile() {
  return prisma.profile.findFirst({
    select: {
      name: true,
      title: true,
      bio: true,
      avatarUrl: true,
      aboutImageUrl: true,
      aboutHeading: true,
      resumeUrl: true,
      yearsOfExp: true,
      location: true,
      availableShow: true,
      availableFor: true,
      availableStatusColor: true,
      coreFocusLabel: true,
      coreFocusValue: true,
    },
  });
}

export async function getPublicHomepageContent() {
  return prisma.homepageContent.findFirst({
    select: {
      heroGreeting: true,
      heroName: true,
      heroNamePrefix: true,
      heroNameHighlight: true,
      heroHeading: true,
      heroSubheading: true,
      heroTagline: true,
      heroParagraph: true,
      primaryCtaText: true,
      primaryCtaLink: true,
      secondaryCtaText: true,
      secondaryCtaLink: true,
      heroTechBadges: true,
      heroUseFeaturedSkills: true,
      heroEnableTypewriter: true,
      heroTypewriterPhrases: true,
      heroTypewriterSpeed: true,
      heroTypewriterLoop: true,
      heroTypewriterName: true,
      heroShowTaglineWords: true,
      heroTaglineWords: true,
      heroImageUrl: true,
      navbarCtaText: true,
      navbarCtaLink: true,
      aboutEyebrow: true,
      aboutTitle: true,
      skillsEyebrow: true,
      skillsTitle: true,
      projectsEyebrow: true,
      projectsTitle: true,
      projectsViewAllText: true,
      servicesEyebrow: true,
      servicesTitle: true,
      servicesIntro: true,
      educationEyebrow: true,
      educationTitle: true,
      timelineEyebrow: true,
      timelineTitle: true,
      educationIntro: true,
      educationQuickContactTitle: true,
      educationQuickContactText: true,
      timelineEducationHeading: true,
      timelineCertificationsHeading: true,
      contactEyebrow: true,
      contactTitle: true,
      contactPitchHeadline: true,
      contactPitchText: true,
      letWorkTogetherTitle: true,
      letWorkTogetherText: true,
      letWorkTogetherCtaText: true,
      contactPopupTitle: true,
      contactPopupSubtitle: true,
      contactPopupSuccessMessage: true,
      heroVisible: true,
      heroShow3D: true,
      aboutVisible: true,
      skillsVisible: true,
      projectsVisible: true,
      servicesVisible: true,
      timelineVisible: true,
      contactVisible: true,
    },
  });
}

export async function getPublicSkills() {
  return prisma.skillCategory.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    include: {
      skills: {
        where: { visible: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          iconName: true,
          proficiency: true,
          proficiencyLevel: true,
          yearsOfExp: true,
          description: true,
          featured: true,
        },
      },
    },
  });
}

export type PublicSkills = Awaited<ReturnType<typeof getPublicSkills>>;
export type PublicSkillCategory = PublicSkills[number];

export async function getPublicProjects() {
  return prisma.project.findMany({
    where: { published: true },
    orderBy: [
      { featured: "desc" },
      { featuredOrder: "asc" },
      { order: "asc" },
      { createdAt: "desc" },
    ],
    include: {
      images: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          url: true,
          altText: true,
        },
      },
    },
  });
}

export async function getPublicProjectBySlug(slug: string, includeDrafts: boolean = false) {
  return prisma.project.findFirst({
    where: {
      slug,
      ...(includeDrafts ? {} : { published: true }),
    },
    include: {
      images: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          url: true,
          altText: true,
        },
      },
    },
  });
}

export async function getPublicServices() {
  return prisma.service.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      iconName: true,
      deliverableTag: true,
    },
  });
}

export async function getPublicEducation() {
  return prisma.education.findMany({
    where: { visible: true },
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });
}

export async function getPublicCertifications() {
  return prisma.certification.findMany({
    where: { visible: true },
    orderBy: [{ order: "asc" }, { issueDate: "desc" }],
  });
}

export async function getPublicSocialLinks() {
  return prisma.socialLink.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      platform: true,
      url: true,
      iconName: true,
    },
  });
}

export async function getPublicSiteSettings() {
  return prisma.siteSettings.findFirst({
    select: {
      brandName: true,
      brandMonogram: true,
      contactEmail: true,
      contactPhone: true,
      footerText: true,
      copyrightNotice: true,
    },
  });
}

export async function getPublicThemeSettings() {
  return prisma.themeSettings.findFirst({
    select: {
      defaultMode: true,
      accentColor: true,
      enableGradients: true,
      updatedAt: true,
    },
  });
}

export async function getPublicSeoSettings() {
  return prisma.seoSettings.findFirst({
    select: {
      siteTitle: true,
      metaDescription: true,
      keywords: true,
      ogImageUrl: true,
      faviconUrl: true,
      twitterHandle: true,
    },
  });
}

export async function getPublicStats() {
  return prisma.keyStat.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      label: true,
      value: true,
    },
  });
}

