-- Migration: 20261012162200_add_cms_content_fields
-- Description: Adds CMS editable content fields for Section Headings, Hero Tech Badges, Availability, Brand, Core Focus, and Deliverable Tag

-- AlterTable Profile
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "availableShow" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "availableStatusColor" TEXT NOT NULL DEFAULT 'green';
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "coreFocusLabel" TEXT DEFAULT 'Core Focus';
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "coreFocusValue" TEXT DEFAULT 'Next.js & AI Systems';

-- AlterTable SiteSettings
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "brandName" TEXT NOT NULL DEFAULT 'Rohan.Dev';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "brandMonogram" TEXT NOT NULL DEFAULT 'R';

-- AlterTable HomepageContent
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "heroTechBadges" TEXT[] DEFAULT ARRAY['Next.js 16', 'React 19', 'TypeScript', 'Python', 'FastAPI', 'OpenAI / LLMs', 'MCP', 'PostgreSQL']::TEXT[];
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "heroUseFeaturedSkills" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "navbarCtaText" TEXT NOT NULL DEFAULT 'Let''s Connect';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "navbarCtaLink" TEXT NOT NULL DEFAULT '#contact';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "aboutEyebrow" TEXT NOT NULL DEFAULT '// Introduction';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "aboutTitle" TEXT NOT NULL DEFAULT 'About Me';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "skillsEyebrow" TEXT NOT NULL DEFAULT '// Engineering Expertise';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "skillsTitle" TEXT NOT NULL DEFAULT 'Tech Stack & Skills';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "projectsEyebrow" TEXT NOT NULL DEFAULT '// Selected Systems';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "projectsTitle" TEXT NOT NULL DEFAULT 'Featured Projects';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "servicesEyebrow" TEXT NOT NULL DEFAULT '// Core Offerings';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "servicesTitle" TEXT NOT NULL DEFAULT 'Services & Solutions';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "timelineEyebrow" TEXT NOT NULL DEFAULT '// Milestones & Qualifications';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "timelineTitle" TEXT NOT NULL DEFAULT 'Education & Certifications';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "timelineEducationHeading" TEXT NOT NULL DEFAULT 'Education';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "timelineCertificationsHeading" TEXT NOT NULL DEFAULT 'Certifications';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "contactEyebrow" TEXT NOT NULL DEFAULT '// Initiation';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "contactTitle" TEXT NOT NULL DEFAULT 'Get in Touch';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "contactPitchHeadline" TEXT NOT NULL DEFAULT 'Let''s build intelligent web applications together.';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "contactPitchText" TEXT NOT NULL DEFAULT 'Whether you are looking to architect a Next.js platform, integrate LLM/agent pipelines, or build robust backend systems, feel free to reach out.';

-- AlterTable Service
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "deliverableTag" TEXT DEFAULT 'Custom Architecture & Execution';
