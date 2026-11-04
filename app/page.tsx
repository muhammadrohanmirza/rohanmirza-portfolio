import React from "react";
import {
  getPublicProfile,
  getPublicHomepageContent,
  getPublicSkills,
  getPublicProjects,
  getPublicServices,
  getPublicEducation,
  getPublicCertifications,
  getPublicSocialLinks,
  getPublicSiteSettings,
  getPublicThemeSettings,
} from "@/lib/queries/public.queries";
import { ContactModalProvider } from "@/components/public/ContactModalContext";
import { Navbar } from "@/components/public/Navbar";
import { HeroSection } from "@/components/public/HeroSection";
import { AboutSection } from "@/components/public/AboutSection";
import { ProjectsSection } from "@/components/public/ProjectsSection";
import { ServicesEducationSection } from "@/components/public/ServicesEducationSection";
import { Footer } from "@/components/public/Footer";
import { ContactPopup } from "@/components/public/ContactPopup";

export const instant = false;

export default async function HomePage() {
  let profile: Awaited<ReturnType<typeof getPublicProfile>> = null;
  let homepageContent: Awaited<ReturnType<typeof getPublicHomepageContent>> = null;
  let skills: Awaited<ReturnType<typeof getPublicSkills>> = [];
  let projects: Awaited<ReturnType<typeof getPublicProjects>> = [];
  let services: Awaited<ReturnType<typeof getPublicServices>> = [];
  let education: Awaited<ReturnType<typeof getPublicEducation>> = [];
  let certifications: Awaited<ReturnType<typeof getPublicCertifications>> = [];
  let socialLinks: Awaited<ReturnType<typeof getPublicSocialLinks>> = [];
  let siteSettings: Awaited<ReturnType<typeof getPublicSiteSettings>> = null;
  let themeSettings: Awaited<ReturnType<typeof getPublicThemeSettings>> = null;

  try {
    const results = await Promise.allSettled([
      getPublicProfile(),
      getPublicHomepageContent(),
      getPublicSkills(),
      getPublicProjects(),
      getPublicServices(),
      getPublicEducation(),
      getPublicCertifications(),
      getPublicSocialLinks(),
      getPublicSiteSettings(),
      getPublicThemeSettings(),
    ]);

    profile = results[0].status === "fulfilled" ? results[0].value : null;
    homepageContent = results[1].status === "fulfilled" ? results[1].value : null;
    skills = results[2].status === "fulfilled" ? results[2].value : [];
    projects = results[3].status === "fulfilled" ? results[3].value : [];
    services = results[4].status === "fulfilled" ? results[4].value : [];
    education = results[5].status === "fulfilled" ? results[5].value : [];
    certifications = results[6].status === "fulfilled" ? results[6].value : [];
    socialLinks = results[7].status === "fulfilled" ? results[7].value : [];
    siteSettings = results[8].status === "fulfilled" ? results[8].value : null;
    themeSettings = results[9].status === "fulfilled" ? results[9].value : null;
  } catch (err) {
    console.warn("Database read notice:", err);
  }

  return (
    <ContactModalProvider>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-white transition-colors duration-200">
        {/* Sticky Frosted Navbar */}
        <Navbar
          homepageContent={homepageContent}
          siteSettings={siteSettings}
          hasProjects={projects.length > 0}
          hasServices={services.length > 0}
          hasTimeline={education.length > 0 || certifications.length > 0}
        />

        <main>
          {/* Hero Section */}
          {(homepageContent?.heroVisible ?? true) && (
            <HeroSection
              content={homepageContent}
              profile={profile}
              socialLinks={socialLinks}
            />
          )}

          {/* About & Tech Stack Section */}
          {(homepageContent?.aboutVisible ?? true) && (
            <AboutSection
              profile={profile}
              homepageContent={homepageContent}
              skillsCategories={skills}
            />
          )}

          {/* Featured Projects Section */}
          {(homepageContent?.projectsVisible ?? true) && (
            <ProjectsSection
              projects={projects}
              eyebrow={homepageContent?.projectsEyebrow}
              title={homepageContent?.projectsTitle}
              viewAllText={homepageContent?.projectsViewAllText}
            />
          )}

          {/* Services, Education Timeline & "Let's Work Together" Row */}
          <ServicesEducationSection
            services={services}
            education={education}
            certifications={certifications}
            homepageContent={homepageContent}
            siteSettings={siteSettings}
            profile={profile}
          />
        </main>

        {/* Footer */}
        <Footer
          siteSettings={siteSettings}
          socialLinks={socialLinks}
          profileTitle={profile?.title}
        />

        {/* Global Contact Popup Modal */}
        <ContactPopup
          title={homepageContent?.contactPopupTitle}
          subtitle={homepageContent?.contactPopupSubtitle}
          successMessage={homepageContent?.contactPopupSuccessMessage}
        />
      </div>
    </ContactModalProvider>
  );
}
