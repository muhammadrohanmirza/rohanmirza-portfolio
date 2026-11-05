import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const src = 'public/uploads/images/b531235f-d010-4aaf-83c7-bb63745190d6-1791827792983.png';
  const dest = 'public/uploads/images/hero-photo-cutout.png';
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Copied hero image to hero-photo-cutout.png');
  }

  console.log('Legacy profile hero image support is disabled; homepage hero image remains the single source.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
