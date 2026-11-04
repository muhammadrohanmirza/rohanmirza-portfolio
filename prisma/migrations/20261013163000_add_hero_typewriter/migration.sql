-- Migration: 20261013163000_add_hero_typewriter
-- Description: Adds hero typewriter fields to HomepageContent

-- AlterTable HomepageContent
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "heroEnableTypewriter" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "heroTypewriterPhrases" TEXT[] DEFAULT ARRAY['Full Stack Developer & AI Engineer']::TEXT[];
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "heroTypewriterSpeed" TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE "HomepageContent" ADD COLUMN IF NOT EXISTS "heroTypewriterLoop" BOOLEAN NOT NULL DEFAULT true;
