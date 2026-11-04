-- AlterEnum: Add BLUE to AccentColor
ALTER TYPE "AccentColor" ADD VALUE 'BLUE';

-- AlterTable ThemeSettings
ALTER TABLE "ThemeSettings" ALTER COLUMN "accentColor" SET DEFAULT 'BLUE';

-- AlterTable HomepageContent
ALTER TABLE "HomepageContent" 
  ADD COLUMN IF NOT EXISTS "heroGreeting" TEXT NOT NULL DEFAULT 'Hello, I''m',
  ADD COLUMN IF NOT EXISTS "heroName" TEXT NOT NULL DEFAULT 'Rohan Mirza',
  ADD COLUMN IF NOT EXISTS "heroNameHighlight" TEXT NOT NULL DEFAULT 'Mirza',
  ADD COLUMN IF NOT EXISTS "heroTypewriterName" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "heroTaglineWords" TEXT[] NOT NULL DEFAULT ARRAY['Code', 'Build', 'Innovate']::TEXT[],
  ADD COLUMN IF NOT EXISTS "projectsViewAllText" TEXT NOT NULL DEFAULT 'View All Projects',
  ADD COLUMN IF NOT EXISTS "servicesIntro" TEXT DEFAULT 'I offer modern web development and AI solutions tailored to your needs. From concept to deployment, I help turn your ideas into powerful digital products.',
  ADD COLUMN IF NOT EXISTS "educationEyebrow" TEXT NOT NULL DEFAULT 'EDUCATION',
  ADD COLUMN IF NOT EXISTS "educationTitle" TEXT NOT NULL DEFAULT 'My *Education*',
  ADD COLUMN IF NOT EXISTS "educationIntro" TEXT DEFAULT 'My academic journey and the skills I''ve built along the way.',
  ADD COLUMN IF NOT EXISTS "educationQuickContactTitle" TEXT NOT NULL DEFAULT 'Feel free to contact me',
  ADD COLUMN IF NOT EXISTS "educationQuickContactText" TEXT NOT NULL DEFAULT 'I''m always open to discussing new projects, ideas or opportunities.';

-- Drop testimonialsVisible column from HomepageContent
ALTER TABLE "HomepageContent" DROP COLUMN IF EXISTS "testimonialsVisible";

-- DropTable testimonials
DROP TABLE IF EXISTS "testimonials";
