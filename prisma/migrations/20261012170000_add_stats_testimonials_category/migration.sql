-- AlterTable HomepageContent
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "heroShow3D" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "testimonialsVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'AI Systems';
CREATE INDEX IF NOT EXISTS "Project_category_idx" ON "Project"("category");

-- CreateTable key_stats
CREATE TABLE IF NOT EXISTS "key_stats" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_stats_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "key_stats_order_idx" ON "key_stats"("order");
CREATE INDEX IF NOT EXISTS "key_stats_visible_idx" ON "key_stats"("visible");

-- CreateTable testimonials
CREATE TABLE IF NOT EXISTS "testimonials" (
    "id" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "testimonials_order_idx" ON "testimonials"("order");
CREATE INDEX IF NOT EXISTS "testimonials_visible_idx" ON "testimonials"("visible");
