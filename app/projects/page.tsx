import React from "react";
import type { Metadata } from "next";
import {
  getPublicProjects,
  getPublicSiteSettings,
  getPublicHomepageContent,
  getPublicSkills,
  getPublicServices,
  getPublicEducation,
  getPublicCertifications,
} from "@/lib/queries/public.queries";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ProjectsClient } from "./ProjectsClient";

import { ContactModalProvider } from "@/components/public/ContactModalContext";
import { ContactPopup } from "@/components/public/ContactPopup";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getPublicSiteSettings().catch(() => null);
  const brandName = siteSettings?.brandName || "Rohan.Dev";

  return {
    title: `All Projects | ${brandName}`,
    description: "Explore all published full-stack, web, and AI engineering projects.",
    openGraph: {
      title: `All Projects | ${brandName}`,
      description: "Explore all published full-stack, web, and AI engineering projects.",
      type: "website",
    },
  };
}

export default async function AllProjectsPage() {
  const [
    projects,
    siteSettings,
    homepageContent,
    skills,
    services,
    education,
    certifications,
  ] = await Promise.all([
    getPublicProjects(),
    getPublicSiteSettings().catch(() => null),
    getPublicHomepageContent().catch(() => null),
    getPublicSkills().catch(() => []),
    getPublicServices().catch(() => []),
    getPublicEducation().catch(() => []),
    getPublicCertifications().catch(() => []),
  ]);

  return (
    <ContactModalProvider>
      <div className="min-h-screen bg-black bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between selection:bg-[var(--accent)] selection:text-white">
        <Navbar
          homepageContent={homepageContent}
          siteSettings={siteSettings}
          hasProjects={projects.length > 0}
          hasServices={services.length > 0}
          hasTimeline={education.length > 0 || certifications.length > 0}
        />

        <main className="flex-1">
          <ProjectsClient initialProjects={projects} />
        </main>

        <Footer siteSettings={siteSettings} />

        <ContactPopup
          title={homepageContent?.contactPopupTitle}
          subtitle={homepageContent?.contactPopupSubtitle}
          successMessage={homepageContent?.contactPopupSuccessMessage}
        />
      </div>
    </ContactModalProvider>
  );
}
