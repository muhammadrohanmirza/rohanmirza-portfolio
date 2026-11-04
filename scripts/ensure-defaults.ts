import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const hp = await prisma.homepageContent.findFirst();
  if (hp) {
    await prisma.homepageContent.update({
      where: { id: hp.id },
      data: {
        heroShow3D: false,
        letWorkTogetherTitle: hp.letWorkTogetherTitle || "Let's Work Together",
        letWorkTogetherText: hp.letWorkTogetherText || "Have a project in mind or want to collaborate? Feel free to reach out and let's create something extraordinary together.",
        letWorkTogetherCtaText: hp.letWorkTogetherCtaText || "Get In Touch",
        contactPopupTitle: hp.contactPopupTitle || "Let's Build Something Together",
        contactPopupSubtitle: hp.contactPopupSubtitle || "Have an inquiry, project proposal, or just want to connect? Send a message below.",
        contactPopupSuccessMessage: hp.contactPopupSuccessMessage || "Thanks! Your message has been sent successfully."
      }
    });
    console.log('HomepageContent initialized/updated with heroShow3D = false');
  }

  const profile = await prisma.profile.findFirst();
  const defaultImg = profile?.avatarUrl || '/uploads/images/b531235f-d010-4aaf-83c7-bb63745190d6-1791827792983.png';
  if (profile) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        heroImageUrl: profile.heroImageUrl || defaultImg,
        aboutImageUrl: profile.aboutImageUrl || defaultImg,
        aboutHeading: profile.aboutHeading || 'Transforming complex ideas into polished, high-performance web applications.'
      }
    });
    console.log('Profile images set:', { hero: profile.heroImageUrl || defaultImg, about: profile.aboutImageUrl || defaultImg });
  }

  const settings = await prisma.siteSettings.findFirst();
  if (settings && !settings.contactPhone) {
    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        contactPhone: '+1 (555) 234-5678'
      }
    });
    console.log('SiteSettings updated with contactPhone');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
