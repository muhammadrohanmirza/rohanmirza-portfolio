"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "../prisma";
import { assertAdminSession } from "../auth";
import {
  ProfileSchema,
  SiteSettingsSchema,
  HomepageContentSchema,
  ThemeSettingsSchema,
  SeoSettingsSchema,
  ProfileInput,
  SiteSettingsInput,
  HomepageContentInput,
  ThemeSettingsInput,
  SeoSettingsInput,
} from "../validations/settings.schema";
import { ThemeMode, AccentColor } from "@prisma/client";

export async function updateProfile(data: ProfileInput) {
  await assertAdminSession();
  const validated = ProfileSchema.parse(data);

  const payload = {
    ...validated,
    avatarUrl: validated.avatarUrl?.trim() || null,
    heroImageUrl: validated.heroImageUrl?.trim() || null,
    aboutImageUrl: validated.aboutImageUrl?.trim() || null,
    resumeUrl: validated.resumeUrl?.trim() || null,
  };

  const existing = await prisma.profile.findFirst();
  if (existing) {
    await prisma.profile.update({
      where: { id: existing.id },
      data: payload,
    });
  } else {
    await prisma.profile.create({
      data: payload,
    });
  }

  revalidateTag("portfolio:profile", "max");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/admin/profile");

  return { success: true };
}

export async function updateSiteSettings(data: SiteSettingsInput) {
  await assertAdminSession();
  const validated = SiteSettingsSchema.parse(data);

  const payload = {
    ...validated,
    contactPhone: validated.contactPhone?.trim() || null,
  };

  const existing = await prisma.siteSettings.findFirst();
  if (existing) {
    await prisma.siteSettings.update({
      where: { id: existing.id },
      data: payload,
    });
  } else {
    await prisma.siteSettings.create({
      data: payload,
    });
  }

  revalidateTag("portfolio:settings", "max");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { success: true };
}

export async function updateHomepageContent(data: HomepageContentInput) {
  await assertAdminSession();
  const validated = HomepageContentSchema.parse(data);

  // Sync full name if prefix/highlight are provided
  if (validated.heroNamePrefix || validated.heroNameHighlight) {
    const full = [validated.heroNamePrefix, validated.heroNameHighlight]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (full) {
      validated.heroName = full;
    }
  }

  const existing = await prisma.homepageContent.findFirst();
  if (existing) {
    await prisma.homepageContent.update({
      where: { id: existing.id },
      data: validated,
    });
  } else {
    await prisma.homepageContent.create({
      data: validated,
    });
  }

  // If hero image was set or updated, keep profile.heroImageUrl in sync
  if (validated.heroImageUrl !== undefined) {
    const profile = await prisma.profile.findFirst();
    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { heroImageUrl: validated.heroImageUrl || null },
      });
      revalidateTag("portfolio:profile", "max");
      revalidatePath("/admin/profile");
    }
  }

  revalidateTag("portfolio:homepage", "max");
  revalidateTag("portfolio:profile", "max");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/admin/homepage");

  return { success: true };
}

export async function toggleSectionVisibility(
  sectionKey:
    | "heroVisible"
    | "heroShow3D"
    | "aboutVisible"
    | "skillsVisible"
    | "projectsVisible"
    | "servicesVisible"
    | "timelineVisible"
    | "contactVisible",
  visible: boolean
) {
  await assertAdminSession();

  const existing = await prisma.homepageContent.findFirst();
  if (existing) {
    await prisma.homepageContent.update({
      where: { id: existing.id },
      data: { [sectionKey]: visible },
    });
  }

  revalidateTag("portfolio:homepage", "max");
  revalidatePath("/");
  revalidatePath("/admin/homepage");

  return { success: true };
}

export async function updateThemeSettings(data: ThemeSettingsInput) {
  await assertAdminSession();
  const validated = ThemeSettingsSchema.parse(data);

  const existing = await prisma.themeSettings.findFirst();
  if (existing) {
    await prisma.themeSettings.update({
      where: { id: existing.id },
      data: {
        defaultMode: validated.defaultMode as ThemeMode,
        accentColor: validated.accentColor as AccentColor,
        enableGradients: validated.enableGradients,
      },
    });
  } else {
    await prisma.themeSettings.create({
      data: {
        defaultMode: validated.defaultMode as ThemeMode,
        accentColor: validated.accentColor as AccentColor,
        enableGradients: validated.enableGradients,
      },
    });
  }

  revalidateTag("portfolio:theme", "max");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/admin/theme");

  return { success: true };
}

export async function updateSeoSettings(data: SeoSettingsInput) {
  await assertAdminSession();
  const validated = SeoSettingsSchema.parse(data);

  const payload = {
    ...validated,
    ogImageUrl: validated.ogImageUrl?.trim() || null,
    faviconUrl: validated.faviconUrl?.trim() || null,
  };

  const existing = await prisma.seoSettings.findFirst();
  if (existing) {
    await prisma.seoSettings.update({
      where: { id: existing.id },
      data: payload,
    });
  } else {
    await prisma.seoSettings.create({
      data: payload,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");

  return { success: true };
}

export async function saveSocialLinks(
  links: { id?: string; platform: string; url: string; iconName: string; order: number; visible: boolean }[]
) {
  await assertAdminSession();

  await prisma.$transaction([
    prisma.socialLink.deleteMany(),
    prisma.socialLink.createMany({
      data: links.map((link, idx) => ({
        platform: link.platform,
        url: link.url,
        iconName: link.iconName || "ExternalLink",
        order: link.order ?? idx,
        visible: link.visible ?? true,
      })),
    }),
  ]);

  revalidateTag("portfolio:settings", "max");
  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { success: true };
}
