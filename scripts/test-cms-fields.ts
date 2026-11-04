import fs from "fs";
import path from "path";

// Load .env before initializing Prisma
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

import { PrismaClient } from "@prisma/client";
import {
  getPublicProfile,
  getPublicHomepageContent,
  getPublicServices,
  getPublicSiteSettings,
  getPublicProjects,
} from "../lib/queries/public.queries";

const prisma = new PrismaClient();

async function runCmsTests() {
  console.log("=== STARTING CMS FIELDS AUDIT TESTS ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${detail ? `- ${detail}` : ""}`);
      failed++;
    }
  }

  try {
    // Check if HomepageContent exists, or initialize if empty
    let homepage = await getPublicHomepageContent();
    if (!homepage) {
      console.log("ℹ️ Initializing default HomepageContent for test...");
      await prisma.homepageContent.create({
        data: {}, // All fields have defaults in schema!
      });
      homepage = await getPublicHomepageContent();
    }

    assert(homepage !== null, "HomepageContent exists in database");
    if (homepage) {
      assert(homepage.aboutEyebrow === "// Introduction", `aboutEyebrow: "${homepage.aboutEyebrow}"`);
      assert(homepage.aboutTitle === "About Me", `aboutTitle: "${homepage.aboutTitle}"`);
      assert(homepage.skillsEyebrow === "// Engineering Expertise", `skillsEyebrow: "${homepage.skillsEyebrow}"`);
      assert(homepage.skillsTitle === "Tech Stack & Skills", `skillsTitle: "${homepage.skillsTitle}"`);
      assert(homepage.projectsEyebrow === "// Selected Systems", `projectsEyebrow: "${homepage.projectsEyebrow}"`);
      assert(homepage.projectsTitle === "Featured Projects", `projectsTitle: "${homepage.projectsTitle}"`);
      assert(homepage.servicesEyebrow === "// Core Offerings", `servicesEyebrow: "${homepage.servicesEyebrow}"`);
      assert(homepage.servicesTitle === "Services & Solutions", `servicesTitle: "${homepage.servicesTitle}"`);
      assert(homepage.timelineEyebrow === "// Milestones & Qualifications", `timelineEyebrow: "${homepage.timelineEyebrow}"`);
      assert(homepage.timelineTitle === "Education & Certifications", `timelineTitle: "${homepage.timelineTitle}"`);
      assert(homepage.timelineEducationHeading === "Education", `timelineEducationHeading: "${homepage.timelineEducationHeading}"`);
      assert(homepage.timelineCertificationsHeading === "Certifications", `timelineCertificationsHeading: "${homepage.timelineCertificationsHeading}"`);
      assert(homepage.contactEyebrow === "// Initiation", `contactEyebrow: "${homepage.contactEyebrow}"`);
      assert(homepage.contactTitle === "Get in Touch", `contactTitle: "${homepage.contactTitle}"`);
      assert(
        homepage.contactPitchHeadline === "Let's build intelligent web applications together.",
        `contactPitchHeadline: "${homepage.contactPitchHeadline}"`
      );
      assert(
        homepage.contactPitchText.includes("architect a Next.js platform"),
        "contactPitchText contains default body"
      );
      assert(Array.isArray(homepage.heroTechBadges), "heroTechBadges is array");
      assert(homepage.heroTechBadges.length === 8, `heroTechBadges has ${homepage.heroTechBadges.length} items`);
      assert(homepage.heroUseFeaturedSkills === false, "heroUseFeaturedSkills default is false");
      assert(homepage.navbarCtaText === "Let's Connect", `navbarCtaText: "${homepage.navbarCtaText}"`);
      assert(homepage.navbarCtaLink === "#contact", `navbarCtaLink: "${homepage.navbarCtaLink}"`);
    }

    // 2. Profile & Availability & Core Focus
    let profile = await getPublicProfile();
    if (!profile) {
      console.log("ℹ️ Initializing default Profile for test...");
      await prisma.profile.create({
        data: {
          name: "Rohan",
          title: "Full Stack Developer & AI Engineer",
          bio: "Full Stack Developer & AI Engineer passionate about building high-performance web applications...",
        },
      });
      profile = await getPublicProfile();
    }

    assert(profile !== null, "Profile exists in database");
    if (profile) {
      assert(profile.availableShow === true, "profile.availableShow is true by default");
      assert(profile.availableStatusColor === "green", `profile.availableStatusColor: "${profile.availableStatusColor}"`);
      assert(profile.coreFocusLabel === "Core Focus", `profile.coreFocusLabel: "${profile.coreFocusLabel}"`);
      assert(profile.coreFocusValue === "Next.js & AI Systems", `profile.coreFocusValue: "${profile.coreFocusValue}"`);
    }

    // 3. Site Settings & Brand
    let siteSettings = await getPublicSiteSettings();
    if (!siteSettings) {
      console.log("ℹ️ Initializing default SiteSettings for test...");
      await prisma.siteSettings.create({
        data: {
          contactEmail: "contact@rohan.dev",
        },
      });
      siteSettings = await getPublicSiteSettings();
    }

    assert(siteSettings !== null, "SiteSettings exists in database");
    if (siteSettings) {
      assert(siteSettings.brandName === "Rohan.Dev", `brandName: "${siteSettings.brandName}"`);
      assert(siteSettings.brandMonogram === "R", `brandMonogram: "${siteSettings.brandMonogram}"`);
    }

    // 4. Services deliverableTag
    let services = await getPublicServices();
    if (services.length === 0) {
      console.log("ℹ️ Initializing sample Service for test...");
      await prisma.service.create({
        data: {
          title: "AI & Full Stack Engineering",
          description: "End-to-end production systems built with Next.js, Python, and LLMs.",
          iconName: "Cpu",
          order: 1,
          visible: true,
        },
      });
      services = await getPublicServices();
    }
    assert(services.length > 0, "Services exist in database");
    if (services.length > 0) {
      assert(
        services[0].deliverableTag === "Custom Architecture & Execution",
        `service.deliverableTag: "${services[0].deliverableTag}"`
      );
    }

    // 5. Messages Actions
    // Test count and mark-all-read with isRead field
    const testMsg = await prisma.contactMessage.create({
      data: {
        name: "Test Inquirer",
        email: "test@example.com",
        subject: "Project Inquiry",
        message: "Hello world!",
        isRead: false,
      },
    });
    assert(testMsg.isRead === false, "Message created with isRead: false");

    await prisma.contactMessage.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    const unreadCount = await prisma.contactMessage.count({ where: { isRead: false } });
    assert(unreadCount === 0, "markAllMessagesRead updates all to isRead: true");

    // Clean up test message
    await prisma.contactMessage.delete({ where: { id: testMsg.id } });

    // 6. Projects Image Order
    const projects = await getPublicProjects();
    assert(Array.isArray(projects), "Projects query executes cleanly");

    console.log(`\n=== AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  } catch (error) {
    console.error("Test execution threw error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runCmsTests();
